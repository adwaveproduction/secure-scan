
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRGenerator } from '@/components/dashboard/QRGenerator';
import EmployeesList from '@/components/dashboard/EmployeesList';
import FraudAlertsList from '@/components/dashboard/FraudAlertsList';
import EmployeeMetrics from '@/components/dashboard/EmployeeMetrics';
import EmployeeDetails from '@/components/dashboard/EmployeeDetails';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface User {
  id: string;
  email: string;
}

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>('qr-code');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  
  // Update current time and greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentTime(timeString);
      
      const hour = now.getHours();
      let greetingText = '';
      
      if (hour < 12) {
        greetingText = 'Bonjour';
      } else if (hour < 18) {
        greetingText = 'Bon après-midi';
      } else {
        greetingText = 'Bonsoir';
      }
      
      setGreeting(greetingText);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get first part of email (username)
  const username = user.email.split('@')[0];
  
  return (
    <div className="container mx-auto py-4">
      <div className="mb-8 animate-fade-in">
        <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {greeting}, <span className="text-blue-600">{username}</span>
                </h2>
                <p className="text-gray-600 mt-1">
                  Bienvenue sur votre tableau de bord de gestion de présence
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-white py-2 px-4 rounded-full shadow-sm border border-blue-100">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{currentTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Tableau de bord</h1>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-md mb-8">
        <Tabs defaultValue="qr-code" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger 
              value="qr-code"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Générateur QR Code
            </TabsTrigger>
            <TabsTrigger 
              value="employees"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Liste des Employés
            </TabsTrigger>
            <TabsTrigger 
              value="employee-details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Statistiques Employé
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Métriques Globales
            </TabsTrigger>
            <TabsTrigger 
              value="fraud"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Alertes de fraude
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 animate-fade-in">
            <TabsContent value="qr-code">
              <QRGenerator companyId={user.id} />
            </TabsContent>
            
            <TabsContent value="employees">
              <EmployeesList companyId={user.id} />
            </TabsContent>
            
            <TabsContent value="employee-details">
              <EmployeeDetails companyId={user.id} />
            </TabsContent>
            
            <TabsContent value="metrics">
              <EmployeeMetrics companyId={user.id} />
            </TabsContent>
            
            <TabsContent value="fraud">
              <FraudAlertsList companyId={user.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
