import { useState, useEffect } from 'react';
import { getUserColor, LANGUAGES } from './design';

// ── Chat bus ──────────────────────────────────────────────────────────────────
export interface ChatMsg {
  id: number|string; user:string; lang:string; content:string;
  ts:string; role:'host'|'guest'|'viewer'; color?:string;
  pkSide?:string|null; isSelf?:boolean;
}

let _chatBus: ChatMsg[] = [];
const _chatSubs = new Set<(m: ChatMsg[]) => void>();

export function emitChat(msg: ChatMsg) {
  _chatBus = [..._chatBus.slice(-199), msg];
  _chatSubs.forEach(f => f([..._chatBus]));
}

export function useChatBus() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([..._chatBus]);
  useEffect(() => { _chatSubs.add(setMsgs); return () => { _chatSubs.delete(setMsgs); }; }, []);
  return msgs;
}

// ── Viewer count bus ──────────────────────────────────────────────────────────
let _viewerCount = 347;
const _viewerSubs = new Set<(n: number) => void>();

export function setViewers(n: number) { _viewerCount = n; _viewerSubs.forEach(f => f(n)); }

export function useViewers() {
  const [v, setV] = useState(_viewerCount);
  useEffect(() => { _viewerSubs.add(setV); return () => { _viewerSubs.delete(setV); }; }, []);
  return v;
}

// ── Seed initial chat messages ────────────────────────────────────────────────
export const CHAT_INIT: ChatMsg[] = [
  { id:1, user:'SwanyThree',   lang:'en', content:'Welcome to Washington Classic 2026! 🎲', ts:'12:04', role:'host' },
  { id:2, user:'CaliBones_23', lang:'en', content:"Let's gooo 🔥",                          ts:'12:04', role:'guest' },
  { id:3, user:'DominoQueen',  lang:'es', content:'¡Esto está increíble! 🔥',               ts:'12:05', role:'viewer' },
  { id:4, user:'TileKing_M',   lang:'en', content:'DOMINO KING 👑',                          ts:'12:05', role:'viewer' },
  { id:5, user:'VibeCheck',    lang:'pt', content:'Que jogo incrível!',                      ts:'12:06', role:'viewer' },
  { id:6, user:'Nakamura_J',   lang:'ja', content:'すごい試合！応援してます！',                ts:'12:07', role:'viewer' },
];

// ── Auto-incoming messages ────────────────────────────────────────────────────
const AUTO_USERS = ['DominoKing','QuickHand_A','PacificDom','NightBones','FreshSet_R','BlockMaster'];
const AUTO_MSGS  = ["That move was CLUTCH 🎯","Let's GO!!!","DOMINO KING 👑","GREAT PLAY!","GG WP 🙌","W creator 💯","HYPE 🔥🔥","SwanyThree running the board"];
const AUTO_LANGS = ['en','en','en','en','es','fr','pt'];

export function startAutoChat(pkSide: string|null = null): () => void {
  const iv = setInterval(() => {
    const user = AUTO_USERS[Math.floor(Math.random() * AUTO_USERS.length)];
    const lang = AUTO_LANGS[Math.floor(Math.random() * AUTO_LANGS.length)];
    emitChat({
      id: Date.now() + Math.random(),
      user, lang,
      content: AUTO_MSGS[Math.floor(Math.random() * AUTO_MSGS.length)],
      ts: new Date().toLocaleTimeString().slice(0,5),
      role: 'viewer',
      color: getUserColor(user),
      pkSide: pkSide ? (Math.random() > 0.5 ? 'A' : 'B') : null,
    });
  }, 2800);
  return () => clearInterval(iv);
}

// ── Language helpers ──────────────────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<string, string>> = {
  "Let's gooo 🔥":  { es:"¡Vámonos! 🔥", fr:"Allons-y! 🔥", ja:"行くぞ！🔥" },
  "DOMINO KING 👑": { es:"REY DEL DOMINÓ 👑", fr:"ROI DU DOMINO 👑", ja:"ドミノキング 👑" },
  "GREAT PLAY!":    { es:"¡GRAN JUGADA!", fr:"BEAU JEU!", ja:"すごいプレイ！" },
};

export function translate(content: string, targetLang: string, sourceLang: string): string {
  if (sourceLang === targetLang) return content;
  return TRANSLATIONS[content]?.[targetLang] || content;
}
