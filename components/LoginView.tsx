import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2, AlertCircle, CheckSquare, Square, User, Mail, Lock } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null); // Erro geral (API)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({}); // Erros por campo

  const resetForm = () => {
    setIdentifier('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setError(null);
    setFieldErrors({});
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Validação Customizada
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    if (isLogin) {
      if (!identifier.trim()) {
        errors.identifier = "Digite seu email ou usuário.";
        isValid = false;
      }
      if (!password) {
        errors.password = "Digite sua senha.";
        isValid = false;
      }
    } else {
      if (!username.trim()) {
        errors.username = "Escolha um nome de usuário.";
        isValid = false;
      } else if (username.length < 3) {
        errors.username = "Mínimo de 3 caracteres.";
        isValid = false;
      }
      
      if (!email.trim()) {
        errors.email = "Email obrigatório.";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Email inválido.";
        isValid = false;
      }

      if (!password) {
        errors.password = "Senha obrigatória.";
        isValid = false;
      } else if (password.length < 6) {
        errors.password = "Mínimo de 6 caracteres.";
        isValid = false;
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = "As senhas não coincidem.";
        isValid = false;
      }

      if (!termsAccepted) {
        setError('Você deve aceitar os Termos de Uso.'); // Erro geral
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Lógica de Login (Email ou Username)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);

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

    if (!validateForm()) return;

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
      const newProfile: any = {
        uid: user.uid,
        email: user.email!,
        username: username,
        displayName: username, 
        role: 'visitor', 
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
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
      setFieldErrors(prev => ({ ...prev, username: 'Este usuário já existe.' }));
    } else if (err.message === 'user-not-found-by-username') {
      setError('Usuário não encontrado.');
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError('Credenciais incorretas.');
    } else if (err.code === 'auth/email-already-in-use') {
      setFieldErrors(prev => ({ ...prev, email: 'Este email já está em uso.' }));
    } else if (err.code === 'auth/weak-password') {
      setFieldErrors(prev => ({ ...prev, password: 'A senha é muito fraca.' }));
    } else {
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  // Helper de estilo para inputs com erro
  const getInputClass = (fieldName: string) => `
    w-full pl-10 pr-4 py-2.5 rounded-xl transition-all outline-none border
    ${fieldErrors[fieldName] 
      ? 'bg-red-50 border-red-300 text-red-900 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300' 
      : 'bg-background-100 border-background-300 text-text-900 focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600'
    }
  `;

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

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4" noValidate>
            
            {/* MODO LOGIN: INPUT ÚNICO */}
            {isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Email ou Usuário</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.identifier ? 'text-red-400' : 'text-text-400'}`}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    className={getInputClass('identifier')}
                    placeholder="user123 ou email@exemplo.com"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if(fieldErrors.identifier) setFieldErrors({...fieldErrors, identifier: ''});
                    }}
                  />
                </div>
                {fieldErrors.identifier && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{fieldErrors.identifier}</p>}
              </div>
            )}

            {/* MODO REGISTRO: CAMPOS SEPARADOS */}
            {!isLogin && (
              <>
                 <div>
                  <label className="block text-sm font-medium text-text-700 mb-1.5">Usuário</label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.username ? 'text-red-400' : 'text-text-400'}`}>
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      className={getInputClass('username')}
                      placeholder="seu_usuario"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                        if(fieldErrors.username) setFieldErrors({...fieldErrors, username: ''});
                      }} 
                    />
                  </div>
                  {fieldErrors.username && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{fieldErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-700 mb-1.5">Email</label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-text-400'}`}>
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      className={getInputClass('email')}
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if(fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                      }}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{fieldErrors.email}</p>}
                </div>
              </>
            )}
            
            {/* SENHA (COMUM AOS DOIS) */}
            <div>
              <label className="block text-sm font-medium text-text-700 mb-1.5">Senha</label>
              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-400' : 'text-text-400'}`}>
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  className={getInputClass('password')}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(fieldErrors.password) setFieldErrors({...fieldErrors, password: ''});
                  }}
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{fieldErrors.password}</p>}
            </div>

            {/* CONFIRMAÇÃO DE SENHA (SÓ REGISTRO) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.confirmPassword ? 'text-red-400' : 'text-text-400'}`}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    className={getInputClass('confirmPassword')}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if(fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''});
                    }}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            {/* TERMOS DE USO (SÓ REGISTRO) */}
            {!isLogin && (
              <div 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${termsAccepted ? 'border-accent-200 bg-accent-50/50' : 'border-background-200 hover:bg-background-100'}`}
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