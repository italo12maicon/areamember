import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiCINPkxLaeIAp-zxp3UkZQf0YIasPGGI",
  authDomain: "member-d1e99.firebaseapp.com",
  projectId: "member-d1e99",
  storageBucket: "member-d1e99.firebasestorage.app",
  messagingSenderId: "5387155867",
  appId: "1:5387155867:web:965f3ddb9c501fe05b493e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Função para inicializar dados padrão
export const initializeFirebaseData = async () => {
  try {
    console.log('🔄 Inicializando dados do Firebase...');
    
    // Importar e executar inicialização
    const { initializeDefaultData } = await import('../services/firebaseService');
    await initializeDefaultData();
    
    console.log('✅ Dados do Firebase inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar dados do Firebase:', error);
  }
};

export default app;