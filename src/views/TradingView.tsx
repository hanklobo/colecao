import { useState } from 'react';
import type { AlbumState } from '../types';
import type { TradePartner } from '../hooks/useTradePartners';
import { STICKER_MAP, TOTAL_STICKERS } from '../data/album2026';
import {
  encodeTradeCode,
  calculateTrade,
  getPartnerStats,
  generateShareUrl,
} from '../utils/trading';
import { decodeTradeCode } from '../utils/trading';
import { ShareIcon, CheckIcon, TradeIcon } from '../components/Icons';

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
  const myDuplicates = Object.values(state).filter((s) => s.status === 'repeated').length;
  const myMissing = TOTAL_STICKERS - myHave;

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? null;

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
    // select newly added (will be last in array after re-render)
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">

      {/* ── Share section ── */}
      <div
        className="px-5 pt-5 pb-6 shadow-card-lg"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
      >
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Meu link de troca</p>

        {/* Name */}
        {editingName ? (
          <div className="flex gap-2 mb-4">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Seu nome..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/20"
            />
            <button
              onClick={saveName}
              disabled={!nameInput.trim()}
              className="px-4 py-2 bg-copa-gold text-gray-900 rounded-xl font-bold text-sm disabled:opacity-40"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setNameInput(myName); setEditingName(true); }}
            className="flex items-center gap-2 mb-4 group"
          >
            <p className="text-white font-black text-xl">{myName}</p>
            <span className="text-white/30 text-xs group-hover:text-white/60 transition-colors">✎</span>
          </button>
        )}

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-white font-bold">{myHave}</p>
            <p className="text-white/40 text-[10px]">tenho</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-copa-gold font-bold">{myDuplicates}</p>
            <p className="text-white/40 text-[10px]">repetidas</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-red-400 font-bold">{myMissing}</p>
            <p className="text-white/40 text-[10px]">faltam</p>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={shareLink}
          disabled={!myName && !nameInput.trim()}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
            shared
              ? 'bg-emerald-500 text-white'
              : 'bg-copa-gold text-gray-900 hover:brightness-110 disabled:opacity-40'
          }`}
        >
          {shared ? (
            <><CheckIcon className="w-4 h-4" /> Link copiado!</>
          ) : (
            <><ShareIcon className="w-4 h-4" /> Compartilhar meu link de troca</>
          )}
        </button>
        {!myName && (
          <p className="text-white/40 text-[10px] text-center mt-2">
            Digite seu nome acima para gerar o link
          </p>
        )}
      </div>

      {/* ── Partners section ── */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">
            Parceiros de troca
          </p>
          <button
            onClick={() => { setShowAddForm((v) => !v); setAddError(''); }}
            className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            {showAddForm ? '✕ Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {/* Manual add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Adicionar amigo manualmente</p>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Nome do amigo..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
            />
            <textarea
              value={addCode}
              onChange={(e) => setAddCode(e.target.value)}
              placeholder="Cole o link ou código de troca aqui..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-gray-400"
            />
            {addError && <p className="text-red-500 text-xs">{addError}</p>}
            <button
              onClick={submitAddPartner}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm"
            >
              Adicionar
            </button>
          </div>
        )}

        {/* No partners yet */}
        {partners.length === 0 && !showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">📤</p>
            <p className="font-semibold text-gray-700 text-sm">Nenhum parceiro ainda</p>
            <p className="text-gray-400 text-xs mt-1">
              Compartilhe seu link acima com amigos. Quando eles clicarem, aparecerão aqui automaticamente.
            </p>
          </div>
        )}

        {/* Partner tabs + analysis */}
        {partners.length > 0 && (
          <>
            {/* Horizontal partner list */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
              {partners.map((p) => {
                const trade = calculateTrade(state, p.code);
                const tradeCount = (trade?.give.length ?? 0) + (trade?.receive.length ?? 0);
                const isActive = p.id === selectedPartnerId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span>{p.name}</span>
                    {tradeCount > 0 && (
                      <span
                        className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                          isActive
                            ? 'bg-copa-gold text-gray-900'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {tradeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected partner analysis */}
            {selectedPartner && (
              <PartnerAnalysis
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

// ── Partner analysis card ──────────────────────────────────────────────────

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

  return (
    <div className="mt-3 space-y-3">
      {/* Partner header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-800">{partner.name}</p>
            <p className="text-gray-400 text-[10px]">
              {stats
                ? `${stats.have} figurinhas · ${stats.duplicates} repetidas`
                : 'Dados indisponíveis'}
            </p>
          </div>
          {confirmRemove ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs text-gray-500 px-2 py-1"
              >
                Cancelar
              </button>
              <button
                onClick={onRemove}
                className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-lg"
              >
                Remover
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Onboarding nudge for users with no stickers */}
        {myHave === 0 && (
          <div className="px-4 py-4 bg-amber-50 border-b border-amber-100">
            <p className="text-amber-800 font-semibold text-sm">
              {partner.name} está esperando!
            </p>
            <p className="text-amber-700/70 text-xs mt-0.5">
              Cadastre suas figurinhas no álbum para ver o que vocês podem trocar.
            </p>
            <button
              onClick={onGoToAlbum}
              className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs w-full"
            >
              Ir para o Álbum →
            </button>
          </div>
        )}
      </div>

      {/* Trade result */}
      {!trade ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-gray-400 text-sm">Não foi possível calcular a troca.</p>
        </div>
      ) : trade.give.length === 0 && trade.receive.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl mb-2">😕</p>
          <p className="font-semibold text-gray-700 text-sm">Nenhuma troca possível agora</p>
          <p className="text-gray-400 text-xs mt-1">
            {myHave === 0
              ? 'Cadastre suas figurinhas para ver as trocas.'
              : `Vocês não têm o que um ao outro precisa no momento.`}
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between shadow-card"
            style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
          >
            <div className="text-center">
              <p className="text-emerald-300 font-display font-extrabold text-2xl tabular-nums">{trade.give.length}</p>
              <p className="text-white/60 text-[10px] font-medium">você dá</p>
            </div>
            <TradeIcon className="w-7 h-7 text-white/40" />
            <div className="text-center">
              <p className="text-sky-300 font-display font-extrabold text-2xl tabular-nums">{trade.receive.length}</p>
              <p className="text-white/60 text-[10px] font-medium">você recebe</p>
            </div>
          </div>

          {/* Give */}
          {trade.give.length > 0 && (
            <StickerList
              title={`Você dá para ${partner.name} (${trade.give.length})`}
              ids={trade.give}
              colorClass="bg-emerald-50 border-emerald-100"
              chipClass="bg-emerald-50 border border-emerald-200 text-emerald-800"
            />
          )}

          {/* Receive */}
          {trade.receive.length > 0 && (
            <StickerList
              title={`Você recebe de ${partner.name} (${trade.receive.length})`}
              ids={trade.receive}
              colorClass="bg-blue-50 border-blue-100"
              chipClass="bg-blue-50 border border-blue-200 text-blue-800"
            />
          )}

          {/* Balance */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 text-center">
            {trade.give.length === trade.receive.length ? (
              <p className="text-emerald-700 font-semibold text-sm">✓ Troca equilibrada!</p>
            ) : trade.give.length > trade.receive.length ? (
              <p className="text-amber-600 font-semibold text-sm">
                ⚠ Você dá {trade.give.length - trade.receive.length} a mais
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold text-sm">
                🎉 Você recebe {trade.receive.length - trade.give.length} a mais!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sticker chip list ──────────────────────────────────────────────────────

function StickerList({
  title,
  ids,
  colorClass,
  chipClass,
}: {
  title: string;
  ids: number[];
  colorClass: string;
  chipClass: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${colorClass}`}>
      <p className="px-4 py-2.5 font-bold text-gray-700 text-xs border-b border-gray-100">{title}</p>
      <div className="p-4 flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const info = STICKER_MAP[id];
          return (
            <span
              key={id}
              className={`${chipClass} text-[10px] font-semibold px-2 py-1 rounded-lg`}
              title={`${info?.section.name} – ${info?.name}`}
            >
              #{id} {info?.section.flag}
            </span>
          );
        })}
      </div>
    </div>
  );
}
