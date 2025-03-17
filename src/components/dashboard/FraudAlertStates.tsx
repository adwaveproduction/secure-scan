
import React from 'react';

export const LoadingState = () => (
  <div className="flex justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const EmptyState = () => (
  <div className="text-center py-4 text-muted-foreground">
    Aucune alerte de fraude détectée.
  </div>
);
