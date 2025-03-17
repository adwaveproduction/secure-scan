
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const handleForgotPassword = async (data: { email: string }) => {
    // En production, nous utiliserions Supabase Auth ici
    console.log('Reset password for:', data);
    
    // Simulons un envoi d'email réussi
    setTimeout(() => {
      toast.success('Un email de réinitialisation a été envoyé');
      navigate('/login');
    }, 1000);
  };
  
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <AuthForm type="forgot-password" onSubmit={handleForgotPassword} />
      </div>
    </Layout>
  );
};

export default ForgotPassword;
