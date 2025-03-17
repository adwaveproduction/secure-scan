
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase-client';

interface PasswordChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordChangeModal = ({ open, onOpenChange }: PasswordChangeModalProps) => {
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeConfirmPassword, setEmployeeConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Fetch the current stored admin password from Supabase
  const getStoredAdminPassword = async () => {
    try {
      const { data, error } = await supabase
        .from('app_passwords')
        .select('password_value')
        .eq('password_type', 'admin')
        .maybeSingle();
      
      if (error) throw error;
      
      // If no data found, return default password
      return data?.password_value || '123456789';
    } catch (error) {
      console.error('Error fetching admin password:', error);
      return '123456789'; // Default password as fallback
    }
  };
  
  const handleChangeAdminPassword = async () => {
    try {
      setLoading(true);
      
      // Validate against the current admin password
      const currentPassword = await getStoredAdminPassword();
      console.log('Current stored password:', currentPassword);
      console.log('User entered current password:', adminCurrentPassword);
      
      if (adminCurrentPassword !== currentPassword) {
        toast.error('Le mot de passe actuel est incorrect');
        return;
      }
      
      if (adminNewPassword !== adminConfirmPassword) {
        toast.error('Les nouveaux mots de passe ne correspondent pas');
        return;
      }
      
      // Check if record exists before trying to update
      const { data: existingRecord, error: checkError } = await supabase
        .from('app_passwords')
        .select('id')
        .eq('password_type', 'admin')
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let error;
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('app_passwords')
          .update({ password_value: adminNewPassword, updated_at: new Date().toISOString() })
          .eq('password_type', 'admin');
          
        error = updateError;
      } else {
        // Insert new record if none exists
        const { error: insertError } = await supabase
          .from('app_passwords')
          .insert({ 
            password_type: 'admin', 
            password_value: adminNewPassword, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
      console.log('Password updated successfully to:', adminNewPassword);
      toast.success('Mot de passe administrateur changé avec succès');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating admin password:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeEmployeePassword = async () => {
    try {
      setLoading(true);
      
      if (employeePassword !== employeeConfirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
      
      // Check if record exists before trying to update
      const { data: existingRecord, error: checkError } = await supabase
        .from('app_passwords')
        .select('id')
        .eq('password_type', 'employee_registration')
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let error;
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('app_passwords')
          .update({ password_value: employeePassword, updated_at: new Date().toISOString() })
          .eq('password_type', 'employee_registration');
          
        error = updateError;
      } else {
        // Insert new record if none exists
        const { error: insertError } = await supabase
          .from('app_passwords')
          .insert({ 
            password_type: 'employee_registration', 
            password_value: employeePassword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
      toast.success('Mot de passe de validation des employés changé avec succès');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating employee password:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setAdminCurrentPassword('');
    setAdminNewPassword('');
    setAdminConfirmPassword('');
    setEmployeePassword('');
    setEmployeeConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer les mots de passe</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="employee">Validation Employé</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={adminCurrentPassword}
                onChange={(e) => setAdminCurrentPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
              />
            </div>
            
            <Button onClick={handleChangeAdminPassword} className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : 'Changer le mot de passe'}
            </Button>
          </TabsContent>
          
          <TabsContent value="employee" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeePassword">Nouveau mot de passe de validation</Label>
              <Input 
                id="employeePassword" 
                type="password" 
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeConfirmPassword">Confirmer le mot de passe</Label>
              <Input 
                id="employeeConfirmPassword" 
                type="password" 
                value={employeeConfirmPassword}
                onChange={(e) => setEmployeeConfirmPassword(e.target.value)}
              />
            </div>
            
            <Button onClick={handleChangeEmployeePassword} className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : 'Changer le mot de passe de validation'}
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
