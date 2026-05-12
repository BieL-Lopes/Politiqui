import { Plus, BarChart3, Users, Clock, TrendingUp } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  date: string;
  responses: number;
  status: 'active' | 'closed';
}

const MOCK_POLLS: Poll[] = [
  {
    id: '1',
    title: 'Qual a principal demanda do seu bairro?',
    date: '2026-05-08',
    responses: 127,
    status: 'active'
  },
  {
    id: '2',
    title: 'Avaliação da última reunião comunitária',
    date: '2026-05-05',
    responses: 84,
    status: 'closed'
  }
];

export function PollsScreen() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Enquetes</h1>
        <p className="text-sm text-blue-100">Pesquisas de opinião via WhatsApp</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Botão Criar Enquete */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Criar Nova Enquete
        </button>

        {/* Card de Estatísticas */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Resultados da Semana
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">211</p>
              <p className="text-sm text-gray-600">Respostas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">2</p>
              <p className="text-sm text-gray-600">Enquetes Ativas</p>
            </div>
          </div>
        </div>

        {/* Lista de Enquetes */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Enquetes Recentes</h3>

          <div className="space-y-3">
            {MOCK_POLLS.map(poll => (
              <div
                key={poll.id}
                className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900 flex-1 mr-3">{poll.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    poll.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {poll.status === 'active' ? '✓ Ativa' : 'Encerrada'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="font-semibold text-blue-600">{poll.responses} respostas</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDate(poll.date)}</span>
                  </div>
                </div>

                <button className="w-full mt-3 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold transition-all">
                  Ver Resultados →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card Informativo */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-start">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Enquetes via WhatsApp</h4>
              <p className="text-sm text-gray-700">
                Envie pesquisas de opinião rápidas para eleitores que aceitaram receber mensagens automáticas.
                Os resultados aparecem em tempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
