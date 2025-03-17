
import { useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { FraudAlert } from '@/types/fraud-alerts';
import { toast } from 'sonner';

export function useFraudAlertActions() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const markAsResolved = async (alertId: string) => {
    try {
      setIsProcessing(true);
      // Update the alert status to 'resolved'
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId);
        
      if (error) {
        throw error;
      }
      
      toast.success('Alerte marquée comme résolue');
      return true;
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
      toast.error('Erreur lors de la résolution de l\'alerte');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { markAsResolved, isProcessing };
}

// Hook to update fraud alerts state locally after actions
export function useLocalAlertUpdater(setFraudAlerts: React.Dispatch<React.SetStateAction<FraudAlert[]>>) {
  const updateAlertStatus = (alertId: string, status: string) => {
    setFraudAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, status } : alert
      )
    );
  };

  return { updateAlertStatus };
}
