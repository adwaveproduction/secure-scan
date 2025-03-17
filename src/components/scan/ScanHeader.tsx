
import React from 'react';
import { QrCode } from 'lucide-react';
import { ScanState } from '@/hooks/useScanValidator';

interface ScanHeaderProps {
  state: ScanState;
}

const ScanHeader = ({ state }: ScanHeaderProps) => {
  const getStateText = () => {
    switch (state) {
      case ScanState.TIME_TRACKING:
        return 'Enregistrez votre présence';
      default:
        return 'Validation du QR code';
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      <QrCode className="h-10 w-10 text-primary mb-2" />
      <h1 className="text-2xl font-bold text-center">Système de Pointage</h1>
      <p className="text-muted-foreground text-center">{getStateText()}</p>
    </div>
  );
};

export default ScanHeader;
