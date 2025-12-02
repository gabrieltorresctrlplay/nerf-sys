import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { initializeApp, deleteApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '@/lib/firebase';
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
  MoreVertical,
  Shield,
  Briefcase
} from 'lucide-react';

// Interface local para funcionário
interface Employee {
  uid: string;
  displayName: string;
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de Criação
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca Funcionários da Empresa Atual
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
        // Filtrar para não mostrar o próprio Admin na lista de "funcionários" se desejar,
        // mas geralmente é útil ver todos. Vamos manter todos.
        list.push({
          uid: doc.id,
          displayName: data.displayName || 'Sem nome',
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

  // Lógica de Criação de Funcionário
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCreating(true);

    // TRUQUE DO FIREBASE:
    // Para criar um usuário sem deslogar o admin atual, precisamos inicializar 
    // uma segunda instância (app) do Firebase temporariamente.
    let secondaryApp: any;

    try {
      // Nome único para o app secundário para evitar conflitos
      const appName = "secondaryAppForUserCreation";
      
      // Verifica se já existe, senão cria
      const existingApps = getApps();
      const foundApp = existingApps.find(app => app.name === appName);
      secondaryApp = foundApp || initializeApp(firebaseConfig, appName);

      const secondaryAuth = getAuth(secondaryApp);

      // 1. Criar o usuário na Auth (usando a instância secundária)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      // 2. Criar o documento no Firestore (usando a instância principal 'db')
      // Isso garante que o admin atual tenha permissão de escrita
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: email,
        displayName: name,
        username: email.split('@')[0], // username simples gerado
        role: 'employee', // FORÇA SER FUNCIONÁRIO
        companyId: userProfile?.companyId, // VINCULA À EMPRESA DO ADMIN
        companyName: userProfile?.companyName,
        createdAt: new Date().toISOString()
      });

      // 3. Deslogar da instância secundária para limpar estado
      await signOut(secondaryAuth);

      // Limpar formulário e fechar modal
      setName('');
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
      // Se necessário, deletar o app secundário para liberar memória
      // (Algumas versões do SDK recomendam deleteApp)
      if (secondaryApp) {
        await deleteApp(secondaryApp).catch(console.error);
      }
      setCreating(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (confirm("Tem certeza que deseja remover este funcionário? O acesso dele será revogado.")) {
      // Nota: Deletar do Firestore é fácil. Deletar do Authentication requer Cloud Functions ou Admin SDK.
      // Como estamos no frontend, vamos apenas deletar o registro do banco de dados (users) e/ou mudar status.
      // Para este exemplo, deletaremos o documento 'users', o que efetivamente "quebra" o login no App 
      // (pois o App verifica o perfil no Firestore).
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
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 flex items-center gap-3">
            <Users className="text-accent-600" size={32} />
            Gestão de Equipe
          </h1>
          <p className="text-text-600 mt-2">
            Gerencie os acessos da <strong>{userProfile?.companyName || 'Sua Empresa'}</strong>.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-accent-600/20 flex items-center gap-2 transition-all active:scale-95 w-fit"
        >
          <Plus size={20} />
          Adicionar Funcionário
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-background-50 rounded-xl border border-background-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-background-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-100 border-none text-text-900 focus:ring-2 focus:ring-accent-500/50 outline-none"
            />
          </div>
          <div className="text-xs text-text-500 font-medium px-2">
            {employees.length} membros
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-accent-600" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-text-500">
            Nenhum funcionário encontrado. Adicione o primeiro membro da sua equipe!
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                <tr className="bg-background-100/50 text-text-500 text-xs uppercase tracking-wider border-b border-background-200">
                  <th className="px-6 py-4 font-semibold">Nome</th>
                  <th className="px-6 py-4 font-semibold">Email / Acesso</th>
                  <th className="px-6 py-4 font-semibold">Função</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
               </thead>
               <tbody className="divide-y divide-background-200">
                 {employees.map((emp) => (
                   <tr key={emp.uid} className="hover:bg-background-100/50 transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-sm">
                           {emp.displayName.substring(0,2).toUpperCase()}
                         </div>
                         <span className="font-semibold text-text-900">{emp.displayName}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-text-600 text-sm">
                       {emp.email}
                     </td>
                     <td className="px-6 py-4">
                       {emp.role === 'admin' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                           <Shield size={12} /> Gestor
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                           <Briefcase size={12} /> Colaborador
                         </span>
                       )}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         {emp.uid !== userProfile?.uid && ( // Não pode deletar a si mesmo
                           <button 
                             onClick={() => handleDelete(emp.uid)}
                             className="p-2 text-text-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background-50 rounded-2xl w-full max-w-md shadow-2xl border border-background-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-background-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-text-900">Novo Colaborador</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-400 hover:text-text-900">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 outline-none transition-all"
                    placeholder="joao@suaempresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-100 border border-background-300 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <p className="text-xs text-text-500 mt-1">O funcionário poderá alterar a senha depois.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-background-300 text-text-700 hover:bg-background-100 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-medium shadow-lg shadow-accent-600/20 transition-all flex justify-center items-center gap-2"
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