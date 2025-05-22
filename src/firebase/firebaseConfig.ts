    // src/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpp4VZM_hyDxmRsclShMadbn9PrMkVk-E",
  authDomain: "nutrichef-6dbdd.firebaseapp.com",
  projectId: "nutrichef-6dbdd",
  storageBucket: "nutrichef-6dbdd.firebasestorage.app",
  messagingSenderId: "923897857495",
  appId: "1:923897857495:web:9dadd00392a5cbc902b792",
  measurementId: "G-RFSN0JGBS5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
