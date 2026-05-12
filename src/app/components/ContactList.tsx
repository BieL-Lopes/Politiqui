import { useState } from 'react';
import { ArrowLeft, Search, Phone, MapPin, Trash2 } from 'lucide-react';
import { ElectorData } from './CaptureForm';

interface ContactListProps {
  contacts: ElectorData[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onViewProfile: (elector: ElectorData) => void;
}

export function ContactList({ contacts, onBack, onDelete, onViewProfile }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNivelBadge = (nivel: 'forte' | 'medio' | 'fraco') => {
    const styles = {
      forte: 'bg-green-100 text-green-800 border-green-300',
      medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      fraco: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = {
      forte: 'Forte',
      medio: 'Médio',
      fraco: 'Fraco'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${styles[nivel]}`}>
        {labels[nivel]}
      </span>
    );
  };

  const getNivelEngajamentoBadge = (nivel: 'lideranca' | 'apoiador' | 'eleitor_comum') => {
    const styles = {
      lideranca: 'bg-purple-100 text-purple-800 border-purple-300',
      apoiador: 'bg-blue-100 text-blue-800 border-blue-300',
      eleitor_comum: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    const labels = {
      lideranca: '⭐ Liderança',
      apoiador: '👥 Apoiador',
      eleitor_comum: '👤 Eleitor'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${styles[nivel]}`}>
        {labels[nivel]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Meus Contatos</h1>
            <p className="text-sm text-blue-100">{contacts.length} eleitor(es) cadastrado(s)</p>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Buscar por nome, cidade ou bairro..."
          />
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="p-4 space-y-3 pb-24">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum eleitor cadastrado ainda'}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewProfile(contact)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{contact.nome}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {getNivelBadge(contact.nivelVoto)}
                    {getNivelEngajamentoBadge(contact.nivelEngajamento)}
                  </div>
                  {contact.nichos && contact.nichos.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {contact.nichos.slice(0, 3).map(nicho => (
                        <span
                          key={nicho}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200"
                        >
                          {nicho}
                        </span>
                      ))}
                      {contact.nichos.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          +{contact.nichos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Deseja realmente excluir ${contact.nome}?`)) {
                      onDelete(contact.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Excluir contato"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                  <a
                    href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {contact.whatsapp}
                  </a>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    {contact.bairro ? `${contact.bairro}, ` : ''}{contact.cidade}
                  </span>
                </div>

                {contact.dataNascimento && (
                  <div className="text-xs text-gray-500">
                    Nascimento: {formatDate(contact.dataNascimento)}
                  </div>
                )}

                {contact.observacoes && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 italic">
                      "{contact.observacoes}"
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  Cadastrado em {formatDate(contact.dataCadastro)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas Rápidas (acima da bottom nav) */}
      {contacts.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-green-600 font-bold text-xl">
                {contacts.filter(c => c.nivelVoto === 'forte').length}
              </p>
              <p className="text-gray-600 text-xs">Fortes</p>
            </div>
            <div>
              <p className="text-yellow-600 font-bold text-xl">
                {contacts.filter(c => c.nivelVoto === 'medio').length}
              </p>
              <p className="text-gray-600 text-xs">Médios</p>
            </div>
            <div>
              <p className="text-red-600 font-bold text-xl">
                {contacts.filter(c => c.nivelVoto === 'fraco').length}
              </p>
              <p className="text-gray-600 text-xs">Fracos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
