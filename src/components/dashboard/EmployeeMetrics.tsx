import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeTrackingAction } from '@/utils/timeTracking';
import { FileDown } from 'lucide-react';
import { exportToExcel, formatEmployeeMetricsData } from '@/utils/export-utils';
import { toast } from 'sonner';

interface EmployeeMetricsProps {
  companyId: string;
}

interface TimeTrackingEntry {
  id: string;
  employee_id: string;
  company_id: string;
  action: TimeTrackingAction;
  timestamp: string;
}

interface EmployeeWorkHours {
  name: string;
  email: string;
  totalHours: number;
  averageHoursPerDay: number;
  daysWorked: number;
}

const EmployeeMetrics = ({ companyId }: EmployeeMetricsProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [metrics, setMetrics] = useState<EmployeeWorkHours[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [companyTotalHours, setCompanyTotalHours] = useState<number>(0);
  const [companyAvgHours, setCompanyAvgHours] = useState<number>(0);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: fr })
    };
  });

  useEffect(() => {
    fetchMetrics();
  }, [companyId, selectedMonth]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      if (isUsingMockClient) {
        const mockMetrics = [
          { name: 'Jean Dupont', email: 'jean.dupont@example.com', totalHours: 168, averageHoursPerDay: 8, daysWorked: 21 },
          { name: 'Marie Martin', email: 'marie.martin@example.com', totalHours: 160, averageHoursPerDay: 8, daysWorked: 20 },
          { name: 'Pierre Dubois', email: 'pierre.dubois@example.com', totalHours: 152, averageHoursPerDay: 7.6, daysWorked: 20 }
        ];
        
        setMetrics(mockMetrics);
        setTotalEmployees(3);
        setCompanyTotalHours(480);
        setCompanyAvgHours(8);
        setLoading(false);
        return;
      }
      
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));
      
      const { data: timeTrackingData, error: timeTrackingError } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('company_id', companyId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());
      
      if (timeTrackingError) throw timeTrackingError;
      
      const employeesData = await fetchEmployees(companyId);
      
      const employeeMetrics = calculateEmployeeMetrics(timeTrackingData || [], employeesData);
      
      const totalHours = employeeMetrics.reduce((sum, emp) => sum + emp.totalHours, 0);
      const avgHours = employeeMetrics.length > 0 ? totalHours / employeeMetrics.length : 0;
      
      setMetrics(employeeMetrics);
      setTotalEmployees(employeesData.length);
      setCompanyTotalHours(totalHours);
      setCompanyAvgHours(avgHours);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmployees = async (companyId: string) => {
    const { data: registeredEmployees, error } = await supabase
      .from('registered_employees')
      .select('id, name, email')
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    return registeredEmployees || [];
  };
  
  const calculateEmployeeMetrics = (timeTrackingData: TimeTrackingEntry[], employees: any[]): EmployeeWorkHours[] => {
    const employeeMap = new Map();
    
    employees.forEach(emp => {
      employeeMap.set(emp.id, {
        name: emp.name,
        email: emp.email,
        totalHours: 0,
        daysWorked: 0,
        averageHoursPerDay: 0,
        entries: [] as { date: string, action: TimeTrackingAction, timestamp: string }[] 
      });
    });
    
    timeTrackingData.forEach(entry => {
      const employee = employeeMap.get(entry.employee_id);
      if (employee) {
        employee.entries.push({
          date: format(parseISO(entry.timestamp), 'yyyy-MM-dd'),
          action: entry.action,
          timestamp: entry.timestamp
        });
      }
    });
    
    const results: EmployeeWorkHours[] = [];
    
    employeeMap.forEach((employee, id) => {
      employee.entries.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      let totalMinutes = 0;
      let daysWorked = new Set();
      let entryTime: Date | null = null;
      
      employee.entries.forEach((entry: any) => {
        if (entry.action === TimeTrackingAction.ENTRY) {
          entryTime = new Date(entry.timestamp);
        } else if (entry.action === TimeTrackingAction.EXIT && entryTime) {
          const exitTime = new Date(entry.timestamp);
          const workMinutes = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60);
          totalMinutes += workMinutes;
          daysWorked.add(entry.date);
          entryTime = null;
        }
      });
      
      const totalHours = Number((totalMinutes / 60).toFixed(1));
      const daysWorkedCount = daysWorked.size;
      const averageHoursPerDay = daysWorkedCount > 0 
        ? Number((totalHours / daysWorkedCount).toFixed(1)) 
        : 0;
      
      results.push({
        name: employee.name,
        email: employee.email,
        totalHours,
        daysWorked: daysWorkedCount,
        averageHoursPerDay
      });
    });
    
    return results;
  };

  const handleExportExcel = () => {
    try {
      const formattedData = formatEmployeeMetricsData(metrics);
      const monthName = format(new Date(selectedMonth + '-01'), 'MMMM-yyyy', { locale: fr });
      exportToExcel(
        formattedData, 
        `metriques-employes-${monthName}`,
        `Métriques ${monthName}`
      );
      toast.success("Export Excel réussi");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Métriques des employés</CardTitle>
          <CardDescription>
            Analyse des heures travaillées par mois
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          disabled={loading || metrics.length === 0}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exporter Excel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-muted-foreground">Nombre d'employés</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{companyTotalHours} h</div>
                  <p className="text-muted-foreground">Total des heures travaillées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{companyAvgHours.toFixed(1)} h</div>
                  <p className="text-muted-foreground">Moyenne par employé</p>
                </CardContent>
              </Card>
            </div>
            
            {metrics.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible pour cette période
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employé</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jours travaillés</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Heures totales</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Moyenne quotidienne</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {metrics.map((employee, index) => (
                      <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{employee.name}</td>
                        <td className="p-4 align-middle">{employee.email}</td>
                        <td className="p-4 align-middle">{employee.daysWorked} jours</td>
                        <td className="p-4 align-middle">{employee.totalHours} h</td>
                        <td className="p-4 align-middle">{employee.averageHoursPerDay} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeMetrics;
