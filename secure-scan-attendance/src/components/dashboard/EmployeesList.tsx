
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
          {
            id: 'mock-id-1',
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com'
          },
          {
            id: 'mock-id-2',
            name: 'Marie Martin',
            email: 'marie.martin@example.com'
          }
        ]);
        setLoading(false);
        return;
      }
      
      // Fetch employees from both tables and combine the results
      const [registeredResponse, employeesResponse] = await Promise.all([
        // First query the registered_employees table
        supabase
          .from('registered_employees')
          .select('id, name, email')
          .eq('company_id', companyId),
          
        // Then query the employees table
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
      
      // Combine and deduplicate employees by email
      const allEmployees = [...(registeredResponse.data || []), ...(employeesResponse.data || [])];
      const uniqueEmployees = Array.from(
        new Map(allEmployees.map(emp => [emp.email, emp])).values()
      );
      
      console.log('Combined employee data:', uniqueEmployees);
      setEmployees(uniqueEmployees);
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
      exportToExcel(
        formattedData, 
        `liste-employes-${new Date().toISOString().split('T')[0]}`
      );
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
          <EmployeesTable 
            employees={employees}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeesList;
