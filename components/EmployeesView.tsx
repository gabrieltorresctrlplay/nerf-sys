import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { initializeApp, deleteApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Trash2, 
  Shield,
  Briefcase
} from 'lucide-react';

interface Employee {
  uid: string;
  displayName: string;
  username: string; // Adicionado
  email: string;
  role: string;
  createdAt: any;
}

const EmployeesView: React.FC = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Estado para username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'users'), 
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Employee[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          uid: doc.id,
          displayName: data.displayName || 'Sem nome',
          username: data.username || data.email?.split('@')[0] || 'user',
          email: data.email,
          role: data.role,
          createdAt: data.createdAt
        });
      });
      setEmployees(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !username || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCreating(true);

    let secondaryApp: any;

    try {
      const appName = "secondaryAppForUserCreation";
      const existingApps = getApps();
      const foundApp = existingApps.find(app => app.name === appName);
      secondaryApp = foundApp || initializeApp(firebaseConfig, appName);

      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: email,
        displayName: name,
        username: username.toLowerCase().replace(/\s/g, ''), // Usa o username escolhido
        role: 'employee',
        companyId: userProfile?.companyId,
        companyName: userProfile?.companyName,
        createdAt: new Date().toISOString()
      });

      await signOut(secondaryAuth);

      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setIsModalOpen(false);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado no sistema.');
      } else {
        setError('Erro ao criar funcionário. Tente novamente.');
      }
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp).catch(console.error);
      }
      setCreating(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (confirm("Tem certeza que deseja remover este funcionário? O acesso dele será revogado.")) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao remover funcionário.");
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Users className="text-indigo-600 dark:text-indigo-400" size={32} />
            Gestão de Equipe
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gerencie os acessos da <strong>{userProfile?.companyName || 'Sua Empresa'}</strong>.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 w-fit"
        >
          <Plus size={20} />
          Adicionar Funcionário
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-glass-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-gray-500"
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium px-2">
            {employees.length} membros
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum funcionário encontrado. Adicione o primeiro membro da sua equipe!
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                <tr className="bg-white/20 dark:bg-black/20 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-glass-border">
                  <th className="px-6 py-4 font-semibold">Nome / Usuário</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Função</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
               </thead>
               <tbody className="divide-y divide-glass-border">
                 {employees.map((emp) => (
                   <tr key={emp.uid} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                           {emp.displayName.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{emp.displayName}</div>
                            <div className="text-xs text-gray-500">@{emp.username}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                       {emp.email}
                     </td>
                     <td className="px-6 py-4">
                       {emp.role === 'admin' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
                           <Shield size={12} /> Gestor
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
                           <Briefcase size={12} /> Colaborador
                         </span>
                       )}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         {emp.uid !== userProfile?.uid && (
                           <button 
                             onClick={() => handleDelete(emp.uid)}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                             title="Remover Acesso"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-glass-border flex justify-between items-center bg-white/50 dark:bg-black/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Colaborador</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50/90 text-red-700 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                    placeholder="Ex: João da Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome de Usuário (Acesso)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                    placeholder="joaosilva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                    placeholder="joao@suaempresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha Provisória</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-glass-border text-gray-700 dark:text-gray-300 hover:bg-white/10 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
                >
                  {creating ? <Loader2 className="animate-spin" size={18} /> : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesView;