import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase-client';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  
  useEffect(() => {
    // Fetch the admin password from Supabase when component mounts
    const fetchAdminPassword = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('app_passwords')
          .select('password_value')
          .eq('password_type', 'admin')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          console.log('Fetched admin password:', data.password_value);
          setAdminPassword(data.password_value);
        } else {
          console.error('No admin password found in database');
          // Set a default password if none is found
          setAdminPassword('admin12345@redwan');
        }
      } catch (error) {
        console.error('Error fetching admin password:', error);
        // Keep using the default password if there was an error
        setAdminPassword('admin12345@redwan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminPassword();
  }, []);
  
  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      // Fetch the user data based on the provided email
      const { data: userData, error: userError } = await supabase
        .from('users')  // Assuming you have a 'users' table
        .select('email, password')
        .eq('email', data.email)
        .maybeSingle();
      
      if (userError) throw userError;
      
      if (!userData) {
        toast.error('Email not found');
        return;
      }

      // Fetch the admin password to validate the login
      const { data: passwordData, error: passwordError } = await supabase
        .from('app_passwords')
        .select('password_value')
        .eq('password_type', 'admin')
        .maybeSingle();
      
      if (passwordError) throw passwordError;
      
      const currentAdminPassword = passwordData?.password_value || 'admin12345@redwan';

      console.log('Login attempt with email:', data.email);
      console.log('Current admin password from DB:', currentAdminPassword);

      // Check if the password matches the stored admin password and if the email matches
      if (data.password === currentAdminPassword && data.email === userData.email) {
        toast.success('Connexion réussie');
        // Store user in session
        sessionStorage.setItem('user', JSON.stringify({
          id: '123',  // Replace with the actual user ID
          email: data.email,
        }));
        navigate('/dashboard');
      } else {
        toast.error('Mot de passe incorrect');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Erreur lors de la connexion');
    }
  };
  
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2">Chargement...</p>
          </div>
        ) : (
          <AuthForm type="login" onSubmit={handleLogin} showRegistrationLink={false} />
        )}
      </div>
    </Layout>
  );
};

export default Login;
