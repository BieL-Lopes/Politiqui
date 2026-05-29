import { ElectorData } from '../components/CaptureForm';
import { User } from './auth';

export const META_DIARIA = 5;

export interface Medal {
  id: string;
  label: string;
  desc: string;
  icon: string;
  threshold: number;
}

export const MEDALS: Medal[] = [
  { id: 'first',      label: 'Primeiro Passo', desc: '1º cadastro',     icon: '🌱', threshold: 1   },
  { id: 'ten',        label: 'Decolou!',        desc: '10 cadastros',    icon: '🚀', threshold: 10  },
  { id: 'fifty',      label: 'Meio Caminho',    desc: '50 cadastros',    icon: '⭐', threshold: 50  },
  { id: 'hundred',    label: 'Centurião',       desc: '100 cadastros',   icon: '🏅', threshold: 100 },
  { id: 'twofifty',   label: 'Elite',           desc: '250 cadastros',   icon: '💎', threshold: 250 },
  { id: 'fivehundred',label: 'Lendário',        desc: '500 cadastros',   icon: '👑', threshold: 500 },
];

/** Retorna quantos eleitores o captador cadastrou hoje. */
export function todayCount(electors: ElectorData[], captadorId: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return electors.filter(e => {
    if (e.createdBy !== captadorId) return false;
    return new Date(e.dataCadastro) >= start;
  }).length;
}

/** Sequência de dias consecutivos com pelo menos 1 cadastro (streak). */
export function computeStreak(electors: ElectorData[], captadorId: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [
    ...new Set(
      electors
        .filter(e => e.createdBy === captadorId)
        .map(e => {
          const d = new Date(e.dataCadastro);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    ),
  ].sort((a, b) => b - a);

  if (!uniqueDays.length) return 0;

  let streak = 0;
  let expected = today.getTime();

  for (const day of uniqueDays) {
    if (day === expected) {
      streak++;
      expected -= 86_400_000;
    } else if (day < expected) {
      break;
    }
  }
  return streak;
}

export interface RankEntry {
  id: string;
  name: string;
  total: number;
  today: number;
  streak: number;
  earnedMedalIds: string[];
  rank: number;
}

/** Gera o ranking de captadores ordenado por total de cadastros. */
export function buildRanking(users: User[], electors: ElectorData[]): RankEntry[] {
  const captadores = users.filter(u => u.role === 'captador_votos');
  const entries: RankEntry[] = captadores.map(c => {
    const total = electors.filter(e => e.createdBy === c.id).length;
    return {
      id: c.id,
      name: c.name,
      total,
      today: todayCount(electors, c.id),
      streak: computeStreak(electors, c.id),
      earnedMedalIds: MEDALS.filter(m => total >= m.threshold).map(m => m.id),
      rank: 0,
    };
  });

  entries.sort((a, b) => b.total - a.total);
  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}
