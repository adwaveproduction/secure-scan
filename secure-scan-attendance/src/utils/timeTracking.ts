
/**
 * Utility pour gérer le pointage des employés
 */
import { supabase, isUsingMockClient } from './supabase-client';

// Types d'actions de pointage
export enum TimeTrackingAction {
  ENTRY = 'entry',
  EXIT = 'exit'
}

// Enregistrer un nouveau pointage (entrée ou sortie)
export const recordTimeTracking = async (
  employeeId: string,
  companyId: string,
  action: TimeTrackingAction
): Promise<boolean> => {
  try {
    // Si nous utilisons le client mock, juste logger
    if (isUsingMockClient) {
      console.log('Mode démo: Pointage simulé enregistré', {
        employeeId,
        companyId,
        action,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    
    // Enregistrer le pointage dans la base de données
    const { error } = await supabase
      .from('time_tracking')
      .insert([
        {
          employee_id: employeeId,
          company_id: companyId,
          action: action,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du pointage:', error);
    return false;
  }
};

// Obtenir le dernier pointage d'un employé
export const getLastTimeTracking = async (
  employeeId: string,
  companyId: string
): Promise<{ action: TimeTrackingAction; timestamp: string } | null> => {
  try {
    // Si nous utilisons le client mock, retourner des données simulées
    if (isUsingMockClient) {
      console.log('Mode démo: Récupération simulée du dernier pointage');
      
      // Créer un comportement alternant entre entrée et sortie
      // en fonction de l'employeeId pour la démonstration
      const mockAction = employeeId.length % 2 === 0 
        ? TimeTrackingAction.ENTRY 
        : TimeTrackingAction.EXIT;
        
      return {
        action: mockAction,
        timestamp: new Date().toISOString()
      };
    }
    
    // Rechercher le dernier pointage dans la base de données
    const { data, error } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('company_id', companyId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      action: data.action,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier pointage:', error);
    return null;
  }
};

// Déterminer la prochaine action (entrée ou sortie) en fonction du dernier pointage
export const getNextAction = async (
  employeeId: string,
  companyId: string
): Promise<TimeTrackingAction> => {
  // Si nous utilisons le client mock, alterner en fonction de l'ID
  if (isUsingMockClient) {
    console.log('Mode démo: Détermination simulée de la prochaine action');
    
    // Pour simplifier la démo, utiliser l'ID pour déterminer l'action
    // Si la longueur de l'ID est paire, proposer une entrée, sinon une sortie
    return employeeId.length % 2 === 0 
      ? TimeTrackingAction.ENTRY 
      : TimeTrackingAction.EXIT;
  }
  
  const lastTracking = await getLastTimeTracking(employeeId, companyId);
  
  if (!lastTracking || lastTracking.action === TimeTrackingAction.EXIT) {
    return TimeTrackingAction.ENTRY;
  }
  
  return TimeTrackingAction.EXIT;
};
