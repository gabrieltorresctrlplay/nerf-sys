import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { LayoutProps } from '../types';

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, userRole }) => {
  // State for desktop collapse (default expanded on large screens)
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State for mobile drawer open/close
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // State to track if device is mobile
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
    <div className="min-h-screen bg-background-100 transition-colors duration-300 flex">
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
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out w-full`}
      >
        <Topbar 
          toggleSidebar={toggleMobileSidebar} 
          isCollapsed={isCollapsed}
          roleLabel={getRoleLabel()}
        />

        {/* Content Wrapper with dynamic margin for desktop sidebar */}
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