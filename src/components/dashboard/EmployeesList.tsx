import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { Employee } from '@/types/fraud-alerts';
import { exportToExcel, formatEmployeeListData } from '@/utils/export-utils';
import { toast } from 'sonner';
import EmployeesListHeader from './EmployeesListHeader';
import EmployeesTable from './EmployeesTable';

interface EmployeesListProps {
  companyId: string;
}

const EmployeesList = ({ companyId }: EmployeesListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // If using mock client, use mock data
      if (isUsingMockClient) {
        console.log('Using mock employee data');
        setEmployees([
          { id: 'mock-id-1', name: 'Jean Dupont', email: 'jean.dupont@example.com' },
          { id: 'mock-id-2', name: 'Marie Martin', email: 'marie.martin@example.com' }
        ]);
        setLoading(false);
        return;
      }

      // Fetch employees only from 'registered_employees' table
      const { data, error } = await supabase
        .from('registered_employees')
        .select('id, name, email')
        .eq('company_id', companyId);

      if (error) {
        throw error;
      }

      setEmployees(data || []); // Ensure employees list is never undefined
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [companyId]);

  const handleExportExcel = () => {
    try {
      const formattedData = formatEmployeeListData(employees);
      exportToExcel(formattedData, `liste-employes-${new Date().toISOString().split('T')[0]}`);
      toast.success("Export Excel réussi");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  return (
    <Card>
      <EmployeesListHeader 
        employeeCount={employees.length}
        onExport={handleExportExcel}
        disabled={loading || employees.length === 0}
      />
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucun employé enregistré.
          </div>
        ) : (
          <EmployeesTable employees={employees} />
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeesList;
