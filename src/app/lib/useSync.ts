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

  const runSync = async (showToast = true) => {
    if (!isSupabaseConfigured) return;
    try {
      const { pushed, pulled } = await syncAll();
      await refreshCount();
      if (showToast && pushed + pulled > 0) {
        toast.success(
          `Sincronizado: ${pushed} enviado${pushed !== 1 ? 's' : ''}, ${pulled} recebido${pulled !== 1 ? 's' : ''}`
        );
      }
      if (pulled > 0) {
        setSyncedAt(new Date().toISOString());
      }
    } catch {
      toast.error('Erro ao sincronizar — dados mantidos localmente');
    }
  };

  useEffect(() => {
    refreshCount();

    // Ao iniciar online: faz push de pendentes + pull de dados novos do servidor
    if (navigator.onLine && isSupabaseConfigured) {
      runSync(false);
    }

    const handleOnline = async () => {
      setIsOnline(true);
      await refreshCount();
      // Sempre sincroniza ao voltar online (push pendentes + pull novos)
      if (isSupabaseConfigured) {
        await runSync(true);
      } else {
        const count = await db.pendingChanges.count();
        if (count > 0) {
          await db.pendingChanges.clear();
          setPendingCount(0);
          toast.success(`${count} alteraç${count === 1 ? 'ão sincronizada' : 'ões sincronizadas'}!`);
        }
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

  return { isOnline, pendingCount, refreshCount, syncedAt, runSync };
}

