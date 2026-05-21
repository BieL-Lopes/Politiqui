import { useState } from 'react';
import { Plus, BarChart3, Users, Clock, TrendingUp, Download, FileText, FileSpreadsheet, X } from 'lucide-react';

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
  const [showExportMenu, setShowExportMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const exportPollsToCSV = () => {
    const headers = ['Titulo', 'Data', 'Respostas', 'Status'];
    const rows = MOCK_POLLS.map(p => [
      p.title,
      new Date(p.date).toLocaleDateString('pt-BR'),
      p.responses.toString(),
      p.status === 'active' ? 'Ativa' : 'Encerrada'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquetes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportPollsToPDF = () => {
    const totalRespostas = MOCK_POLLS.reduce((acc, p) => acc + p.responses, 0);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatorio de Enquetes</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          h1 { color: #2563eb; font-size: 18px; margin-bottom: 5px; }
          .subtitle { color: #666; margin-bottom: 20px; font-size: 11px; }
          .stats { display: flex; gap: 30px; margin-bottom: 20px; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 10px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #2563eb; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
          td { padding: 8px 6px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f9fafb; }
          .badge { padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
          .active { background: #dcfce7; color: #166534; }
          .closed { background: #f3f4f6; color: #374151; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Relatorio de Enquetes</h1>
        <p class="subtitle">Exportado em ${new Date().toLocaleDateString('pt-BR')}</p>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${MOCK_POLLS.length}</div>
            <div class="stat-label">Total de Enquetes</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalRespostas}</div>
            <div class="stat-label">Total de Respostas</div>
          </div>
          <div class="stat">
            <div class="stat-value">${MOCK_POLLS.filter(p => p.status === 'active').length}</div>
            <div class="stat-label">Enquetes Ativas</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Data</th>
              <th>Respostas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_POLLS.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td>${new Date(p.date).toLocaleDateString('pt-BR')}</td>
                <td>${p.responses}</td>
                <td><span class="badge ${p.status === 'active' ? 'active' : 'closed'}">${p.status === 'active' ? 'Ativa' : 'Encerrada'}</span></td>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Enquetes</h1>
            <p className="text-sm text-blue-100">Pesquisas de opiniao via WhatsApp</p>
          </div>

          {/* Botao Exportar */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors flex items-center"
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
                  onClick={exportPollsToCSV}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center text-gray-700 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">CSV / Excel</p>
                    <p className="text-xs text-gray-500">Planilha completa</p>
                  </div>
                </button>
                <button
                  onClick={exportPollsToPDF}
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
        </div>
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
