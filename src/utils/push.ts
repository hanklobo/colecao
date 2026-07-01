// VAPID public keys are meant to be public (they're the "who is allowed to
// push to this subscription" identity, not a secret) — safe to inline.
const VAPID_PUBLIC_KEY =
  'BN-zqyErvcqZOWDUHgIZFyMxiYhSMNomhDlNDmc5_UGyg9aKnz5K6mpWVSt54GQwZj0CpRmleom42A-HVfGP300';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined';
}

export function pushPermission(): NotificationPermission | 'unsupported' {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

export type SubscribeResult = 'subscribed' | 'denied' | 'unsupported' | 'error';

export async function subscribeToPush(): Promise<SubscribeResult> {
  if (!isPushSupported()) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    return 'subscribed';
  } catch (err) {
    console.error('push subscribe failed', err);
    return 'error';
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  try {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } finally {
    await sub.unsubscribe();
  }
}
