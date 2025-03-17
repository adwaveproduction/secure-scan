
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock, RefreshCw } from 'lucide-react';
import { recordTimeTracking, getNextAction, TimeTrackingAction as Action, saveLastAction } from '@/utils/timeTracking';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TimeTrackingActionProps {
  employeeId: string;
  companyId: string;
  employeeName?: string;
  employeeEmail?: string;
}

export const TimeTrackingAction = ({ employeeId, companyId, employeeName, employeeEmail }: TimeTrackingActionProps) => {
  const [nextAction, setNextAction] = useState<Action>(Action.ENTRY);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNextAction = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching next action for employee ${employeeId} in company ${companyId}`);
        const action = await getNextAction(employeeId, companyId);
        console.log(`Next action determined: ${action}`);
        setNextAction(action);
      } catch (error) {
        console.error('Error fetching next action:', error);
        toast.error('Erreur lors de la récupération de l\'action');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (employeeId && companyId) {
      fetchNextAction();
    }
  }, [employeeId, companyId]);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentTime(now.toLocaleTimeString('fr-FR', options));
    };
    
    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } 
    else if (countdown === 0) {
      handleLogout();
    }
  }, [countdown]);

  const handleTimeTracking = async () => {
    try {
      setIsLoading(true);
      
      console.log(`Recording time tracking: ${nextAction}`);
      
      const success = await recordTimeTracking(
        employeeId,
        companyId,
        nextAction
      );
      
      if (!success) {
        throw new Error('Échec de l\'enregistrement du pointage');
      }
      
      // Save the current action for mock mode
      saveLastAction(employeeId, nextAction);
      
      toast.success(
        nextAction === Action.ENTRY 
          ? 'Entrée enregistrée avec succès!' 
          : 'Sortie enregistrée avec succès!'
      );
      
      // Toggle the next action
      setNextAction(
        nextAction === Action.ENTRY ? Action.EXIT : Action.ENTRY
      );

      setCountdown(5);
      
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      toast.error('Échec du pointage', {
        description: 'Veuillez réessayer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.setItem('scan_logged_out', 'true');
    
    // Store employee info for fraud detection purposes
    if (employeeName || employeeEmail) {
      sessionStorage.setItem('employee_data', JSON.stringify({
        name: employeeName,
        email: employeeEmail,
        id: employeeId
      }));
    }
    
    toast.success('Déconnexion réussie');
    navigate('/', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            {employeeName ? `Bonjour, ${employeeName}` : 'Pointage'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLoading ? 'Chargement...' : (
              countdown !== null 
                ? `Déconnexion automatique dans ${countdown} secondes...` 
                : nextAction === Action.ENTRY 
                  ? 'Enregistrez votre entrée' 
                  : 'Enregistrez votre sortie'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="text-4xl font-bold text-center">
            {currentTime}
          </div>
          
          <motion.div 
            className="w-full" 
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg"
              className={`w-full p-6 text-lg ${
                nextAction === Action.ENTRY 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-destructive hover:bg-destructive/90'
              }`}
              onClick={handleTimeTracking}
              disabled={isLoading || countdown !== null}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </span>
              ) : countdown !== null ? (
                <span className="flex items-center justify-center">
                  <Clock className="mr-2 h-6 w-6" />
                  En attente...
                </span>
              ) : nextAction === Action.ENTRY ? (
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-6 w-6" />
                  Je rentre
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogOut className="mr-2 h-6 w-6" />
                  Je sors
                </span>
              )}
            </Button>
          </motion.div>

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={handleLogout}
            disabled={countdown !== null}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
