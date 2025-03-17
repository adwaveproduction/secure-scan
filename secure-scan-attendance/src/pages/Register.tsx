import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase, isUsingMockClient } from '@/utils/supabase-client';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [step, setStep] = useState<'passwordVerification' | 'registration'>('passwordVerification');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeePasswordLoading, setEmployeePasswordLoading] = useState(true);
  const [employeeRegistrationPassword, setEmployeeRegistrationPassword] = useState('123456'); // Default fallback
  
  useEffect(() => {
    const fetchEmployeePassword = async () => {
      try {
        const { data, error } = await supabase
          .from('app_passwords')
          .select('password_value')
          .eq('password_type', 'employee_registration')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data && data.password_value) {
          setEmployeeRegistrationPassword(data.password_value);
        }
      } catch (error) {
        console.error('Error fetching employee registration password:', error);
      } finally {
        setEmployeePasswordLoading(false);
      }
    };
    
    fetchEmployeePassword();
  }, []);
  
  const handlePasswordVerification = () => {
    if (password === employeeRegistrationPassword) {
      setPasswordError('');
      setStep('registration');
    } else {
      setPasswordError('Mot de passe incorrect');
    }
  };
  
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      toast.error('ID de l\'entreprise manquant');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Tentative d\'inscription de l\'employé:', { name, email, companyId });
      
      const fingerprint = await generateDeviceFingerprint();
      
      const { data, error } = await supabase
        .from('registered_employees')
        .insert([
          { 
            name, 
            email, 
            company_id: companyId,
            registration_time: new Date().toISOString(),
            initial_device_id: fingerprint
          }
        ])
        .select();
        
      if (error) {
        console.error('Erreur Supabase lors de l\'inscription:', error);
        throw error;
      }
      
      console.log('Inscription réussie, données retournées:', data);
      
      if (isUsingMockClient) {
        console.log('Mode démo: Simulation d\'inscription réussie');
        localStorage.setItem(`employee_device_${companyId}`, fingerprint);
        
        if (data && data.length > 0) {
          sessionStorage.setItem('employee_data', JSON.stringify({
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            initialDeviceId: fingerprint
          }));
        }
        
        toast.success('Inscription réussie (mode démo) !');
        navigate(`/scan?data=${encodeURIComponent(companyId)}`);
        return;
      }
      
      localStorage.setItem(`employee_device_${companyId}`, fingerprint);
      
      if (data && data.length > 0) {
        sessionStorage.setItem('employee_data', JSON.stringify({
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          initialDeviceId: fingerprint
        }));
      }
      
      toast.success('Inscription réussie !');
      navigate(`/scan?data=${encodeURIComponent(companyId)}`);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Échec de l\'inscription: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const renderPasswordVerification = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-md p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-center">Vérification</h2>
        <p className="mb-6 text-center text-muted-foreground">
          Veuillez entrer le mot de passe pour vous inscrire en tant qu'employé.
        </p>
        
        {employeePasswordLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            
            <Button 
              onClick={handlePasswordVerification}
              className="w-full"
            >
              Vérifier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderRegistrationForm = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-md p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-center">Inscription de l'employé</h2>
        <p className="mb-6 text-center text-muted-foreground">
          Veuillez saisir vos informations pour vous inscrire.
        </p>
        
        <form onSubmit={handleRegistration} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </form>
      </div>
    </div>
  );
  
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full px-4"
        >
          {step === 'passwordVerification' 
            ? renderPasswordVerification() 
            : renderRegistrationForm()}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Register;
