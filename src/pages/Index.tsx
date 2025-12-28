import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user && profile) {
        // Redirect based on role
        if (profile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/candidate');
        }
      } else if (!user) {
        navigate('/login');
      }
    }
  }, [user, profile, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading AssessPro...</p>
      </div>
    </div>
  );
};

export default Index;
