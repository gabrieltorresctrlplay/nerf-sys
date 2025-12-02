import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --------------------------------------------------------
// IMPORTANTE: SUBSTITUA COM SUAS CHAVES DO FIREBASE CONSOLE
// --------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyD47kBVxzwXi3QiOGyHMRLk8BcLiVFa25M",
  authDomain: "studio-9435257593-dc1fe.firebaseapp.com",
  projectId: "studio-9435257593-dc1fe",
  storageBucket: "studio-9435257593-dc1fe.firebasestorage.app",
  messagingSenderId: "158700440908",
  appId: "1:158700440908:web:d46ef00bfd1d7674c6d3e9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);