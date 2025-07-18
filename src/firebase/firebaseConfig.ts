// src/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpp4VZM_hyDxmRsclShMadbn9PrMkVk-E",
  authDomain: "https://recipe-giver.vercel.app", // ✅ FIX: Use actual Vercel URL
  projectId: "nutrichef-6dbdd",
  storageBucket: "nutrichef-6dbdd.firebasestorage.app",
  messagingSenderId: "923897857495",
  appId: "1:923897857495:web:9dadd00392a5cbc902b792",
  measurementId: "G-RFSN0JGBS5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth };
export { db };