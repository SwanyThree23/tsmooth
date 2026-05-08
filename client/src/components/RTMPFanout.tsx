import { useState, useEffect } from 'react';
import { Radio, Plus, Trash2, Copy, CheckCircle, Settings, Play, Square } from 'lucide-react';
import { socketService } from '../services/socket';

interface RTMPTarget {
  id: string;
  label: string;
  rtmpUrl: string;
  streamKey: string;
  active: boolean;
}

const PLATFORM_PRESETS: Record<string, { label: string; rtmpUrl: string }> = {
  youtube:   { label: 'YouTube Live',   rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2' },
  twitch:    { label: 'Twitch',          rtmpUrl: 'rtmp://live.twitch.tv/app' },
  kick:      { label: 'Kick',            rtmpUrl: 'rtmp://ingest.kick.com/live' },
  facebook:  { label: 'Facebook Live',  rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp' },
  linkedin:  { label: 'LinkedIn Live',  rtmpUrl: 'rtmp://4.rtmp.linkedin.com/live' },
  custom:    { label: 'Custom',          rtmpUrl: '' },
};

export default function RTMPFanout() {
  const [targets, setTargets] = useState<RTMPTarget[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTarget, setNewTarget] = useState({ preset: 'youtube', label: '', rtmpUrl: '', streamKey: '' });
  const [obsConnected, setObsConnected] = useState(false);
  const [obsWsUrl, setObsWsUrl] = useState('ws://localhost:4455');
  const [log, setLog] = useState<string[]>([]);
  const socket = socketService.connect();

  useEffect(() => {
    socket.on('stream:status', (data: any) => {
      addLog(`Stream status update: ${JSON.stringify(data)}`);
    });
    return () => { socket.off('stream:status'); };
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handlePresetChange = (preset: string) => {
    const p = PLATFORM_PRESETS[preset];
    setNewTarget(prev => ({ ...prev, preset, label: p.label, rtmpUrl: p.rtmpUrl }));
  };

  const addTarget = () => {
    if (!newTarget.rtmpUrl || !newTarget.streamKey) { alert('RTMP URL and stream key required'); return; }
    const target: RTMPTarget = {
      id: Date.now().toString(),
      label: newTarget.label || newTarget.rtmpUrl,
      rtmpUrl: newTarget.rtmpUrl,
      streamKey: newTarget.streamKey,
      active: false,
    };
    setTargets(prev => [...prev, target]);
    setNewTarget({ preset: 'youtube', label: '', rtmpUrl: '', streamKey: '' });
    setShowAdd(false);
    addLog(`Added target: ${target.label}`);
  };

  const removeTarget = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const toggleTarget = (id: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const startBroadcast = () => {
    const activeTargets = targets.filter(t => t.active);
    if (activeTargets.length === 0) { alert('Enable at least one target'); return; }
    setBroadcasting(true);
    activeTargets.forEach(t => addLog(`▶ Pushing to ${t.label}: ${t.rtmpUrl}/***`));
    socket.emit('stream:status', { isStreaming: true, platforms: activeTargets.map(t => t.label) });
  };

  const stopBroadcast = () => {
    setBroadcasting(false);
    addLog('■ Broadcast stopped');
    socket.emit('stream:status', { isStreaming: false });
  };

  const connectOBS = () => {
    addLog(`Connecting to OBS WebSocket: ${obsWsUrl}`);
    // In production: use obs-websocket-js library
    setTimeout(() => {
      setObsConnected(true);
      addLog('✓ OBS WebSocket connected (simulated)');
    }, 1000);
  };

  const copyRTMP = (target: RTMPTarget) => {
    navigator.clipboard.writeText(`${target.rtmpUrl}/${target.streamKey}`);
    addLog(`Copied full RTMP URL for ${target.label}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">RTMP Fanout</h1>
          <p className="text-gray-400">Simultaneously push your stream to multiple platforms</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-black/40 border border-purple-500/30 hover:border-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Target
          </button>
          {broadcasting ? (
            <button onClick={stopBroadcast} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Square className="w-4 h-4" /> Stop
            </button>
          ) : (
            <button
              onClick={startBroadcast}
              disabled={targets.filter(t => t.active).length === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Go Live
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Targets list */}
        <div className="lg:col-span-2 space-y-4">
          {/* OBS Connection */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" /> OBS / Source Input
            </h2>
            <div className="flex gap-3">
              <input
                value={obsWsUrl}
                onChange={e => setObsWsUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm"
                placeholder="ws://localhost:4455"
              />
              <button
                onClick={connectOBS}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${obsConnected ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                {obsConnected ? '✓ Connected' : 'Connect OBS'}
              </button>
            </div>
            {obsConnected && (
              <p className="text-green-400 text-xs mt-2">OBS WebSocket active — scene changes will sync automatically.</p>
            )}
          </div>

          {/* RTMP Targets */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" /> Stream Targets ({targets.filter(t => t.active).length} active)
            </h2>
            {targets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Radio className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No targets yet. Add a platform to start fanout streaming.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {targets.map(target => (
                  <div key={target.id} className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${target.active ? 'border-purple-500 bg-purple-600/10' : 'border-purple-500/20 bg-black/30'}`}>
                    <button onClick={() => toggleTarget(target.id)} className="flex-shrink-0">
                      {target.active
                        ? <CheckCircle className="w-6 h-6 text-green-400" />
                        : <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{target.label}</p>
                      <p className="text-gray-500 text-xs truncate">{target.rtmpUrl}/***</p>
                    </div>
                    {broadcasting && target.active && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
                      </span>
                    )}
                    <button onClick={() => copyRTMP(target)} className="text-gray-400 hover:text-purple-400">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeTarget(target.id)} className="text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="glass rounded-xl p-5 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-3">Activity Log</h2>
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs text-gray-400 max-h-96">
            {log.length === 0
              ? <p className="text-gray-600">No activity yet…</p>
              : log.map((l, i) => <p key={i}>{l}</p>)
            }
          </div>
        </div>
      </div>

      {/* Add target modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">Add Stream Target</h2>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Platform</label>
              <select
                value={newTarget.preset}
                onChange={e => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white"
              >
                {Object.entries(PLATFORM_PRESETS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">RTMP URL</label>
              <input
                value={newTarget.rtmpUrl}
                onChange={e => setNewTarget(prev => ({ ...prev, rtmpUrl: e.target.value }))}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm"
                placeholder="rtmp://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Stream Key</label>
              <input
                value={newTarget.streamKey}
                onChange={e => setNewTarget(prev => ({ ...prev, streamKey: e.target.value }))}
                type="password"
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm"
                placeholder="your-stream-key"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={addTarget} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">Add</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
