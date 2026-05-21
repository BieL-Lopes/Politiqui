import { Users, MapPin, TrendingUp, BarChart3, Target } from 'lucide-react';

export function CoordinationScreen() {
  // Dados mockados de coordenacao
  const regions = [
    { name: 'Centro', coordinator: 'Maria Silva', electors: 245, target: 300, progress: 82 },
    { name: 'Zona Norte', coordinator: 'Joao Santos', electors: 189, target: 250, progress: 76 },
    { name: 'Zona Sul', coordinator: 'Ana Costa', electors: 167, target: 200, progress: 84 },
    { name: 'Zona Leste', coordinator: 'Pedro Lima', electors: 134, target: 200, progress: 67 },
    { name: 'Zona Oeste', coordinator: 'Carla Souza', electors: 98, target: 150, progress: 65 }
  ];

  const totalElectors = regions.reduce((acc, r) => acc + r.electors, 0);
  const totalTarget = regions.reduce((acc, r) => acc + r.target, 0);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Coordenacao</h1>
        <p className="text-sm text-purple-100">Gestao de regioes e equipes</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Total Eleitores</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalElectors}</p>
            <p className="text-xs text-gray-500">Meta: {totalTarget}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Progresso</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{Math.round((totalElectors / totalTarget) * 100)}%</p>
            <p className="text-xs text-gray-500">da meta geral</p>
          </div>
        </div>

        {/* Lista de Regioes */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Regioes
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {regions.map((region, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{region.name}</h3>
                    <p className="text-sm text-gray-500">{region.coordinator}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{region.electors}</p>
                    <p className="text-xs text-gray-500">de {region.target}</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      region.progress >= 80 ? 'bg-green-500' : region.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${region.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acoes Rapidas */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Acoes Rapidas
          </h2>
          <div className="space-y-2">
            <button className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left font-medium transition-colors">
              Adicionar nova regiao
            </button>
            <button className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left font-medium transition-colors">
              Definir metas mensais
            </button>
            <button className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left font-medium transition-colors">
              Ver relatorio detalhado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
