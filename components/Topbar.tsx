import React from 'react';
import { Menu, ShieldCheck, Briefcase, User } from 'lucide-react';
import { TopbarProps } from '../docs/types';
import { useAuth } from '../contexts/AuthContext';

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, isCollapsed, roleLabel }) => {
  const { user, userProfile } = useAuth();

  // Pega as iniciais do email ou nome
  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const companyName = userProfile?.companyName;

  // Ícone baseado no cargo
  const getRoleIcon = () => {
    switch (userProfile?.role) {
      case 'superuser': return <ShieldCheck size={16} className="text-purple-600" />;
      case 'admin': return <Briefcase size={16} className="text-amber-600" />;
      default: return <User size={16} className="text-blue-600" />;
    }
  };

  return (
    <header 
      className={`
        h-16 bg-background-50/80 backdrop-blur-md 
        border-b border-background-200
        fixed top-0 right-0 z-30 transition-all duration-300
        flex items-center justify-between px-4 md:px-6
      `}
      style={{ left: 0 }}
    >
      {/* Spacer para empurrar o conteúdo dependendo da sidebar (apenas desktop) */}
      <div 
        className={`transition-all duration-300 hidden md:block`}
        style={{ width: isCollapsed ? '5rem' : '16rem' }} 
      />

      {/* Lado Esquerdo: Toggle Mobile e Infos da Empresa */}
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-text-600 hover:bg-background-100 md:hidden focus:outline-none shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>

        {companyName && userProfile?.role !== 'superuser' && (
          <div className="flex flex-col">
             <span className="text-xs text-text-500 font-medium uppercase tracking-wide">Empresa</span>
             <span className="text-sm font-bold text-text-900 truncate">{companyName}</span>
          </div>
        )}

        {userProfile?.role === 'superuser' && (
           <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full">
             <ShieldCheck size={14} className="text-purple-700"/>
             <span className="text-xs font-bold text-purple-700 uppercase">Modo Deus (Admin SaaS)</span>
           </div>
        )}
      </div>

      {/* Lado Direito: Perfil do Usuário */}
      <div className="flex items-center pl-4 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-background-100 transition-colors">
          <div className="text-right hidden md:block">
            <p className="font-semibold text-text-800 leading-none text-sm">{displayName}</p>
            <p className="text-xs text-text-500 mt-1 flex items-center justify-end gap-1">
               {getRoleIcon()}
               {roleLabel}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-background-50 font-bold border-2 border-background-50 shadow-sm
            ${userProfile?.role === 'superuser' ? 'bg-purple-600' : userProfile?.role === 'admin' ? 'bg-amber-600' : 'bg-blue-600'}
          `}>
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;