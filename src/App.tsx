import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import { initializeFirebaseData } from './config/firebase';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Carregando...</h2>
      <p className="text-gray-400">Conectando ao Firebase</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { loading } = useData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (user?.isAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeFirebaseData();
        console.log('✅ Firebase inicializado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;