import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiCH2oZzzFvJgngVu2I0Hl5b-84g_87Fk",
  authDomain: "laz-mdt-aljihad.firebaseapp.com",
  projectId: "laz-mdt-aljihad",
  storageBucket: "laz-mdt-aljihad.firebasestorage.app",
  messagingSenderId: "619008561263",
  appId: "1:619008561263:web:bec9d8bf8bf77acff47d9a"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore for default database
export const db = getFirestore(app);
