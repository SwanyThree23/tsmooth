import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Users, Radio, Plus, Copy, Crown, Mic, MicOff,
  Video, VideoOff, MessageSquare, DollarSign, Settings, Share2, X
} from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import LiveChat from './LiveChat';
import TipJar from './TipJar';

interface PartyMember {
  userId: string;
  role: string;
  user: { id: string; name: string; avatar?: string };
}

interface WatchPartyData {
  id: string;
  title: string;
  hostId: string;
  videoUrl: string;
  roomCode: string;
  isLive: boolean;
  maxMembers: number;
  members: PartyMember[];
  liveKitToken?: string;
  liveKitUrl?: string;
  videoState?: { playing: boolean; currentTime: number };
}

export default function WatchParty() {
  const { user } = useAuth();
  const [parties, setParties] = useState<WatchPartyData[]>([]);
  const [currentParty, setCurrentParty] = useState<WatchPartyData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'tips'>('chat');
  const [isPlaying, setIsPlaying] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', videoUrl: '', maxMembers: 20 });
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const socket = socketService.connect();

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    if (!currentParty) return;
    socket.on('party:sync', handleVideoSync);
    socket.on('party:member-joined', () => loadCurrentParty());
    socket.on('party:kicked', (data: any) => {
      if (data.userId === user?.id) setCurrentParty(null);
      else loadCurrentParty();
    });
    socket.on('party:status', (data: any) => {
      setCurrentParty(prev => prev ? { ...prev, isLive: data.isLive } : null);
    });
    return () => {
      socket.off('party:sync');
      socket.off('party:member-joined');
      socket.off('party:kicked');
      socket.off('party:status');
    };
  }, [currentParty?.roomCode]);

  const loadParties = async () => {
    try {
      const data = await api.getWatchParties();
      setParties(data);
    } catch { /* no parties yet */ }
  };

  const loadCurrentParty = async () => {
    if (!currentParty) return;
    try {
      const data = await api.getWatchParty(currentParty.roomCode);
      setCurrentParty(data);
    } catch {}
  };

  const handleVideoSync = (state: any) => {
    if (!isHost()) {
      setIsPlaying(state.playing);
    }
  };

  const isHost = () => currentParty?.hostId === user?.id;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const party = await api.createWatchParty(createForm);
      setCurrentParty(party);
      socket.emit('room:join', party.roomCode);
      setShowCreate(false);
      setCreateForm({ title: '', videoUrl: '', maxMembers: 20 });
    } catch (err: any) {
      alert(err.message || 'Failed to create party');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      const party = await api.joinWatchParty(joinCode.toUpperCase());
      setCurrentParty(party);
      socket.emit('room:join', party.roomCode);
      setJoinCode('');
    } catch (err: any) {
      alert(err.message || 'Failed to join party');
    }
  };

  const syncVideo = async (playing: boolean) => {
    if (!currentParty || !isHost()) return;
    try {
      await api.syncWatchParty(currentParty.roomCode, { playing, currentTime: 0 });
      setIsPlaying(playing);
    } catch {}
  };

  const copyCode = () => {
    if (!currentParty) return;
    navigator.clipboard.writeText(currentParty.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLive = async () => {
    if (!currentParty || !isHost()) return;
    try {
      await api.setWatchPartyLive(currentParty.roomCode, !currentParty.isLive);
    } catch {}
  };

  const getMemberRole = (memberId: string) => {
    return currentParty?.members.find(m => m.userId === memberId)?.role || 'viewer';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&autoplay=0`;
    return url;
  };

  if (currentParty) {
    const myRole = getMemberRole(user?.id || '');
    const isHostUser = isHost();
    const panelMembers = currentParty.members.filter(m => m.role === 'panelist' || m.role === 'host');

    return (
      <div className="h-screen flex flex-col bg-black/90">
        {/* Header */}
        <div className="glass px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold">{currentParty.title}</h2>
            {currentParty.isLive && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
              </span>
            )}
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Users className="w-4 h-4" />{currentParty.members.length}/{currentParty.maxMembers}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyCode} className="text-xs text-purple-400 flex items-center gap-1">
              <Copy className="w-4 h-4" />{copied ? 'Copied!' : currentParty.roomCode}
            </button>
            {isHostUser && (
              <button
                onClick={toggleLive}
                className={`text-xs px-3 py-1 rounded ${currentParty.isLive ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'}`}
              >
                {currentParty.isLive ? 'End Live' : 'Go Live'}
              </button>
            )}
            <button onClick={() => setCurrentParty(null)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main video + panel grid */}
          <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
            {/* YouTube / Video */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative">
              <iframe
                ref={videoRef}
                src={getYouTubeEmbedUrl(currentParty.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {isHostUser && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={() => syncVideo(!isPlaying)}
                    className="bg-purple-600/90 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause All' : 'Play All'}
                  </button>
                </div>
              )}
            </div>

            {/* Panel Grid (up to 20 members) */}
            {panelMembers.length > 0 && (
              <div className={`grid gap-2 ${
                panelMembers.length <= 4 ? 'grid-cols-4' :
                panelMembers.length <= 9 ? 'grid-cols-5' : 'grid-cols-6'
              }`} style={{ maxHeight: '140px' }}>
                {panelMembers.map((member) => (
                  <div key={member.userId} className="glass rounded-lg overflow-hidden aspect-video relative">
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      {member.user.avatar ? (
                        <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white text-xs font-bold">
                          {member.user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                      <span className="text-white text-xs truncate">{member.user.name}</span>
                      {member.role === 'host' && <Crown className="w-3 h-3 text-yellow-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My controls */}
            <div className="flex items-center justify-center gap-3 py-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full ${micOn ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-3 rounded-full ${camOn ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                {camOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </button>
              <div className="text-xs text-gray-400 capitalize bg-black/40 px-3 py-1 rounded">
                {myRole}
              </div>
            </div>
          </div>

          {/* Sidebar: Chat + Tips */}
          <div className="w-80 flex flex-col glass border-l border-purple-500/30">
            <div className="flex border-b border-purple-500/30">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400'}`}
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'tips' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400'}`}
              >
                <DollarSign className="w-4 h-4" /> Tips
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' ? (
                <LiveChat roomId={currentParty.roomCode} embedded />
              ) : (
                <TipJar receiverId={currentParty.hostId} roomId={currentParty.roomCode} embedded />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Watch Party</h1>
          <p className="text-gray-400">Host or join a live 20-person viewing session</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Party
        </button>
      </div>

      {/* Join by code */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Join with Room Code</h2>
        <div className="flex gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code (e.g. A1B2C3D4)"
            className="flex-1 px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white uppercase tracking-widest"
            maxLength={8}
          />
          <button
            onClick={handleJoin}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Join
          </button>
        </div>
      </div>

      {/* Live parties */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Live Parties</h2>
        {parties.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No live parties. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party) => (
              <div key={party.id} className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold">{party.title}</h3>
                  {party.isLive && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">LIVE</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <Users className="w-4 h-4" />
                  {party.members.length}/{party.maxMembers} members
                </div>
                <div className="text-xs text-purple-400 mb-3 font-mono">Code: {party.roomCode}</div>
                <button
                  onClick={async () => {
                    const data = await api.joinWatchParty(party.roomCode);
                    setCurrentParty(data);
                    socket.emit('room:join', party.roomCode);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm"
                >
                  Join Party
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Create Watch Party</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Party Title</label>
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white"
                  placeholder="Podcast Premiere Night"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube / Video URL</label>
                <input
                  value={createForm.videoUrl}
                  onChange={(e) => setCreateForm({ ...createForm, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Members (up to 20)</label>
                <input
                  type="number"
                  min={2} max={20}
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
                  Create Party
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
