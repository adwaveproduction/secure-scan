
import { ReactNode, useState, useEffect } from 'react';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/button';
import { LogOut, Bell, User, Settings } from 'lucide-react';
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
      {isLoggedIn && (
        <header className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  SecureScan
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-600 hover:bg-blue-100"
                  onClick={() => toast.info('Fonctionnalité à venir')}
                >
                  <Bell size={18} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-600 hover:bg-blue-100"
                  onClick={() => toast.info('Fonctionnalité à venir')}
                >
                  <Settings size={18} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-600 hover:bg-blue-100"
                  onClick={() => toast.info('Fonctionnalité à venir')}
                >
                  <User size={18} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
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
