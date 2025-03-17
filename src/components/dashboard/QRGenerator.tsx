
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQRCode } from '@/utils/qrcode';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { RefreshCw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';

interface QRGeneratorProps {
  companyId: string;
}

export const QRGenerator = ({ companyId }: QRGeneratorProps) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [fraudAlertsCount, setFraudAlertsCount] = useState<number>(0);

  // Générer un nouveau QR code
  const handleGenerateQR = async () => {
    try {
      setIsLoading(true);
      const { qrUrl, qrId } = await generateQRCode(companyId);
      setQrUrl(qrUrl);
      setQrId(qrId);
      setGeneratedAt(new Date());
      toast.success('QR Code généré avec succès');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erreur lors de la génération du QR code');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier les alertes de fraude pour cette entreprise
  const checkFraudAlertsCount = async () => {
    try {
      console.log('Fetching fraud alerts for company:', companyId);
      
      if (isUsingMockClient) {
        // En mode démo, on simule des alertes
        setFraudAlertsCount(1);
        return;
      }
      
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'new');
      
      console.log('Fraud alerts response:', { data, error });
      
      if (error) throw error;
      
      setFraudAlertsCount(data?.length || 0);
    } catch (error) {
      console.error('Error checking fraud alerts:', error);
    }
  };

  // Formater la date de génération
  const formatGeneratedDate = () => {
    if (!generatedAt) return '';
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(generatedAt);
  };

  // Vérifier périodiquement le nombre d'alertes de fraude
  useEffect(() => {
    checkFraudAlertsCount();
    
    const interval = setInterval(() => {
      checkFraudAlertsCount();
    }, 30000); // Vérifier toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium">Générer un QR Code</CardTitle>
            <CardDescription>
              Les employés pourront scanner ce code pour pointer leur entrée/sortie
            </CardDescription>
          </div>
          {isUsingMockClient && (
            <Badge variant="outline" className="flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Mode démo
            </Badge>
          )}
          {fraudAlertsCount > 0 && (
            <Badge variant="destructive" className="flex items-center ml-2">
              {fraudAlertsCount} alerte{fraudAlertsCount > 1 ? 's' : ''} de fraude
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {qrUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <img 
              src={qrUrl} 
              alt="QR Code" 
              className="w-64 h-64 border rounded-md p-2 shadow-sm"
            />
            {generatedAt && (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">Généré le</p>
                <p className="text-sm">{formatGeneratedDate()}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md w-64">
            <p className="text-muted-foreground text-center">Aucun QR code actif</p>
            <p className="text-sm text-muted-foreground mt-2">Générez un nouveau code</p>
          </div>
        )}
        
        <div className="w-full text-center mt-4">
          <p className="text-sm text-muted-foreground">
            À chaque génération, les anciens QR codes sont automatiquement désactivés.
            Les tentatives d'utilisation d'anciens codes sont détectées et signalées.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateQR} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </span>
          ) : qrUrl ? (
            <span className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Régénérer le QR Code
            </span>
          ) : (
            "Générer un QR Code"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
