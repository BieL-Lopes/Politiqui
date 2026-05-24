import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { db } from './db';
import { syncAll } from './syncService';
import { isSupabaseConfigured } from './supabase';

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const refreshCount = async () => {
    const count = await db.pendingChanges.count();
    setPendingCount(count);
    return count;
  };

  useEffect(() => {
    refreshCount();

    const handleOnline = async () => {
      setIsOnline(true);
      const count = await refreshCount();
      if (count === 0) return;

      try {
        if (isSupabaseConfigured) {
          const { pushed, pulled } = await syncAll();
          await refreshCount();
          if (pushed + pulled > 0) {
            toast.success(
              `Sincronizado: ${pushed} enviado${pushed !== 1 ? 's' : ''}, ${pulled} recebido${pulled !== 1 ? 's' : ''}`
            );
          }
          if (pulled > 0) {
            // Sinaliza para App.tsx recarregar eleitores do Dexie
            setSyncedAt(new Date().toISOString());
          }
        } else {
          // Sem Supabase: limpa fila local (comportamento demo anterior)
          await db.pendingChanges.clear();
          setPendingCount(0);
          toast.success(`${count} alteraç${count === 1 ? 'ão sincronizada' : 'ões sincronizadas'}!`);
        }
      } catch {
        toast.error('Erro ao sincronizar — dados mantidos localmente');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sem conexão — trabalhando offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, pendingCount, refreshCount, syncedAt };
}

