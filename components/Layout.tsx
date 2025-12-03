import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { LayoutProps } from '../types';

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isSmallScreen);
      if (!isSmallScreen) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'superuser': return 'Super Admin';
      case 'admin': return 'Gestor';
      case 'employee': return 'Funcionário';
      default: return 'Visitante';
    }
  }

  return (
    <div className="min-h-screen flex text-gray-900 dark:text-gray-100 font-sans">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobile={isMobile}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        toggleCollapse={toggleCollapse}
        currentView={currentView}
        onNavigate={onNavigate}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Topbar 
          toggleSidebar={toggleMobileSidebar} 
          isCollapsed={isCollapsed}
          roleLabel={getRoleLabel()}
        />

        {/* Content Wrapper */}
        <main 
          className={`
            flex-1 p-4 md:p-8 mt-16 overflow-x-hidden transition-all duration-300
            ${!isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : ''}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;