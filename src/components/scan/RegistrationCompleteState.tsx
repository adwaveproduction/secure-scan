
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RegistrationCompleteState = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold">Inscription réussie!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center px-6">
          <p className="text-muted-foreground mb-6">
            Votre compte a été créé avec succès. Pour pointer votre présence, veuillez scanner à nouveau le QR code.
          </p>
          
          <div className="flex flex-col items-center gap-4 mt-4">
            <QrCode className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Votre appareil est maintenant enregistré et pourra être utilisé pour pointer vos entrées et sorties.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={handleBackToHome} variant="outline" className="mt-2">
            Retour à l'accueil
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegistrationCompleteState;
