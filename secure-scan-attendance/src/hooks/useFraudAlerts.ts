
import { useState } from 'react';
import { FraudAlert, Employee } from '@/types/fraud-alerts';
import { useFraudAlertsData } from './useFraudAlertsData';
import { useFraudAlertActions, useLocalAlertUpdater } from './useFraudAlertActions';

export function useFraudAlerts(companyId: string) {
  const { fraudAlerts, setFraudAlerts, employees, loading, error } = useFraudAlertsData(companyId);
  const { markAsResolved, isProcessing } = useFraudAlertActions();
  const { updateAlertStatus } = useLocalAlertUpdater(setFraudAlerts);
  
  const handleMarkAsResolved = async (alertId: string) => {
    const success = await markAsResolved(alertId);
    if (success) {
      updateAlertStatus(alertId, 'resolved');
    }
  };

  return { 
    fraudAlerts, 
    employees, 
    loading,
    error,
    isProcessing,
    markAsResolved: handleMarkAsResolved 
  };
}
