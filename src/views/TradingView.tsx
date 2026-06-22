import { Fragment, useMemo, useState } from 'react';
import type { AlbumState, Section } from '../types';
import type { TradePartner } from '../hooks/useTradePartners';
import { STICKER_MAP } from '../data/album2026';
import {
  encodeTradeCode,
  calculateTrade,
  getPartnerStats,
  generateShareUrl,
  decodeTradeCode,
} from '../utils/trading';
import { getFlagUrl } from '../utils/flags';
import {
  ShareIcon,
  CheckIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  GiveIcon,
  ReceiveIcon,
  CloseIcon,
} from '../components/Icons';

interface Props {
  state: AlbumState;
  myName: string;
  onUpdateMyName: (name: string) => void;
  partners: TradePartner[];
  onAddPartner: (name: string, code: string) => boolean;
  onRemovePartner: (id: string) => void;
  onGoToAlbum: () => void;
}

const totalHave = (state: AlbumState) =>
  Object.values(state).filter((s) => s.status !== 'missing').length;

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

const SHARE_STEPS = [
  { emoji: '🔗', label: 'Compartilhe seu link' },
  { emoji: '📲', label: 'O amigo abre' },
  { emoji: '🤝', label: 'As trocas aparecem' },
];

export function TradingView({
  state,
  myName,
  onUpdateMyName,
  partners,
  onAddPartner,
  onRemovePartner,
  onGoToAlbum,
}: Props) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    partners[0]?.id ?? null,
  );
  const [editingName, setEditingName] = useState(!myName);
  const [nameInput, setNameInput] = useState(myName);
  const [shared, setShared] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCode, setAddCode] = useState('');
  const [addError, setAddError] = useState('');

  const myCode = encodeTradeCode(state);
  const myHave = totalHave(state);

  // Keep selection valid as partners change
  const selectedPartner =
    partners.find((p) => p.id === selectedPartnerId) ?? partners[0] ?? null;

  function saveName() {
    if (!nameInput.trim()) return;
    onUpdateMyName(nameInput.trim());
    setEditingName(false);
  }

  async function shareLink() {
    const name = myName || nameInput.trim();
    if (!name) { setEditingName(true); return; }
    const url = generateShareUrl(name, myCode);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Troca de figurinhas · Copa 2026',
          text: `${name} quer trocar figurinhas da Copa com você! Clique para ver o que podemos trocar.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      // user cancelled share — ignore
    }
  }

  function submitAddPartner() {
    const name = addName.trim();
    const code = addCode.trim();
    if (!name) { setAddError('Digite o nome do amigo.'); return; }
    if (!code) { setAddError('Cole o código do amigo.'); return; }
    if (!decodeTradeCode(code)) { setAddError('Código inválido. Verifique e tente novamente.'); return; }
    onAddPartner(name, code);
    setShowAddForm(false);
    setAddName('');
    setAddCode('');
    setAddError('');
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">

      {/* ── Share section ── */}
      <div
        className="px-5 pt-5 pb-6 shadow-card-lg"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
      >
        {/* Header row: label + compact name (where Ajuda used to be) */}
        <div className="flex items-center justify-between gap-3 mb-4 min-h-[34px]">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Meu link de troca</p>
          {myName && !editingName && (
            <button
              onClick={() => { setNameInput(myName); setEditingName(true); }}
              className="flex items-center gap-2 group min-w-0 bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-display font-extrabold text-sm text-white flex-shrink-0">
                {initial(myName)}
              </span>
              <span className="text-white font-bold text-sm truncate max-w-[130px]">{myName}</span>
              <EditIcon className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Name input — only when empty or editing */}
        {(!myName || editingName) && (
          <div className="flex gap-2 mb-4">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Digite seu nome..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/15 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:bg-white/25"
            />
            <button
              onClick={saveName}
              disabled={!nameInput.trim()}
              className="px-5 py-2.5 bg-copa-gold text-copa-navy rounded-xl font-bold text-sm disabled:opacity-40 active:scale-95 transition"
            >
              OK
            </button>
          </div>
        )}

        {/* How link-trading works — the fun part */}
        <div className="flex items-start mb-5">
          {SHARE_STEPS.map((s, idx) => (
            <Fragment key={s.label}>
              <div className="flex-1 flex flex-col items-center text-center px-1">
                <div
                  className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl animate-float"
                  style={{ animationDelay: `${idx * 0.45}s` }}
                >
                  {s.emoji}
                </div>
                <p className="text-white/75 text-[10px] font-semibold mt-2 leading-tight">{s.label}</p>
              </div>
              {idx < SHARE_STEPS.length - 1 && (
                <span className="text-white/30 text-xl font-bold pt-4">›</span>
              )}
            </Fragment>
          ))}
        </div>

        {/* Share button — only after the name is filled */}
        {myName && !editingName ? (
          <>
            <button
              onClick={shareLink}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                shared
                  ? 'bg-emerald-500 text-white'
                  : 'bg-copa-gold text-copa-navy hover:brightness-110 shadow-card'
              }`}
            >
              {shared ? (
                <><CheckIcon className="w-4 h-4" /> Link copiado!</>
              ) : (
                <><ShareIcon className="w-4 h-4" /> Compartilhar meu link</>
              )}
            </button>
            <p className="text-white/50 text-[11px] text-center mt-2.5 leading-snug">
              Envie para um amigo. Quando ele abrir, vira parceiro de troca aqui.
            </p>
          </>
        ) : (
          <p className="text-white/60 text-[11px] text-center leading-snug">
            ☝️ Preencha seu nome para gerar e compartilhar seu link de troca.
          </p>
        )}
      </div>

      {/* ── Partners section ── */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900 font-display font-extrabold text-base tracking-tight">
            Parceiros
          </h2>
          <button
            onClick={() => { setShowAddForm((v) => !v); setAddError(''); }}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              showAddForm
                ? 'bg-gray-200 text-gray-700'
                : 'bg-copa-blue/10 text-copa-blue hover:bg-copa-blue/20'
            }`}
          >
            {showAddForm
              ? (<><CloseIcon className="w-3.5 h-3.5" /> Cancelar</>)
              : (<><PlusIcon className="w-3.5 h-3.5" /> Adicionar</>)}
          </button>
        </div>

        {/* Manual add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-card p-4 mb-4 space-y-3 animate-slide-down">
            <p className="text-sm font-bold text-gray-800">Adicionar amigo manualmente</p>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Nome do amigo"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-copa-blue focus:ring-2 focus:ring-copa-blue/15 transition"
            />
            <textarea
              value={addCode}
              onChange={(e) => setAddCode(e.target.value)}
              placeholder="Cole aqui o link ou código de troca dele"
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-copa-blue focus:ring-2 focus:ring-copa-blue/15 transition"
            />
            {addError && <p className="text-rose-500 text-xs font-medium">{addError}</p>}
            <button
              onClick={submitAddPartner}
              className="w-full py-2.5 bg-copa-ink text-white rounded-xl font-bold text-sm active:scale-95 transition"
            >
              Adicionar parceiro
            </button>
          </div>
        )}

        {/* No partners yet */}
        {partners.length === 0 && !showAddForm && (
          <div className="bg-white rounded-2xl shadow-card p-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-copa-blue/10 text-copa-blue flex items-center justify-center mx-auto mb-3">
              <ShareIcon className="w-7 h-7" />
            </div>
            <p className="font-bold text-gray-800 text-sm">Nenhum parceiro ainda</p>
            <p className="text-gray-400 text-xs mt-1 leading-snug">
              Compartilhe seu link acima. Quando um amigo abrir, ele aparece aqui e o app
              mostra na hora o que vale a pena trocar.
            </p>
          </div>
        )}

        {/* Partner selector + analysis */}
        {partners.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
              {partners.map((p) => {
                const trade = calculateTrade(state, p.code);
                const tradeCount = (trade?.give.length ?? 0) + (trade?.receive.length ?? 0);
                const isActive = p.id === selectedPartner?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`flex-shrink-0 flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                      isActive
                        ? 'bg-copa-ink text-white border-transparent shadow-card'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {initial(p.name)}
                    </span>
                    <span>{p.name}</span>
                    {tradeCount > 0 && (
                      <span
                        className={`text-[9px] font-extrabold rounded-full px-1.5 py-0.5 leading-none tabular-nums ${
                          isActive ? 'bg-copa-gold text-copa-navy' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {tradeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedPartner && (
              <PartnerAnalysis
                key={selectedPartner.id}
                partner={selectedPartner}
                myState={state}
                myHave={myHave}
                onRemove={() => {
                  onRemovePartner(selectedPartner.id);
                  const remaining = partners.filter((p) => p.id !== selectedPartner.id);
                  setSelectedPartnerId(remaining[0]?.id ?? null);
                }}
                onGoToAlbum={onGoToAlbum}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Partner analysis card ───────────────────────────────────────────────────

interface AnalysisProps {
  partner: TradePartner;
  myState: AlbumState;
  myHave: number;
  onRemove: () => void;
  onGoToAlbum: () => void;
}

function PartnerAnalysis({ partner, myState, myHave, onRemove, onGoToAlbum }: AnalysisProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const trade = calculateTrade(myState, partner.code);
  const stats = getPartnerStats(partner.code);

  const give = trade?.give ?? [];
  const receive = trade?.receive ?? [];
  const hasTrade = give.length > 0 || receive.length > 0;
  const diff = give.length - receive.length;

  return (
    <div className="mt-3 space-y-3">
      {/* Partner header */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-11 h-11 rounded-full bg-copa-blue/10 text-copa-blue flex items-center justify-center font-display font-extrabold text-lg flex-shrink-0">
            {initial(partner.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{partner.name}</p>
            <p className="text-gray-400 text-[11px] font-medium">
              {stats
                ? `${stats.have} tem · ${stats.duplicates} repetidas`
                : 'Dados indisponíveis'}
            </p>
          </div>
          {confirmRemove ? (
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs font-semibold text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={onRemove}
                className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1.5 rounded-lg hover:bg-rose-100"
              >
                Remover
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              aria-label="Remover parceiro"
              className="text-gray-300 hover:text-rose-500 transition-colors flex-shrink-0 p-1"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Onboarding nudge for users with no stickers */}
        {myHave === 0 && (
          <div className="px-4 py-4 bg-amber-50 border-t border-amber-100">
            <p className="text-amber-800 font-bold text-sm">{partner.name} está esperando!</p>
            <p className="text-amber-700/70 text-xs mt-0.5 leading-snug">
              Cadastre suas figurinhas no álbum para ver o que vocês podem trocar.
            </p>
            <button
              onClick={onGoToAlbum}
              className="mt-3 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs w-full active:scale-95 transition"
            >
              Ir para o Álbum →
            </button>
          </div>
        )}
      </div>

      {/* Trade result */}
      {!trade ? (
        <EmptyCard text="Não foi possível calcular a troca." />
      ) : !hasTrade ? (
        <EmptyCard
          emoji="🤝"
          title="Nenhuma troca possível agora"
          text={myHave === 0
            ? 'Cadastre suas figurinhas para ver as trocas.'
            : 'Vocês não têm o que o outro precisa no momento.'}
        />
      ) : (
        <>
          {/* Summary + balance */}
          <div
            className="rounded-2xl px-5 py-4 shadow-card text-white"
            style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
          >
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="font-display font-extrabold text-3xl tabular-nums text-emerald-300">{give.length}</p>
                <p className="text-white/60 text-[11px] font-medium mt-0.5">você dá</p>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div className="text-center">
                <p className="font-display font-extrabold text-3xl tabular-nums text-sky-300">{receive.length}</p>
                <p className="text-white/60 text-[11px] font-medium mt-0.5">você recebe</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              {diff === 0 ? (
                <p className="text-emerald-200 font-bold text-xs">✓ Troca equilibrada</p>
              ) : diff > 0 ? (
                <p className="text-amber-200 font-semibold text-xs">Você dá {diff} a mais</p>
              ) : (
                <p className="text-sky-200 font-semibold text-xs">Você recebe {-diff} a mais 🎉</p>
              )}
            </div>
          </div>

          {/* Give */}
          {give.length > 0 && (
            <TradeBlock
              variant="give"
              title="Você dá"
              subtitle={`para ${partner.name}`}
              ids={give}
            />
          )}

          {/* Receive */}
          {receive.length > 0 && (
            <TradeBlock
              variant="receive"
              title="Você recebe"
              subtitle={`de ${partner.name}`}
              ids={receive}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Empty / placeholder card ────────────────────────────────────────────────

function EmptyCard({ emoji, title, text }: { emoji?: string; title?: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-7 text-center">
      {emoji && <p className="text-4xl mb-2">{emoji}</p>}
      {title && <p className="font-bold text-gray-800 text-sm">{title}</p>}
      <p className="text-gray-400 text-xs mt-1 leading-snug">{text}</p>
    </div>
  );
}

// ── Trade block: stickers grouped by selection ──────────────────────────────

const VARIANTS = {
  give: {
    Icon: GiveIcon,
    head: 'bg-emerald-500',
    chip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    count: 'bg-emerald-100 text-emerald-700',
  },
  receive: {
    Icon: ReceiveIcon,
    head: 'bg-sky-500',
    chip: 'bg-sky-50 border-sky-200 text-sky-800',
    count: 'bg-sky-100 text-sky-700',
  },
} as const;

function groupBySection(ids: number[]): { section: Section; ids: number[] }[] {
  const map = new Map<string, { section: Section; ids: number[] }>();
  for (const id of ids) {
    const info = STICKER_MAP[id];
    if (!info) continue;
    const entry = map.get(info.section.id);
    if (entry) entry.ids.push(id);
    else map.set(info.section.id, { section: info.section, ids: [id] });
  }
  return Array.from(map.values());
}

function TradeBlock({
  variant,
  title,
  subtitle,
  ids,
}: {
  variant: 'give' | 'receive';
  title: string;
  subtitle: string;
  ids: number[];
}) {
  const v = VARIANTS[variant];
  const groups = useMemo(() => groupBySection(ids), [ids]);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg ${v.head} text-white flex items-center justify-center flex-shrink-0`}>
          <v.Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight">{title}</p>
          <p className="text-gray-400 text-[11px] font-medium leading-tight">{subtitle}</p>
        </div>
        <span className={`text-xs font-extrabold rounded-full px-2.5 py-1 tabular-nums ${v.count}`}>
          {ids.length}
        </span>
      </div>

      {/* Groups by selection */}
      <div className="divide-y divide-gray-50">
        {groups.map(({ section, ids: groupIds }) => {
          const flagUrl = section.flagCode ? getFlagUrl(section.flagCode, 40) : null;
          return (
            <div key={section.id} className="flex items-start gap-2.5 px-4 py-2.5">
              <div className="w-7 h-5 rounded overflow-hidden flex-shrink-0 bg-gray-100 mt-0.5 ring-1 ring-gray-200">
                {flagUrl ? (
                  <img src={flagUrl} alt={section.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs">{section.flag ?? '⚽'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-700 mb-1 truncate">{section.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {groupIds.map((id) => (
                    <span
                      key={id}
                      className={`${v.chip} text-[11px] font-bold px-2 py-0.5 rounded-md border tabular-nums`}
                      title={STICKER_MAP[id]?.name}
                    >
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
