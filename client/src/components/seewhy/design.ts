export const C = {
  bg0:"#08070A", bg1:"#0F0D14", bg2:"#17151F", bg3:"#211E2E",
  border:"#2E2940", borderHi:"#4A4468",
  gold:"#D4AF37", goldDim:"#9A7E28", goldGlow:"rgba(212,175,55,0.18)", goldSoft:"rgba(212,175,55,0.08)",
  burgundy:"#800020", burgundyLo:"rgba(128,0,32,0.25)",
  emerald:"#0ECF7C", crimson:"#F03E3E", sky:"#38C4F5",
  violet:"#8B5CF6", amber:"#F59E0B", rose:"#F472B6", lime:"#84CC16", cyan:"#06B6D4",
  snow:"#EEE8FF", ghost:"#9591AA", dim:"#5C5875", muted:"#3A3650",
};

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@300;400;500;600&family=Orbitron:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.5)}70%{box-shadow:0 0 0 10px rgba(212,175,55,0)}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes glow{0%,100%{text-shadow:0 0 16px #D4AF37}50%{text-shadow:0 0 32px #F03E3E}}
@keyframes coin{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-60px) scale(1.5);opacity:0}}
@keyframes speak{0%,100%{box-shadow:0 0 0 2px #0ECF7C}50%{box-shadow:0 0 0 6px #0ECF7C,0 0 16px #0ECF7C}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.sw-nav:hover{color:#D4AF37!important;background:rgba(212,175,55,0.08)!important}
.sw-chat-msg:hover{background:#211E2E!important}
.sw-guest-tile:hover .sw-guest-actions{opacity:1!important}
.sw-dest-row:hover{background:#211E2E!important}
.sw-tier-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(212,175,55,.2)!important}
`;

export const REV_DATA = [
  { d:"Apr12", gross:240,  creator:216, platform:24 },
  { d:"Apr13", gross:380,  creator:342, platform:38 },
  { d:"Apr14", gross:290,  creator:261, platform:29 },
  { d:"Apr15", gross:510,  creator:459, platform:51 },
  { d:"Apr16", gross:680,  creator:612, platform:68 },
  { d:"Apr17", gross:920,  creator:828, platform:92 },
  { d:"Apr18", gross:1140, creator:1026,platform:114 },
];

export const LANGUAGES = [
  { code:"en", flag:"🇺🇸", name:"English" },
  { code:"es", flag:"🇪🇸", name:"Español" },
  { code:"fr", flag:"🇫🇷", name:"Français" },
  { code:"pt", flag:"🇧🇷", name:"Português" },
  { code:"de", flag:"🇩🇪", name:"Deutsch" },
  { code:"ja", flag:"🇯🇵", name:"日本語" },
  { code:"ko", flag:"🇰🇷", name:"한국어" },
  { code:"zh", flag:"🇨🇳", name:"中文" },
  { code:"ar", flag:"🇸🇦", name:"العربية" },
  { code:"hi", flag:"🇮🇳", name:"हिन्दी" },
  { code:"ru", flag:"🇷🇺", name:"Русский" },
  { code:"sw", flag:"🇰🇪", name:"Kiswahili" },
];

export const PAGES = [
  { id:"watchparty",   icon:"🎞", label:"WATCH PARTY" },
  { id:"panel",        icon:"📡", label:"LIVE PANEL" },
  { id:"pkbattle",     icon:"⚔️", label:"PK BATTLE" },
  { id:"embed",        icon:"▶",  label:"EMBED + PAYWALL" },
  { id:"monetize",     icon:"💎", label:"MONETIZE" },
  { id:"destinations", icon:"🔀", label:"DESTINATIONS" },
  { id:"analytics",    icon:"📊", label:"ANALYTICS" },
];

export const TICKER = "🔴 Washington Classic 2026 · Jamar's Sports Bar · $1,000 Prize Pool | ⚡ 90/10 Creator Split | 🎲 Cali Bones × VibeN'Bones LIVE | 🛡 Guardian AI moderation ACTIVE | 🌍 Multilingual chat — 12 languages | ⚔️ PK BATTLE: SwanyThree vs CaliBones_23 | 💰 $2,340 tipped tonight";

export const USER_COLORS = [C.gold,C.emerald,C.sky,C.violet,C.rose,C.amber,C.cyan,C.lime,C.crimson,C.ghost];
const _map: Record<string,string> = {};
let _idx = 0;
export function getUserColor(u: string) {
  if (!_map[u]) _map[u] = USER_COLORS[_idx++ % USER_COLORS.length];
  return _map[u];
}
