
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>Validation du QR code...</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
