
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FraudAlert } from '@/types/fraud-alerts';
import { InfoIcon, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FraudAlertItemProps {
  alert: FraudAlert;
  onMarkAsResolved: (alertId: string) => void;
  isProcessing?: boolean;
}

const FraudAlertItem = ({ alert, onMarkAsResolved, isProcessing = false }: FraudAlertItemProps) => {
  const isKnownEmployee = !!alert.employee_id && alert.employee_name && alert.employee_name !== 'Inconnu' && !alert.employee_name.includes('Utilisateur non identifié');
  
  // Format the timestamp for display
  const formattedDate = new Date(alert.timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Format device ID for display (first 8 characters)
  const shortDeviceId = alert.device_id ? 
    `${alert.device_id.substring(0, 8)}...` : 
    'Non identifié';
  
  return (
    <TableRow key={alert.id}>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="font-mono text-xs">{alert.qr_id}</TableCell>
      <TableCell 
        className={isKnownEmployee ? 'font-semibold text-destructive' : ''}
      >
        {alert.employee_name}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p className="text-xs">Entreprise ID: {alert.company_id}</p>
              {alert.employee_id && (
                <p className="text-xs mt-1">ID de l'employé: {alert.employee_id}</p>
              )}
              {alert.device_id && alert.device_id !== 'Non identifié' && (
                <p className="text-xs mt-1">
                  <span className="font-semibold">Appareil utilisé:</span> {alert.device_id.substring(0, 12)}...
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>{alert.employee_email || 'Non fourni'}</TableCell>
      <TableCell className="font-mono text-xs">{shortDeviceId}</TableCell>
      <TableCell>
        <Badge 
          variant={alert.status === 'new' ? 'destructive' : 'outline'}
        >
          {alert.status === 'new' ? 'Nouvelle' : 'Résolue'}
        </Badge>
      </TableCell>
      <TableCell>
        {alert.status === 'new' && (
          <Button
            onClick={() => onMarkAsResolved(alert.id)}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                En cours...
              </>
            ) : (
              'Marquer comme résolue'
            )}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default FraudAlertItem;
