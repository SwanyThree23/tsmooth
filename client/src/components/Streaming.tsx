import React, { useEffect, useState, useRef } from 'react';
import {
  Video, Camera, Radio, Users, Settings, Play, Square,
  Youtube, Twitch as TwitchIcon, Zap, CheckCircle, XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { StreamingStatus } from '../types';

export default function Streaming() {
  const [cameraActive, setCameraActive] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>({
    isStreaming: false,
    platforms: {
      youtube: false,
      twitch: false,
      kick: false,
      facebook: false,
      linkedin: false,
    },
    viewers: 0,
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: false,
    twitch: false,
    kick: false,
  });
  const [showRTMPConfig, setShowRTMPConfig] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadStreamingStatus();
    startCamera();

    // WebSocket for real-time viewer updates
    const socket = socketService.connect();
    socketService.on('streaming:viewers', (count: number) => {
      setStreamingStatus(prev => ({ ...prev, viewers: count }));
    });

    return () => {
      socketService.off('streaming:viewers');
      stopCamera();
    };
  }, []);

  const loadStreamingStatus = async () => {
    try {
      const status = await api.getStreamingStatus();
      setStreamingStatus(status);
    } catch (err) {
      setError('Failed to load streaming status');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Failed to access camera and microphone');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  const togglePlatform = (platform: keyof typeof selectedPlatforms) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const startStreaming = async () => {
    if (!cameraActive) {
      setError('Please enable camera first');
      return;
    }

    const activePlatforms = Object.entries(selectedPlatforms)
      .filter(([_, active]) => active)
      .map(([platform]) => platform);

    if (activePlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    try {
      await api.startStreaming(selectedPlatforms);
      setStreamingStatus(prev => ({
        ...prev,
        isStreaming: true,
        platforms: { ...prev.platforms, ...selectedPlatforms }
      }));
      showSuccess('Streaming started successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start streaming');
    }
  };

  const stopStreaming = async () => {
    try {
      await api.stopStreaming();
      setStreamingStatus(prev => ({
        ...prev,
        isStreaming: false,
        platforms: {
          youtube: false,
          twitch: false,
          kick: false,
          facebook: false,
          linkedin: false,
        }
      }));
      showSuccess('Streaming stopped');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop streaming');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const platformCards = [
    {
      name: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      color: 'red'
    },
    {
      name: 'twitch',
      label: 'Twitch',
      icon: TwitchIcon,
      color: 'purple'
    },
    {
      name: 'kick',
      label: 'Kick',
      icon: Zap,
      color: 'green'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Radio className="w-8 h-8 mr-3 text-purple-500" />
            Multi-Platform Streaming
          </h1>
          <p className="text-gray-400 mt-1">Stream to multiple platforms simultaneously</p>
        </div>
        {streamingStatus.isStreaming && (
          <div className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full" />
            <span className="text-white font-bold">LIVE</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Preview */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Camera className="w-5 h-5 mr-2 text-purple-500" />
              Camera Preview
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{streamingStatus.viewers.toLocaleString()} viewers</span>
              </div>
              {cameraActive ? (
                <span className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>Inactive</span>
                </span>
              )}
            </div>
          </div>

          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {streamingStatus.isStreaming && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-bold">STREAMING LIVE</span>
              </div>
            )}
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          {/* Stream Controls */}
          <div className="mt-4 flex items-center space-x-4">
            {!streamingStatus.isStreaming ? (
              <button
                onClick={startStreaming}
                disabled={!cameraActive}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="w-5 h-5" />
                <span className="font-bold">Start Streaming</span>
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
              >
                <Square className="w-5 h-5" />
                <span className="font-bold">Stop Streaming</span>
              </button>
            )}
            <button
              onClick={() => setShowRTMPConfig(!showRTMPConfig)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>RTMP Config</span>
            </button>
          </div>

          {/* RTMP Configuration */}
          {showRTMPConfig && (
            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg space-y-3">
              <h3 className="font-bold text-white">RTMP Configuration</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Server URL</label>
                <input
                  type="text"
                  placeholder="rtmp://live.example.com/app"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stream Key</label>
                <input
                  type="password"
                  placeholder="Your stream key"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-all">
                Save Configuration
              </button>
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Video className="w-5 h-5 mr-2 text-purple-500" />
              Streaming Platforms
            </h2>

            <div className="space-y-3">
              {platformCards.map((platform) => {
                const Icon = platform.icon;
                const isActive = selectedPlatforms[platform.name as keyof typeof selectedPlatforms];
                const isStreaming = streamingStatus.platforms[platform.name as keyof typeof streamingStatus.platforms];

                return (
                  <div
                    key={platform.name}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? `bg-${platform.color}-500/10 border-${platform.color}-500/50`
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                    onClick={() => !streamingStatus.isStreaming && togglePlatform(platform.name as keyof typeof selectedPlatforms)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-6 h-6 ${isActive ? `text-${platform.color}-500` : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-white">{platform.label}</p>
                          {isStreaming && (
                            <p className="text-xs text-green-400 flex items-center mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                              Streaming
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-all ${
                        isActive ? `bg-${platform.color}-500` : 'bg-gray-700'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform m-0.5 ${
                          isActive ? 'translate-x-6' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stream Stats */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Stream Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Status</span>
                <span className={`font-bold ${streamingStatus.isStreaming ? 'text-green-400' : 'text-gray-400'}`}>
                  {streamingStatus.isStreaming ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Live Viewers</span>
                <span className="font-bold text-white">{streamingStatus.viewers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Active Platforms</span>
                <span className="font-bold text-white">
                  {Object.values(streamingStatus.platforms).filter(Boolean).length}
                </span>
              </div>
              {streamingStatus.startedAt && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Started At</span>
                  <span className="font-bold text-white">
                    {new Date(streamingStatus.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
