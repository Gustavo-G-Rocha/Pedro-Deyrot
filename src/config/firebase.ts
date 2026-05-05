import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Substitua com suas credenciais do Firebase
// Você pode encontrar essas informações em: Firebase Console > Project Settings > General
const firebaseConfig = {
    apiKey: "AIzaSyCOKhOFjhzEzTxirYIaggLU6YTulbP_CpI",
    authDomain: "deyrot-e4381.firebaseapp.com",
    projectId: "deyrot-e4381",
    storageBucket: "deyrot-e4381.firebasestorage.app",
    messagingSenderId: "421061329011",
    appId: "1:421061329011:web:691ea3d833a6dc5ff46a06"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
