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
  ShieldAlert,
  Wrench,
  Activity
} from 'lucide-react';
import { NavItem, SidebarProps, UserRole } from '../docs/types';
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

  // Define os itens de menu baseados no cargo
  const navItems: NavItem[] = useMemo(() => {
    const common: NavItem[] = [
       // Todos veem configurações básicas (perfil, tema)
       { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    switch (userRole) {
      case 'superuser': // DONO DO SAAS
        return [
          { id: 'dashboard', label: 'Visão Geral (SaaS)', icon: LayoutDashboard },
          { id: 'saas-companies', label: 'Gerenciar Empresas', icon: Building2 },
          { id: 'saas-metrics', label: 'Métricas Globais', icon: Activity },
          ...common
        ];
      
      case 'admin': // DONO DA EMPRESA CLIENTE
        return [
          { id: 'dashboard', label: 'Painel da Empresa', icon: LayoutDashboard },
          { id: 'employees', label: 'Funcionários', icon: Users },
          { id: 'financial', label: 'Financeiro', icon: Briefcase },
          { id: 'app-tools', label: 'Acessar Ferramentas', icon: Wrench },
          ...common
        ];

      case 'employee': // FUNCIONÁRIO DA EMPRESA
        return [
          { id: 'dashboard', label: 'Minhas Tarefas', icon: LayoutDashboard },
          { id: 'app-tools', label: 'Ferramentas', icon: Wrench },
          ...common
        ];

      default:
        return common;
    }
  }, [userRole]);

  // Width logic
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mobileClasses = isMobile 
    ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') 
    : `${sidebarWidth}`;

  const sidebarClasses = `
    fixed top-0 left-0 z-40 h-screen 
    bg-background-50 border-r border-background-200
    transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col
    ${mobileClasses}
  `;

  const overlayClasses = `
    fixed inset-0 bg-black/50 z-30 transition-opacity duration-300
    ${isMobile && isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
  `;

  // Helper para controlar a visibilidade de montagem
  const showLogo = !isCollapsed || (isMobile && isOpen);

  return (
    <>
      {/* Mobile Overlay */}
      <div className={overlayClasses} onClick={onClose} aria-hidden="true" />

      {/* Sidebar Element */}
      <aside className={sidebarClasses}>
        
        {/* HEADER */}
        <div className="flex items-center h-16 px-3 relative shrink-0 border-b border-background-200">
          
          <div className="w-14 flex items-center justify-center shrink-0 relative h-10">
            <div 
              className={`
                absolute inset-0 flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
              `}
            >
               <div className={`
                 h-9 w-9 flex items-center justify-center rounded-xl text-background-50
                 ${userRole === 'superuser' ? 'bg-purple-600' : userRole === 'admin' ? 'bg-accent-600' : 'bg-blue-600'}
               `}>
                <span className="font-bold text-xl">
                  {userRole === 'superuser' ? 'S' : userRole === 'admin' ? 'E' : 'F'}
                </span>
              </div>
            </div>

            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className={`
                  absolute inset-0 flex items-center justify-center
                  bg-accent-50 text-accent-700
                  rounded-xl hover:bg-accent-100
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
            ${showLogo ? 'w-32 opacity-100 ml-1' : 'w-0 opacity-0 ml-0'}
          `}>
            <span className="font-bold text-xl text-text-900 tracking-tight leading-none pl-2">
              Nerfas<span className="text-accent-600">SaaS</span>
            </span>
          </div>

          {!isMobile && showLogo && (
            <button 
              onClick={toggleCollapse}
              className={`
                absolute right-3 p-1.5
                text-text-400 hover:text-accent-600
                hover:bg-background-100 rounded-lg
                transition-all duration-200
              `}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav 
          className={`
            flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-2 custom-scrollbar
            px-3
          `}
        >
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
                    ? 'bg-accent-100 text-accent-800 font-medium'
                    : 'text-text-600 hover:bg-background-100 hover:text-text-900'
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

                {!isMobile && !showLogo && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-text-800 text-background-50 text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50 whitespace-nowrap translate-x-2 group-hover:translate-x-0">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-text-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Badge (Apenas visível quando aberto) */}
        {showLogo && (
          <div className="px-6 py-2">
            <div className={`
              text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-md text-center border
              ${userRole === 'superuser' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                userRole === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                'bg-blue-100 text-blue-700 border-blue-200'}
            `}>
              {userRole === 'superuser' ? 'Desenvolvedor' : 
               userRole === 'admin' ? 'Dono da Empresa' : 'Colaborador'}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-background-200 mt-auto">
          <button
            onClick={logout}
            className={`
              w-full flex items-center h-12 rounded-xl text-left transition-all duration-200 group relative
              text-text-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20
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