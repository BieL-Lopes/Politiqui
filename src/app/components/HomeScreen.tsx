import { Plus, Users, TrendingUp, MapPin, LogOut, Clock, Calendar, PieChart } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  type: 'reuniao' | 'visita';
}

interface HomeScreenProps {
  userName: string;
  totalCadastros: number;
  onNavigate: (screen: 'form' | 'list') => void;
  onLogout: () => void;
}

// Atividades mockadas para demonstração
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    time: '14:00',
    title: 'Reunião com Liderança do Bairro Centro',
    location: 'Salão Comunitário',
    type: 'reuniao'
  },
  {
    id: '2',
    time: '16:30',
    title: 'Visita na casa do eleitor João da Silva',
    location: 'Rua das Flores, 123',
    type: 'visita'
  }
];

export function HomeScreen({ userName, totalCadastros, onNavigate, onLogout }: HomeScreenProps) {
  // Dados mockados para o gráfico de rosca (hardcoded: 1 cadastro na categoria Fortes)
  const votoData = [
    { name: 'Fortes', value: 1, color: '#16a34a' }, // green-600
    { name: 'Médios', value: 0, color: '#eab308' }, // yellow-500
    { name: 'Fracos', value: 0, color: '#dc2626' } // red-600
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-24">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-sm opacity-90 mb-1">Bem-vindo(a),</h2>
            <h1 className="text-2xl font-bold">{userName}</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            aria-label="Sair"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Eleitores cadastrados</p>
              <p className="text-4xl font-bold text-blue-600">{totalCadastros}</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+{Math.floor(totalCadastros * 0.3)} esta semana</span>
          </div>
        </div>

        {/* Cards Secundários */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Votos Fortes</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{votoData[0].value}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Regiões</p>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-blue-600 mr-1" />
              <p className="text-2xl font-bold text-blue-600">{Math.max(1, Math.floor(totalCadastros / 10))}</p>
            </div>
          </div>
        </div>

        {/* Termômetro de Votos - Barra Linear */}
        {totalCadastros > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Termômetro de Votos
              </h3>
              <span className="text-sm font-semibold text-gray-600">
                {totalCadastros} {totalCadastros === 1 ? 'Cadastro' : 'Cadastros'}
              </span>
            </div>

            {/* Barra de Progresso Empilhada */}
            <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full flex">
                {/* Verde - Votos Fortes */}
                <div
                  className="bg-green-600 h-full transition-all"
                  style={{ width: `${(votoData[0].value / totalCadastros) * 100}%` }}
                ></div>
                {/* Amarelo - Votos Médios */}
                <div
                  className="bg-yellow-500 h-full transition-all"
                  style={{ width: `${(votoData[1].value / totalCadastros) * 100}%` }}
                ></div>
                {/* Vermelho - Votos Fracos */}
                <div
                  className="bg-red-600 h-full transition-all"
                  style={{ width: `${(votoData[2].value / totalCadastros) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Legenda Horizontal */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-600 mr-1.5"></div>
                <span className="text-gray-700">
                  Fortes: <span className="font-bold text-green-600">{votoData[0].value}</span>
                  <span className="text-gray-500 ml-1">({totalCadastros > 0 ? Math.round((votoData[0].value / totalCadastros) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
                <span className="text-gray-700">
                  Médios: <span className="font-bold text-yellow-600">{votoData[1].value}</span>
                  <span className="text-gray-500 ml-1">({totalCadastros > 0 ? Math.round((votoData[1].value / totalCadastros) * 100) : 0}%)</span>
                </span>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-600 mr-1.5"></div>
                <span className="text-gray-700">
                  Fracos: <span className="font-bold text-red-600">{votoData[2].value}</span>
                  <span className="text-gray-500 ml-1">({totalCadastros > 0 ? Math.round((votoData[2].value / totalCadastros) * 100) : 0}%)</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Regiões */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="font-bold text-gray-900">Top 3 Regiões</h3>
          </div>

          <div className="space-y-4">
            {/* Item 1 - Centro */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">Centro</span>
                <span className="text-sm font-semibold text-blue-600">45 votos</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>

            {/* Item 2 - Jardim Primavera */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">Jardim Primavera</span>
                <span className="text-sm font-semibold text-blue-600">28 votos</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: '50%' }}
                ></div>
              </div>
            </div>

            {/* Item 3 - Vila Nova */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">Vila Nova</span>
                <span className="text-sm font-semibold text-blue-600">15 votos</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: '30%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda do Dia */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Agenda do Dia
            </h3>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_ACTIVITIES.map(activity => (
              <div
                key={activity.id}
                className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600"
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-bold text-blue-600 mr-2">{activity.time}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        activity.type === 'reuniao'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {activity.type === 'reuniao' ? '🤝 Reunião' : '🏠 Visita'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">{activity.title}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{activity.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => alert('Em produção, abriria formulário de nova atividade na aba Agenda')}
              className="w-full bg-blue-50 border-2 border-blue-200 border-dashed hover:bg-blue-100 text-blue-600 py-3 px-4 rounded-xl text-sm font-semibold transition-all"
            >
              + Adicionar Nova Atividade
            </button>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-3 pb-20">
          <button
            onClick={() => onNavigate('list')}
            className="w-full bg-white border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 text-gray-800 py-4 px-6 rounded-xl text-left transition-all shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold">Meus Contatos</p>
                <p className="text-sm text-gray-600">Ver lista completa</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Botão Flutuante - Novo Cadastro */}
      <button
        onClick={() => onNavigate('form')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
        aria-label="Novo Cadastro"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </button>
    </div>
  );
}
