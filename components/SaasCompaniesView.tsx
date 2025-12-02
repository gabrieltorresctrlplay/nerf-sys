import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Company } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Trash2, 
  MoreVertical, 
  Copy, 
  Check, 
  ShieldCheck,
  Zap,
  Star,
  Box,
  Loader2,
  UserPlus
} from 'lucide-react';

const SaasCompaniesView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  // Form States - Create Company
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyPlan, setNewCompanyPlan] = useState<'free'|'basic'|'pro'|'enterprise'>('free');
  const [creating, setCreating] = useState(false);

  // Form States - Assign Owner
  const [ownerEmail, setOwnerEmail] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Helper State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Fetch Companies (Realtime)
  useEffect(() => {
    const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
      setCompanies(companyList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Create Company Logic
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setCreating(true);
    try {
      await addDoc(collection(db, 'companies'), {
        name: newCompanyName,
        plan: newCompanyPlan,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      
      // Reset form
      setNewCompanyName('');
      setNewCompanyPlan('free');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      alert("Erro ao criar empresa. Verifique o console.");
    } finally {
      setCreating(false);
    }
  };

  // 3. Assign Owner Logic
  const openOwnerModal = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setOwnerEmail('');
    setIsOwnerModalOpen(true);
  };

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail || !selectedCompanyId) return;

    setAssigning(true);
    try {
      // a) Achar a empresa
      const company = companies.find(c => c.id === selectedCompanyId);
      if (!company) throw new Error("Empresa não encontrada");

      // b) Achar o usuário pelo email
      const q = query(collection(db, 'users'), where('email', '==', ownerEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Usuário não encontrado. Peça para ele se cadastrar na plataforma primeiro.");
        setAssigning(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;

      // c) Atualizar a empresa com o email do dono
      await updateDoc(doc(db, 'companies', selectedCompanyId), {
        ownerEmail: ownerEmail
      });

      // d) Atualizar o usuário para ser Admin e vincular à empresa
      await updateDoc(doc(db, 'users', userId), {
        role: 'admin', // PROMOVE PARA DONO
        companyId: selectedCompanyId,
        companyName: company.name
      });

      alert(`Sucesso! O usuário ${ownerEmail} agora é dono da empresa ${company.name}.`);
      setIsOwnerModalOpen(false);

    } catch (error) {
      console.error("Erro ao vincular:", error);
      alert("Erro ao vincular dono.");
    } finally {
      setAssigning(false);
    }
  };

  // 4. Actions
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza? Isso pode deixar usuários órfãos.')) {
      await deleteDoc(doc(db, 'companies', id));
    }
  };

  const handleToggleStatus = async (company: Company) => {
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'companies', company.id), { status: newStatus });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render Helpers
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return <ShieldCheck className="text-purple-600" size={18} />;
      case 'pro': return <Zap className="text-amber-500" size={18} />;
      case 'basic': return <Star className="text-blue-500" size={18} />;
      default: return <Box className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 flex items-center gap-3">
            <Building2 className="text-accent-600" size={32} />
            Empresas Cadastradas
          </h1>
          <p className="text-text-600 mt-2">Gerencie os clientes do seu SaaS (Nível 1).</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent-600 hover:bg-accent-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-accent-600/20 flex items-center gap-2 transition-all active:scale-95 w-fit"
        >
          <Plus size={20} />
          Nova Empresa
        </button>
      </div>

      {/* List / Table */}
      <div className="bg-background-50 rounded-xl border border-background-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-background-200 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar empresas..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-100 border-none text-text-900 focus:ring-2 focus:ring-accent-500/50 outline-none"
            />
          </div>
          <div className="text-xs text-text-500 font-medium px-2">
            Total: {companies.length}
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-accent-600" size={32} />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-text-500">
            Nenhuma empresa cadastrada. Clique em "Nova Empresa" para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-100/50 text-text-500 text-xs uppercase tracking-wider border-b border-background-200">
                  <th className="px-6 py-4 font-semibold">Empresa / ID</th>
                  <th className="px-6 py-4 font-semibold">Dono (Admin)</th>
                  <th className="px-6 py-4 font-semibold">Plano</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-background-100/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-900 text-base">{company.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[10px] bg-background-200 text-text-600 px-1.5 py-0.5 rounded font-mono">
                            {company.id}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(company.id)}
                            className="text-text-400 hover:text-accent-600 transition-colors"
                            title="Copiar ID"
                          >
                            {copiedId === company.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.ownerEmail ? (
                        <span className="text-sm text-text-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 truncate max-w-[150px] inline-block">
                          {company.ownerEmail}
                        </span>
                      ) : (
                        <button 
                          onClick={() => openOwnerModal(company.id)}
                          className="text-xs font-bold text-accent-600 hover:text-accent-700 hover:underline flex items-center gap-1"
                        >
                          <UserPlus size={14} /> Vincular Dono
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(company.plan)}
                        <span className="text-sm font-medium capitalize text-text-700">
                          {company.plan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(company)}
                        className={`
                          px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer select-none transition-all
                          ${company.status === 'active' 
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}
                        `}
                      >
                        {company.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleDelete(company.id)}
                            className="p-2 text-text-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Empresa"
                         >
                           <Trash2 size={18} />
                         </button>
                         <button className="p-2 text-text-400 hover:text-text-900 hover:bg-background-200 rounded-lg transition-colors">
                           <MoreVertical size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação de Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background-50 rounded-2xl w-full max-w-md shadow-2xl border border-background-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-background-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-text-900">Nova Empresa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-400 hover:text-text-900">✕</button>
            </div>
            
            <form onSubmit={handleCreateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ex: Tech Solutions Ltda"
                  className="w-full px-4 py-2.5 rounded-xl bg-background-100 border border-background-300 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Plano de Assinatura</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['free', 'basic', 'pro', 'enterprise'] as const).map((plan) => (
                     <button
                       key={plan}
                       type="button"
                       onClick={() => setNewCompanyPlan(plan)}
                       className={`
                         flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all
                         ${newCompanyPlan === plan 
                           ? 'border-accent-600 bg-accent-50 text-accent-700 ring-1 ring-accent-600' 
                           : 'border-background-200 bg-background-50 text-text-600 hover:bg-background-100'}
                       `}
                     >
                        {getPlanIcon(plan)}
                        <span className="capitalize">{plan}</span>
                     </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-background-300 text-text-700 hover:bg-background-100 font-medium">Cancelar</button>
                <button type="submit" disabled={creating || !newCompanyName} className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-medium shadow-lg shadow-accent-600/20 transition-all flex justify-center items-center gap-2">
                  {creating ? <Loader2 className="animate-spin" size={18} /> : 'Criar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Definir Dono */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background-50 rounded-2xl w-full max-w-sm shadow-2xl border border-background-200 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-background-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-text-900">Vincular Dono</h3>
              <button onClick={() => setIsOwnerModalOpen(false)} className="text-text-400 hover:text-text-900">✕</button>
            </div>
            <form onSubmit={handleAssignOwner} className="p-6 space-y-4">
               <p className="text-sm text-text-600">
                 Digite o email do usuário cadastrado na plataforma para torná-lo <strong>Admin</strong> desta empresa.
               </p>
               <div>
                <label className="block text-sm font-medium text-text-700 mb-1.5">Email do Usuário</label>
                <input 
                  type="email" 
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-background-100 border border-background-300 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 outline-none"
                  autoFocus
                  required
                />
              </div>
              <div className="pt-2">
                 <button type="submit" disabled={assigning || !ownerEmail} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2">
                  {assigning ? <Loader2 className="animate-spin" size={18} /> : 'Vincular Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasCompaniesView;