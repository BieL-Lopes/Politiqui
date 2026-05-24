import { RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  isOnline: boolean;
  pendingCount: number;
}

export function OfflineBanner({ isOnline, pendingCount }: Props) {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-white text-sm font-medium ${
        isOnline ? 'bg-amber-500' : 'bg-red-600'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>
          {isOnline ? 'Sincronizando...' : 'Offline — dados salvos localmente'}
        </span>
      </div>
      {pendingCount > 0 && (
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
          {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
