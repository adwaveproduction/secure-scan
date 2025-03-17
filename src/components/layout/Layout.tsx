
import { ReactNode, useState, useEffect } from 'react';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { PasswordChangeModal } from './PasswordChangeModal';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const user = sessionStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, [location.pathname]); // Re-check when route changes
  
  const handleLogout = () => {
    // Clear user session data
    sessionStorage.removeItem('user');
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-4 px-6 flex items-center">
        {isLoggedIn && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Déconnexion
            </Button>
          </div>
        )}
      </div>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <PageTransition>{children}</PageTransition>
      </main>
      
      <PasswordChangeModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
    </div>
  );
};

