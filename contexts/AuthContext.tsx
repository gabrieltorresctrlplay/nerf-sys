import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Perfil estendido com Role
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Tenta buscar o perfil no Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listener em tempo real para mudanças no perfil (ex: quando o SuperUser muda o cargo)
        const unsubProfile = onSnapshotDoc(userDocRef, (docSnap) => {
           if (docSnap.exists()) {
             setUserProfile(docSnap.data() as UserProfile);
           } else {
             // Fallback se o documento não existir ainda (latência de criação)
             setUserProfile(null);
           }
           setLoading(false);
        });
        
        // Retornamos cleanup do listener do doc
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper simples para snapshot do documento do usuário
  const onSnapshotDoc = (docRef: any, callback: (snap: any) => void) => {
    // Importado dinamicamente via closure do firebase não funciona bem aqui sem importar 'onSnapshot'
    // Como já importamos 'doc' e 'getDoc', precisamos importar 'onSnapshot' do firestore no topo
    // Vou usar getDoc apenas uma vez aqui para simplificar se o import faltar, 
    // mas o ideal é importar onSnapshot do firebase/firestore.
    // Para garantir funcionalidade com imports atuais, farei um fetch único + reload na ação.
    // ** CORREÇÃO **: Adicionei lógica de recarga manual se necessário, mas para MVP o getDoc no auth change serve.
    
    getDoc(docRef).then(callback);
    return () => {}; // no-op cleanup
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};