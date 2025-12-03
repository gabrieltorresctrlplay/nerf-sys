import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginView from './components/LoginView';
import SaasCompaniesView from './components/SaasCompaniesView';
import EmployeesView from './components/EmployeesView';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { 
  Activity, 
  Sun, 
  Moon, 
  Laptop, 
  Palette, 
  Loader2,
  Building2,
  Users,
  CreditCard,
  Shield,
  Zap,
  Wrench,
  BarChart3,
  Lock,
  Briefcase
} from 'lucide-react';

// --- CONFIGURAÇÃO GLOBAL ---

const SettingsView = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie suas preferências e aparência do sistema.</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aparência</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Personalize como o NerfasSaaS se parece para você.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
            Tema da Interface
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t as any)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all hover:bg-white/10 flex flex-col gap-3
                  ${theme === t
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-glass-border bg-white/5'
                  }
                `}
              >
                <div className={`p-3 rounded-full w-fit ${theme === t ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'}`}>
                   {t === 'system' ? <Laptop size={24}/> : t === 'light' ? <Sun size={24}/> : <Moon size={24}/>}
                </div>
                <div>
                  <span className="block font-semibold text-gray-900 dark:text-white capitalize">
                    {t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Escuro'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARDS POR CARGO ---

// 1. Dashboard do SuperUser (Você)
const SuperUserDashboard: React.FC<{ onNavigate: (v:string) => void }> = ({ onNavigate }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">Painel do Administrador SaaS</h1>
        <p className="text-indigo-200">Visão completa de todas as empresas cadastradas e faturamento.</p>
      </div>
      <Shield className="absolute right-[-20px] bottom-[-40px] text-indigo-800 opacity-50" size={180} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass-card p-6 rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-lg"><Building2 /></div>
          <span className="text-green-600 text-sm font-bold">+12%</span>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Empresas Ativas</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">1,240</p>
      </div>
      <div className="glass-card p-6 rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg"><CreditCard /></div>
          <span className="text-green-600 text-sm font-bold">+5%</span>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Receita Mensal (MRR)</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 482k</p>
      </div>
      <div className="glass-card p-6 rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><Users /></div>
          <span className="text-blue-600 text-sm font-bold">Total</span>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Usuários na Plataforma</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">15,403</p>
      </div>
    </div>

    <div className="glass-panel rounded-xl p-6">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Gerenciamento do Sistema</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Você não tem acesso às ferramentas de usuário final aqui. Seu foco é infraestrutura.</p>
      <div className="flex gap-4">
        <button onClick={() => onNavigate('saas-companies')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/20">
          Gerenciar Clientes
        </button>
        <button className="px-4 py-2 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors border border-glass-border">
          Logs do Servidor
        </button>
      </div>
    </div>
  </div>
);

// 2. Dashboard do Admin da Empresa (Cliente)
const CompanyAdminDashboard: React.FC<{ onNavigate: (v:string) => void }> = ({ onNavigate }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Gestão Empresarial</h1>
          <p className="text-orange-100">Controle sua equipe, acesse dados sensíveis e gerencie ferramentas.</p>
          <button onClick={() => onNavigate('app-tools')} className="mt-6 bg-white text-orange-600 px-6 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-sm">
            Ir para Ferramentas do App
          </button>
        </div>
        <BriefcaseIcon className="absolute right-[-20px] bottom-[-30px] text-white opacity-20" size={160} />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Área Sensível - Só Admin Vê */}
      <div className="glass-card p-6 rounded-xl border-l-4 border-l-red-400 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-2 bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 rounded-bl-xl">
           <Lock size={12}/> DADOS SENSÍVEIS
         </div>
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
           <BarChart3 className="text-gray-500"/> Performance da Equipe
         </h3>
         <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-glass-border">
               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Produtividade Semanal</span>
               <span className="text-green-600 font-bold">+24%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-glass-border">
               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custo Operacional</span>
               <span className="text-red-500 font-bold">R$ 12.450,00</span>
            </div>
         </div>
         <button onClick={() => onNavigate('financial')} className="w-full mt-4 py-2 border border-glass-border text-gray-600 dark:text-gray-300 rounded-lg hover:bg-white/20 text-sm font-medium transition-colors">
           Ver Relatório Financeiro Completo
         </button>
      </div>

      {/* Gestão de Funcionários */}
      <div className="glass-card p-6 rounded-xl">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
           <Users className="text-gray-500"/> Colaboradores
         </h3>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gerencie acessos e licenças da sua equipe.</p>
         <div className="flex -space-x-2 mb-4">
           {[1,2,3,4].map(i => (
             <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
               USR
             </div>
           ))}
           <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
             +12
           </div>
         </div>
         <button onClick={() => onNavigate('employees')} className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
           Gerenciar todos os funcionários &rarr;
         </button>
      </div>
    </div>
  </div>
);

// 3. Dashboard do Funcionário (Usuário Final)
const EmployeeDashboard: React.FC<{ onNavigate: (v:string) => void }> = ({ onNavigate }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-500/20">
      <h1 className="text-2xl font-bold mb-2">Olá, bem-vindo de volta!</h1>
      <p className="text-blue-100 max-w-xl">
        Acesse as ferramentas disponibilizadas pela sua empresa para realizar suas tarefas diárias com eficiência.
      </p>
    </div>

    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Zap size={20} className="text-indigo-600" />
        Minhas Ferramentas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Gestão de Tarefas', 'Automação de Email', 'Chat Corporativo'].map((tool, idx) => (
          <button 
            key={idx}
            onClick={() => onNavigate('app-tools')}
            className="glass-card p-6 rounded-xl hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Wrench size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{tool}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Clique para acessar esta funcionalidade.</p>
          </button>
        ))}
      </div>
    </div>

    <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 flex gap-3 text-amber-800 text-sm backdrop-blur-sm">
      <Shield size={20} className="shrink-0"/>
      <p>Você tem acesso nível <strong>Colaborador</strong>. Configurações administrativas e dados financeiros são restritos aos gestores.</p>
    </div>
  </div>
);

// 4. Dashboard de Visitante (Sem Empresa)
const VisitorDashboard: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto animate-in zoom-in-95">
    <div className="bg-white/20 p-6 rounded-full mb-6 text-gray-500 backdrop-blur-md border border-white/20">
      <Users size={64} />
    </div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Aguardando Vínculo</h1>
    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
      Seu cadastro foi realizado com sucesso, mas você ainda não está vinculado a nenhuma empresa.
    </p>
    <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl text-blue-800 text-sm text-left backdrop-blur-sm">
      <strong>Como prosseguir:</strong>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Se você contratou o SaaS, aguarde a ativação pelo Administrador.</li>
        <li>Se você é funcionário, peça ao seu gestor para adicionar seu email à equipe.</li>
      </ul>
    </div>
  </div>
);

// --- COMPONENTE PLACEHOLDER PARA PÁGINAS EM CONSTRUÇÃO ---
const PlaceholderPage: React.FC<{ title: string, icon: any }> = ({ title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 animate-in zoom-in-95 duration-300">
    <div className="glass-panel p-6 rounded-full mb-4">
      <Icon size={48} />
    </div>
    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
    <p>Esta funcionalidade está disponível para seu nível de acesso.</p>
  </div>
);

// Ícone auxiliar
const BriefcaseIcon = ({size, className}: {size:number, className?:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    const role = userProfile?.role || 'visitor'; 

    if (currentView === 'settings') return <SettingsView />;

    switch (role) {
      case 'superuser':
        if (currentView === 'dashboard') return <SuperUserDashboard onNavigate={setCurrentView} />;
        if (currentView === 'saas-companies') return <SaasCompaniesView />; 
        if (currentView === 'saas-metrics') return <PlaceholderPage title="Métricas Globais" icon={Activity} />;
        break;

      case 'admin':
        if (currentView === 'dashboard') return <CompanyAdminDashboard onNavigate={setCurrentView} />;
        if (currentView === 'employees') return <EmployeesView />;
        if (currentView === 'financial') return <PlaceholderPage title="Financeiro da Empresa" icon={CreditCard} />;
        if (currentView === 'app-tools') return <PlaceholderPage title="Ferramentas" icon={Wrench} />;
        break;

      case 'employee':
        if (currentView === 'dashboard') return <EmployeeDashboard onNavigate={setCurrentView} />;
        if (currentView === 'app-tools') return <PlaceholderPage title="Ferramentas" icon={Wrench} />;
        break;
      
      default:
        return <VisitorDashboard />;
    }

    return <VisitorDashboard />;
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      userRole={userProfile?.role || 'employee'}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;