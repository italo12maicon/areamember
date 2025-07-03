import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

export default app;