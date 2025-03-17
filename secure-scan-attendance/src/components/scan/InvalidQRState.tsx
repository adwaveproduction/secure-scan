
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface InvalidQRStateProps {
  errorMessage: string;
}

const InvalidQRState = ({ errorMessage }: InvalidQRStateProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center text-destructive">QR Code Invalide</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <p className="text-center mb-4">{errorMessage}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </CardContent>
    </Card>
  );
};

export default InvalidQRState;
