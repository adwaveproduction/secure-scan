
import { supabase, isUsingMockClient } from './supabase-client';

// Vérifier si un employé existe déjà
export const checkEmployeeExists = async (
  employeeId: string,
  companyId: string
): Promise<boolean> => {
  try {
    // First check in the employees table
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (employeeData) {
      return true;
    }
    
    // If not found in employees, check registered_employees
    const { data: registeredData, error: registeredError } = await supabase
      .from('registered_employees')
      .select('*')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (registeredData) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'employé:', error);
    return false;
  }
};

// Créer un nouvel employé
export const createEmployee = async (
  name: string,
  email: string,
  companyId: string
): Promise<string | null> => {
  try {
    // Générer un ID unique pour l'employé
    const employeeId = crypto.randomUUID();
    
    // First check if an employee with this email already exists
    const { data: existingEmployee, error: checkError } = await supabase
      .from('registered_employees')
      .select('id')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (existingEmployee) {
      console.log(`Employee with email ${email} already exists with ID: ${existingEmployee.id}`);
      return existingEmployee.id;
    }
    
    // Insérer le nouvel employé dans la base de données registered_employees
    const { data, error } = await supabase
      .from('registered_employees')
      .insert([
        {
          id: employeeId,
          name: name,
          email: email,
          company_id: companyId,
          registration_time: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`Created new employee in registered_employees with ID: ${data[0].id}`);
      return data[0].id;
    }
    
    return employeeId;
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    return null;
  }
};

// Obtenir des informations sur un employé par email
export const getEmployeeByEmail = async (
  email: string,
  companyId: string
): Promise<{ id: string; name: string; email: string } | null> => {
  try {
    // First check in registered_employees
    const { data: registeredData, error: registeredError } = await supabase
      .from('registered_employees')
      .select('id, name, email')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (registeredData) {
      return registeredData;
    }
    
    // Then check in employees table
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, email')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (employeeData) {
      return employeeData;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'employé par email:', error);
    return null;
  }
};

// Supprimer un employé
export const deleteEmployee = async (
  employeeId: string,
  companyId: string
): Promise<boolean> => {
  try {
    console.log(`Attempting to delete employee with ID: ${employeeId} from company: ${companyId}`);
    
    if (isUsingMockClient) {
      console.log('Using mock client. In a real environment, this would delete:');
      console.log('- Employee records');
      console.log('- Associated time tracking records');
      console.log('- Associated fraud alerts');
      return true;
    }
    
    // First get the employee email for later usage
    let employeeEmail = '';
    
    // Check in registered_employees first
    const { data: employeeData, error: employeeDataError } = await supabase
      .from('registered_employees')
      .select('email')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (employeeData && employeeData.email) {
      employeeEmail = employeeData.email;
    } else {
      // Try to find in employees table
      const { data: regularEmployeeData, error: regularEmployeeError } = await supabase
        .from('employees')
        .select('email')
        .eq('id', employeeId)
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (regularEmployeeData && regularEmployeeData.email) {
        employeeEmail = regularEmployeeData.email;
      }
    }

    // Check if we found the employee email
    if (!employeeEmail) {
      console.error(`Could not find email for employee with ID: ${employeeId}. Deletion might be incomplete.`);
    } else {
      console.log(`Found employee email: ${employeeEmail} for deletion process`);
    }
    
    // Delete associated time tracking records - with explicit error checking
    const timeTrackingResult = await supabase
      .from('time_tracking')
      .delete()
      .eq('employee_id', employeeId)
      .eq('company_id', companyId);
      
    if (timeTrackingResult.error) {
      console.error(`Error deleting time tracking data: ${timeTrackingResult.error.message}`);
    } else {
      console.log(`Successfully deleted time tracking records for employee: ${employeeId}`);
    }
    
    // Delete associated fraud alerts by employee ID - with explicit error checking
    const fraudAlertsResult = await supabase
      .from('fraud_alerts')
      .delete()
      .eq('employee_id', employeeId)
      .eq('company_id', companyId);
      
    if (fraudAlertsResult.error) {
      console.error(`Error deleting fraud alerts by ID: ${fraudAlertsResult.error.message}`);
    } else {
      console.log(`Successfully deleted fraud alerts for employee: ${employeeId}`);
    }
    
    // Also delete fraud alerts that may reference the employee by email
    if (employeeEmail) {
      const emailFraudAlertsResult = await supabase
        .from('fraud_alerts')
        .delete()
        .eq('employee_email', employeeEmail)
        .eq('company_id', companyId);
        
      if (emailFraudAlertsResult.error) {
        console.error(`Error deleting fraud alerts by email: ${emailFraudAlertsResult.error.message}`);
      } else {
        console.log(`Successfully deleted fraud alerts for employee email: ${employeeEmail}`);
      }
    }
    
    // Now delete the employee from both tables to ensure complete removal
    let registeredDeleteSuccess = false;
    let employeesDeleteSuccess = false;
    
    // Try to delete from registered_employees - with improved error handling
    const registeredResult = await supabase
      .from('registered_employees')
      .delete()
      .eq('id', employeeId)
      .eq('company_id', companyId);
    
    if (registeredResult.error) {
      console.error(`Error deleting from registered_employees: ${registeredResult.error.message}`);
    } else {
      console.log(`Successfully deleted employee from registered_employees: ${employeeId}`);
      registeredDeleteSuccess = true;
    }
    
    // Also try to delete from employees table - with improved error handling
    const employeesResult = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
      .eq('company_id', companyId);
      
    if (employeesResult.error) {
      console.error(`Error deleting from employees table: ${employeesResult.error.message}`);
    } else {
      console.log(`Successfully deleted employee from employees table: ${employeeId}`);
      employeesDeleteSuccess = true;
    }
    
    // Consider the deletion successful if the employee was removed from at least one of the tables
    if (registeredDeleteSuccess || employeesDeleteSuccess) {
      console.log(`Successfully deleted employee with ID: ${employeeId} and all associated data`);
      return true;
    } else {
      console.error(`Failed to delete employee from both tables: ${employeeId}`);
      
      // Additional attempt to delete by email if ID-based deletion failed
      if (employeeEmail) {
        console.log(`Attempting fallback deletion by email: ${employeeEmail}`);
        
        const registeredEmailResult = await supabase
          .from('registered_employees')
          .delete()
          .eq('email', employeeEmail)
          .eq('company_id', companyId);
          
        const employeesEmailResult = await supabase
          .from('employees')
          .delete()
          .eq('email', employeeEmail)
          .eq('company_id', companyId);
          
        if (!registeredEmailResult.error || !employeesEmailResult.error) {
          console.log(`Successfully deleted employee with email: ${employeeEmail} in fallback process`);
          return true;
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};
