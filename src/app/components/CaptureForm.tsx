import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Phone, Calendar, MapPin, MessageSquare, Navigation, Tag, Award } from 'lucide-react';

export interface Atendimento {
  id: string;
  data: string;
  descricao: string;
  tipo: 'demanda' | 'visita' | 'reuniao' | 'ligacao';
}

export interface ElectorData {
  id: string;
  nome: string;
  whatsapp: string;
  dataNascimento: string;
  bairro: string;
  cidade: string;
  nivelVoto: 'forte' | 'medio' | 'fraco';
  nivelEngajamento: 'lideranca' | 'apoiador' | 'eleitor_comum';
  nichos: string[];
  gpsLatitude?: number;
  gpsLongitude?: number;
  aceitaWhatsapp: boolean;
  observacoes: string;
  dataCadastro: string;
  atendimentos: Atendimento[];
}

interface CaptureFormProps {
  onBack: () => void;
  onSave: (elector: Omit<ElectorData, 'id' | 'dataCadastro' | 'atendimentos'>) => void;
}

const NICHOS_DISPONIVEIS = [
  'Saúde',
  'Educação',
  'Esporte',
  'Religião',
  'Empresário',
  'Agricultura',
  'Cultura',
  'Meio Ambiente',
  'Segurança',
  'Assistência Social'
];

export function CaptureForm({ onBack, onSave }: CaptureFormProps) {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [nivelVoto, setNivelVoto] = useState<'forte' | 'medio' | 'fraco' | ''>('');
  const [nivelEngajamento, setNivelEngajamento] = useState<'lideranca' | 'apoiador' | 'eleitor_comum' | ''>('');
  const [nichos, setNichos] = useState<string[]>([]);
  const [gpsLatitude, setGpsLatitude] = useState<number | undefined>();
  const [gpsLongitude, setGpsLongitude] = useState<number | undefined>();
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [capturandoGps, setCapturandoGps] = useState(false);

  // Captura GPS automaticamente ao carregar o formulário
  useEffect(() => {
    captureGPS();
  }, []);

  const captureGPS = () => {
    setCapturandoGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLatitude(position.coords.latitude);
          setGpsLongitude(position.coords.longitude);
          setCapturandoGps(false);
        },
        (error) => {
          // Silencia o erro - GPS é opcional
          setCapturandoGps(false);
        },
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      setCapturandoGps(false);
    }
  };

  const toggleNicho = (nicho: string) => {
    setNichos(prev =>
      prev.includes(nicho)
        ? prev.filter(n => n !== nicho)
        : [...prev, nicho]
    );
  };

  const handleWhatsappChange = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Formata (XX) XXXXX-XXXX
    let formatted = numbers;
    if (numbers.length > 10) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    } else if (numbers.length > 6) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length > 2) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    setWhatsapp(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !whatsapp || !nivelVoto || !nivelEngajamento || !cidade) {
      alert('Preencha pelo menos: Nome, WhatsApp, Cidade, Nível de Voto e Nível de Engajamento');
      return;
    }

    onSave({
      nome,
      whatsapp,
      dataNascimento,
      bairro,
      cidade,
      nivelVoto: nivelVoto as 'forte' | 'medio' | 'fraco',
      nivelEngajamento: nivelEngajamento as 'lideranca' | 'apoiador' | 'eleitor_comum',
      nichos,
      gpsLatitude,
      gpsLongitude,
      aceitaWhatsapp,
      observacoes
    });

    // Limpa o formulário
    setNome('');
    setWhatsapp('');
    setDataNascimento('');
    setBairro('');
    setCidade('');
    setNivelVoto('');
    setNivelEngajamento('');
    setNichos([]);
    setAceitaWhatsapp(false);
    setObservacoes('');
    captureGPS(); // Recaptura GPS para próximo cadastro
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Novo Cadastro</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-24 space-y-4">
        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-2">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Dados Pessoais
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-2">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Localização
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="Digite a cidade"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="Digite o bairro"
            />
          </div>
        </div>

        {/* Termômetro de Voto */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3">
            Termômetro de Voto *
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setNivelVoto('forte')}
              className={`py-4 px-6 rounded-xl text-lg font-semibold transition-all border-3 ${
                nivelVoto === 'forte'
                  ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
            >
              ✓ Voto Forte / Garantido
            </button>

            <button
              type="button"
              onClick={() => setNivelVoto('medio')}
              className={`py-4 px-6 rounded-xl text-lg font-semibold transition-all border-3 ${
                nivelVoto === 'medio'
                  ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg scale-105'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
              }`}
            >
              ~ Voto Médio / Simpatizante
            </button>

            <button
              type="button"
              onClick={() => setNivelVoto('fraco')}
              className={`py-4 px-6 rounded-xl text-lg font-semibold transition-all border-3 ${
                nivelVoto === 'fraco'
                  ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              ? Voto Fraco / Indeciso
            </button>
          </div>
        </div>

        {/* Nível de Engajamento */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-3">
            <Award className="w-5 h-5 mr-2 text-blue-600" />
            Nível de Engajamento *
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setNivelEngajamento('lideranca')}
              className={`py-3 px-5 rounded-lg font-semibold transition-all border-2 ${
                nivelEngajamento === 'lideranca'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-lg'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              ⭐ Liderança
            </button>

            <button
              type="button"
              onClick={() => setNivelEngajamento('apoiador')}
              className={`py-3 px-5 rounded-lg font-semibold transition-all border-2 ${
                nivelEngajamento === 'apoiador'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              👥 Apoiador Ativo
            </button>

            <button
              type="button"
              onClick={() => setNivelEngajamento('eleitor_comum')}
              className={`py-3 px-5 rounded-lg font-semibold transition-all border-2 ${
                nivelEngajamento === 'eleitor_comum'
                  ? 'bg-gray-600 text-white border-gray-700 shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              👤 Eleitor Comum
            </button>
          </div>
        </div>

        {/* Nichos e Interesses */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-3">
            <Tag className="w-5 h-5 mr-2 text-blue-600" />
            Nichos e Interesses
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {NICHOS_DISPONIVEIS.map(nicho => (
              <button
                key={nicho}
                type="button"
                onClick={() => toggleNicho(nicho)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  nichos.includes(nicho)
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {nichos.includes(nicho) ? '✓ ' : ''}{nicho}
              </button>
            ))}
          </div>
        </div>

        {/* GPS e Localização */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-3">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            Geolocalização
          </h2>
          {gpsLatitude && gpsLongitude ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium mb-1">✓ Localização capturada</p>
              <p className="text-xs text-green-700">
                Lat: {gpsLatitude.toFixed(6)} / Long: {gpsLongitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-center justify-between">
              <p className="text-sm text-yellow-800">
                {capturandoGps ? 'Capturando GPS...' : 'GPS não disponível'}
              </p>
              <button
                type="button"
                onClick={captureGPS}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        {/* Opt-in WhatsApp */}
        <div className="bg-white rounded-xl shadow p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceitaWhatsapp}
              onChange={(e) => setAceitaWhatsapp(e.target.checked)}
              className="w-6 h-6 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Aceita mensagens automáticas</p>
              <p className="text-sm text-gray-600">
                Permite receber informações da campanha via WhatsApp
              </p>
            </div>
          </label>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-900 flex items-center mb-3">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            Observações
          </h2>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
            rows={4}
            placeholder="Ex: Morador pediu asfalto na Rua João Silva..."
          />
        </div>

        {/* Botão Salvar Fixo */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-200 shadow-lg">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-bold shadow-lg flex items-center justify-center transition-all active:scale-95"
          >
            <Save className="w-6 h-6 mr-2" />
            Salvar Cadastro
          </button>
        </div>
      </form>
    </div>
  );
}
