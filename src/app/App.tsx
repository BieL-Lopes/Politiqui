import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { CaptureForm, ElectorData } from './components/CaptureForm';
import { ContactList } from './components/ContactList';
import { ElectorProfile } from './components/ElectorProfile';
import { AgendaScreen } from './components/AgendaScreen';
import { PollsScreen } from './components/PollsScreen';
import { CoordinationScreen } from './components/CoordinationScreen';
import { AdminScreen } from './components/AdminScreen';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Tab, getAllowedTabs, getPermissions, ROLE_LABELS } from './lib/rbac';
import { User, signOut } from './lib/auth';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { db } from './lib/db';
import { pushPendingChanges } from './lib/syncService';
import { useSync } from './lib/useSync';

type Screen = 'login' | 'home' | 'form' | 'list' | 'profile' | 'agenda' | 'polls' | 'coordination' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [electors, setElectors] = useState<ElectorData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedElector, setSelectedElector] = useState<ElectorData | null>(null);
  const [electorToEdit, setElectorToEdit] = useState<ElectorData | null>(null);
  const { isOnline, pendingCount, refreshCount, syncedAt } = useSync();

  const fetchUsers = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data } = await supabase
      .from('perfis')
      .select('id, nome, role, regiao, deputado_id, coordenador_regional_id');
    if (data) {
      setUsers(data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.nome as string,
        role: p.role as User['role'],
        regiao: (p.regiao as string) ?? undefined,
        deputadoId: (p.deputado_id as string) ?? undefined,
        coordenadorRegionalId: (p.coordenador_regional_id as string) ?? undefined,
      })));
    }
  };

  // Carrega dados do IndexedDB na inicialização (com migração do localStorage)
  useEffect(() => {
    const loadData = async () => {
      const savedUser = localStorage.getItem('politiqui_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setCurrentScreen('home');
      }

      // Migração one-time: move dados do localStorage para IndexedDB
      const lsElectors = localStorage.getItem('politiqui_electors');
      if (lsElectors) {
        const parsed: ElectorData[] = JSON.parse(lsElectors);
        const migrated = parsed.map(e => ({
          createdBy: 'desconhecido',
          createdByName: 'Desconhecido',
          ...e,
        }));
        await db.electors.bulkPut(migrated);
        localStorage.removeItem('politiqui_electors');
      }

      const all = await db.electors.orderBy('dataCadastro').reverse().toArray();
      setElectors(all);

      // Busca usuários do Supabase somente se já há sessão ativa
      if (savedUser) {
        await fetchUsers();
      }
    };
    loadData();
  }, []);

  // Recarrega eleitores do Dexie quando o sync traz dados novos do servidor
  useEffect(() => {
    if (syncedAt) {
      db.electors.orderBy('dataCadastro').reverse().toArray().then(setElectors);
    }
  }, [syncedAt]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('politiqui_user', JSON.stringify(userData));
    setCurrentScreen('home');
    fetchUsers();
    // Define a primeira tab permitida para o papel do usuario
    const allowedTabs = getAllowedTabs(userData.role);
    setCurrentTab(allowedTabs[0]);
    toast.success(`Bem-vindo(a), ${userData.name}! (${ROLE_LABELS[userData.role]})`);
  };

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    switch (tab) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'contacts':
        setCurrentScreen('list');
        break;
      case 'agenda':
        setCurrentScreen('agenda');
        break;
      case 'polls':
        setCurrentScreen('polls');
        break;
      case 'coordination':
        setCurrentScreen('coordination');
        break;
      case 'admin':
        setCurrentScreen('admin');
        break;
    }
  };

  const handleSaveElector = async (electorData: Omit<ElectorData, 'id' | 'dataCadastro' | 'atendimentos'>) => {
    const now = new Date().toISOString();
    const newElector: ElectorData = {
      ...electorData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataCadastro: now,
      updatedAt: now,
      atendimentos: [],
      createdBy: user?.id ?? 'desconhecido',
      createdByName: user?.name ?? 'Desconhecido',
      regiao: user?.regiao ?? electorData.regiao
    };

    await db.electors.add(newElector);
    await db.pendingChanges.add({
      operation: 'create',
      entityId: newElector.id,
      payload: newElector,
      timestamp: new Date().toISOString(),
    });
    if (isOnline && isSupabaseConfigured) await pushPendingChanges();
    await refreshCount();
    setElectors(prev => [newElector, ...prev]);
    setCurrentScreen('home');
    toast.success('✅ Eleitor cadastrado com sucesso!');
  };

  const handleDeleteElector = async (id: string) => {
    await db.electors.delete(id);
    await db.pendingChanges.add({
      operation: 'delete',
      entityId: id,
      timestamp: new Date().toISOString(),
    });
    if (isOnline && isSupabaseConfigured) await pushPendingChanges();
    await refreshCount();
    setElectors(prev => prev.filter(e => e.id !== id));
    toast.success('Contato excluído');
  };

  const handleViewProfile = (elector: ElectorData) => {
    setSelectedElector(elector);
    setCurrentScreen('profile');
  };

  const handleUpdateElector = async (updatedElector: ElectorData) => {
    const updated = { ...updatedElector, updatedAt: new Date().toISOString() };
    await db.electors.put(updated);
    await db.pendingChanges.add({
      operation: 'update',
      entityId: updated.id,
      payload: updated,
      timestamp: new Date().toISOString(),
    });
    if (isOnline && isSupabaseConfigured) await pushPendingChanges();
    await refreshCount();
    setElectors(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedElector(updated);
    toast.success('Atendimento registrado!');
  };

  const handleEditElector = (elector: ElectorData) => {
    setElectorToEdit(elector);
    setCurrentScreen('form');
  };

  const handleSaveEditedElector = async (updatedElector: ElectorData) => {
    const updated = { ...updatedElector, updatedAt: new Date().toISOString() };
    await db.electors.put(updated);
    await db.pendingChanges.add({
      operation: 'update',
      entityId: updated.id,
      payload: updated,
      timestamp: new Date().toISOString(),
    });
    if (isOnline && isSupabaseConfigured) await pushPendingChanges();
    await refreshCount();
    setElectors(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedElector(updated);
    setElectorToEdit(null);
    setCurrentScreen('profile');
    toast.success('✅ Eleitor atualizado com sucesso!');
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('politiqui_user');
    await signOut();
    setCurrentScreen('login');
    toast.info('Até logo!');
  };

  if (currentScreen === 'login') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Obtem permissoes do usuario atual
  const userPermissions = user ? getPermissions(user.role) : null;

  if (currentScreen === 'form') {
    // Verifica se o usuario pode criar eleitores
    if (!userPermissions?.canCreateElector) {
      setCurrentScreen('home');
      return null;
    }
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <CaptureForm
          onBack={() => {
            setElectorToEdit(null);
            setCurrentScreen(electorToEdit ? 'profile' : 'home');
            setCurrentTab(electorToEdit ? 'contacts' : 'home');
          }}
          onSave={handleSaveElector}
          electorToEdit={electorToEdit ?? undefined}
          onUpdate={handleSaveEditedElector}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'profile' && selectedElector) {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <ElectorProfile
          elector={selectedElector}
          onBack={() => {
            setCurrentScreen('list');
            setCurrentTab('contacts');
          }}
          onUpdate={handleUpdateElector}
          onEdit={userPermissions?.canCreateElector ? handleEditElector : undefined}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'agenda') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <AgendaScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'polls') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <PollsScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'coordination') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <CoordinationScreen
          user={user!}
          electors={electors}
          users={users}
          canExport={userPermissions?.canExport ?? false}
        />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'admin') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <AdminScreen
          user={user!}
          electors={electors}
          users={users}
          canExport={userPermissions?.canExport ?? false}
        />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'list') {
    return (
      <>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
        <ContactList
          contacts={electors}
          onBack={() => {
            setCurrentScreen('home');
            setCurrentTab('home');
          }}
          onDelete={userPermissions?.canDeleteElector ? handleDeleteElector : undefined}
          onViewProfile={handleViewProfile}
        />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
      <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
      <HomeScreen
        userName={user?.name || 'Usuario'}
        totalCadastros={electors.length}
        onNavigate={setCurrentScreen}
        onLogout={handleLogout}
        userRole={user?.role || 'eleitor'}
      />
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
      <Toaster position="top-center" richColors />
    </>
  );
}
