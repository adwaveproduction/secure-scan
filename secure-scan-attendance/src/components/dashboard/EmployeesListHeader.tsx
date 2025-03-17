
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface EmployeesListHeaderProps {
  employeeCount: number;
  onExport: () => void;
  disabled: boolean;
}

const EmployeesListHeader = ({ 
  employeeCount, 
  onExport,
  disabled 
}: EmployeesListHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Liste des employés</CardTitle>
        <CardDescription>
          {employeeCount} employé(s) enregistré(s)
        </CardDescription>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport}
        disabled={disabled}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Exporter Excel
      </Button>
    </CardHeader>
  );
};

export default EmployeesListHeader;
