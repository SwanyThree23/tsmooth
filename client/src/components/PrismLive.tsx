import React, { useState } from 'react';
import {
  Video, Sparkles, Radio, Youtube, Twitch as TwitchIcon,
  Facebook, Linkedin, MonitorPlay, Layers, CheckCircle
} from 'lucide-react';

type Scene = 'podcast' | 'gaming' | 'interview' | 'presentation';
type Effect = 'blur' | 'greenscreen' | 'overlay';

export default function PrismLive() {
  const [selectedScene, setSelectedScene] = useState<Scene>('podcast');
  const [activeEffects, setActiveEffects] = useState<Effect[]>([]);
  const [virtualCamera, setVirtualCamera] = useState(false);
  const [streamingPlatforms, setStreamingPlatforms] = useState({
    youtube: false,
    twitch: false,
    facebook: false,
    linkedin: false,
  });
  const [success, setSuccess] = useState('');

  const toggleEffect = (effect: Effect) => {
    setActiveEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const togglePlatform = (platform: keyof typeof streamingPlatforms) => {
    setStreamingPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const startStreaming = () => {
    const activePlatforms = Object.entries(streamingPlatforms)
      .filter(([_, active]) => active)
      .map(([platform]) => platform);

    if (activePlatforms.length === 0) {
      showSuccess('Please select at least one platform');
      return;
    }

    showSuccess(`Streaming started to: ${activePlatforms.join(', ')}`);
  };

  const scenes = [
    { id: 'podcast', label: 'Podcast', icon: Radio, description: 'Audio-focused setup' },
    { id: 'gaming', label: 'Gaming', icon: MonitorPlay, description: 'Game streaming layout' },
    { id: 'interview', label: 'Interview', icon: Video, description: 'Two-person setup' },
    {
      id: 'presentation',
      label: 'Presentation',
      icon: Layers,
      description: 'Screen share focused',
    },
  ];

  const effects = [
    { id: 'blur', label: 'Background Blur', icon: Sparkles },
    { id: 'greenscreen', label: 'Green Screen', icon: Video },
    { id: 'overlay', label: 'Overlay', icon: Layers },
  ];

  const platforms = [
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
    { id: 'twitch', label: 'Twitch', icon: TwitchIcon, color: 'purple' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Video className="w-8 h-8 mr-3 text-purple-500" />
          PRISM Live Studio & EvMux
        </h1>
        <p className="text-gray-400 mt-1">
          Professional live streaming with scenes and effects
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene & Effects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scene Selection */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Scene Selection</h2>
            <div className="grid grid-cols-2 gap-4">
              {scenes.map((scene) => {
                const Icon = scene.icon;
                const isActive = selectedScene === scene.id;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id as Scene)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon
                        className={`w-6 h-6 ${isActive ? 'text-purple-500' : 'text-gray-400'}`}
                      />
                      <h3 className="font-bold text-white">{scene.label}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{scene.description}</p>
                    {isActive && (
                      <div className="mt-2 flex items-center text-purple-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prism Lens Effects */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Prism Lens Effects</h2>
            <div className="grid grid-cols-3 gap-4">
              {effects.map((effect) => {
                const Icon = effect.icon;
                const isActive = activeEffects.includes(effect.id as Effect);
                return (
                  <div
                    key={effect.id}
                    onClick={() => toggleEffect(effect.id as Effect)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        isActive ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                    <p className="text-sm text-white text-center font-medium">{effect.label}</p>
                    {isActive && (
                      <div className="mt-2 flex justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Virtual Camera */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Virtual Camera</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Enable for use in other applications
                </p>
              </div>
              <div
                onClick={() => setVirtualCamera(!virtualCamera)}
                className={`w-14 h-7 rounded-full cursor-pointer transition-all ${
                  virtualCamera ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-transform m-0.5 ${
                    virtualCamera ? 'translate-x-7' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Platform Streaming */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Streaming Platforms</h2>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isActive =
                  streamingPlatforms[platform.id as keyof typeof streamingPlatforms];
                return (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id as keyof typeof streamingPlatforms)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? `bg-${platform.color}-500/10 border-${platform.color}-500/50`
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-6 h-6 ${
                            isActive ? `text-${platform.color}-500` : 'text-gray-400'
                          }`}
                        />
                        <span className="font-medium text-white">{platform.label}</span>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full transition-all ${
                          isActive ? `bg-${platform.color}-500` : 'bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform m-0.5 ${
                            isActive ? 'translate-x-6' : ''
                          }`}
                        />
                      </div>
                    </div>
                    {isActive && (
                      <div className="mt-2 flex items-center space-x-2 text-green-400 text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Ready to stream</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stream Controls */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Stream Controls</h2>
            <div className="space-y-3">
              <button
                onClick={startStreaming}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
              >
                <Radio className="w-5 h-5" />
                <span className="font-bold">Start Streaming</span>
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="font-bold">Stop Streaming</span>
              </button>
            </div>
          </div>

          {/* Live Status */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Live Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Scene</span>
                <span className="font-bold text-white capitalize">{selectedScene}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Active Effects</span>
                <span className="font-bold text-white">{activeEffects.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Virtual Camera</span>
                <span
                  className={`font-bold ${virtualCamera ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {virtualCamera ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Selected Platforms</span>
                <span className="font-bold text-white">
                  {Object.values(streamingPlatforms).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
