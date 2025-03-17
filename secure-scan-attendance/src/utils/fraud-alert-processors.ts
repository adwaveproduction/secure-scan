
import { FraudAlert, Employee, NormalizedEmployees } from '@/types/fraud-alerts';

// Helper function to normalize employee data for faster lookups
export function normalizeEmployeeData(employees: Employee[]): NormalizedEmployees {
  const byEmail: Record<string, Employee> = {};
  const byId: Record<string, Employee> = {};
  const byDeviceId: Record<string, Employee> = {};
  
  employees.forEach(emp => {
    if (emp.email) byEmail[emp.email.toLowerCase()] = emp;
    if (emp.id) byId[emp.id] = emp;
    if (emp.initial_device_id) byDeviceId[emp.initial_device_id] = emp;
  });
  
  return { byEmail, byId, byDeviceId };
}

// Helper function to process and enrich alert data with employee information
export function processAlertData(
  alerts: FraudAlert[], 
  normalizedEmployees: NormalizedEmployees,
  employees: Employee[]
): FraudAlert[] {
  return alerts.map(alert => {
    // First try to match by employee_id if it exists
    if (alert.employee_id) {
      const matchedEmployee = normalizedEmployees.byId[alert.employee_id];
      if (matchedEmployee) {
        console.log(`Found employee match by ID for alert ${alert.id}:`, matchedEmployee);
        return {
          ...alert,
          employee_name: matchedEmployee.name || alert.employee_name,
          employee_email: matchedEmployee.email || alert.employee_email
        };
      }
    }
    
    // Try to match by device_id if it exists and the device_id is not the default value
    if (alert.device_id && alert.device_id !== 'Non identifié') {
      // Try exact device_id match
      for (const emp of employees) {
        if (emp.initial_device_id === alert.device_id) {
          console.log(`Found employee with exactly matching device ID`, emp);
          return {
            ...alert,
            employee_name: emp.name || alert.employee_name,
            employee_id: emp.id || alert.employee_id,
            employee_email: emp.email || alert.employee_email
          };
        }
      }
      
      // Try to match partial device ID
      const alertDeviceId = alert.device_id.toLowerCase();
      for (const emp of employees) {
        if (emp.initial_device_id && emp.initial_device_id.toLowerCase().includes(alertDeviceId.substring(0, 10))) {
          console.log(`Found employee with partially matching device ID`, emp);
          return {
            ...alert,
            employee_name: emp.name || alert.employee_name,
            employee_id: emp.id || alert.employee_id,
            employee_email: emp.email || alert.employee_email
          };
        }
      }
    }
    
    // If no match by ID or device, try matching by email if it exists and isn't the default value
    if (alert.employee_email && alert.employee_email !== 'Non fourni') {
      const normalizedEmail = alert.employee_email.toLowerCase();
      const matchedEmployee = normalizedEmployees.byEmail[normalizedEmail];
      
      if (matchedEmployee) {
        console.log(`Found employee match by EMAIL for alert ${alert.id}:`, matchedEmployee);
        return {
          ...alert,
          employee_name: matchedEmployee.name || alert.employee_name,
          employee_id: matchedEmployee.id || alert.employee_id
        };
      }
    }
    
    // If we still have no match, return with appropriate defaults
    return {
      ...alert,
      employee_name: alert.employee_name || 'Utilisateur non identifié'
    };
  });
}
