import { useState } from 'react';
import type { AlbumState } from '../types';
import { STICKER_MAP, TOTAL_STICKERS } from '../data/album2026';
import { encodeTradeCode, calculateTrade } from '../utils/trading';

interface Props {
  state: AlbumState;
}

export function TradingView({ state }: Props) {
  const [theirCode, setTheirCode] = useState('');
  const [copied, setCopied] = useState(false);

  const myCode = encodeTradeCode(state);

  function copyCode() {
    navigator.clipboard.writeText(myCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const trade = theirCode.trim() ? calculateTrade(state, theirCode) : null;
  const parseError = theirCode.trim() && !trade;

  const duplicatesCount = Object.values(state).filter((s) => s.status === 'repeated').length;
  const missingCount = TOTAL_STICKERS - Object.values(state).filter((s) => s.status !== 'missing').length;

  return (
    <div className="pb-24 bg-gray-50 min-h-full">
      {/* Header banner */}
      <div className="bg-gray-900 px-5 py-5">
        <h1 className="text-white font-black text-xl mb-1">Trocar figurinhas</h1>
        <p className="text-white/50 text-xs">Compartilhe seu código com um amigo e veja exatamente o que trocar</p>
        <div className="flex gap-4 mt-3">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-copa-gold font-bold text-lg">{duplicatesCount}</p>
            <p className="text-white/50 text-[10px]">repetidas</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-red-400 font-bold text-lg">{missingCount}</p>
            <p className="text-white/50 text-[10px]">faltam</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Step 1 — My code */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">1</span>
              <p className="font-bold text-emerald-800 text-sm">Meu código</p>
            </div>
            <p className="text-emerald-700/70 text-xs mt-0.5">Copie e mande para quem quer trocar</p>
          </div>
          <div className="p-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-[10px] text-gray-600 break-all max-h-20 overflow-y-auto mb-3">
              {myCode}
            </div>
            <button
              onClick={copyCode}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar código'}
            </button>
          </div>
        </div>

        {/* Step 2 — Their code */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">2</span>
              <p className="font-bold text-blue-800 text-sm">Código do amigo</p>
            </div>
            <p className="text-blue-700/70 text-xs mt-0.5">Cole o código que ele te mandou</p>
          </div>
          <div className="p-4">
            <textarea
              value={theirCode}
              onChange={(e) => setTheirCode(e.target.value)}
              placeholder="Cole o código aqui..."
              className={`w-full h-24 px-3 py-2.5 border rounded-xl text-[10px] font-mono resize-none focus:outline-none transition-colors ${
                parseError
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-gray-50 focus:border-gray-400'
              }`}
            />
            {parseError && (
              <p className="text-red-500 text-xs mt-1">⚠ Código inválido. Verifique e tente novamente.</p>
            )}
          </div>
        </div>

        {/* Step 3 — Trade result */}
        {trade && (
          <div className="space-y-3">
            {trade.give.length === 0 && trade.receive.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-4xl mb-2">😕</p>
                <p className="font-bold text-gray-700">Nenhuma troca possível</p>
                <p className="text-xs text-gray-400 mt-1">Vocês não têm o que o outro precisa agora</p>
              </div>
            ) : (
              <>
                {/* Summary banner */}
                <div className="bg-gray-900 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-emerald-400 font-black text-2xl">{trade.give.length}</p>
                    <p className="text-white/50 text-[10px]">você dá</p>
                  </div>
                  <span className="text-white/30 text-2xl">⇄</span>
                  <div className="text-center">
                    <p className="text-blue-400 font-black text-2xl">{trade.receive.length}</p>
                    <p className="text-white/50 text-[10px]">você recebe</p>
                  </div>
                </div>

                {trade.give.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                      <p className="font-bold text-emerald-800 text-sm">
                        Você dá ({trade.give.length})
                      </p>
                    </div>
                    <div className="p-4 flex flex-wrap gap-1.5">
                      {trade.give.map((id) => {
                        const info = STICKER_MAP[id];
                        return (
                          <span
                            key={id}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            title={`${info?.section.name} – ${info?.name}`}
                          >
                            #{id} {info?.section.flag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {trade.receive.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                      <p className="font-bold text-blue-800 text-sm">
                        Você recebe ({trade.receive.length})
                      </p>
                    </div>
                    <div className="p-4 flex flex-wrap gap-1.5">
                      {trade.receive.map((id) => {
                        const info = STICKER_MAP[id];
                        return (
                          <span
                            key={id}
                            className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            title={`${info?.section.name} – ${info?.name}`}
                          >
                            #{id} {info?.section.flag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Balance indicator */}
                <div className="bg-white rounded-2xl shadow-sm px-4 py-3 text-center">
                  {trade.give.length === trade.receive.length ? (
                    <p className="text-emerald-700 font-semibold text-sm">✓ Troca equilibrada!</p>
                  ) : trade.give.length > trade.receive.length ? (
                    <p className="text-amber-600 font-semibold text-sm">
                      ⚠ Você dá {trade.give.length - trade.receive.length} a mais — considere negociar
                    </p>
                  ) : (
                    <p className="text-emerald-700 font-semibold text-sm">
                      🎉 Você sai ganhando {trade.receive.length - trade.give.length} figurinhas!
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
