export type StickerStatus = 'missing' | 'have' | 'repeated';

export interface StickerState {
  status: StickerStatus;
  count: number;
}

export type AlbumState = Record<number, StickerState>;

export interface Sticker {
  id: number;
  name: string;
  sectionId: string;
}

export interface Section {
  id: string;
  name: string;
  flag?: string;
  group?: string;
  stickers: Sticker[];
}

export interface TradeOffer {
  give: number[];
  receive: number[];
}
