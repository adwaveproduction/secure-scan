
import React from 'react';
import { EmployeeRegistration } from '@/components/employee/EmployeeRegistration';

interface RegistrationComponentProps {
  companyId: string;
  onRegistrationComplete: (newEmployeeId: string) => void;
}

const RegistrationComponent = ({ companyId, onRegistrationComplete }: RegistrationComponentProps) => {
  if (!companyId) return null;
  
  return (
    <EmployeeRegistration 
      companyId={companyId} 
      onRegistrationComplete={onRegistrationComplete} 
    />
  );
};

export default RegistrationComponent;
