
/**
 * Utility pour gérer le pointage des employés
 */
import { supabase, isUsingMockClient } from './supabase-client';

// Types d'actions de pointage
export enum TimeTrackingAction {
  ENTRY = 'entry',
  EXIT = 'exit'
}

// Clé pour stocker le dernier pointage dans localStorage (pour le mode démo)
const getLastActionKey = (employeeId: string) => `last_action_${employeeId}`;

// Enregistrer un nouveau pointage (entrée ou sortie)
export const recordTimeTracking = async (
  employeeId: string,
  companyId: string,
  action: TimeTrackingAction
): Promise<boolean> => {
  try {
    if (!employeeId) {
      console.error('recordTimeTracking: employeeId is required!');
      return false;
    }
    
    console.log(`Recording time tracking: Employee ${employeeId}, Company ${companyId}, Action: ${action}`);
    
    // Si nous utilisons le client mock, juste logger et sauvegarder l'état dans localStorage
    if (isUsingMockClient) {
      console.log('Mode démo: Pointage simulé enregistré', {
        employeeId,
        companyId,
        action,
        timestamp: new Date().toISOString()
      });
      
      // Save current action to localStorage for mock mode state persistence
      localStorage.setItem(getLastActionKey(employeeId), action);
      console.log(`Saved action to localStorage: ${action} for employee ${employeeId}`);
      
      return true;
    }
    
    // Log the data we're about to insert for debugging
    const timeData = {
      employee_id: employeeId,
      company_id: companyId,
      action: action,
      timestamp: new Date().toISOString()
    };
    console.log('Inserting time tracking record:', timeData);
    
    // Enregistrer le pointage dans la base de données
    const { error, data } = await supabase
      .from('time_tracking')
      .insert([timeData])
      .select();
    
    if (error) {
      console.error('Error recording time tracking:', error);
      throw error;
    }
    
    console.log(`Successfully recorded ${action} for employee ${employeeId}:`, data);
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
    if (!employeeId) {
      console.error('getLastTimeTracking: employeeId is required!');
      return null;
    }
    
    console.log(`Getting last time tracking for employee ${employeeId}`);
    
    // Si nous utilisons le client mock, retourner des données simulées depuis localStorage
    if (isUsingMockClient) {
      console.log('Mode démo: Récupération simulée du dernier pointage');
      
      // Check localStorage for the last action to maintain consistent state
      const lastActionKey = getLastActionKey(employeeId);
      const storedAction = localStorage.getItem(lastActionKey);
      
      if (storedAction) {
        console.log(`Mock mode: Found stored last action: ${storedAction}`);
        return {
          action: storedAction as TimeTrackingAction,
          timestamp: new Date().toISOString()
        };
      }
      
      // Default to EXIT so next action will be ENTRY
      console.log('Mock mode: No stored action, defaulting to EXIT');
      return {
        action: TimeTrackingAction.EXIT,
        timestamp: new Date().toISOString()
      };
    }
    
    // Rechercher le dernier pointage dans la base de données
    console.log(`Querying time_tracking for employee_id=${employeeId} and company_id=${companyId}`);
    const { data, error } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('company_id', companyId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching last time tracking:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No previous time tracking found for this employee');
      return null;
    }
    
    console.log('Last time tracking found:', data[0]);
    return {
      action: data[0].action as TimeTrackingAction,
      timestamp: data[0].timestamp
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
  if (!employeeId) {
    console.error('getNextAction: employeeId is required!');
    return TimeTrackingAction.ENTRY;
  }
  
  console.log(`Determining next action for employee ${employeeId} in company ${companyId}`);
  
  // Si nous utilisons le client mock, utiliser localStorage pour simuler l'état
  if (isUsingMockClient) {
    console.log('Mode démo: Détermination simulée de la prochaine action');
    
    const lastActionKey = getLastActionKey(employeeId);
    const storedAction = localStorage.getItem(lastActionKey);
    
    if (!storedAction) {
      console.log('Mock mode: No stored action, defaulting to ENTRY');
      return TimeTrackingAction.ENTRY;
    }
    
    const nextAction = storedAction === TimeTrackingAction.ENTRY 
      ? TimeTrackingAction.EXIT 
      : TimeTrackingAction.ENTRY;
    
    console.log(`Mock mode: Last action was ${storedAction}, next action is ${nextAction}`);
    return nextAction;
  }
  
  const lastTracking = await getLastTimeTracking(employeeId, companyId);
  
  if (!lastTracking) {
    console.log('No previous tracking found, suggesting ENTRY');
    return TimeTrackingAction.ENTRY;
  }
  
  // Determine next action based on last action
  const nextAction = lastTracking.action === TimeTrackingAction.ENTRY 
    ? TimeTrackingAction.EXIT 
    : TimeTrackingAction.ENTRY;
  
  console.log(`Last action was ${lastTracking.action}, next action is ${nextAction}`);
  return nextAction;
};

// Save last action for mock mode
export const saveLastAction = (employeeId: string, action: TimeTrackingAction): void => {
  if (!employeeId) {
    console.error('saveLastAction: employeeId is required!');
    return;
  }
  
  if (isUsingMockClient) {
    const lastActionKey = getLastActionKey(employeeId);
    localStorage.setItem(lastActionKey, action);
    console.log(`Saved last action for ${employeeId}: ${action}`);
  }
};
