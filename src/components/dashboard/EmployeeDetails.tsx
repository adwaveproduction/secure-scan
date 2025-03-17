
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { Employee } from '@/types/fraud-alerts';
import { TimeTrackingAction } from '@/utils/timeTracking';
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown } from 'lucide-react';
import { exportToExcel, formatMonthlyTotalsData } from '@/utils/export-utils';

interface EmployeeDetailsProps {
  companyId: string;
}

interface MonthlyTotal {
  month: number;
  monthName: string;
  totalHours: number;
  entriesCount: number;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const EmployeeDetails = ({ companyId }: EmployeeDetailsProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        
        if (isUsingMockClient) {
          console.log('Using mock employee data');
          const mockEmployees = [
            { id: 'mock-id-1', name: 'Jean Dupont', email: 'jean.dupont@example.com' },
            { id: 'mock-id-2', name: 'Marie Martin', email: 'marie.martin@example.com' }
          ];
          setEmployees(mockEmployees);
          setLoadingEmployees(false);
          return;
        }
        
        const [registeredResponse, employeesResponse] = await Promise.all([
          supabase
            .from('registered_employees')
            .select('id, name, email')
            .eq('company_id', companyId),
            
          supabase
            .from('employees')
            .select('id, name, email')
            .eq('company_id', companyId)
        ]);
        
        if (registeredResponse.error) {
          throw registeredResponse.error;
        }
        
        if (employeesResponse.error) {
          throw employeesResponse.error;
        }
        
        const allEmployees = [...(registeredResponse.data || []), ...(employeesResponse.data || [])];
        const uniqueEmployees = Array.from(
          new Map(allEmployees.map(emp => [emp.email, emp])).values()
        );
        
        setEmployees(uniqueEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Erreur lors du chargement des employés');
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, [companyId]);

  const handleEmployeeSelect = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    
    if (!employeeId) {
      setEmployee(null);
      setMonthlyTotals([]);
      return;
    }
    
    setLoading(true);
    try {
      const selectedEmployee = employees.find(emp => emp.id === employeeId) || null;
      setEmployee(selectedEmployee);
      
      if (selectedEmployee) {
        await fetchMonthlyTotals(selectedEmployee.id);
      } else {
        setMonthlyTotals([]);
      }
    } catch (error) {
      console.error('Error selecting employee:', error);
      toast.error('Une erreur est survenue lors de la sélection de l\'employé');
    } finally {
      setLoading(false);
    }
  };
  
  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    if (employee) {
      await fetchMonthlyTotals(employee.id);
    }
  };

  const fetchMonthlyTotals = async (employeeId: string) => {
    try {
      setLoading(true);
      
      if (isUsingMockClient) {
        console.log('Using mock time tracking data');
        const mockTotals = MONTHS.map((monthName, index) => ({
          month: index,
          monthName,
          totalHours: Math.round(Math.random() * 160),
          entriesCount: Math.round(Math.random() * 22)
        }));
        
        setMonthlyTotals(mockTotals);
        setLoading(false);
        return;
      }
      
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_tracking')
        .select('timestamp, action')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId);
      
      if (timeError) {
        throw timeError;
      }
      
      const year = parseInt(selectedYear);
      
      const entriesByMonth = new Map<number, { entries: any[], exits: any[] }>();
      
      MONTHS.forEach((_, index) => {
        entriesByMonth.set(index, { entries: [], exits: [] });
      });
      
      timeEntries?.forEach(entry => {
        const entryDate = parseISO(entry.timestamp);
        const entryYear = getYear(entryDate);
        
        if (entryYear === year) {
          const month = getMonth(entryDate);
          const monthData = entriesByMonth.get(month) || { entries: [], exits: [] };
          
          if (entry.action === TimeTrackingAction.ENTRY) {
            monthData.entries.push(entryDate);
          } else if (entry.action === TimeTrackingAction.EXIT) {
            monthData.exits.push(entryDate);
          }
          
          entriesByMonth.set(month, monthData);
        }
      });
      
      const totals: MonthlyTotal[] = MONTHS.map((monthName, month) => {
        const monthData = entriesByMonth.get(month) || { entries: [], exits: [] };
        
        const sortedEntries = [...monthData.entries].sort((a, b) => a.getTime() - b.getTime());
        const sortedExits = [...monthData.exits].sort((a, b) => a.getTime() - b.getTime());
        
        let totalMilliseconds = 0;
        
        let entryIndex = 0;
        let exitIndex = 0;
        
        while (entryIndex < sortedEntries.length && exitIndex < sortedExits.length) {
          const entry = sortedEntries[entryIndex];
          const exit = sortedExits[exitIndex];
          
          if (exit > entry) {
            totalMilliseconds += exit.getTime() - entry.getTime();
            entryIndex++;
            exitIndex++;
          } else {
            exitIndex++;
          }
        }
        
        const totalHours = Math.round(totalMilliseconds / (1000 * 60 * 60) * 10) / 10;
        
        return {
          month,
          monthName,
          totalHours,
          entriesCount: sortedEntries.length
        };
      });
      
      setMonthlyTotals(totals);
    } catch (error) {
      console.error('Error fetching monthly totals:', error);
      toast.error('Erreur lors de la récupération des données mensuelles');
      setMonthlyTotals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!employee || monthlyTotals.length === 0) return;
    
    try {
      const formattedData = formatMonthlyTotalsData(employee, monthlyTotals);
      exportToExcel(
        formattedData,
        `statistiques-${employee.name.replace(/\s+/g, '-')}-${selectedYear}`,
        `Statistiques ${selectedYear}`
      );
      toast.success("Export Excel réussi");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de l'employé</CardTitle>
        <CardDescription>
          Sélectionnez un employé pour voir ses statistiques mensuelles de travail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="employee-select">Employé</Label>
              <Select 
                value={selectedEmployeeId} 
                onValueChange={handleEmployeeSelect}
                disabled={loadingEmployees || employees.length === 0}
              >
                <SelectTrigger id="employee-select">
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid w-full sm:w-1/3 items-center gap-1.5">
              <Label htmlFor="year-select">Année</Label>
              <Select
                value={selectedYear}
                onValueChange={handleYearChange}
                disabled={!employee}
              >
                <SelectTrigger id="year-select">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {employee && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-2">Informations personnelles</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Nom:</span>
                    <span>{employee.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{employee.email}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="text-xs">{employee.id}</span>
                  </div>
                  {employee.initial_device_id && (
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">ID de l'appareil:</span>
                      <span className="text-xs">{employee.initial_device_id}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    Heures travaillées en {selectedYear}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    disabled={loading || monthlyTotals.length === 0}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter Excel
                  </Button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : monthlyTotals.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Aucune donnée de pointage pour {selectedYear}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead>Heures Totales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyTotals.map((monthData) => (
                        <TableRow key={monthData.month}>
                          <TableCell>{monthData.monthName}</TableCell>
                          <TableCell>{monthData.totalHours} heures</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDetails;
