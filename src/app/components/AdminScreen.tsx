import { useState } from 'react';
import {
  Users, Shield, Settings, ChevronRight, UserPlus, Trash2, Edit2,
  Download, BarChart2, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { UserRole, ROLE_LABELS } from '../lib/rbac';
import { User, MOCK_USERS } from '../lib/auth';
import { ElectorData } from './CaptureForm';

interface Props {
  user: User;
  electors: ElectorData[];
  canExport: boolean;
}

function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(','),
    ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))
  ].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function AdminScreen({ user, electors, canExport }: Props) {
  const showDashboard = user.role === 'lideranca' || user.role === 'coordenador_geral';
  const [activeTab, setActiveTab] = useState<'users' | 'dashboard' | 'settings'>(
    showDashboard ? 'dashboard' : 'users'
  );

  // ── Export handlers ──
  const handleExportUsers = () => {
    exportCSV(
      MOCK_USERS.map(u => ({
        id: u.id,
        nome: u.name,
        role: ROLE_LABELS[u.role],
        regiao: u.regiao ?? '',
        deputadoId: u.deputadoId ?? '',
      })),
      'usuarios.csv'
    );
  };

  const handleExportElectors = () => {
    exportCSV(
      electors.map(e => ({
        nome: e.nome,
        whatsapp: e.whatsapp,
        tituloEleitor: e.tituloEleitor,
        dataNascimento: e.dataNascimento,
        bairro: e.bairro,
        cidade: e.cidade,
        nivelVoto: e.nivelVoto,
        nichos: e.nichos.join('; '),
        regiao: e.regiao ?? '',
        captador: e.createdByName ?? '',
        dataCadastro: new Date(e.dataCadastro).toLocaleDateString('pt-BR'),
      })),
      'eleitores.csv'
    );
  };

  // ── Dashboard data ──
  const regiaoMap: Record<string, number> = {};
  electors.forEach(e => {
    const r = e.regiao || 'Sem região';
    regiaoMap[r] = (regiaoMap[r] ?? 0) + 1;
  });
  const regiaoData = Object.entries(regiaoMap).map(([name, value]) => ({ name, value }));

  const votoMap = { forte: 0, medio: 0, fraco: 0 };
  electors.forEach(e => { if (e.nivelVoto) votoMap[e.nivelVoto]++; });
  const votoData = [
    { name: 'Forte', value: votoMap.forte, color: '#22c55e' },
    { name: 'Médio', value: votoMap.medio, color: '#eab308' },
    { name: 'Fraco', value: votoMap.fraco, color: '#ef4444' },
  ];

  const nichoMap: Record<string, number> = {};
  electors.forEach(e => e.nichos.forEach(n => { nichoMap[n] = (nichoMap[n] ?? 0) + 1; }));
  const nichoData = Object.entries(nichoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Evolução últimos 30 dias
  const today = new Date();
  const dayCounts: Record<string, number> = {};
  const dayLabels: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dayLabels.push(key);
    dayCounts[key] = 0;
  }
  electors.forEach(e => {
    const key = e.dataCadastro.split('T')[0];
    if (key in dayCounts) dayCounts[key]++;
  });
  const evolucaoData = dayLabels.map(d => ({
    data: d.slice(5).replace('-', '/'),
    cadastros: dayCounts[d],
  }));

  const getRoleBadgeStyle = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      lideranca: 'bg-red-100 text-red-800 border-red-200',
      coordenador_geral: 'bg-purple-100 text-purple-800 border-purple-200',
      coordenador_regional: 'bg-blue-100 text-blue-800 border-blue-200',
      captador_votos: 'bg-green-100 text-green-800 border-green-200',
      eleitor: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[role];
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Administração</h1>
        <p className="text-sm text-blue-100">Gestão de usuários e configurações</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Usuários
          </button>
          {showDashboard && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <BarChart2 className="w-4 h-4 inline mr-1" />
              Dashboard
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            Config.
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* ── Tab Usuários ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center transition-colors">
                <UserPlus className="w-5 h-5 mr-2" />
                Adicionar
              </button>
              {canExport && (
                <button
                  onClick={handleExportUsers}
                  className="flex-1 py-3 px-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  CSV Usuários
                </button>
              )}
            </div>

            {canExport && (
              <button
                onClick={handleExportElectors}
                className="w-full py-3 px-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                CSV Eleitores completo ({electors.length} registros)
              </button>
            )}

            {/* Resumo por Papel */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Usuários por Perfil
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                  const count = MOCK_USERS.filter(u => u.role === role).length;
                  return (
                    <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{ROLE_LABELS[role]}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Lista de Usuários</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {MOCK_USERS.map(u => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{u.name}</h3>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadgeStyle(u.role)}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                        {u.regiao && <span className="text-xs text-gray-500">{u.regiao}</span>}
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

        {/* ── Tab Dashboard ── */}
        {activeTab === 'dashboard' && showDashboard && (
          <div className="space-y-4">
            {electors.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhum eleitor cadastrado ainda.</p>
                <p className="text-sm mt-1">Os gráficos aparecerão após os primeiros cadastros.</p>
              </div>
            ) : (
              <>
                {/* Cards resumo */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl shadow p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{electors.length}</p>
                    <p className="text-xs text-gray-500">Eleitores</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{votoMap.forte}</p>
                    <p className="text-xs text-gray-500">Voto Forte</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{regiaoData.length}</p>
                    <p className="text-xs text-gray-500">Regiões</p>
                  </div>
                </div>

                {/* Eleitores por Região */}
                {regiaoData.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Eleitores por Região
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={regiaoData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Eleitores" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Nível de Voto */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h2 className="font-bold text-gray-900 mb-4">Nível de Voto</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={votoData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                      >
                        {votoData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Nichos */}
                {nichoData.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="font-bold text-gray-900 mb-4">Top Nichos</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={nichoData} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Eleitores" fill="#dc2626" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Evolução por dia */}
                <div className="bg-white rounded-xl shadow p-4">
                  <h2 className="font-bold text-gray-900 mb-4">Evolução — últimos 30 dias</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={evolucaoData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="data" tick={{ fontSize: 9 }} interval={6} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cadastros" stroke="#dc2626" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Tab Configurações ── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Configurações do Sistema</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { title: 'Dados da Campanha', desc: 'Nome, logo e informações gerais' },
                  { title: 'Níveis de Voto', desc: 'Personalizar categorias de voto' },
                  { title: 'Regiões', desc: 'Gerenciar bairros e regiões' },
                  { title: 'Integrações', desc: 'WhatsApp, SMS e outras APIs' },
                  { title: 'Backup de Dados', desc: 'Exportar e restaurar dados' },
                ].map(item => (
                  <button key={item.title} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-left">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

