import React from 'react';
import { LucideIcon } from 'lucide-react';

// Tipos de Cargo
export type UserRole = 'superuser' | 'admin' | 'employee';

// Perfil Estendido do Usuário (Salvo no Firestore)
export interface UserProfile {
  uid: string;
  email: string;
  username?: string; // Novo campo
  displayName?: string;
  role: UserRole;
  companyId?: string; // ID da empresa à qual pertence (null se for superuser)
  companyName?: string;
}

// Definição de Empresa (SaaS)
export interface Company {
  id: string;
  name: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive';
  createdAt: any; // Firestore Timestamp
  ownerEmail?: string; // Email do dono (opcional para criação inicial)
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  toggleCollapse: () => void;
  currentView: string;
  onNavigate: (viewId: string) => void;
  userRole: UserRole; // Passando o cargo para controlar o menu
}

export interface TopbarProps {
  toggleSidebar: () => void;
  isCollapsed: boolean;
  roleLabel: string; // Para mostrar o cargo na barra superior
}

export interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (viewId: string) => void;
  userRole: UserRole;
}