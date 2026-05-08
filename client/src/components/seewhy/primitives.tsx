import React from 'react';
import { C } from './design';

type BtnVariant = 'gold'|'burgundy'|'emerald'|'crimson'|'sky'|'violet'|'amber'|'ghost'|'dark';
type BtnSize = 'sm'|'md'|'lg';

export const Btn = ({ children, variant='gold' as BtnVariant, size='md' as BtnSize, onClick, disabled, style, full }: {
  children: React.ReactNode; variant?: BtnVariant; size?: BtnSize;
  onClick?: () => void; disabled?: boolean; style?: React.CSSProperties; full?: boolean;
}) => {
  const vars: Record<BtnVariant,{bg:string;color:string;border?:string}> = {
    gold:{bg:C.gold,color:C.bg0}, burgundy:{bg:C.burgundy,color:'#fff'},
    emerald:{bg:C.emerald,color:C.bg0}, crimson:{bg:C.crimson,color:'#fff'},
    sky:{bg:C.sky,color:C.bg0}, violet:{bg:C.violet,color:'#fff'},
    amber:{bg:C.amber,color:C.bg0},
    ghost:{bg:'transparent',color:C.ghost,border:`1px solid ${C.border}`},
    dark:{bg:C.bg3,color:C.snow,border:`1px solid ${C.border}`},
  };
  const v = vars[variant];
  const pad = size==='sm'?'4px 12px':size==='lg'?'13px 32px':'8px 20px';
  const fs = size==='sm'?10:size==='lg'?14:12;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:v.bg, color:v.color, border:v.border||'none',
      padding:pad, fontSize:fs, fontFamily:"'DM Sans',sans-serif",
      fontWeight:700, borderRadius:7, cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?0.45:1, transition:'all .17s',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      gap:6, letterSpacing:'.02em', width:full?'100%':undefined, ...style
    }}>{children}</button>
  );
};

export const Card = ({ children, style, glow, color }: {
  children: React.ReactNode; style?: React.CSSProperties; glow?: boolean; color?: string;
}) => (
  <div style={{
    background:C.bg2, border:`1px solid ${glow?(color||C.gold):C.border}`,
    borderRadius:12, padding:16, transition:'all .2s',
    boxShadow:glow?`0 0 24px ${color?color+'44':C.goldGlow}`:'none', ...style
  }}>{children}</div>
);

export const Badge = ({ children, color=C.gold, style }: {
  children: React.ReactNode; color?: string; style?: React.CSSProperties;
}) => (
  <span style={{
    background:`${color}22`, color, border:`1px solid ${color}44`,
    borderRadius:5, padding:'2px 8px', fontSize:9, fontWeight:700,
    fontFamily:"'IBM Plex Mono'", letterSpacing:'.08em', textTransform:'uppercase',
    whiteSpace:'nowrap', ...style
  }}>{children}</span>
);

export const LiveDot = ({ color=C.crimson, size=7 }: { color?:string; size?:number }) => (
  <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%',
    background:color, animation:'blink 1.2s infinite', marginRight:5, flexShrink:0 }} />
);

export const Divider = ({ style }: { style?: React.CSSProperties }) =>
  <div style={{ height:1, background:C.border, ...style }} />;

export const Inp = ({ value, onChange, placeholder, type='text', onKeyDown, style, rows }: {
  value:string; onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void;
  placeholder?:string; type?:string; onKeyDown?:(e:React.KeyboardEvent)=>void;
  style?:React.CSSProperties; rows?:number;
}) => {
  const base: React.CSSProperties = {
    background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8,
    padding:'9px 13px', color:C.snow, fontSize:13, width:'100%',
    fontFamily:"'DM Sans',sans-serif", outline:'none', resize:'none', ...style
  };
  return rows
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} rows={rows} style={base as React.CSSProperties} />
    : <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={base} />;
};

export const Sel = ({ value, onChange, options, style }: {
  value:string; onChange:(e:React.ChangeEvent<HTMLSelectElement>)=>void;
  options:{v:string;l:string}[]; style?:React.CSSProperties;
}) => (
  <select value={value} onChange={onChange} style={{
    background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8,
    padding:'9px 13px', color:C.snow, fontSize:12,
    fontFamily:"'DM Sans',sans-serif", outline:'none', ...style
  }}>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

export const Lbl = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontSize:9, fontWeight:700, color:color||C.dim, letterSpacing:'.1em',
    textTransform:'uppercase', fontFamily:"'IBM Plex Mono'", marginBottom:6 }}>{children}</div>
);

export const MV = ({ label, value, color }: { label:string; value:string|number; color?:string }) => (
  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
    <span style={{ fontSize:11, color:C.ghost }}>{label}</span>
    <span style={{ fontFamily:"'IBM Plex Mono'", fontSize:11, color:color||C.snow, fontWeight:600 }}>{value}</span>
  </div>
);

export const TT = (props: object) => (
  // @ts-ignore — recharts Tooltip custom style
  <div {...props} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, fontSize:10, color:C.snow }} />
);
