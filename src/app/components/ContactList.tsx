import { useState } from 'react';
import { ArrowLeft, Search, Phone, MapPin, Trash2, Download, FileText, FileSpreadsheet, X, TrendingUp } from 'lucide-react';
import { ElectorData } from './CaptureForm';
import { computeScore, avgScore } from '../lib/score';

interface ContactListProps {
  contacts: ElectorData[];
  onBack: () => void;
  onDelete?: (id: string) => void;
  onViewProfile: (elector: ElectorData) => void;
}

export function ContactList({ contacts, onBack, onDelete, onViewProfile }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos');

  const filteredContacts = contacts.filter(contact => {
    const matchText =
      contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.bairro.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchText) return false;
    if (scoreFilter !== 'todos' && computeScore(contact).tier !== scoreFilter) return false;
    return true;
  });

  const getNivelBadge = (nivel: 'forte' | 'medio' | 'fraco' | 'indeciso' | 'oposicao') => {
    const styles = {
      forte:    'bg-green-100 text-green-800 border-green-300',
      medio:    'bg-yellow-100 text-yellow-800 border-yellow-300',
      fraco:    'bg-red-100 text-red-800 border-red-300',
      indeciso: 'bg-slate-100 text-slate-700 border-slate-300',
      oposicao: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    const labels = {
      forte:    'Forte',
      medio:    'Médio',
      fraco:    'Fraco',
      indeciso: 'Indeciso',
      oposicao: 'Oposição',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${styles[nivel]}`}>
        {labels[nivel]}
      </span>
    );
  };

  const getNivelEngajamentoBadge = (nivel: 'lideranca' | 'cabo_eleitoral' | 'eleitor_comum') => {
    const styles = {
      lideranca: 'bg-purple-100 text-purple-800 border-purple-300',
      cabo_eleitoral: 'bg-blue-100 text-blue-800 border-blue-300',
      eleitor_comum: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    const labels = {
      lideranca: '⭐ Liderança',
      cabo_eleitoral: '👥 Cabo Eleitoral',
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

  const exportToCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Titulo Eleitor', 'Data Nascimento', 'Bairro', 'Cidade', 'Nivel Voto', 'Nivel Engajamento', 'Nichos', 'Aceita WhatsApp', 'Observacoes', 'Data Cadastro'];
    const rows = filteredContacts.map(c => [
      c.nome,
      c.whatsapp,
      c.tituloEleitor || '',
      c.dataNascimento ? formatDate(c.dataNascimento) : '',
      c.bairro,
      c.cidade,
      c.nivelVoto === 'forte' ? 'Forte' : c.nivelVoto === 'medio' ? 'Medio' : c.nivelVoto === 'fraco' ? 'Fraco' : c.nivelVoto === 'indeciso' ? 'Indeciso' : 'Oposicao',
      c.nivelEngajamento === 'lideranca' ? 'Lideranca' : c.nivelEngajamento === 'cabo_eleitoral' ? 'Cabo Eleitoral' : 'Eleitor Comum',
      (c.nichos || []).join('; '),
      c.aceitaWhatsapp ? 'Sim' : 'Nao',
      c.observacoes || '',
      formatDate(c.dataCadastro)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eleitores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const nivelVotoLabel = (nivel: string) => nivel === 'forte' ? 'Forte' : nivel === 'medio' ? 'Medio' : nivel === 'fraco' ? 'Fraco' : nivel === 'indeciso' ? 'Indeciso' : nivel === 'oposicao' ? 'Oposicao' : nivel;
    const nivelEngajamentoLabel = (nivel: string) => nivel === 'lideranca' ? 'Lideranca' : nivel === 'cabo_eleitoral' ? 'Cabo Eleitoral' : 'Eleitor Comum';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lista de Eleitores</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          h1 { color: #2563eb; font-size: 18px; margin-bottom: 5px; }
          .subtitle { color: #666; margin-bottom: 20px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #2563eb; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
          td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 10px; }
          tr:nth-child(even) { background: #f9fafb; }
          .badge { padding: 2px 6px; border-radius: 10px; font-size: 9px; font-weight: bold; }
          .forte { background: #dcfce7; color: #166534; }
          .medio { background: #fef9c3; color: #854d0e; }
          .fraco { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Lista de Eleitores Cadastrados</h1>
        <p class="subtitle">Exportado em ${new Date().toLocaleDateString('pt-BR')} - Total: ${filteredContacts.length} eleitor(es)</p>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Bairro/Cidade</th>
              <th>Voto</th>
              <th>Engajamento</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            ${filteredContacts.map(c => `
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.whatsapp}</td>
                <td>${c.bairro ? c.bairro + ', ' : ''}${c.cidade}</td>
                <td><span class="badge ${c.nivelVoto}">${nivelVotoLabel(c.nivelVoto)}</span></td>
                <td>${nivelEngajamentoLabel(c.nivelEngajamento)}</td>
                <td>${formatDate(c.dataCadastro)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
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

          {/* Botao Exportar */}
          {contacts.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
              >
                <Download className="w-5 h-5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 min-w-[180px]">
                  <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Exportar</span>
                    <button
                      onClick={() => setShowExportMenu(false)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center text-gray-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">CSV / Excel</p>
                      <p className="text-xs text-gray-500">Planilha completa</p>
                    </div>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center text-gray-700 border-t border-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">PDF / Imprimir</p>
                      <p className="text-xs text-gray-500">Relatorio formatado</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
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

        {/* Filtro por score */}
        <div className="flex gap-2 pt-1">
          {(['todos', 'alto', 'medio', 'baixo'] as const).map(tier => {
            const active = scoreFilter === tier;
            const config = {
              todos: { label: 'Todos', activeStyle: 'bg-white text-blue-700 font-bold' },
              alto:  { label: `Alto (${contacts.filter(c => computeScore(c).tier === 'alto').length})`,  activeStyle: 'bg-green-500 text-white font-bold' },
              medio: { label: `Médio (${contacts.filter(c => computeScore(c).tier === 'medio').length})`, activeStyle: 'bg-yellow-400 text-yellow-900 font-bold' },
              baixo: { label: `Baixo (${contacts.filter(c => computeScore(c).tier === 'baixo').length})`, activeStyle: 'bg-red-500 text-white font-bold' },
            };
            return (
              <button
                key={tier}
                onClick={() => setScoreFilter(tier)}
                className={`flex-1 text-xs py-1.5 rounded-full transition-colors border ${
                  active
                    ? config[tier].activeStyle + ' border-transparent'
                    : 'bg-blue-500 text-blue-100 border-blue-400 hover:bg-blue-400'
                }`}
              >
                {config[tier].label}
              </button>
            );
          })}
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
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{contact.nome}</h3>
                    {(() => {
                      const s = computeScore(contact);
                      return (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                          style={{ backgroundColor: s.hexColor }}
                          title={`Score: ${s.score}/100`}
                        >
                          {s.score}
                        </span>
                      );
                    })()}
                  </div>
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
                {onDelete && (
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
                )}
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
          <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-center text-sm">
            <div>
              <p className="text-green-600 font-bold text-lg leading-tight">
                {contacts.filter(c => c.nivelVoto === 'forte').length}
              </p>
              <p className="text-gray-600 text-xs">Fortes</p>
            </div>
            <div>
              <p className="text-yellow-600 font-bold text-lg leading-tight">
                {contacts.filter(c => c.nivelVoto === 'medio').length}
              </p>
              <p className="text-gray-600 text-xs">Médios</p>
            </div>
            <div>
              <p className="text-red-600 font-bold text-lg leading-tight">
                {contacts.filter(c => c.nivelVoto === 'fraco').length}
              </p>
              <p className="text-gray-600 text-xs">Fracos</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {contacts.filter(c => c.nivelVoto === 'indeciso').length}
              </p>
              <p className="text-gray-600 text-xs">Indecisos</p>
            </div>
            <div>
              <p className="text-purple-600 font-bold text-lg leading-tight">
                {contacts.filter(c => c.nivelVoto === 'oposicao').length}
              </p>
              <p className="text-gray-600 text-xs">Oposição</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <p className="text-blue-600 font-bold text-lg leading-tight">{avgScore(contacts)}</p>
              </div>
              <p className="text-gray-600 text-xs">Score médio</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
