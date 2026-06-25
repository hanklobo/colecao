import type { SyncStatus } from '../hooks/useUserSync';

interface Props {
  status: SyncStatus;
  dirty: boolean;
  enabled: boolean;        // hide entirely until the account exists
  onForceSync: () => void;
}

// Compact pill placed in the dark app header. Stays hidden in the steady
// state (synced + idle) so the chrome doesn't feel chatty. Surfaces only
// when there's something interesting: pending, syncing, or failed.
export function SyncBadge({ status, dirty, enabled, onForceSync }: Props) {
  if (!enabled) return null;
  const interesting =
    status === 'syncing' || status === 'error' || (dirty && status === 'pending');
  if (!interesting) return null;

  let icon: string;
  let label: string;
  let tone: string;
  let spin = false;
  if (status === 'error') {
    icon = '⚠';
    label = 'Falha';
    tone = 'bg-rose-500/25 text-rose-100 hover:bg-rose-500/35';
  } else if (status === 'syncing') {
    icon = '⟳';
    label = 'Sincronizando';
    tone = 'bg-white/15 text-white/85';
    spin = true;
  } else {
    icon = '•';
    label = 'Pendente';
    tone = 'bg-amber-400/25 text-amber-100 hover:bg-amber-400/35';
  }

  return (
    <button
      onClick={onForceSync}
      disabled={status === 'syncing'}
      title="Sincronizar agora"
      className={`flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1 text-[10px] font-bold transition-colors ${tone} disabled:cursor-default`}
    >
      <span className={`text-sm leading-none ${spin ? 'animate-spin inline-block' : ''}`}>
        {icon}
      </span>
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}
