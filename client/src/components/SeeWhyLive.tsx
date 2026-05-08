import { useState, useEffect, useCallback, useMemo } from 'react';
import { C, GLOBAL_CSS } from './seewhy/design';
import { AppCtx } from './seewhy/context';
import { setViewers, emitChat } from './seewhy/state';
import { TopNav, WatchPartyPage, PanelPage, PKBattlePage, EmbedPlayerPage, MonetizePage, DestinationsPage, AnalyticsPage } from './seewhy/pages';

export default function SeeWhyLive() {
  const [page, setPage] = useState('watchparty');
  const [isLive, setIsLive] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(4160);
  const [tipTotal, setTipTotal] = useState(234000);
  const username = 'SwanyThree';

  useEffect(() => {
    const iv = setInterval(() => setViewers(v => Math.max(1, v + Math.floor(Math.random() * 10 - 4))), 3500);
    return () => clearInterval(iv);
  }, []);

  const addTip = useCallback((cents: number, target: string) => {
    const creator = cents - Math.floor(cents * 0.10);
    setTipTotal(t => t + cents);
    setTotalRevenue(r => r + creator);
    emitChat({
      id: Date.now(), user: '💰 TIP ALERT', lang: 'en',
      content: `${username} tipped ${target} $${(cents/100).toFixed(2)}! (Creator: $${(creator/100).toFixed(2)})`,
      ts: new Date().toLocaleTimeString().slice(0,5), role: 'host', color: C.amber,
    });
  }, [username]);

  const addRevenue = useCallback((cents: number) => {
    setTotalRevenue(r => r + cents - Math.floor(cents * 0.10));
    setTipTotal(t => t + cents);
  }, []);

  const ctx = useMemo(() => ({ username, addTip, addRevenue, totalRevenue, tipTotal }), [username, addTip, addRevenue, totalRevenue, tipTotal]);

  const renderPage = () => {
    switch (page) {
      case 'watchparty':   return <WatchPartyPage />;
      case 'panel':        return <PanelPage isLive={isLive} />;
      case 'pkbattle':     return <PKBattlePage />;
      case 'embed':        return <EmbedPlayerPage />;
      case 'monetize':     return <MonetizePage totalRevenue={totalRevenue} tipTotal={tipTotal} />;
      case 'destinations': return <DestinationsPage />;
      case 'analytics':    return <AnalyticsPage tipTotal={tipTotal} />;
      default:             return <WatchPartyPage />;
    }
  };

  return (
    <AppCtx.Provider value={ctx}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:'100vh', background:C.bg0, color:C.snow, fontFamily:"'DM Sans',sans-serif" }}>
        <TopNav page={page} setPage={setPage} isLive={isLive} setIsLive={setIsLive} />
        <main style={{ marginTop:74, padding:'20px 24px', minHeight:'calc(100vh - 74px)' }}>
          {renderPage()}
        </main>
        {/* Live revenue ticker */}
        <div style={{ position:'fixed', bottom:16, right:16, background:`${C.emerald}18`, border:`1px solid ${C.emerald}44`, borderRadius:10, padding:'8px 14px', zIndex:300 }}>
          <div style={{ fontSize:9, color:C.dim, fontFamily:"'IBM Plex Mono'", marginBottom:2 }}>LIVE REVENUE</div>
          <div style={{ fontFamily:"'Orbitron'", fontSize:16, color:C.emerald, fontWeight:700 }}>
            ${(totalRevenue/100).toFixed(2)} <span style={{ fontSize:10, color:C.dim }}>creator</span>
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );
}
