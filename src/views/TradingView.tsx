import { useState } from 'react';
import type { AlbumState } from '../types';
import { STICKER_MAP } from '../data/album2026';
import { encodeTradeCode, calculateTrade } from '../utils/trading';

interface Props {
  state: AlbumState;
}

export function TradingView({ state }: Props) {
  const [theirCode, setTheirCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [tradeError, setTradeError] = useState('');

  const myCode = encodeTradeCode(state);

  function copyCode() {
    navigator.clipboard.writeText(myCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const trade = theirCode.trim() ? calculateTrade(state, theirCode) : null;
  const parseError =
    theirCode.trim() && !trade ? 'Código inválido. Verifique e tente novamente.' : '';

  function handleTheirCode(val: string) {
    setTheirCode(val);
    setTradeError('');
  }

  const duplicatesCount = Object.values(state).filter(
    (s) => s.status === 'repeated',
  ).length;

  const missingCount = Object.keys(STICKER_MAP).length - Object.values(state).filter(s => s.status !== 'missing').length;

  return (
    <div className="pb-20 px-4 py-4 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{duplicatesCount}</p>
          <p className="text-xs text-amber-600">figurinhas repetidas</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{missingCount}</p>
          <p className="text-xs text-red-600">figurinhas que faltam</p>
        </div>
      </div>

      {/* My code */}
      <div className="bg-copa-green/5 border border-copa-green/30 rounded-xl p-4">
        <h2 className="font-bold text-copa-green mb-1">Meu código de troca</h2>
        <p className="text-xs text-gray-500 mb-3">
          Compartilhe este código com quem você quer trocar
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-3 font-mono text-xs break-all text-gray-700 max-h-24 overflow-y-auto mb-3">
          {myCode}
        </div>
        <button
          onClick={copyCode}
          className="w-full py-2.5 bg-copa-green text-white rounded-lg font-semibold text-sm active:bg-green-800 transition-colors"
        >
          {copied ? '✓ Copiado!' : 'Copiar código'}
        </button>
      </div>

      {/* Their code */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h2 className="font-bold text-blue-800 mb-1">Código do amigo</h2>
        <p className="text-xs text-gray-500 mb-3">
          Cole aqui o código de quem você quer trocar
        </p>
        <textarea
          value={theirCode}
          onChange={(e) => handleTheirCode(e.target.value)}
          placeholder="Cole o código aqui..."
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono resize-none focus:outline-none focus:border-blue-400"
        />
        {parseError && (
          <p className="text-red-500 text-xs mt-1">{parseError}</p>
        )}
        {tradeError && (
          <p className="text-red-500 text-xs mt-1">{tradeError}</p>
        )}
      </div>

      {/* Trade result */}
      {trade && (
        <div className="space-y-4">
          {trade.give.length === 0 && trade.receive.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-3xl mb-2">😕</p>
              <p className="font-semibold text-gray-700">Nenhuma troca possível</p>
              <p className="text-xs text-gray-500 mt-1">
                Vocês não têm o que o outro precisa no momento
              </p>
            </div>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-green-800 mb-2">
                  Você dá ({trade.give.length} figurinhas)
                </h3>
                {trade.give.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhuma para dar</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {trade.give.map((id) => {
                      const info = STICKER_MAP[id];
                      return (
                        <span
                          key={id}
                          className="bg-white border border-green-300 rounded px-2 py-0.5 text-xs"
                          title={`${info?.section.name} - ${info?.name}`}
                        >
                          #{id} {info?.section.flag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-800 mb-2">
                  Você recebe ({trade.receive.length} figurinhas)
                </h3>
                {trade.receive.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhuma para receber</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {trade.receive.map((id) => {
                      const info = STICKER_MAP[id];
                      return (
                        <span
                          key={id}
                          className="bg-white border border-blue-300 rounded px-2 py-0.5 text-xs"
                          title={`${info?.section.name} - ${info?.name}`}
                        >
                          #{id} {info?.section.flag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-copa-gold/10 border border-copa-gold/40 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-amber-900">
                  Troca: {trade.give.length} por {trade.receive.length}
                </p>
                {trade.give.length > trade.receive.length && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Você está dando mais — considere negociar
                  </p>
                )}
                {trade.receive.length > trade.give.length && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Você sai ganhando nessa troca!
                  </p>
                )}
                {trade.give.length === trade.receive.length && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Troca equilibrada!
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
