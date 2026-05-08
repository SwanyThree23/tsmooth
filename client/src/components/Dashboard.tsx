import { useEffect, useState, useRef } from 'react';
import {
  Eye, Video, Zap, DollarSign, Activity, Camera, Play,
  Users, TrendingUp, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { Project, Video as VideoType } from '../types';

interface DashboardStats {
  liveViewers: number;
  totalViews: number;
  aiGenerations: number;
  tokensSaved: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    liveViewers: 0,
    totalViews: 0,
    aiGenerations: 0,
    tokensSaved: 0,
    revenue: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [latestVideos, setLatestVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadDashboardData();

    // Connect to WebSocket for real-time updates
    socketService.connect();

    socketService.on('stats:update', (updatedStats: DashboardStats) => {
      setStats(updatedStats);
    });

    socketService.on('viewer:join', () => {
      setStats(prev => ({ ...prev, liveViewers: prev.liveViewers + 1 }));
    });

    socketService.on('viewer:leave', () => {
      setStats(prev => ({ ...prev, liveViewers: Math.max(0, prev.liveViewers - 1) }));
    });

    return () => {
      socketService.off('stats:update');
      socketService.off('viewer:join');
      socketService.off('viewer:leave');
      stopCamera();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projects, videos] = await Promise.all([
        api.getProjects(),
        api.getVideos(),
      ]);

      setRecentProjects(projects.slice(0, 5));
      setLatestVideos(videos.slice(0, 4));

      // Calculate initial stats from data
      const totalViews = videos.reduce((sum: number, v: VideoType) => sum + v.views, 0);
      setStats(prev => ({ ...prev, totalViews }));

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Failed to access camera');
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

  const statCards = [
    {
      icon: Users,
      label: 'Live Viewers',
      value: stats.liveViewers.toLocaleString(),
      color: 'purple',
      trend: '+12%'
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      color: 'blue',
      trend: '+24%'
    },
    {
      icon: Sparkles,
      label: 'AI Generations',
      value: stats.aiGenerations.toLocaleString(),
      color: 'indigo',
      trend: '+8%'
    },
    {
      icon: Zap,
      label: 'Tokens Saved',
      value: (stats.tokensSaved / 1000).toFixed(1) + 'K',
      color: 'violet',
      trend: '+15%'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: '$' + stats.revenue.toLocaleString(),
      color: 'green',
      trend: '+18%'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-spin text-purple-500" />
          <span className="text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Streaming Preview */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Video className="w-5 h-5 mr-2 text-purple-500" />
              Live Streaming Preview
            </h2>
            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                cameraActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {cameraActive ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Stop Camera</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          </div>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Click "Start Camera" to preview</p>
                </div>
              </div>
            )}
            {cameraActive && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Recent Projects
          </h2>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent projects</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white text-sm truncate">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        project.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : project.status === 'in-progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{project.client}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Latest Videos */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Play className="w-5 h-5 mr-2 text-purple-500" />
          Latest Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestVideos.length === 0 ? (
            <p className="text-gray-400 col-span-full">No videos available</p>
          ) : (
            latestVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all overflow-hidden group"
              >
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm truncate mb-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400">
                    <Eye className="w-3 h-3 mr-1" />
                    {video.views.toLocaleString()} views
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
