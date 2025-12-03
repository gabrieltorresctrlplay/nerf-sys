import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Briefcase,
  Wrench,
  Activity
} from 'lucide-react';
import { NavItem, SidebarProps } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  isMobile, 
  isOpen, 
  onClose, 
  toggleCollapse,
  currentView,
  onNavigate,
  userRole
}) => {
  
  const { logout } = useAuth();

  const navItems: NavItem[] = useMemo(() => {
    const common: NavItem[] = [
       { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    switch (userRole) {
      case 'superuser':
        return [
          { id: 'dashboard', label: 'Visão Geral (SaaS)', icon: LayoutDashboard },
          { id: 'saas-companies', label: 'Gerenciar Empresas', icon: Building2 },
          { id: 'saas-metrics', label: 'Métricas Globais', icon: Activity },
          ...common
        ];
      
      case 'admin':
        return [
          { id: 'dashboard', label: 'Painel da Empresa', icon: LayoutDashboard },
          { id: 'employees', label: 'Funcionários', icon: Users },
          { id: 'financial', label: 'Financeiro', icon: Briefcase },
          { id: 'app-tools', label: 'Acessar Ferramentas', icon: Wrench },
          ...common
        ];

      case 'employee':
        return [
          { id: 'dashboard', label: 'Minhas Tarefas', icon: LayoutDashboard },
          { id: 'app-tools', label: 'Ferramentas', icon: Wrench },
          ...common
        ];

      default:
        return common;
    }
  }, [userRole]);

  // Styling logic
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mobileClasses = isMobile 
    ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') 
    : `${sidebarWidth}`;

  // Glassmorphism classes applied here
  const sidebarClasses = `
    fixed top-0 left-0 z-40 h-screen 
    glass-panel border-r border-glass-border
    transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col
    ${mobileClasses}
  `;

  const showLogo = !isCollapsed || (isMobile && isOpen);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${isMobile && isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={sidebarClasses}>
        
        {/* HEADER */}
        <div className="flex items-center h-16 px-3 relative shrink-0 border-b border-glass-border">
          
          <div className="w-14 flex items-center justify-center shrink-0 relative h-10">
            <div 
              className={`
                absolute inset-0 flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
              `}
            >
               <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <span className="font-bold text-xl heading-font">N</span>
              </div>
            </div>

            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className={`
                  absolute inset-0 flex items-center justify-center
                  bg-white/20 hover:bg-white/40 text-gray-700 dark:text-gray-200
                  rounded-xl backdrop-blur-md
                  transition-all duration-300 ease-in-out cursor-pointer
                  ${!showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
                `}
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
            
          <div className={`
            flex flex-col justify-center overflow-hidden whitespace-nowrap
            transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
            ${showLogo ? 'w-32 opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}
          `}>
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight leading-none">
              Nerfas<span className="text-indigo-600 dark:text-indigo-400">SaaS</span>
            </span>
          </div>

          {!isMobile && showLogo && (
            <button 
              onClick={toggleCollapse}
              className={`
                absolute right-3 p-1.5
                text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400
                hover:bg-black/5 dark:hover:bg-white/10 rounded-lg
                transition-all duration-200
              `}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-2 custom-scrollbar px-3">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) onClose();
                }}
                className={`
                  relative flex items-center h-12 rounded-xl transition-all duration-200 group w-full text-left
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
                  }
                `}
              >
                <div className="w-14 flex items-center justify-center shrink-0">
                   <item.icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                
                <span className={`
                  whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                  ${showLogo ? 'w-auto opacity-100' : 'w-0 opacity-0'}
                `}>
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {!isMobile && !showLogo && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50 whitespace-nowrap translate-x-2 group-hover:translate-x-0">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Badge */}
        {showLogo && (
          <div className="px-6 py-4">
            <div className={`
              text-xs font-bold uppercase tracking-wider py-1.5 px-2 rounded-lg text-center border backdrop-blur-sm
              ${userRole === 'superuser' ? 'bg-purple-100/50 text-purple-800 border-purple-200' :
                userRole === 'admin' ? 'bg-amber-100/50 text-amber-800 border-amber-200' :
                'bg-blue-100/50 text-blue-800 border-blue-200'}
            `}>
              {userRole === 'superuser' ? 'Desenvolvedor' : 
               userRole === 'admin' ? 'Gestor' : 'Colaborador'}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-glass-border mt-auto">
          <button
            onClick={logout}
            className={`
              w-full flex items-center h-12 rounded-xl text-left transition-all duration-200 group relative
              text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
            `}
          >
            <div className="w-14 flex items-center justify-center shrink-0">
               <LogOut size={22} />
            </div>
            
            <span className={`
              whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
              ${showLogo ? 'w-auto opacity-100' : 'w-0 opacity-0'}
            `}>
              Sair
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;