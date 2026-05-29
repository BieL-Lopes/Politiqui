import { supabase, isSupabaseConfigured } from './supabase';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Aguarda serviceWorker.ready com timeout para não travar. */
function waitForSW(ms = 8000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('SW timeout')), ms)
    ),
  ]);
}

/**
 * Solicita permissão e registra a assinatura Web Push para o usuário.
 */
export async function subscribeToPush(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] API não suportada neste browser');
    return;
  }
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[Push] VITE_VAPID_PUBLIC_KEY não definida');
    return;
  }
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Push] Supabase não configurado');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await waitForSW();
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subJson = sub.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh,
        auth: subJson.keys!.auth,
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('[Push] Erro ao salvar assinatura:', error);
      toast.error(`Push: falha ao salvar assinatura — ${error.message}`);
      return;
    }

    console.log('[Push] Assinatura salva com sucesso para userId', userId);
  } catch (err) {
    console.error('[Push] Erro geral na assinatura:', err);
    // Não exibe toast — erros silenciosos são aceitáveis aqui (SW não ativo em build de dev)
  }
}

/**
 * Cancela a assinatura e remove do banco.
 */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    }
  } catch {
    // ignorar
  }
}
