import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, AlertCircle, CheckSquare, Square, User, Mail, Lock } from 'lucide-react';
import { UserProfile } from '../types';

const LoginView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Campos
  const [identifier, setIdentifier] = useState(''); // Serve para Email ou Username no login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setIdentifier('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setError(null);
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Lógica de Login (Email ou Username)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let emailToLogin = identifier;

      // Verifica se o input NÃO parece um email (simples regex)
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(identifier)) {
        // Assume que é um username e busca o email no Firestore
        const q = query(collection(db, 'users'), where('username', '==', identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('user-not-found-by-username');
        }

        const userData = querySnapshot.docs[0].data();
        emailToLogin = userData.email;
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);
      // O redirecionamento acontece automaticamente pelo AuthContext
    } catch (err: any) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações Pré-Envio
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!termsAccepted) {
      setError('Você deve aceitar os Termos de Uso para continuar.');
      return;
    }
    if (username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verifica se Username já existe
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('username-taken');
      }

      // 2. Cria Usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Cria Perfil no Firestore
      // IMPORTANTE: Role começa como 'visitor' ou undefined.
      // O Superuser precisa vincular este usuário a uma empresa para virar 'admin'.
      const newProfile: any = {
        uid: user.uid,
        email: user.email!,
        username: username,
        displayName: username, 
        role: 'visitor', // Visitante até ser atribuído
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      
      // Atualiza Display Name no Auth também
      await updateProfile(user, { displayName: username });

    } catch (err: any) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tratamento de Erros
  const handleAuthError = (err: any) => {
    if (err.message === 'username-taken') {
      setError('Este nome de usuário já está em uso.');
    } else if (err.message === 'user-not-found-by-username') {
      setError('Usuário não encontrado.');
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError('Credenciais incorretas.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('Este email já está cadastrado.');
    } else if (err.code === 'auth/weak-password') {
      setError('A senha deve ter pelo menos 6 caracteres.');
    } else {
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-50 rounded-2xl border border-background-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="bg-accent-600 h-12 w-12 flex items-center justify-center rounded-xl text-background-50 mx-auto mb-4 shadow-lg shadow-accent-600/20">
            <span className="font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-900">
            {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
          </h1>
          <p className="text-text-600 mt-2 text-sm">
            {isLogin ? 'Entre com seu usuário ou email' : 'Preencha os dados abaixo'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            
            {/* MODO LOGIN: INPUT ÚNICO */}
            {isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Email ou Usuário</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 text-text-900 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-all"
                    placeholder="user123 ou email@exemplo.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* MODO REGISTRO: CAMPOS SEPARADOS */}
            {!isLogin && (
              <>
                 <div>
                  <label className="block text-sm font-medium text-text-700 mb-1.5">Usuário</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 text-text-900 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-all"
                      placeholder="seu_usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} // Força lowercase e sem espaço
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-700 mb-1.5">Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 text-text-900 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-all"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* SENHA (COMUM AOS DOIS) */}
            <div>
              <label className="block text-sm font-medium text-text-700 mb-1.5">Senha</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 text-text-900 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* CONFIRMAÇÃO DE SENHA (SÓ REGISTRO) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 text-text-900 focus:outline-none focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TERMOS DE USO (SÓ REGISTRO) */}
            {!isLogin && (
              <div 
                className="flex items-start gap-3 p-3 rounded-lg border border-background-200 cursor-pointer hover:bg-background-100 transition-colors"
                onClick={() => setTermsAccepted(!termsAccepted)}
              >
                <div className={`mt-0.5 ${termsAccepted ? 'text-accent-600' : 'text-text-400'}`}>
                  {termsAccepted ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div className="text-sm text-text-600 leading-snug">
                  Li e concordo com os <span className="text-accent-600 font-bold hover:underline">Termos de Uso</span> e Política de Privacidade da plataforma.
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-accent-600/20 hover:shadow-accent-600/30 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Processando...
                </>
              ) : (
                isLogin ? 'Entrar na Plataforma' : 'Criar Minha Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-background-200 pt-6">
            <p className="text-sm text-text-500 mb-2">
              {isLogin ? 'Ainda não tem acesso?' : 'Já possui cadastro?'}
            </p>
            <button 
              onClick={handleModeSwitch}
              className="text-sm text-accent-700 hover:text-accent-800 font-bold hover:underline transition-all"
            >
              {isLogin ? 'Criar uma conta gratuitamente' : 'Fazer login agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;