import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { TopbarProps } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, isCollapsed, roleLabel }) => {
  const { userProfile } = useAuth();

  return (
    <header 
      className={`
        h-16 fixed top-0 right-0 z-20 flex items-center justify-between px-4 md:px-8
        transition-all duration-300 ease-in-out
        glass-panel border-b border-glass-border
        ${isCollapsed ? 'left-20' : 'md:left-64 left-0'}
      `}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {roleLabel}
          </h2>
          {userProfile?.companyName && (
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
               {userProfile.companyName}
             </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
           <div className="flex flex-col items-end hidden md:flex">
             <span className="text-sm font-bold text-gray-900 dark:text-white">
                {userProfile?.displayName || 'Usuário'}
             </span>
             <span className="text-xs text-gray-500 dark:text-gray-400">
                {userProfile?.email}
             </span>
           </div>

           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-gray-800">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
           </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;