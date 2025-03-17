
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Check } from 'lucide-react';
import { createEmployee } from '@/utils/qrcode';
import { registerDeviceFingerprint } from '@/utils/deviceFingerprint';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase-client';

interface EmployeeRegistrationProps {
  companyId: string;
  onRegistrationComplete: (employeeId: string) => void;
}

export const EmployeeRegistration = ({ companyId, onRegistrationComplete }: EmployeeRegistrationProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !deviceName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Créer un nouvel employé
      const employeeId = await createEmployee(name, email, companyId);
      
      if (!employeeId) {
        throw new Error('Échec de la création de l\'employé');
      }
      
      // Enregistrer l'empreinte numérique de l'appareil
      const registered = await registerDeviceFingerprint(
        employeeId,
        companyId,
        deviceName,
        supabase
      );
      
      if (!registered) {
        throw new Error('Échec de l\'enregistrement de l\'appareil');
      }
      
      toast.success('Inscription réussie!', {
        description: 'Vous pouvez maintenant pointer votre entrée/sortie'
      });
      
      // Informer le composant parent que l'inscription est terminée
      onRegistrationComplete(employeeId);
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Échec de l\'inscription', {
        description: 'Veuillez réessayer plus tard'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">Inscription Employé</CardTitle>
          <CardDescription className="text-center">
            Enregistrez-vous pour commencer à utiliser le système de pointage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceName">Nom de l'appareil</Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Mon téléphone personnel"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cet appareil sera associé à votre compte pour le pointage
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  S'inscrire
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            En vous inscrivant, vous acceptez que vos informations soient utilisées
            uniquement à des fins de pointage de présence.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
