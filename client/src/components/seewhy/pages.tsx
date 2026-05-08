import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { C, REV_DATA, PAGES, TICKER } from './design';
import { Btn, Card, Badge, LiveDot, Lbl, MV, Inp, Divider } from './primitives';
import { useViewers } from './state';
import Chat from './Chat';
import { useApp } from './context';

// ═══════════════════════════════════════════════════════════════════════════════
// TOP NAV
// ═══════════════════════════════════════════════════════════════════════════════
export function TopNav({ page, setPage, isLive, setIsLive }: {
  page:string; setPage:(p:string)=>void; isLive:boolean; setIsLive:(f:(b:boolean)=>boolean)=>void;
}) {
  const viewers = useViewers();
  const tickerText = TICKER + ' | ' + TICKER;
  return (
    <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:`${C.bg0}EE`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:0, padding:'0 20px', height:52 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:24, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${C.burgundy},${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue'", fontSize:14, color:'#fff' }}>SW</div>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:'.1em', color:C.gold }}>SEEWHY LIVE</div>
        </div>
        <div style={{ display:'flex', gap:2, flex:1, overflowX:'auto' }}>
          {PAGES.map(p => (
            <button key={p.id} className="sw-nav" onClick={() => setPage(p.id)} style={{
              background:page===p.id?C.goldSoft:'transparent', border:`1px solid ${page===p.id?C.goldDim:'transparent'}`,
              color:page===p.id?C.gold:C.ghost, borderRadius:7, padding:'5px 14px', fontSize:10,
              fontFamily:"'IBM Plex Mono'", fontWeight:700, letterSpacing:'.07em', cursor:'pointer',
              transition:'all .17s', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap'
            }}><span>{p.icon}</span>{p.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginLeft:20, flexShrink:0 }}>
          <span style={{ fontSize:11, color:C.ghost }}>👁 <b style={{ color:C.snow }}>{viewers.toLocaleString()}</b></span>
          <Btn variant={isLive?'burgundy':'gold'} size="sm" onClick={() => setIsLive(l => !l)}>
            {isLive?'⏹ END':<><LiveDot size={6} />GO LIVE</>}
          </Btn>
        </div>
      </div>
      <div style={{ height:22, background:C.burgundy, overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div style={{ display:'inline-flex', gap:80, whiteSpace:'nowrap', animation:'ticker 55s linear infinite', fontSize:10, fontFamily:"'IBM Plex Mono'", color:'rgba(255,255,255,.85)' }}>
          {tickerText.split('|').map((t,i) => <span key={i}>{t.trim()}</span>)}
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WATCH PARTY
// ═══════════════════════════════════════════════════════════════════════════════
const YT_VIDEOS = [
  { id:'dQw4w9WgXcQ', title:'Washington Classic 2026 — LIVE', channel:'DOMINO Entertainment', live:true },
  { id:'9bZkp7q19f0', title:'Cali Bones × VibeN\'Bones Championship', channel:'DOMINO Entertainment', live:false },
  { id:'jNQXAC9IVRw', title:'AIverse Podcast — AI Tools 2026', channel:'AIverse', live:false },
];

export function WatchPartyPage() {
  const [activeVideo, setActiveVideo] = useState(YT_VIDEOS[0]);
  const [synced, setSynced] = useState(true);
  const [reactions, setReactions] = useState<{id:number;emoji:string;x:number}[]>([]);
  const viewers = useViewers();
  const fireReaction = (emoji: string) => {
    const r = { id:Date.now(), emoji, x:20+Math.random()*60 };
    setReactions(rs => [...rs,r]);
    setTimeout(() => setReactions(rs => rs.filter(x => x.id !== r.id)), 1800);
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, animation:'fadeUp .35s ease' }}>
      <div>
        <Card style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
          <div style={{ position:'relative', aspectRatio:'16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&modestbranding=1`}
              style={{ width:'100%', height:'100%', border:'none', position:'absolute', top:0, left:0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={activeVideo.title} />
            {reactions.map(r => <div key={r.id} style={{ position:'absolute', bottom:'15%', left:`${r.x}%`, fontSize:28, animation:'coin 1.8s ease-out forwards', pointerEvents:'none', zIndex:10 }}>{r.emoji}</div>)}
            {activeVideo.live && <div style={{ position:'absolute', top:12, left:12, background:C.crimson, borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><LiveDot size={6}/>LIVE</div>}
          </div>
          <div style={{ padding:'12px 16px', background:C.bg1, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{activeVideo.title}</div>
              <div style={{ fontSize:11, color:C.ghost }}>{activeVideo.channel} · 👁 {viewers.toLocaleString()}</div>
            </div>
            <button onClick={() => setSynced(s => !s)} style={{ background:synced?`${C.emerald}22`:'transparent', border:`1px solid ${synced?C.emerald:C.border}`, color:synced?C.emerald:C.ghost, borderRadius:7, padding:'5px 12px', fontSize:10, cursor:'pointer', fontWeight:700 }}>🔗 {synced?'SYNCED':'SYNC'}</button>
            {["🔥","👑","😂","❤️","🎲","⚡"].map(e => <button key={e} onClick={() => fireReaction(e)} style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 7px', cursor:'pointer', fontSize:15 }}>{e}</button>)}
          </div>
        </Card>
        <Card style={{ padding:14 }}>
          <Lbl>QUEUE</Lbl>
          {YT_VIDEOS.map(v => (
            <div key={v.id} onClick={() => setActiveVideo(v)} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 11px', borderRadius:9, border:`1px solid ${activeVideo.id===v.id?C.gold:C.border}`, background:activeVideo.id===v.id?C.goldSoft:'transparent', cursor:'pointer', marginBottom:6, transition:'all .18s' }}>
              <div style={{ width:60, aspectRatio:'16/9', background:C.bg3, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{v.live?'🔴':'▶'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                <div style={{ fontSize:10, color:C.ghost }}>{v.channel}</div>
              </div>
              {v.live && <Badge color={C.crimson}><LiveDot size={5}/>LIVE</Badge>}
              {activeVideo.id===v.id && <Badge color={C.gold}>NOW</Badge>}
            </div>
          ))}
        </Card>
      </div>
      <div style={{ position:'sticky', top:90 }}><Chat height={620} /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20-PERSON PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const GUEST_COLORS_P = [C.gold,C.emerald,C.sky,C.violet,C.rose,C.amber,C.cyan,C.lime,C.crimson,C.ghost];
const INIT_GUESTS = [
  { id:1, name:'SwanyThree',   role:'HOST',  muted:false, cam:true,  speaking:true,  bitrate:850, latency:42 },
  { id:2, name:'CaliBones_23', role:'GUEST', muted:false, cam:true,  speaking:true,  bitrate:620, latency:68 },
  { id:3, name:'DominoKing',   role:'GUEST', muted:true,  cam:true,  speaking:false, bitrate:410, latency:112 },
  { id:4, name:'WestCoast_K',  role:'GUEST', muted:false, cam:true,  speaking:false, bitrate:540, latency:89 },
  { id:5, name:'VibeCheck_T',  role:'GUEST', muted:false, cam:false, speaking:false, bitrate:0,   latency:0 },
  { id:6, name:'SixSuit_J',    role:'GUEST', muted:true,  cam:true,  speaking:false, bitrate:380, latency:145 },
];

export function PanelPage({ isLive }: { isLive:boolean }) {
  const [guests, setGuests] = useState(INIT_GUESTS);
  const [layout, setLayout] = useState<'grid'|'spotlight'>('grid');
  const [spotlight, setSpotlight] = useState(1);
  const [guestName, setGuestName] = useState('');
  const viewers = useViewers();

  useEffect(() => {
    const iv = setInterval(() => {
      setGuests(gs => gs.map(g => ({ ...g, speaking:g.cam&&!g.muted&&Math.random()>0.75, bitrate:g.cam?Math.floor(350+Math.random()*550):0, latency:g.cam?Math.floor(30+Math.random()*140):0 })));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const toggle = (id: number, field: 'muted'|'cam') => setGuests(gs => gs.map(g => g.id===id?{...g,[field]:!g[field]}:g));
  const kick = (id: number) => setGuests(gs => gs.filter(g => g.id!==id));
  const addGuest = () => { if (!guestName.trim()||guests.length>=20) return; setGuests(gs => [...gs,{id:Date.now(),name:guestName,role:'GUEST',muted:false,cam:true,speaking:false,bitrate:450,latency:80}]); setGuestName(''); };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, animation:'fadeUp .35s ease' }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:'.08em', color:C.gold }}>📡 LIVE PANEL STAGE</div>
            <div style={{ fontSize:10, color:C.ghost, fontFamily:"'IBM Plex Mono'" }}>MediaSoup SFU · {guests.length}/20 guests · WebRTC</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:12, color:C.ghost }}>👁 <b style={{ color:C.snow }}>{viewers.toLocaleString()}</b></span>
            {(['grid','spotlight'] as const).map(l => <Btn key={l} size="sm" variant={layout===l?'gold':'ghost'} onClick={() => setLayout(l)}>{l.toUpperCase()}</Btn>)}
            {isLive && <Badge color={C.crimson}><LiveDot size={6}/>ON AIR</Badge>}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:layout==='grid'?'repeat(4,1fr)':layout==='spotlight'?'1fr':'repeat(4,1fr)', gap:8 }}>
          {(layout==='spotlight' ? guests.slice(0,1) : guests).map(g => {
            const col = GUEST_COLORS_P[g.id % GUEST_COLORS_P.length];
            return (
              <div key={g.id} className="sw-guest-tile" onClick={() => setSpotlight(g.id)} style={{ position:'relative', background:g.cam?`${col}12`:C.bg2, border:`2px solid ${g.speaking?C.emerald:spotlight===g.id?C.gold:C.border}`, borderRadius:10, overflow:'hidden', aspectRatio:'16/9', animation:g.speaking?'speak 1.5s ease infinite':undefined, cursor:'pointer' }}>
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {g.cam ? <div style={{ width:44, height:44, borderRadius:'50%', background:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:C.bg0 }}>{g.name[0]}</div>
                    : <div style={{ textAlign:'center' }}><div style={{ fontSize:20, opacity:0.3 }}>📷</div></div>}
                </div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,.8))', padding:'12px 9px 7px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:col, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{g.name}</span>
                    <Badge color={g.role==='HOST'?C.gold:C.ghost} style={{ fontSize:7, padding:'1px 5px' }}>{g.role}</Badge>
                  </div>
                  {g.cam && <div style={{ fontFamily:"'IBM Plex Mono'", fontSize:8, color:C.dim }}>{g.bitrate}kb/s · {g.latency}ms</div>}
                </div>
                <div className="sw-guest-actions" style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center', gap:5, opacity:0, transition:'opacity .18s' }}>
                  <button onClick={e => { e.stopPropagation(); toggle(g.id,'muted'); }} style={{ background:g.muted?`${C.crimson}33`:C.bg3, border:`1px solid ${g.muted?C.crimson:C.border}`, color:g.muted?C.crimson:C.ghost, borderRadius:6, padding:'4px 9px', cursor:'pointer', fontSize:12 }}>{g.muted?'🔇':'🎙'}</button>
                  <button onClick={e => { e.stopPropagation(); kick(g.id); }} style={{ background:`${C.crimson}22`, border:`1px solid ${C.crimson}44`, color:C.crimson, borderRadius:6, padding:'4px 9px', cursor:'pointer', fontSize:12 }}>✕</button>
                </div>
              </div>
            );
          })}
          {layout==='spotlight' && guests.slice(1).map(g => {
            const col = GUEST_COLORS_P[g.id % GUEST_COLORS_P.length];
            return <div key={g.id} onClick={() => setSpotlight(g.id)} style={{ background:`${col}12`, border:`1px solid ${col}33`, borderRadius:8, aspectRatio:'4/3', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><div style={{ fontSize:10, fontWeight:700, color:col }}>{g.name[0]}</div></div>;
          })}
          {Array(Math.max(0,4-guests.length)).fill(null).map((_,i) => <div key={`e${i}`} style={{ aspectRatio:'16/9', background:C.bg2, border:`1px dashed ${C.border}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:24 }}>+</div>)}
        </div>
        <Card style={{ marginTop:14, padding:13 }}>
          <Lbl>GUEST INVITE</Lbl>
          <div style={{ background:C.bg3, borderRadius:8, padding:'8px 12px', fontFamily:"'IBM Plex Mono'", fontSize:11, color:C.gold }}>https://seewhy.live/join/sw-live-001</div>
        </Card>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Card>
          <Lbl>STAGE MANAGER</Lbl>
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            <Inp value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Guest name" style={{ fontSize:11 }} />
            <Btn size="sm" onClick={addGuest} disabled={guests.length>=20}>+ ADD</Btn>
          </div>
          <Divider style={{ marginBottom:10 }} />
          {guests.map(g => (
            <div key={g.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:GUEST_COLORS_P[g.id%GUEST_COLORS_P.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.bg0, flexShrink:0 }}>{g.name[0]}</div>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:11, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</div><div style={{ fontSize:9, color:C.dim }}>{g.role} · {g.latency}ms</div></div>
              <button onClick={() => toggle(g.id,'muted')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, opacity:g.muted?1:0.4 }}>🔇</button>
              <button onClick={() => kick(g.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:C.crimson, opacity:0.6 }}>✕</button>
            </div>
          ))}
          <div style={{ marginTop:8, fontSize:10, color:C.dim, textAlign:'center' }}>{guests.length}/20 · {20-guests.length} slots open</div>
        </Card>
        <Chat height={320} compact />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PK BATTLE
// ═══════════════════════════════════════════════════════════════════════════════
const PK_INIT = [
  { id:'pk1', challenger:'SwanyThree', challenged:'CaliBones_23', game:'Domino 6×6', prize:250, status:'LIVE',    pct:[64,36], duration:'14:22' },
  { id:'pk2', challenger:'DominoKing', challenged:'WestCoast_K',  game:'Domino 9×9', prize:100, status:'PENDING', pct:[50,50], duration:'—' },
  { id:'pk3', challenger:'VibeCheck',  challenged:'SixSuit_J',    game:'Domino 6×6', prize:50,  status:'ENDED',   pct:[44,56], duration:'28:15' },
];

export function PKBattlePage() {
  const [battles, setBattles] = useState(PK_INIT);
  const [activePK, setActivePK] = useState('pk1');
  const [pctA, setPctA] = useState(64);
  const [tipTarget, setTipTarget] = useState<string|null>(null);
  const [tipAmt, setTipAmt] = useState(5);
  const [coins, setCoins] = useState<{id:number;target:string}[]>([]);
  const app = useApp();
  const cur = battles.find(b => b.id === activePK);
  const SC: Record<string,string> = { LIVE:C.crimson, PENDING:C.amber, ENDED:C.dim };

  useEffect(() => { const iv = setInterval(() => setPctA(p => Math.min(99,Math.max(1,p+Math.floor(Math.random()*7-3)))), 2600); return () => clearInterval(iv); }, []);

  const sendTip = (target: string, amount: number) => {
    app?.addTip?.(amount, target);
    const id = Date.now();
    setCoins(cs => [...cs,{id,target}]);
    setTimeout(() => setCoins(cs => cs.filter(c => c.id!==id)), 1600);
    setTipTarget(null);
  };

  return (
    <div style={{ animation:'fadeUp .35s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:'.08em', color:C.gold }}>⚔️ PK BATTLE ARENA</div>
          <div style={{ fontSize:10, color:C.ghost, fontFamily:"'IBM Plex Mono'" }}>Live 1v1 · Viewer Tipping · Real-time Win%</div>
        </div>
        <Btn size="sm" style={{ marginLeft:'auto' }} onClick={() => setBattles(b => [...b,{id:'pk'+Date.now(),challenger:'New',challenged:'Opponent',game:'Domino 6×6',prize:0,status:'PENDING',pct:[50,50],duration:'—'}])}>+ NEW PK</Btn>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 300px', gap:16 }}>
        {/* Battle list */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {battles.map(b => (
            <div key={b.id} onClick={() => setActivePK(b.id)} style={{ background:activePK===b.id?`${C.gold}08`:C.bg2, border:`1px solid ${activePK===b.id?C.gold:C.border}`, borderRadius:12, padding:14, cursor:'pointer', transition:'all .2s' }}>
              <div style={{ display:'flex', gap:6, marginBottom:8 }}><Badge color={SC[b.status]}>{b.status==='LIVE'&&<LiveDot size={5}/>}{b.status}</Badge><span style={{ fontFamily:"'IBM Plex Mono'", fontSize:9, color:C.dim, marginLeft:'auto' }}>{b.game}</span></div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:11, fontWeight:700, color:C.gold }}>{b.challenger}</div></div>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, color:C.crimson, animation:b.status==='LIVE'?'glow 2s ease infinite':undefined }}>VS</div>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:11, fontWeight:700, color:C.sky }}>{b.challenged}</div></div>
              </div>
              {b.status==='LIVE' && <div style={{ height:4, background:C.bg3, borderRadius:2, overflow:'hidden', marginBottom:6 }}><div style={{ height:'100%', width:`${pctA}%`, background:`linear-gradient(90deg,${C.gold},${C.crimson})`, transition:'width .8s ease' }}/></div>}
              <Badge color={C.amber}>💰 ${b.prize}</Badge>
            </div>
          ))}
        </div>
        {/* Arena */}
        {cur && (
          <div>
            <Card glow color={cur.status==='LIVE'?C.crimson:undefined} style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', background:C.bg1, padding:20, gap:12 }}>
                {[{name:cur.challenger,color:C.gold,pct:pctA},{name:cur.challenged,color:C.sky,pct:100-pctA}].map((p,i) => (
                  <div key={i} style={{ textAlign:'center', position:'relative' }}>
                    {coins.filter(c => c.target===p.name).map(c => <div key={c.id} style={{ position:'absolute', top:'30%', left:'50%', fontSize:22, animation:'coin 1.6s ease-out forwards', pointerEvents:'none', zIndex:20 }}>💰</div>)}
                    <div style={{ width:72, height:72, borderRadius:'50%', background:`${p.color}22`, border:`4px solid ${p.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 8px', animation:cur.status==='LIVE'?'pulse 2.5s infinite':undefined }}>🎲</div>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, color:p.color, marginBottom:4 }}>{p.name}</div>
                    <div style={{ background:`${p.color}18`, borderRadius:8, padding:'8px 0', fontFamily:"'Orbitron'", fontSize:20, color:p.color, fontWeight:700 }}>{p.pct}%</div>
                    <Btn variant={i===0?'gold':'sky'} style={{ marginTop:10, width:'100%' }} onClick={() => setTipTarget(p.name)}>💰 TIP</Btn>
                  </div>
                ))}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:60 }}>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:38, color:C.crimson, animation:cur.status==='LIVE'?'glow 2s ease infinite':undefined }}>VS</div>
                  <div style={{ fontFamily:"'IBM Plex Mono'", fontSize:13, color:C.amber, fontWeight:700 }}>${cur.prize}</div>
                  <div style={{ fontSize:9, color:C.dim }}>PRIZE</div>
                </div>
              </div>
              {cur.status==='LIVE' && <div style={{ height:8, background:C.bg3 }}><div style={{ height:'100%', width:`${pctA}%`, background:`linear-gradient(90deg,${C.gold},${C.crimson},${C.sky})`, transition:'width .8s ease' }}/></div>}
              <div style={{ padding:'11px 16px', background:C.bg2, display:'flex', gap:10, alignItems:'center' }}>
                <Badge color={SC[cur.status]}>{cur.status}</Badge>
                {cur.status==='PENDING' && <Btn size="sm" variant="emerald" onClick={() => setBattles(b => b.map(x => x.id===cur.id?{...x,status:'LIVE'}:x))}>▶ START</Btn>}
                {cur.status==='LIVE' && <Btn size="sm" variant="ghost" onClick={() => setBattles(b => b.map(x => x.id===cur.id?{...x,status:'ENDED'}:x))}>⏹ END</Btn>}
              </div>
            </Card>
            {tipTarget && (
              <Card glow color={C.amber} style={{ padding:14, marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <span style={{ fontSize:12, color:C.ghost }}>Tip <b style={{ color:C.amber }}>{tipTarget}</b></span>
                  {[1,5,10,25,50].map(a => <button key={a} onClick={() => setTipAmt(a)} style={{ background:tipAmt===a?C.amber:'transparent', border:`1px solid ${tipAmt===a?C.amber:C.border}`, color:tipAmt===a?C.bg0:C.ghost, borderRadius:6, padding:'4px 10px', fontSize:11, cursor:'pointer', fontWeight:700 }}>${a}</button>)}
                  <Btn variant="amber" size="sm" onClick={() => sendTip(tipTarget, tipAmt*100)}>SEND 💰</Btn>
                  <button onClick={() => setTipTarget(null)} style={{ background:'none', border:'none', color:C.ghost, cursor:'pointer', fontSize:16, marginLeft:'auto' }}>✕</button>
                </div>
              </Card>
            )}
          </div>
        )}
        <Chat height={540} pkSide="both" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMBED + PAYWALL
// ═══════════════════════════════════════════════════════════════════════════════
const TIERS = [
  { id:'bronze', name:'BRONZE', price:100,  color:'#CD7F32', icon:'🥉', perks:['Full stream access','Chat in 12 languages','Replay 24h'] },
  { id:'silver', name:'SILVER', price:500,  color:C.ghost,   icon:'🥈', perks:['Everything Bronze','HD quality','Priority chat'] },
  { id:'gold',   name:'GOLD',   price:1500, color:C.gold,    icon:'🥇', perks:['Everything Silver','4K quality','Guest panel seat'] },
];

export function EmbedPlayerPage() {
  const [paywallActive, setPaywallActive] = useState(true);
  const [countdown, setCountdown] = useState(120);
  const [unlocked, setUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);
  const app = useApp();

  useEffect(() => {
    if (!paywallActive || unlocked) return;
    const iv = setInterval(() => setCountdown(c => { if (c<=1) { clearInterval(iv); setShowPaywall(true); return 0; } return c-1; }), 1000);
    return () => clearInterval(iv);
  }, [paywallActive, unlocked]);

  const pct = !unlocked ? (countdown/120)*100 : 100;
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const embedCode = `<iframe src="https://seewhy.live/embed/sw-live-001" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, animation:'fadeUp .35s ease' }}>
      <div>
        <Card style={{ padding:0, overflow:'hidden', marginBottom:14, border:`1px solid ${paywallActive&&!unlocked?C.gold:C.border}`, boxShadow:paywallActive&&!unlocked?`0 0 32px ${C.goldGlow}`:'none' }}>
          <div style={{ position:'relative', aspectRatio:'16/9' }}>
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
              style={{ width:'100%', height:'100%', border:'none', position:'absolute', top:0, left:0, filter:showPaywall&&!unlocked?'blur(8px)':undefined, transition:'filter .5s' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Stream" />
            {showPaywall && !unlocked && (
              <div style={{ position:'absolute', inset:0, background:'rgba(8,7,10,.88)', backdropFilter:'blur(4px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, animation:'fadeIn .4s ease' }}>
                <div style={{ fontSize:48, marginBottom:12, animation:'float 2.5s ease infinite' }}>🔒</div>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:30, color:C.gold, letterSpacing:'.1em', marginBottom:6 }}>FREE PREVIEW ENDED</div>
                <div style={{ fontSize:13, color:C.ghost, marginBottom:20 }}>Unlock full access to continue watching</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                  {TIERS.map(t => (
                    <button key={t.id} className="sw-tier-card" onClick={() => { setUnlocked(true); setShowPaywall(false); app?.addRevenue?.(t.price); }} style={{ background:`${t.color}12`, border:`2px solid ${t.color}55`, borderRadius:12, padding:'16px 20px', cursor:'pointer', textAlign:'center', transition:'all .2s', minWidth:120 }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
                      <div style={{ fontFamily:"'Bebas Neue'", fontSize:17, color:t.color, marginBottom:2 }}>{t.name}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:t.color, marginBottom:8 }}>${(t.price/100).toFixed(2)}/mo</div>
                      {t.perks.map(p => <div key={p} style={{ fontSize:10, color:C.ghost, marginBottom:2 }}>✓ {p}</div>)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {paywallActive && !unlocked && !showPaywall && (
              <>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:'rgba(0,0,0,.5)' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${C.gold},${C.amber})`, transition:'width 1s linear', boxShadow:`0 0 8px ${C.gold}` }}/>
                </div>
                <div style={{ position:'absolute', bottom:14, right:14, background:`${C.gold}EE`, borderRadius:8, padding:'5px 12px' }}>
                  <span style={{ fontSize:11, color:C.bg0, fontFamily:"'IBM Plex Mono'", fontWeight:700 }}>PREVIEW </span>
                  <span style={{ fontFamily:"'Orbitron'", fontSize:14, color:C.bg0, fontWeight:700 }}>{fmt(countdown)}</span>
                </div>
              </>
            )}
            {unlocked && <div style={{ position:'absolute', top:12, left:12 }}><Badge color={C.emerald}>✓ FULL ACCESS</Badge></div>}
          </div>
          <div style={{ padding:'12px 16px', background:C.bg1, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600 }}>Washington Classic 2026 — LIVE</div>
              <div style={{ fontSize:11, color:C.ghost }}>DOMINO Entertainment</div>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => { setPaywallActive(p => !p); setCountdown(120); setShowPaywall(false); setUnlocked(false); }}>{paywallActive?'🔓 DISABLE PAYWALL':'🔒 ENABLE PAYWALL'}</Btn>
            {!unlocked && paywallActive && <Btn size="sm" onClick={() => { setUnlocked(true); setShowPaywall(false); }}>DEMO UNLOCK</Btn>}
          </div>
        </Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {TIERS.map(t => (
            <Card key={t.id} style={{ background:`${t.color}10`, border:`1px solid ${t.color}44` }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{t.icon}</div>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:t.color }}>{t.name}</div>
              <div style={{ fontSize:18, fontWeight:700, color:t.color, marginBottom:8 }}>${(t.price/100).toFixed(2)}/mo</div>
              {t.perks.map(p => <div key={p} style={{ fontSize:11, color:C.ghost, marginBottom:4 }}>✓ {p}</div>)}
            </Card>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Card>
          <Lbl color={C.sky}>EMBED CODE</Lbl>
          <pre style={{ background:C.bg3, borderRadius:8, padding:'12px 14px', fontSize:10, fontFamily:"'IBM Plex Mono'", color:C.emerald, overflow:'auto', lineHeight:1.6, marginBottom:10, whiteSpace:'pre-wrap', border:`1px solid ${C.border}` }}>{embedCode}</pre>
          <Btn variant="sky" full onClick={() => { navigator.clipboard?.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false),2000); }}>{copied?'✓ COPIED!':'📋 COPY EMBED'}</Btn>
          <div style={{ marginTop:10 }}>
            {[['Paywall',paywallActive?'ENABLED':'DISABLED',paywallActive?C.gold:C.dim],['Preview','120 seconds',C.gold],['90/10 split','ACTIVE',C.emerald]].map(([k,v,c]) => <MV key={String(k)} label={String(k)} value={String(v)} color={String(c)} />)}
          </div>
        </Card>
        <Chat height={340} compact />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONETIZE — 90/10 FLYWHEEL
// ═══════════════════════════════════════════════════════════════════════════════
const FLYWHEEL = [
  { icon:'👁', title:'1. VIEWER ARRIVES',       desc:'Organic + embed + share', color:C.sky },
  { icon:'⏱', title:'2. FREE 120s PREVIEW',     desc:'Golden Paywall timer runs', color:C.gold },
  { icon:'💳', title:'3. PAYWALL CONVERTS',      desc:'Bronze $1 · Silver $5 · Gold $15/mo', color:C.amber },
  { icon:'💰', title:'4. 90/10 SPLIT FIRES',     desc:'Math.floor(total×0.10) — 4-layer enforcement', color:C.emerald },
  { icon:'🎲', title:'5. PK TIPS + HYPE',        desc:'Viewer bets fire tips → viral clips', color:C.violet },
  { icon:'📤', title:'6. SHARE + LOOP',          desc:'Clips auto-export → new viewers', color:C.crimson },
];

export function MonetizePage({ tipTotal }: { totalRevenue:number; tipTotal:number }) {
  const [active, setActive] = useState(0);
  const tG = REV_DATA.reduce((a,r) => a+r.gross, 0);
  const tC = REV_DATA.reduce((a,r) => a+r.creator, 0);
  useEffect(() => { const iv = setInterval(() => setActive(f => (f+1)%FLYWHEEL.length), 2200); return () => clearInterval(iv); }, []);
  return (
    <div style={{ animation:'fadeUp .35s ease' }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:'.08em', color:C.gold, marginBottom:4 }}>💎 90/10 MONETIZATION FLYWHEEL</div>
      <div style={{ fontSize:10, color:C.ghost, fontFamily:"'IBM Plex Mono'", marginBottom:16 }}>Stripe Connect · 4-layer immutable enforcement · Math.floor always</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[['7-DAY GROSS',`$${tG.toLocaleString()}`,C.gold],['CREATOR 90%',`$${tC.toLocaleString()}`,C.emerald],['PEAK VIEWERS','890',C.sky],['TIPS TONIGHT',`$${(tipTotal/100).toFixed(2)}`,C.amber]].map(([l,v,c]) => (
          <Card key={String(l)} style={{ padding:14, textAlign:'center' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, color:String(c) }}>{v}</div>
            <div style={{ fontSize:9, color:C.dim, fontFamily:"'IBM Plex Mono'", fontWeight:700, letterSpacing:'.08em' }}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <Card style={{ padding:16 }}>
          <Lbl>FLYWHEEL — 6-STAGE LOOP</Lbl>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {FLYWHEEL.map((stage,i) => (
              <div key={i} style={{ background:active===i?`${stage.color}18`:C.bg3, border:`2px solid ${active===i?stage.color:C.border}`, borderRadius:10, padding:'12px 10px', transition:'all .4s', transform:active===i?'scale(1.03)':'scale(1)', boxShadow:active===i?`0 0 20px ${stage.color}44`:'none' }}>
                <div style={{ fontSize:22, marginBottom:5 }}>{stage.icon}</div>
                <div style={{ fontSize:10, fontWeight:700, color:active===i?stage.color:C.snow, marginBottom:3 }}>{stage.title}</div>
                <div style={{ fontSize:10, color:C.ghost }}>{stage.desc}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding:16 }}>
          <Lbl>REVENUE SPLIT — 7 DAYS</Lbl>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REV_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="d" stroke={C.dim} tick={{ fontSize:10, fill:C.dim }} />
              <YAxis stroke={C.dim} tick={{ fontSize:10, fill:C.dim }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:10 }} />
              <Legend wrapperStyle={{ fontSize:10, color:C.ghost }} />
              <Bar dataKey="creator" fill={C.emerald} radius={[4,4,0,0]} name="Creator (90%)" />
              <Bar dataKey="platform" fill={C.burgundy} radius={[4,4,0,0]} name="Platform (10%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card glow color={C.gold}>
          <Lbl color={C.gold}>SPLIT CONFIG — IMMUTABLE</Lbl>
          {[['Creator share','90%',C.emerald],['Platform fee','10%',C.burgundy]].map(([k,v,c]) => (
            <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:`${c}12`, borderRadius:8, border:`1px solid ${c}33`, marginBottom:8 }}>
              <span style={{ fontSize:12, color:C.ghost }}>{k}</span>
              <span style={{ fontFamily:"'Orbitron'", fontSize:20, color:String(c), fontWeight:700 }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize:10, color:C.dim, lineHeight:1.6, fontFamily:"'IBM Plex Mono'" }}>
            Layer 1: PostgreSQL CHECK constraint<br/>
            Layer 2: DB IMMUTABLE trigger<br/>
            Layer 3: assertSplit() server hook<br/>
            Layer 4: Stripe application_fee_amount<br/>
            <span style={{ color:C.crimson }}>Math.round() and Math.ceil() FORBIDDEN</span>
          </div>
        </Card>
        <Card>
          <Lbl>SUBSCRIPTION TIERS</Lbl>
          {[['🥉 Bronze','$1/mo',100,'#CD7F32'],['🥈 Silver','$5/mo',500,C.ghost],['🥇 Gold','$15/mo',1500,C.gold]].map(([name,price,cents,color]) => (
            <div key={String(name)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:`${color}10`, border:`1px solid ${color}33`, borderRadius:9, marginBottom:7 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:String(color) }}>{name}</div>
                <div style={{ fontSize:9, color:C.dim, fontFamily:"'IBM Plex Mono'" }}>Creator: ${((Number(cents)-Math.floor(Number(cents)*0.1))/100).toFixed(2)} · Platform: ${(Math.floor(Number(cents)*0.1)/100).toFixed(2)}</div>
              </div>
              <span style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:String(color) }}>{price}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESTINATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const DEST_INIT = [
  { id:'d1', name:'YouTube DOMINO Ent.', icon:'▶', color:C.crimson, rtmp:'rtmp://a.rtmp.youtube.com/live2', key:'rtmp-yt-domino-xxxx', enabled:false, bitrate:0, health:0, viewers:0 },
  { id:'d2', name:'Twitch',              icon:'🎮',color:C.violet,  rtmp:'rtmp://live.twitch.tv/app',       key:'live_twitch_abc123', enabled:false, bitrate:0, health:0, viewers:0 },
  { id:'d3', name:'Facebook Live',       icon:'f', color:C.sky,     rtmp:'rtmps://live-api-s.facebook.com', key:'fb_live_xxxabc',    enabled:false, bitrate:0, health:0, viewers:0 },
  { id:'d4', name:'SeeWhy LIVE CDN',     icon:'📡',color:C.gold,    rtmp:'rtmp://76.13.31.91:1935/live',    key:'sw_master_9x8y7z',  enabled:false, bitrate:0, health:0, viewers:0 },
];

export function DestinationsPage() {
  const [dests, setDests] = useState(DEST_INIT);
  const [ingestActive, setIngestActive] = useState(false);
  const [ingestBitrate, setIngestBitrate] = useState(0);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    if (!ingestActive) return;
    const iv = setInterval(() => {
      setIngestBitrate(Math.floor(2200+Math.random()*600));
      setDests(ds => ds.map(d => d.enabled?{...d,bitrate:Math.floor(2200+Math.random()*400),health:Math.floor(93+Math.random()*7),viewers:Math.max(0,d.viewers+Math.floor(Math.random()*6-2))}:d));
    }, 1800);
    return () => clearInterval(iv);
  }, [ingestActive]);

  const toggleDest = (id: string) => {
    if (!ingestActive) return;
    setDests(ds => ds.map(d => d.id===id?{...d,enabled:!d.enabled,bitrate:!d.enabled?2400:0,health:!d.enabled?97:0,viewers:!d.enabled?Math.floor(Math.random()*200+20):0}:d));
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, animation:'fadeUp .35s ease' }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:'.08em', color:C.crimson }}>🔀 DESTINATION STREAMING</div>
            <div style={{ fontSize:10, color:C.ghost, fontFamily:"'IBM Plex Mono'" }}>MediaMTX · FFmpeg Fanout · 76.13.31.91:1935</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            {ingestActive && <Badge color={C.crimson}><LiveDot size={6}/>INGEST · {ingestBitrate}kbps</Badge>}
            {!ingestActive
              ? <Btn variant="gold" onClick={() => setIngestActive(true)}>▶ START INGEST</Btn>
              : <Btn variant="burgundy" onClick={() => { setIngestActive(false); setIngestBitrate(0); setDests(ds => ds.map(d => ({...d,enabled:false,bitrate:0,health:0,viewers:0}))); }}>⏹ STOP ALL</Btn>}
          </div>
        </div>
        {!ingestActive && <div style={{ background:`${C.amber}12`, border:`1px solid ${C.amber}44`, borderRadius:10, padding:'12px 16px', marginBottom:14, fontSize:11, color:C.amber }}>⚠️ Start RTMP Ingest first, then enable destinations.</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
          {[['ACTIVE',`${dests.filter(d=>d.enabled).length}/${dests.length}`,C.emerald],['VIEWERS',dests.filter(d=>d.enabled).reduce((a,d)=>a+d.viewers,0)||'—',C.gold],['INGEST',ingestActive?ingestBitrate+'kbps':'IDLE',ingestActive?C.emerald:C.dim]].map(([l,v,c]) => (
            <div key={String(l)} style={{ background:C.bg2, border:`1px solid ${c}22`, borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:String(c) }}>{v}</div>
              <div style={{ fontSize:8, color:C.dim, fontFamily:"'IBM Plex Mono'", fontWeight:700, letterSpacing:'.08em' }}>{l}</div>
            </div>
          ))}
        </div>
        {dests.map(d => (
          <div key={d.id} className="sw-dest-row" style={{ background:C.bg2, border:`1px solid ${d.enabled?d.color+'44':C.border}`, borderLeft:`3px solid ${d.enabled?d.color:C.border}`, borderRadius:10, padding:14, marginBottom:8, transition:'all .2s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:d.enabled?10:0 }}>
              <div style={{ width:30, height:30, borderRadius:7, background:`${d.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:d.color }}>{d.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                  {d.name} {d.enabled && <div style={{ width:7, height:7, borderRadius:'50%', background:C.emerald, animation:'blink 1.2s infinite' }}/>}
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono'", fontSize:9, color:C.dim }}>{d.rtmp}</div>
              </div>
              <Badge color={d.enabled?C.emerald:C.dim}>{d.enabled?'LIVE':'OFF'}</Badge>
              <button onClick={() => toggleDest(d.id)} disabled={!ingestActive&&!d.enabled} style={{ background:d.enabled?C.crimson:'transparent', border:`1px solid ${d.enabled?C.crimson:C.border}`, color:d.enabled?'#fff':C.ghost, borderRadius:7, padding:'5px 14px', fontSize:10, fontWeight:700, cursor:!ingestActive&&!d.enabled?'not-allowed':'pointer', opacity:!ingestActive&&!d.enabled?0.4:1 }}>
                {d.enabled?'STOP':'START'}
              </button>
            </div>
            {d.enabled && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {[['BITRATE',d.bitrate+'kbps',C.sky],['HEALTH',d.health+'%',d.health>90?C.emerald:C.amber],['VIEWERS',d.viewers,C.gold]].map(([l,v,c]) => (
                  <div key={String(l)} style={{ background:C.bg3, borderRadius:6, padding:'5px 8px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:15, color:String(c) }}>{v}</div>
                    <div style={{ fontSize:7, color:C.dim, fontFamily:"'IBM Plex Mono'", fontWeight:700 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Card>
          <Lbl color={C.gold}>ADD DESTINATION</Lbl>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Inp value={newName} onChange={e => setNewName(e.target.value)} placeholder="Channel name" />
            <Inp value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Stream key" />
            <Btn full onClick={() => { if (!newName||!newKey) return; setDests(ds => [...ds,{id:'d'+Date.now(),name:newName,icon:'▶',color:C.sky,rtmp:'rtmp://custom',key:newKey,enabled:false,bitrate:0,health:0,viewers:0}]); setNewName(''); setNewKey(''); }}>+ ADD</Btn>
          </div>
        </Card>
        <Card>
          <Lbl>MEDIAMTX CONFIG</Lbl>
          {[['RTMP Ingest','rtmp://76.13.31.91:1935/live',C.crimson],['SRT','srt://76.13.31.91:7935',C.sky],['HLS','http://76.13.31.91:8888/live',C.emerald]].map(([k,v,c]) => <MV key={String(k)} label={String(k)} value={String(v)} color={String(c)} />)}
        </Card>
        {dests.some(d => d.enabled) && (
          <Card>
            <Lbl color={C.emerald}>FFMPEG FANOUT</Lbl>
            <pre style={{ background:C.bg3, borderRadius:8, padding:'10px 12px', fontSize:9, fontFamily:"'IBM Plex Mono'", color:C.emerald, overflowX:'auto', whiteSpace:'pre-wrap', lineHeight:1.6 }}>
              {`ffmpeg -re -i rtmp://76.13.31.91:1935/live/stream \\\n  -c copy \\\n${dests.filter(d=>d.enabled).map(d=>`  -f flv ${d.rtmp}/${d.key.slice(0,8)}•••• \\`).join('\n')}\n  -map 0`}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
export function AnalyticsPage({ tipTotal }: { tipTotal:number }) {
  const [hist] = useState(() => Array(24).fill(null).map((_,i) => ({ h:i, v:Math.floor(50+Math.random()*300+(i>18?200:0)) })));
  const tG = REV_DATA.reduce((a,r) => a+r.gross, 0);
  const tC = REV_DATA.reduce((a,r) => a+r.creator, 0);
  return (
    <div style={{ animation:'fadeUp .35s ease' }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, letterSpacing:'.08em', color:C.gold, marginBottom:4 }}>📊 ANALYTICS DASHBOARD</div>
      <div style={{ fontSize:10, color:C.ghost, fontFamily:"'IBM Plex Mono'", marginBottom:16 }}>Supabase rxlgywvfclyjdfyvfvyc · Real-time · 90/10 enforced</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[['GROSS',`$${tG.toLocaleString()}`,C.gold],['CREATOR',`$${tC.toLocaleString()}`,C.emerald],['PEAK','890',C.sky],['TIPS',`$${(tipTotal/100).toFixed(2)}`,C.amber]].map(([l,v,c]) => (
          <Card key={String(l)} style={{ padding:14 }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:28, color:String(c) }}>{v}</div>
            <div style={{ fontSize:9, color:C.dim, fontFamily:"'IBM Plex Mono'", fontWeight:700 }}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
        <Card style={{ padding:16 }}>
          <Lbl>REVENUE SPLIT — 7 DAYS</Lbl>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REV_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="d" stroke={C.dim} tick={{ fontSize:10, fill:C.dim }} />
              <YAxis stroke={C.dim} tick={{ fontSize:10, fill:C.dim }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:10 }} />
              <Legend wrapperStyle={{ fontSize:10, color:C.ghost }} />
              <Bar dataKey="creator" fill={C.emerald} radius={[4,4,0,0]} name="Creator (90%)" />
              <Bar dataKey="platform" fill={C.burgundy} radius={[4,4,0,0]} name="Platform (10%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding:16 }}>
          <Lbl>VIEWERS — 24H</Lbl>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hist}>
              <defs><linearGradient id="vG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.4}/><stop offset="100%" stopColor={C.gold} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="h" stroke={C.dim} tick={{ fontSize:9, fill:C.dim }} tickFormatter={v => v+':00'} />
              <YAxis stroke={C.dim} tick={{ fontSize:9, fill:C.dim }} />
              <Tooltip contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:10 }} />
              <Area type="monotone" dataKey="v" stroke={C.gold} fill="url(#vG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        <Card><Lbl>MONETIZATION</Lbl>{[['Tips',`$${(tipTotal/100).toFixed(2)}`,C.amber],['Subscriptions','$1,240',C.violet],['Pay-per-view','$595',C.gold]].map(([k,v,c]) => <MV key={String(k)} label={String(k)} value={String(v)} color={String(c)} />)}</Card>
        <Card><Lbl>CHAT ENGAGEMENT</Lbl>{[['Msgs/hr','1,240',C.sky],['Languages','6',C.violet],['Translations','840',C.emerald],['Tip-click rate','4.2%',C.amber]].map(([k,v,c]) => <MV key={String(k)} label={String(k)} value={String(v)} color={String(c)} />)}</Card>
        <Card><Lbl>STREAM QUALITY</Lbl>{[['Bitrate','2,500 kbps',C.emerald],['FPS','60',C.emerald],['CPU','38%',C.sky],['Buffer','98%',C.emerald]].map(([k,v,c]) => <MV key={String(k)} label={String(k)} value={String(v)} color={String(c)} />)}</Card>
      </div>
    </div>
  );
}
