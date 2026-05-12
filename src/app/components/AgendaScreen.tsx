import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Trash2 } from 'lucide-react';

interface Activity {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  type: 'reuniao' | 'visita';
  electorName?: string;
}

export function AgendaScreen() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      time: '14:00',
      title: 'Reunião com Liderança do Bairro Centro',
      location: 'Salão Comunitário',
      type: 'reuniao'
    },
    {
      id: '2',
      date: new Date().toISOString(),
      time: '16:30',
      title: 'Visita na casa do eleitor João da Silva',
      location: 'Rua das Flores, 123',
      type: 'visita',
      electorName: 'João da Silva'
    }
  ]);

  const [showNewActivity, setShowNewActivity] = useState(false);

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const dateKey = new Date(activity.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Minha Agenda</h1>
        <p className="text-sm text-blue-100">Controle de visitas e reuniões</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Botão Nova Atividade */}
        <button
          onClick={() => setShowNewActivity(!showNewActivity)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Atividade
        </button>

        {/* Formulário Nova Atividade */}
        {showNewActivity && (
          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Criar Nova Atividade</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 rounded-lg border-2 border-purple-600 bg-purple-50 text-purple-700 font-semibold">
                  🤝 Reunião
                </button>
                <button className="py-3 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold">
                  🏠 Visita
                </button>
              </div>

              <input
                type="text"
                placeholder="Título da atividade"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Local"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <input
                  type="time"
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">
                  Salvar
                </button>
                <button
                  onClick={() => setShowNewActivity(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Atividades */}
        {Object.entries(groupedActivities).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">Nenhuma atividade agendada</p>
            <p className="text-sm text-gray-500 mt-1">Crie sua primeira visita ou reunião</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
            <div key={dateKey}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center capitalize">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                {formatDate(dateActivities[0].date)}
              </h3>

              <div className="space-y-3 mb-6">
                {dateActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">{activity.time}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            activity.type === 'reuniao'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {activity.type === 'reuniao' ? '🤝 Reunião' : '🏠 Visita'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir esta atividade?')) {
                            handleDeleteActivity(activity.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="font-semibold text-gray-900 mb-2">{activity.title}</p>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{activity.location}</span>
                      </div>
                      {activity.electorName && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{activity.electorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
