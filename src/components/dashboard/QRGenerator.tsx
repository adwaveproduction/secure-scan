
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateQRCode } from '@/utils/qrcode';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { RefreshCw, Info, Printer } from 'lucide-react';
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

  // Imprimer uniquement le QR code
  const handlePrintQR = () => {
    if (!qrUrl) return;
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez les paramètres de votre navigateur.");
      return;
    }
    
    // Créer le contenu HTML de la page d'impression
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .qr-container {
              text-align: center;
            }
            .qr-image {
              width: 300px;
              height: 300px;
              margin-bottom: 20px;
            }
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>QR Code de pointage</h2>
            <img src="${qrUrl}" alt="QR Code" class="qr-image" />
          </div>
          <script>
            // Imprimer automatiquement
            window.onload = function() {
              window.print();
              // Fermer après impression (peut être bloqué par des paramètres de navigateur)
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
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
    <Card className="w-full max-w-md mx-auto shadow-lg border border-blue-100 overflow-hidden bg-gradient-to-b from-white to-blue-50/50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium">Générer un QR Code</CardTitle>
            <CardDescription className="text-blue-100">
              Les employés pourront scanner ce code pour pointer leur entrée/sortie
            </CardDescription>
          </div>
          {isUsingMockClient && (
            <Badge variant="outline" className="flex items-center border-white/30 text-white bg-white/10">
              <Info className="h-4 w-4 mr-1" />
              Mode démo
            </Badge>
          )}
          {fraudAlertsCount > 0 && (
            <Badge variant="destructive" className="flex items-center ml-2 bg-red-500">
              {fraudAlertsCount} alerte{fraudAlertsCount > 1 ? 's' : ''} de fraude
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
        {qrUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="p-4 bg-white rounded-xl shadow-md border border-blue-100">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="w-64 h-64 rounded-md"
              />
            </div>
            {generatedAt && (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground text-sm">Généré le</p>
                <p className="text-blue-600 font-medium">{formatGeneratedDate()}</p>
              </div>
            )}
            
            {/* Bouton d'impression */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={handlePrintQR}
              disabled={!qrUrl}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer le QR Code
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-blue-50/50 rounded-md w-64 border border-blue-100 border-dashed">
            <p className="text-blue-400 text-center">Aucun QR code actif</p>
            <p className="text-sm text-blue-300 mt-2">Générez un nouveau code</p>
          </div>
        )}
        
        <div className="w-full text-center mt-4">
          <p className="text-sm text-blue-400 bg-blue-50 p-3 rounded-md">
            À chaque génération, les anciens QR codes sont automatiquement désactivés.
            Les tentatives d'utilisation d'anciens codes sont détectées et signalées.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 pt-4">
        <Button 
          onClick={handleGenerateQR} 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300" 
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
