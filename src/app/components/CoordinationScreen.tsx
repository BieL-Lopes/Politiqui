import { useState } from 'react';
import { Users, Target, Download, ChevronDown, ChevronRight, UserCheck, Calendar } from 'lucide-react';
import { User } from '../lib/auth';
import { ElectorData } from './CaptureForm';

interface Props {
  user: User;
  electors: ElectorData[];
  users: User[];
  canExport: boolean;
}

const META_POR_CAPTADOR = 100;

function exportCSV(rows: Record<string, string | number>[], filename: string) {
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

export function CoordinationScreen({ user, electors, users, canExport }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const countByCaptador = (captadorId: string) =>
    electors.filter(e => e.createdBy === captadorId).length;

  const lastCadastro = (captadorId: string): string | null => {
    const dates = electors
      .filter(e => e.createdBy === captadorId)
      .map(e => e.dataCadastro);
    if (!dates.length) return null;
    return dates.sort().reverse()[0];
  };

  const pct = (count: number) => Math.min(Math.round((count / META_POR_CAPTADOR) * 100), 100);

  const barColor = (p: number) =>
    p >= 80 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-500' : 'bg-red-400';

  // ── Coordenador Regional: mostra seus próprios captadores ──
  if (user.role === 'coordenador_regional') {
    const captadores = users.filter(u => u.coordenadorRegionalId === user.id);
    const total = captadores.reduce((s, c) => s + countByCaptador(c.id), 0);

    const handleExport = () => {
      exportCSV(
        captadores.map(c => ({
          captador: c.name,
          regiao: c.regiao ?? '',
          eleitores_cadastrados: countByCaptador(c.id),
          meta: META_POR_CAPTADOR,
          progresso_pct: pct(countByCaptador(c.id)),
        })),
        `equipe-${user.regiao ?? 'regiao'}.csv`
      );
    };

    return (
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-2xl font-bold mb-1">Minha Equipe</h1>
          <p className="text-sm text-blue-100">{user.regiao} • {total} eleitor{total !== 1 ? 'es' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="p-4 space-y-4">
          {canExport && (
            <button
              onClick={handleExport}
              className="w-full py-3 px-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar CSV da equipe
            </button>
          )}

          {captadores.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhum captador vinculado a você ainda.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">Captadores</h2>
                <span className="ml-auto text-sm text-gray-500">Meta: {META_POR_CAPTADOR} cada</span>
              </div>
              <div className="divide-y divide-gray-100">
                {captadores.map(c => {
                  const count = countByCaptador(c.id);
                  const p = pct(count);
                  const last = lastCadastro(c.id);
                  return (
                    <div key={c.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          {last ? (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Último: {new Date(last).toLocaleDateString('pt-BR')}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">Nenhum cadastro ainda</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 text-lg">{count}</p>
                          <p className="text-xs text-gray-400">{p}% da meta</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor(p)}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Coordenador Geral / Liderança: drill-down regiao → captadores ──
  const regionalCoords = users.filter(u =>
    u.role === 'coordenador_regional' &&
    (user.role === 'lideranca' || (user.deputadoId && u.deputadoId === user.deputadoId))
  );

  const allCaptadores = users.filter(u => u.role === 'captador_votos');
  const grandTotal = electors.length;
  const grandTarget = allCaptadores.length * META_POR_CAPTADOR;

  const handleExportGeral = () => {
    const rows: Record<string, string | number>[] = [];
    regionalCoords.forEach(rc => {
      const captadores = users.filter(u => u.coordenadorRegionalId === rc.id);
      captadores.forEach(c => {
        rows.push({
          regiao: rc.regiao ?? '',
          coordenador_regional: rc.name,
          captador: c.name,
          eleitores: countByCaptador(c.id),
          meta: META_POR_CAPTADOR,
          progresso_pct: pct(countByCaptador(c.id)),
        });
      });
    });
    exportCSV(rows, 'relatorio-coordenacao.csv');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">Coordenação</h1>
        <p className="text-sm text-blue-100">Visão geral da equipe</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-500">Total Eleitores</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{grandTotal}</p>
            <p className="text-xs text-gray-400">Meta: {grandTarget}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-500">Progresso</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {grandTarget > 0 ? Math.round((grandTotal / grandTarget) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400">da meta geral</p>
          </div>
        </div>

        {canExport && (
          <button
            onClick={handleExportGeral}
            className="w-full py-3 px-4 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar relatório completo (CSV)
          </button>
        )}

        {/* Drill-down por região */}
        <div className="space-y-2">
          {regionalCoords.map(rc => {
            const captadores = users.filter(u => u.coordenadorRegionalId === rc.id);
            const regionTotal = captadores.reduce((s, c) => s + countByCaptador(c.id), 0);
            const regionTarget = captadores.length * META_POR_CAPTADOR;
            const regionPct = regionTarget > 0 ? Math.round((regionTotal / regionTarget) * 100) : 0;
            const isOpen = expanded === rc.id;

            return (
              <div key={rc.id} className="bg-white rounded-xl shadow overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : rc.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{rc.regiao}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      {rc.name} • {captadores.length} captador{captadores.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{regionTotal}</p>
                      <p className="text-xs text-gray-400">{regionPct}%</p>
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-5 h-5 text-gray-400" />
                      : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Progress bar da região */}
                <div className="px-4 pb-3">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(regionPct)}`} style={{ width: `${regionPct}%` }} />
                  </div>
                </div>

                {/* Captadores expandidos */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {captadores.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400 text-center">Nenhum captador nesta região.</p>
                    ) : (
                      captadores.map(c => {
                        const count = countByCaptador(c.id);
                        const p = pct(count);
                        const last = lastCadastro(c.id);
                        return (
                          <div key={c.id} className="px-6 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                                {last ? (
                                  <p className="text-xs text-gray-400">
                                    Último: {new Date(last).toLocaleDateString('pt-BR')}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-400">Nenhum cadastro</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">{count}</p>
                                <p className="text-xs text-gray-400">{p}%</p>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor(p)}`} style={{ width: `${p}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

