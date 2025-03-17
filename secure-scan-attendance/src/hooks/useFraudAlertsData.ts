
import { useState, useEffect } from 'react';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { FraudAlert, Employee } from '@/types/fraud-alerts';
import { toast } from 'sonner';
import { normalizeEmployeeData, processAlertData } from '@/utils/fraud-alert-processors';

export function useFraudAlertsData(companyId: string) {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If using mock client, use mock data
        if (isUsingMockClient) {
          console.log('Using mock fraud alerts data');
          setFraudAlerts([
            {
              id: 'mock-id-1',
              qr_id: 'qr-123456',
              timestamp: new Date().toISOString(),
              status: 'new',
              employee_name: 'Jean Dupont',
              employee_email: 'jean.dupont@example.com',
              employee_id: 'e95a8768-d5e7-4adc-9014-109167dab2ec', // UUID format
              device_id: '7ad82f3621a9c05debc68fb2c48ae951c0535be24d14a739315d255e7f55610b',
              company_id: companyId
            },
            {
              id: 'mock-id-2',
              qr_id: 'qr-789012',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              status: 'resolved',
              employee_name: 'Marie Martin',
              employee_email: 'marie.martin@example.com',
              employee_id: 'a7b21c45-f9d3-42e5-b76a-1428503d7e92', // UUID format
              device_id: '8bc93f4732b0d16efc79de74d59bf063d1646cf3512b5740426e366e8f661e2c',
              company_id: companyId
            }
          ]);
          setLoading(false);
          return;
        }
        
        // Fetch fraud alerts and registered employees data in parallel
        console.log(`Fetching fraud alerts and employees for company: ${companyId}`);
        const [fraudAlertsResponse, employeesResponse] = await Promise.all([
          supabase
            .from('fraud_alerts')
            .select('*')
            .eq('company_id', companyId)
            .order('timestamp', { ascending: false }),
            
          supabase
            .from('registered_employees')
            .select('id, name, email, initial_device_id')
            .eq('company_id', companyId)
        ]);
        
        if (fraudAlertsResponse.error) {
          throw fraudAlertsResponse.error;
        }
        
        if (employeesResponse.error) {
          throw employeesResponse.error;
        }
        
        console.log('Employees data:', employeesResponse.data);
        console.log('Fraud alerts data:', fraudAlertsResponse.data);
        
        // Store the employees data
        setEmployees(employeesResponse.data || []);
        
        // Create normalized lookup tables for faster matching
        const normalizedEmployees = normalizeEmployeeData(employeesResponse.data || []);
        
        console.log('Normalized employee data:', normalizedEmployees);
        
        // Process fraud alerts to enrich with employee data where possible
        const processedAlerts = processAlertData(
          fraudAlertsResponse.data || [], 
          normalizedEmployees,
          employeesResponse.data || []
        );
        
        console.log('Processed fraud alerts with employee data:', processedAlerts);
        setFraudAlerts(processedAlerts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error as Error);
        toast.error('Erreur lors du chargement des alertes de fraude');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  return { fraudAlerts, setFraudAlerts, employees, loading, error };
}
