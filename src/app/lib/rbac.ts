// Definicao dos 5 papeis do sistema
export type UserRole = 
  | 'lideranca'           // Lideranca - acesso total
  | 'coordenador_geral'   // Coordenador Geral - acesso administrativo
  | 'coordenador_regional'// Coordenador Regional - acesso a regiao
  | 'captador_votos'      // Captador de Votos - cadastro e contatos
  | 'eleitor';            // Eleitor - apenas visualizacao basica

// Tabs disponiveis no sistema
export type Tab = 'home' | 'contacts' | 'agenda' | 'polls' | 'admin' | 'coordination';

// Labels amigaveis para os papeis
export const ROLE_LABELS: Record<UserRole, string> = {
  lideranca: 'Lideranca',
  coordenador_geral: 'Coordenador Geral',
  coordenador_regional: 'Coordenador Regional',
  captador_votos: 'Captador de Votos',
  eleitor: 'Eleitor'
};

// Definicao de permissoes por papel
export const ROLE_PERMISSIONS: Record<UserRole, {
  tabs: Tab[];
  canCreateElector: boolean;
  canDeleteElector: boolean;
  canExport: boolean;
  canManagePolls: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}> = {
  lideranca: {
    tabs: ['home', 'contacts', 'agenda', 'polls', 'admin', 'coordination'],
    canCreateElector: true,
    canDeleteElector: true,
    canExport: true,
    canManagePolls: true,
    canViewReports: true,
    canManageUsers: true
  },
  coordenador_geral: {
    tabs: ['home', 'contacts', 'agenda', 'polls', 'coordination'],
    canCreateElector: true,
    canDeleteElector: true,
    canExport: true,
    canManagePolls: true,
    canViewReports: true,
    canManageUsers: false
  },
  coordenador_regional: {
    tabs: ['home', 'contacts', 'agenda', 'polls'],
    canCreateElector: true,
    canDeleteElector: true,
    canExport: true,
    canManagePolls: false,
    canViewReports: true,
    canManageUsers: false
  },
  captador_votos: {
    tabs: ['home', 'contacts', 'agenda'],
    canCreateElector: true,
    canDeleteElector: false,
    canExport: false,
    canManagePolls: false,
    canViewReports: false,
    canManageUsers: false
  },
  eleitor: {
    tabs: ['home', 'agenda'],
    canCreateElector: false,
    canDeleteElector: false,
    canExport: false,
    canManagePolls: false,
    canViewReports: false,
    canManageUsers: false
  }
};

// Funcao para verificar se um papel tem acesso a uma tab
export function canAccessTab(role: UserRole, tab: Tab): boolean {
  return ROLE_PERMISSIONS[role].tabs.includes(tab);
}

// Funcao para obter as tabs permitidas para um papel
export function getAllowedTabs(role: UserRole): Tab[] {
  return ROLE_PERMISSIONS[role].tabs;
}

// Funcao para obter permissoes de um papel
export function getPermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role];
}
