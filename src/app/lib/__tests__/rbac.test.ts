import { describe, it, expect } from 'vitest';
import {
  canAccessTab,
  getAllowedTabs,
  getPermissions,
  ROLE_LABELS,
  type UserRole,
  type Tab,
} from '../rbac';

// ─── ROLE_LABELS ──────────────────────────────────────────────────────────────

describe('ROLE_LABELS', () => {
  it('cobre todos os 5 papéis', () => {
    const roles: UserRole[] = [
      'lideranca',
      'coordenador_geral',
      'coordenador_regional',
      'captador_votos',
      'eleitor',
    ];
    roles.forEach(role => {
      expect(ROLE_LABELS[role]).toBeTruthy();
    });
  });
});

// ─── canAccessTab ─────────────────────────────────────────────────────────────

describe('canAccessTab', () => {
  it('lideranca acessa todas as tabs', () => {
    const allTabs: Tab[] = ['home', 'contacts', 'agenda', 'polls', 'admin', 'coordination'];
    allTabs.forEach(tab => {
      expect(canAccessTab('lideranca', tab)).toBe(true);
    });
  });

  it('eleitor só acessa home e agenda', () => {
    expect(canAccessTab('eleitor', 'home')).toBe(true);
    expect(canAccessTab('eleitor', 'agenda')).toBe(true);
    expect(canAccessTab('eleitor', 'contacts')).toBe(false);
    expect(canAccessTab('eleitor', 'admin')).toBe(false);
    expect(canAccessTab('eleitor', 'coordination')).toBe(false);
    expect(canAccessTab('eleitor', 'polls')).toBe(false);
  });

  it('captador_votos não acessa admin nem coordination', () => {
    expect(canAccessTab('captador_votos', 'home')).toBe(true);
    expect(canAccessTab('captador_votos', 'contacts')).toBe(true);
    expect(canAccessTab('captador_votos', 'admin')).toBe(false);
    expect(canAccessTab('captador_votos', 'coordination')).toBe(false);
  });

  it('coordenador_geral não acessa admin', () => {
    expect(canAccessTab('coordenador_geral', 'admin')).toBe(false);
    expect(canAccessTab('coordenador_geral', 'coordination')).toBe(true);
  });

  it('role undefined usa eleitor como fallback', () => {
    expect(canAccessTab(undefined, 'admin')).toBe(false);
    expect(canAccessTab(undefined, 'home')).toBe(true);
  });
});

// ─── getAllowedTabs ────────────────────────────────────────────────────────────

describe('getAllowedTabs', () => {
  it('lideranca recebe 6 tabs', () => {
    expect(getAllowedTabs('lideranca')).toHaveLength(6);
  });

  it('eleitor recebe 2 tabs', () => {
    expect(getAllowedTabs('eleitor')).toEqual(['home', 'agenda']);
  });

  it('undefined retorna ao menos home', () => {
    const tabs = getAllowedTabs(undefined);
    expect(tabs).toContain('home');
  });
});

// ─── getPermissions ───────────────────────────────────────────────────────────

describe('getPermissions — lideranca', () => {
  const perms = getPermissions('lideranca');

  it('pode criar, deletar e exportar', () => {
    expect(perms.canCreateElector).toBe(true);
    expect(perms.canDeleteElector).toBe(true);
    expect(perms.canExport).toBe(true);
  });

  it('pode gerenciar usuários e relatórios', () => {
    expect(perms.canManageUsers).toBe(true);
    expect(perms.canViewReports).toBe(true);
    expect(perms.canManagePolls).toBe(true);
  });
});

describe('getPermissions — captador_votos', () => {
  const perms = getPermissions('captador_votos');

  it('pode criar mas não deletar', () => {
    expect(perms.canCreateElector).toBe(true);
    expect(perms.canDeleteElector).toBe(false);
  });

  it('não pode exportar nem gerenciar usuários', () => {
    expect(perms.canExport).toBe(false);
    expect(perms.canManageUsers).toBe(false);
    expect(perms.canViewReports).toBe(false);
  });
});

describe('getPermissions — eleitor', () => {
  const perms = getPermissions('eleitor');

  it('não tem nenhuma permissão de escrita', () => {
    expect(perms.canCreateElector).toBe(false);
    expect(perms.canDeleteElector).toBe(false);
    expect(perms.canExport).toBe(false);
    expect(perms.canManageUsers).toBe(false);
    expect(perms.canManagePolls).toBe(false);
  });
});

describe('getPermissions — undefined usa fallback eleitor', () => {
  it('retorna permissões de eleitor', () => {
    const perms = getPermissions(undefined);
    expect(perms.canCreateElector).toBe(false);
    expect(perms.canManageUsers).toBe(false);
  });
});
