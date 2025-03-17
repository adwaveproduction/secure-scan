
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Système de pointage <span className="text-primary">simple</span> et <span className="text-primary">sécurisé</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Une solution moderne pour le suivi de présence des employés utilisant des QR codes temporaires et sécurisés.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="text-lg px-8"
            >
              Se connecter
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-card p-6 rounded-lg shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">QR Codes Sécurisés</h3>
              <p className="text-muted-foreground">Codes QR temporaires et sécurisés pour les entrées et sorties.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ChartBar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Suivi en Temps Réel</h3>
              <p className="text-muted-foreground">Suivez les horaires de vos employés en temps réel avec des rapports détaillés.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Haute Sécurité</h3>
              <p className="text-muted-foreground">Protection contre la fraude avec des codes uniques à durée limitée.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

// Composants d'icônes temporaires (en attendant d'utiliser Lucide React)
const QrCode = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v-3a2 2 0 0 0-2-2h-3" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h3a2 2 0 0 1 2 2v3" />
    <path d="M12 3h.01" />
    <path d="M12 16h.01" />
    <path d="M12 21h.01" />
    <path d="M16 12h.01" />
    <path d="M21 12h.01" />
    <path d="M12 12h.01" />
  </svg>
);

const ChartBar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default Index;
