
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRGenerator } from '@/components/dashboard/QRGenerator';
import EmployeesList from '@/components/dashboard/EmployeesList';
import FraudAlertsList from '@/components/dashboard/FraudAlertsList';
import EmployeeMetrics from '@/components/dashboard/EmployeeMetrics';
import EmployeeDetails from '@/components/dashboard/EmployeeDetails';

interface User {
  id: string;
  email: string;
}

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>('qr-code');
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      
      <Tabs defaultValue="qr-code" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="qr-code">Générateur QR Code</TabsTrigger>
          <TabsTrigger value="employees">Liste des Employés</TabsTrigger>
          <TabsTrigger value="employee-details">Statistiques Employé</TabsTrigger>
          <TabsTrigger value="metrics">Métriques Globales</TabsTrigger>
          <TabsTrigger value="fraud">Alertes de fraude</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qr-code" className="mt-6">
          <QRGenerator companyId={user.id} />
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <EmployeesList companyId={user.id} />
        </TabsContent>
        
        <TabsContent value="employee-details" className="mt-6">
          <EmployeeDetails companyId={user.id} />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <EmployeeMetrics companyId={user.id} />
        </TabsContent>
        
        <TabsContent value="fraud" className="mt-6">
          <FraudAlertsList companyId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
