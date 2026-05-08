import { useState, useEffect, useRef } from 'react';
import { C, LANGUAGES } from './design';
import { Btn, Inp, Sel } from './primitives';
import { useChatBus, emitChat, startAutoChat, CHAT_INIT, translate } from './state';
import { useApp } from './context';

export default function UniversalChat({ height=400, pkSide=null as string|null, compact=false }) {
  const messages = useChatBus();
  const [input, setInput] = useState('');
  const [myLang, setMyLang] = useState('en');
  const [showLangs, setShowLangs] = useState(false);
  const [filterLang, setFilterLang] = useState('all');
  const [translateAll, setTranslateAll] = useState(true);
  const [tipTarget, setTipTarget] = useState<string|null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const app = useApp();

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);
  useEffect(() => { if (messages.length === 0) CHAT_INIT.forEach(m => emitChat(m)); }, []);
  useEffect(() => startAutoChat(pkSide), [pkSide]);

  const send = () => {
    if (!input.trim()) return;
    emitChat({ id:Date.now(), user:app?.username||'You', lang:myLang, content:input,
      ts:new Date().toLocaleTimeString().slice(0,5), role:'viewer', color:C.gold, pkSide, isSelf:true });
    setInput('');
  };

  const myLangObj = LANGUAGES.find(l => l.code === myLang);
  const filtered = filterLang === 'all' ? messages : messages.filter(m => m.lang === filterLang);

  return (
    <div style={{ display:'flex', flexDirection:'column', height, background:C.bg1, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:compact?'8px 12px':'10px 14px', borderBottom:`1px solid ${C.border}`, background:C.bg2, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <span style={{ fontSize:11, fontFamily:"'IBM Plex Mono'", color:C.ghost, flex:1 }}>
          🌍 CHAT <span style={{ color:C.gold }}>{messages.length}</span>
        </span>
        <button onClick={() => setTranslateAll(t => !t)} style={{ background:translateAll?`${C.sky}22`:'transparent', border:`1px solid ${translateAll?C.sky:C.border}`, color:translateAll?C.sky:C.ghost, borderRadius:5, padding:'2px 8px', fontSize:9, cursor:'pointer', fontFamily:"'IBM Plex Mono'", fontWeight:700 }}>
          🌐 {translateAll?'AUTO-TRANSLATE ON':'OFF'}
        </button>
        <Sel value={filterLang} onChange={e => setFilterLang(e.target.value)}
          options={[{v:'all',l:'All'}, ...LANGUAGES.map(l => ({v:l.code,l:`${l.flag} ${l.name}`}))]}
          style={{ padding:'3px 8px', fontSize:10, width:120 }} />
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:compact?'8px 10px':'10px 14px' }}>
        {filtered.map((m, i) => {
          const sideColor = m.pkSide==='A'?C.gold:m.pkSide==='B'?C.sky:null;
          const lang = LANGUAGES.find(l => l.code === m.lang);
          return (
            <div key={String(m.id)+i} className="sw-chat-msg" onClick={() => setTipTarget(m.user)} style={{
              padding:'5px 8px', borderRadius:6, marginBottom:3, cursor:'pointer',
              borderLeft:sideColor?`3px solid ${sideColor}`:m.role==='host'?`3px solid ${C.gold}`:'3px solid transparent',
              background:m.isSelf?`${C.gold}10`:'transparent', transition:'all .15s',
              animation: i > messages.length-4?'fadeIn .3s ease':undefined,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                {lang && <span style={{ fontSize:10 }}>{lang.flag}</span>}
                <span style={{ fontSize:11, fontWeight:700, color:m.color||C.ghost }}>{m.user}</span>
                {m.role==='host' && <span style={{ fontSize:7, background:`${C.gold}22`, color:C.gold, borderRadius:4, padding:'1px 5px', fontWeight:700 }}>HOST</span>}
                <span style={{ fontFamily:"'IBM Plex Mono'", fontSize:8, color:C.dim, marginLeft:'auto' }}>{m.ts}</span>
              </div>
              <span style={{ fontSize:12, color:C.snow, lineHeight:1.4 }}>
                {translateAll ? translate(m.content, myLang, m.lang) : m.content}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tip quick bar */}
      {tipTarget && (
        <div style={{ padding:'8px 14px', background:`${C.amber}12`, borderTop:`1px solid ${C.amber}44`, display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:11, color:C.ghost }}>Tip <b style={{ color:C.amber }}>{tipTarget}</b></span>
          {[1,5,10,25].map(a => (
            <button key={a} onClick={() => { app?.addTip?.(a*100, tipTarget); setTipTarget(null); }}
              style={{ background:C.amber, border:'none', color:C.bg0, borderRadius:5, padding:'3px 9px', fontSize:11, fontWeight:700, cursor:'pointer' }}>${a}</button>
          ))}
          <button onClick={() => setTipTarget(null)} style={{ background:'transparent', border:'none', color:C.ghost, cursor:'pointer', marginLeft:'auto', fontSize:14 }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding:compact?'8px 10px':'10px 14px', borderTop:`1px solid ${C.border}`, background:C.bg2, flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, marginBottom:6 }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <button onClick={() => setShowLangs(s => !s)} style={{ background:C.bg3, border:`1px solid ${C.border}`, color:C.snow, borderRadius:7, padding:'7px 10px', cursor:'pointer', fontSize:13 }}>
              {myLangObj?.flag} <span style={{ fontSize:9, color:C.ghost }}>{myLang.toUpperCase()}</span>
            </button>
            {showLangs && (
              <div style={{ position:'absolute', bottom:'100%', left:0, background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, padding:8, zIndex:50, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, minWidth:260, marginBottom:4, boxShadow:'0 8px 32px rgba(0,0,0,.5)' }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setMyLang(l.code); setShowLangs(false); }} style={{
                    background:myLang===l.code?C.goldSoft:'transparent', border:`1px solid ${myLang===l.code?C.goldDim:C.border}`,
                    borderRadius:6, padding:'5px 8px', cursor:'pointer', fontSize:11, color:myLang===l.code?C.gold:C.ghost,
                    display:'flex', alignItems:'center', gap:5, transition:'all .15s'
                  }}><span>{l.flag}</span><span style={{ fontSize:10 }}>{l.name}</span></button>
                ))}
              </div>
            )}
          </div>
          <Inp value={input} onChange={e => setInput(e.target.value)} placeholder={`Chat in ${myLangObj?.name}…`} onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()} style={{ borderRadius:7 }} />
          <Btn onClick={send} disabled={!input.trim()} size="sm" style={{ flexShrink:0 }}>SEND</Btn>
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {["🔥 HYPE!","👑 KING!","🎲 LET'S GO!","💯 GG WP","⚡ CLUTCH"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ background:C.bg3, border:`1px solid ${C.border}`, color:C.ghost, borderRadius:5, padding:'2px 8px', fontSize:9, cursor:'pointer', fontFamily:"'IBM Plex Mono'" }}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

