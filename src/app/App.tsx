import { useState, useEffect, useRef } from 'react';
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
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { UserRole, Tab, getAllowedTabs, getPermissions, ROLE_LABELS } from './lib/rbac';
import { User } from './lib/auth';

type Screen = 'login' | 'home' | 'form' | 'list' | 'profile' | 'agenda' | 'polls' | 'coordination' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [electors, setElectors] = useState<ElectorData[]>([]);
  const [selectedElector, setSelectedElector] = useState<ElectorData | null>(null);
  const [electorToEdit, setElectorToEdit] = useState<ElectorData | null>(null);
  const isFirstRender = useRef(true);

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('politiqui_user');
    const savedElectors = localStorage.getItem('politiqui_electors');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentScreen('home');
    }

    if (savedElectors) {
      const parsed: ElectorData[] = JSON.parse(savedElectors);
      // Migra registros antigos adicionando campos ausentes com valores padrao
      const migrated = parsed.map(e => ({
        createdBy: 'desconhecido',
        createdByName: 'Desconhecido',
        ...e
      }));
      setElectors(migrated);
    }
  }, []);

  // Salva eleitores no localStorage sempre que mudar (incluindo lista vazia)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('politiqui_electors', JSON.stringify(electors));
  }, [electors]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('politiqui_user', JSON.stringify(userData));
    setCurrentScreen('home');
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

  const handleSaveElector = (electorData: Omit<ElectorData, 'id' | 'dataCadastro' | 'atendimentos'>) => {
    const newElector: ElectorData = {
      ...electorData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataCadastro: new Date().toISOString(),
      atendimentos: [],
      createdBy: user?.id ?? 'desconhecido',
      createdByName: user?.name ?? 'Desconhecido',
      regiao: user?.regiao ?? electorData.regiao
    };

    setElectors(prev => [newElector, ...prev]);
    setCurrentScreen('home');
    toast.success('✅ Eleitor cadastrado com sucesso!');
  };

  const handleDeleteElector = (id: string) => {
    setElectors(prev => prev.filter(e => e.id !== id));
    toast.success('Contato excluído');
  };

  const handleViewProfile = (elector: ElectorData) => {
    setSelectedElector(elector);
    setCurrentScreen('profile');
  };

  const handleUpdateElector = (updatedElector: ElectorData) => {
    setElectors(prev => prev.map(e => e.id === updatedElector.id ? updatedElector : e));
    setSelectedElector(updatedElector);
    toast.success('Atendimento registrado!');
  };

  const handleEditElector = (elector: ElectorData) => {
    setElectorToEdit(elector);
    setCurrentScreen('form');
  };

  const handleSaveEditedElector = (updatedElector: ElectorData) => {
    setElectors(prev => prev.map(e => e.id === updatedElector.id ? updatedElector : e));
    setSelectedElector(updatedElector);
    setElectorToEdit(null);
    setCurrentScreen('profile');
    toast.success('✅ Eleitor atualizado com sucesso!');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('politiqui_user');
    setCurrentScreen('login');
    toast.info('Até logo!');
  };

  if (currentScreen === 'login') {
    return (
      <>
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
        <AgendaScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'polls') {
    return (
      <>
        <PollsScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'coordination') {
    return (
      <>
        <CoordinationScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'admin') {
    return (
      <>
        <AdminScreen />
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} userRole={user?.role || 'eleitor'} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (currentScreen === 'list') {
    return (
      <>
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
