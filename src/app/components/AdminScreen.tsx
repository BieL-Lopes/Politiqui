import { useState } from 'react';
import { Users, Shield, Settings, ChevronRight, UserPlus, Trash2, Edit2 } from 'lucide-react';
import { UserRole, ROLE_LABELS } from '../lib/rbac';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  createdAt: string;
}

export function AdminScreen() {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  // Dados mockados de usuarios
  const mockUsers: MockUser[] = [
    { id: '1', name: 'Victor', email: 'victor@email.com', role: 'lideranca', createdAt: '2024-01-15' },
    { id: '2', name: 'Maria Silva', email: 'maria@email.com', role: 'coordenador_geral', region: 'Geral', createdAt: '2024-02-01' },
    { id: '3', name: 'Joao Santos', email: 'joao@email.com', role: 'coordenador_regional', region: 'Centro', createdAt: '2024-02-10' },
    { id: '4', name: 'Ana Costa', email: 'ana@email.com', role: 'captador_votos', region: 'Zona Norte', createdAt: '2024-03-05' },
    { id: '5', name: 'Pedro Lima', email: 'pedro@email.com', role: 'captador_votos', region: 'Zona Sul', createdAt: '2024-03-12' },
    { id: '6', name: 'Carla Souza', email: 'carla@email.com', role: 'eleitor', createdAt: '2024-03-20' }
  ];

  const getRoleBadgeStyle = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      lideranca: 'bg-red-100 text-red-800 border-red-200',
      coordenador_geral: 'bg-purple-100 text-purple-800 border-purple-200',
      coordenador_regional: 'bg-blue-100 text-blue-800 border-blue-200',
      captador_votos: 'bg-green-100 text-green-800 border-green-200',
      eleitor: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[role];
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Administracao</h1>
        <p className="text-sm text-red-100">Gestao de usuarios e configuracoes</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuracoes
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Botao Adicionar */}
            <button className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center transition-colors">
              <UserPlus className="w-5 h-5 mr-2" />
              Adicionar Usuario
            </button>

            {/* Resumo por Papel */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Usuarios por Perfil
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                  const count = mockUsers.filter(u => u.role === role).length;
                  return (
                    <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{ROLE_LABELS[role]}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Lista de Usuarios</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {mockUsers.map(user => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                        {user.region && (
                          <span className="text-xs text-gray-500">{user.region}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Configuracoes do Sistema</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-left">Dados da Campanha</h3>
                    <p className="text-sm text-gray-500">Nome, logo e informacoes gerais</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-left">Niveis de Voto</h3>
                    <p className="text-sm text-gray-500">Personalizar categorias de voto</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-left">Regioes</h3>
                    <p className="text-sm text-gray-500">Gerenciar bairros e regioes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-left">Integracoes</h3>
                    <p className="text-sm text-gray-500">WhatsApp, SMS e outras APIs</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-left">Backup de Dados</h3>
                    <p className="text-sm text-gray-500">Exportar e restaurar dados</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
