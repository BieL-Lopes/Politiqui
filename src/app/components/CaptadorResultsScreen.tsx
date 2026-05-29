import { useMemo } from 'react';
import { Trophy, Flame, Target, Star, LogOut, ChevronUp, Minus, ChevronDown } from 'lucide-react';
import { User } from '../lib/auth';
import { ElectorData } from './CaptureForm';
import {
  MEDALS, META_DIARIA, buildRanking, computeStreak, todayCount,
} from '../lib/gamification';

interface Props {
  user: User;
  electors: ElectorData[];
  users: User[];
  onLogout: () => void;
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];
const RANK_LABELS = ['1º', '2º', '3º'];

export function CaptadorResultsScreen({ user, electors, users, onLogout }: Props) {
  const ranking = useMemo(() => buildRanking(users, electors), [users, electors]);
  const me = ranking.find(r => r.id === user.id);

  const myTotal = electors.filter(e => e.createdBy === user.id).length;
  const myToday = todayCount(electors, user.id);
  const myStreak = computeStreak(electors, user.id);
  const myRank = me?.rank ?? ranking.length + 1;

  const todayPct = Math.min((myToday / META_DIARIA) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-blue-200 mb-1">Meus Resultados</p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-blue-800 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Rank */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {myRank <= 3
                ? <span style={{ color: RANK_COLORS[myRank - 1] }}>{RANK_LABELS[myRank - 1]}</span>
                : `#${myRank}`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Ranking</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
            <Flame className={`w-6 h-6 mb-1 ${myStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold text-gray-900">{myStreak}</p>
            <p className="text-xs text-gray-400 mt-0.5">Dias seguidos</p>
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
            <Star className="w-6 h-6 text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{myTotal}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
        </div>

        {/* Meta Diária */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm">Meta de hoje</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{myToday}/{META_DIARIA}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all ${myToday >= META_DIARIA ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${todayPct}%` }}
            />
          </div>
          {myToday >= META_DIARIA && (
            <p className="text-xs text-green-600 font-medium mt-1.5">✅ Meta atingida hoje!</p>
          )}
        </div>

        {/* Medalhas */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-bold text-gray-900 mb-3">Medalhas</h3>
          <div className="grid grid-cols-3 gap-3">
            {MEDALS.map(medal => {
              const earned = myTotal >= medal.threshold;
              return (
                <div
                  key={medal.id}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    earned
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{medal.icon}</span>
                  <p className={`text-xs font-bold text-center ${earned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {medal.label}
                  </p>
                  <p className="text-xs text-gray-400">{medal.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking Geral */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h3 className="font-bold text-gray-900">Ranking da Equipe</h3>
          </div>
          {ranking.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum captador cadastrado</p>
          ) : (
            <div className="space-y-2">
              {ranking.map(entry => {
                const isMe = entry.id === user.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isMe ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    {/* Position */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : '#e5e7eb',
                        color: entry.rank <= 3 ? '#fff' : '#6b7280',
                      }}
                    >
                      <span className="text-xs font-bold">{entry.rank}</span>
                    </div>

                    {/* Name + medals */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-blue-700' : 'text-gray-900'}`}>
                        {entry.name}{isMe ? ' (você)' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.earnedMedalIds.map(id => MEDALS.find(m => m.id === id)?.icon).join(' ')}
                        {entry.streak > 0 && ` 🔥${entry.streak}`}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{entry.total}</p>
                      <p className="text-xs text-gray-400">cadastros</p>
                    </div>

                    {/* Trend vs #1 */}
                    {entry.rank === 1 ? (
                      <ChevronUp className="w-4 h-4 text-green-500 shrink-0" />
                    ) : entry.total === 0 ? (
                      <Minus className="w-4 h-4 text-gray-300 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
