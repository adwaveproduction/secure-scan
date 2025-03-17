
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/fraud-alerts';

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const DeleteEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
  onConfirm,
  loading
}: DeleteEmployeeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'employé {employee?.name} ? 
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEmployeeDialog;
