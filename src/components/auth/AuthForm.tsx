
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password';
  onSubmit: (data: { email: string; password?: string; confirmPassword?: string }) => Promise<void>;
  showRegistrationLink?: boolean;
}

export const AuthForm = ({ type, onSubmit, showRegistrationLink = true }: AuthFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'register' && password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setLoading(true);
      await onSubmit({ email, password, confirmPassword });
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(
        type === 'login' 
          ? 'Échec de la connexion' 
          : type === 'register' 
            ? 'Échec de l\'inscription'
            : 'Échec de l\'envoi'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'login': return 'Connexion';
      case 'register': return 'Inscription';
      case 'forgot-password': return 'Réinitialisation';
    }
  };

  const getDescription = () => {
    switch(type) {
      case 'login': return 'Connectez-vous à votre compte';
      case 'register': return 'Créez un nouveau compte';
      case 'forgot-password': return 'Réinitialisez votre mot de passe';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-lg border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{getTitle()}</CardTitle>
          <CardDescription className="text-center">{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2"
              />
            </div>
            
            {type !== 'forgot-password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2"
                />
              </div>
            )}
            
            {type === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-2"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : (
                type === 'login' 
                  ? 'Se connecter' 
                  : type === 'register' 
                    ? 'S\'inscrire'
                    : 'Envoyer le lien'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {type === 'login' && showRegistrationLink ? (
            <p className="text-sm text-center text-muted-foreground">
              Vous n'avez pas de compte?{' '}
              <a 
                href="/register" 
                className="text-primary font-medium hover:underline"
              >
                S'inscrire
              </a>
            </p>
          ) : type === 'register' ? (
            <p className="text-sm text-center text-muted-foreground">
              Vous avez déjà un compte?{' '}
              <a 
                href="/login" 
                className="text-primary font-medium hover:underline"
              >
                Se connecter
              </a>
            </p>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              <a 
                href="/login" 
                className="text-primary font-medium hover:underline"
              >
                Retour à la connexion
              </a>
            </p>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
