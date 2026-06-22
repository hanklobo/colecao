import {
  BallIcon,
  AlbumIcon,
  TapIcon,
  FilterIcon,
  StatsIcon,
  TradeIcon,
  CloseIcon,
} from './Icons';

interface Props {
  onClose: () => void;
  /** true on first ever visit — tweaks the copy / button label */
  firstTime?: boolean;
}

const STEPS: {
  Icon: (p: { className?: string }) => JSX.Element;
  title: string;
  text: string;
  tint: string;
}[] = [
  {
    Icon: AlbumIcon,
    title: 'Seu álbum completo',
    text: 'Todas as seleções da Copa 2026, organizadas por grupo, com as figurinhas de cada uma.',
    tint: 'bg-copa-blue/10 text-copa-blue',
  },
  {
    Icon: TapIcon,
    title: 'Marque com um toque',
    text: 'Toque numa figurinha para alternar entre faltando → tenho → repetida. Toque no × para desfazer.',
    tint: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    Icon: FilterIcon,
    title: 'Filtros e busca',
    text: 'Use o botão Filtros no canto superior direito para buscar uma seleção e filtrar por faltando ou repetidas.',
    tint: 'bg-amber-500/10 text-amber-600',
  },
  {
    Icon: StatsIcon,
    title: 'Acompanhe o progresso',
    text: 'Veja sua completude geral e por seleção na aba Progresso.',
    tint: 'bg-fuchsia-500/10 text-fuchsia-600',
  },
  {
    Icon: TradeIcon,
    title: 'Troque com amigos',
    text: 'Compartilhe seu link na aba Troca. Ao abrir o link de um amigo, o app calcula automaticamente o que vale a pena trocar.',
    tint: 'bg-rose-500/10 text-rose-600',
  },
];

export function LandingPage({ onClose, firstTime }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4 animate-bounce-in">
      <div className="bg-gray-50 w-full max-w-lg sm:rounded-3xl overflow-hidden flex flex-col max-h-full shadow-card-lg">

        {/* Hero */}
        <div
          className="relative px-6 pt-7 pb-6 text-white flex-shrink-0"
          style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
          <div className="bg-copa-gold rounded-2xl w-12 h-12 flex items-center justify-center text-copa-navy shadow-card mb-3">
            <BallIcon className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl leading-tight tracking-tight">
            {firstTime ? 'Bem-vindo à Coleção Copa 2026!' : 'Como o app funciona'}
          </h1>
          <p className="text-white/70 text-sm font-medium mt-1.5">
            Organize suas figurinhas, acompanhe o progresso e troque com os amigos — tudo num só lugar.
          </p>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {STEPS.map(({ Icon, title, text, tint }) => (
            <div key={title} className="flex gap-3.5 bg-white rounded-2xl p-4 shadow-card">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight">{title}</p>
                <p className="text-gray-500 text-xs leading-snug mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5 pb-5 pt-2 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-copa-blue text-white font-bold text-sm shadow-card hover:brightness-110 active:scale-95 transition-all"
          >
            {firstTime ? 'Começar a colecionar' : 'Entendi!'}
          </button>
        </div>
      </div>
    </div>
  );
}
