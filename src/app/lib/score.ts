import { ElectorData } from '../components/CaptureForm';

// ── Pontuação por nível de voto ───────────────────────────────────────────────
const VOTO_PTS: Record<string, number> = {
  forte:    40,
  medio:    25,
  fraco:    10,
  indeciso: 15,
  oposicao:  0,
};

// ── Pontuação por nível de engajamento ────────────────────────────────────────
const ENGAJ_PTS: Record<string, number> = {
  lideranca:      30,
  cabo_eleitoral: 20,
  eleitor_comum:   8,
};

// ── Resultado do score ────────────────────────────────────────────────────────
export interface ScoreResult {
  /** Pontuação de 0 a 100 */
  score: number;
  tier: 'alto' | 'medio' | 'baixo';
  label: string;
  hexColor: string;
}

const TIER_CONFIG = {
  alto:  { label: 'Alto',  hexColor: '#16a34a' },
  medio: { label: 'Médio', hexColor: '#ca8a04' },
  baixo: { label: 'Baixo', hexColor: '#dc2626' },
} as const;

/**
 * Calcula o score de engajamento de um eleitor (0–100).
 *
 * Critérios (máx 110 pts antes da normalização):
 *  - nivelVoto (0/10/15/25/40)
 *  - nivelEngajamento (8/20/30)
 *  - atendimentos registrados: 5 pts cada, até 20 pts
 *  - nichos de interesse: 2 pts cada, até 10 pts
 *  - aceitaWhatsapp: +5 pts
 *  - observações preenchidas (>10 chars): +5 pts
 */
export function computeScore(e: ElectorData): ScoreResult {
  let raw = 0;
  raw += VOTO_PTS[e.nivelVoto] ?? 0;
  raw += ENGAJ_PTS[e.nivelEngajamento] ?? 0;
  raw += Math.min((e.atendimentos?.length ?? 0) * 5, 20);
  raw += Math.min((e.nichos?.length ?? 0) * 2, 10);
  raw += e.aceitaWhatsapp ? 5 : 0;
  raw += (e.observacoes?.trim().length ?? 0) > 10 ? 5 : 0;

  // Normaliza para 0–100 (máx raw = 40+30+20+10+5+5 = 110)
  const score = Math.min(Math.round((raw / 110) * 100), 100);

  const tier: ScoreResult['tier'] =
    score >= 65 ? 'alto' : score >= 35 ? 'medio' : 'baixo';

  return { score, tier, ...TIER_CONFIG[tier] };
}

/**
 * Retorna o score médio de uma lista de eleitores (0–100).
 */
export function avgScore(electors: ElectorData[]): number {
  if (!electors.length) return 0;
  return Math.round(
    electors.reduce((sum, e) => sum + computeScore(e).score, 0) / electors.length
  );
}
