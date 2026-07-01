import webpush from 'web-push';
import { delKey, getJSON, keysMatching } from './kv.js';

export function isPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidReady = false;
function ensureVapid() {
  if (vapidReady) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:contato@albumcopa.xyz';
  if (!publicKey || !privateKey) throw new Error('vapid_not_configured');
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidReady = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface SendResult {
  total: number;
  sent: number;
  failed: number;
  removed: number;
}

// Fans a notification out to every stored subscription, pruning any that
// the push service reports as gone (404/410 — the user uninstalled/blocked).
export async function sendToAll(payload: PushPayload): Promise<SendResult> {
  ensureVapid();
  const keys = await keysMatching('push:sub:*');
  const message = JSON.stringify(payload);

  let sent = 0;
  let failed = 0;
  let removed = 0;

  await Promise.all(
    keys.map(async (key) => {
      const sub = await getJSON<webpush.PushSubscription>(key);
      if (!sub) return;
      try {
        await webpush.sendNotification(sub, message);
        sent++;
      } catch (err) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          removed++;
          try { await delKey(key); } catch { /* best effort cleanup */ }
        } else {
          console.error('push:send error', statusCode, err);
        }
      }
    }),
  );

  return { total: keys.length, sent, failed, removed };
}
