
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFraudAlerts } from '@/hooks/useFraudAlerts';
import FraudAlertItem from '@/components/dashboard/FraudAlertItem';
import { LoadingState, EmptyState } from '@/components/dashboard/FraudAlertStates';

interface FraudAlertsListProps {
  companyId: string;
}

const FraudAlertsList = ({ companyId }: FraudAlertsListProps) => {
  const { fraudAlerts, loading, markAsResolved, isProcessing } = useFraudAlerts(companyId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes de fraude</CardTitle>
        <CardDescription>
          {fraudAlerts.length} alerte(s) de fraude détectée(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : fraudAlerts.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead className="font-bold text-destructive">Tentative frauduleuse par</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Appareil ID</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fraudAlerts.map((alert) => (
                <FraudAlertItem 
                  key={alert.id} 
                  alert={alert} 
                  onMarkAsResolved={markAsResolved}
                  isProcessing={isProcessing} 
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudAlertsList;
