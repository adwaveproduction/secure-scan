
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard as DashboardComponent } from '@/components/dashboard/Dashboard';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const storedUser = sessionStorage.getItem('user');
    
    if (!storedUser) {
      toast.error('Veuillez vous connecter pour accéder au tableau de bord');
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user:', error);
      toast.error('Session invalide');
      navigate('/login');
    }
  }, [navigate]);
  
  // Si l'utilisateur n'est pas encore chargé, afficher un loader
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <DashboardComponent user={user} />
    </Layout>
  );
};

export default Dashboard;
