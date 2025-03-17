
import React, { useState, useEffect } from 'react';
import { TimeTrackingAction } from '@/components/employee/TimeTrackingAction';

interface TimeTrackingComponentProps {
  employeeId: string;
  companyId: string;
  employeeName?: string;
}

const TimeTrackingComponent = ({ 
  employeeId, 
  companyId, 
  employeeName 
}: TimeTrackingComponentProps) => {
  const [employeeEmail, setEmployeeEmail] = useState<string>('');
  
  useEffect(() => {
    // Try to get employee email from sessionStorage
    const storedEmployee = sessionStorage.getItem('employee_data');
    if (storedEmployee) {
      try {
        const parsedEmployee = JSON.parse(storedEmployee);
        if (parsedEmployee.email) {
          setEmployeeEmail(parsedEmployee.email);
        }
      } catch (e) {
        console.error('Error parsing stored employee data:', e);
      }
    }
  }, []);
  
  return (
    <TimeTrackingAction 
      employeeId={employeeId} 
      companyId={companyId} 
      employeeName={employeeName}
      employeeEmail={employeeEmail}
    />
  );
};

export default TimeTrackingComponent;
