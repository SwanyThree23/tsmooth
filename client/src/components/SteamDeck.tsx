import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2, Activity, Thermometer, Battery, Play, Square,
  CheckCircle, XCircle, Wifi, WifiOff, Grid
} from 'lucide-react';
import { api } from '../services/api';
import { SteamDeckStatus } from '../types';

interface Game {
  id: number;
  name: string;
  image: string;
  playtime: number;
}

export default function SteamDeck() {
  const [status, setStatus] = useState<SteamDeckStatus>({
    connected: false,
    streaming: false,
  });
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadStatus();
    loadGames();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await api.getSteamDeckStatus();
      setStatus(data);
    } catch (err) {
      // Status not available yet
    }
  };

  const loadGames = async () => {
    try {
      const data = await api.getSteamGames();
      setGames(data);
    } catch (err) {
      setError('Failed to load games');
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await api.connectSteamDeck();
      setStatus((prev) => ({ ...prev, connected: true }));
      showSuccess('Connected to Steam Deck');
      loadGames();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setStatus({
      connected: false,
      streaming: false,
    });
    setSelectedGame(null);
    showSuccess('Disconnected from Steam Deck');
  };

  const handleStartStream = async (game: Game) => {
    try {
      setLoading(true);
      await api.startGameStream(game.id);
      setStatus((prev) => ({ ...prev, streaming: true, currentGame: game.name }));
      setSelectedGame(game);
      showSuccess(`Started streaming ${game.name}`);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start streaming');
    } finally {
      setLoading(false);
    }
  };

  const handleStopStream = async () => {
    try {
      await api.stopGameStream();
      setStatus((prev) => ({ ...prev, streaming: false, currentGame: undefined }));
      setSelectedGame(null);
      showSuccess('Stopped game streaming');
    } catch (err) {
      setError('Failed to stop streaming');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Gamepad2 className="w-8 h-8 mr-3 text-purple-500" />
            Steam Deck Integration
          </h1>
          <p className="text-gray-400 mt-1">Stream games from your Steam Deck</p>
        </div>
        {!status.connected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
          >
            <Wifi className="w-5 h-5" />
            <span>{loading ? 'Connecting...' : 'Connect'}</span>
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
          >
            <WifiOff className="w-5 h-5" />
            <span>Disconnect</span>
          </button>
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
        {/* Stream Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Game Stream</h2>
              {status.streaming && (
                <button
                  onClick={handleStopStream}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Stream</span>
                </button>
              )}
            </div>

            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
              {status.streaming ? (
                <canvas ref={canvasRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {status.connected
                        ? 'Select a game to start streaming'
                        : 'Connect to Steam Deck to get started'}
                    </p>
                  </div>
                </div>
              )}
              {status.streaming && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">STREAMING</span>
                </div>
              )}
            </div>
          </div>

          {/* Game Library */}
          {status.connected && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Grid className="w-5 h-5 mr-2 text-purple-500" />
                Game Library
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {games.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <p>No games found</p>
                  </div>
                ) : (
                  games.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => !status.streaming && handleStartStream(game)}
                      className={`bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer transition-all border ${
                        selectedGame?.id === game.id
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-700/50 hover:border-gray-600'
                      } ${status.streaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="aspect-video bg-gray-900 relative">
                        {game.image ? (
                          <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Gamepad2 className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                        {selectedGame?.id === game.id && status.streaming && (
                          <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white text-sm truncate mb-1">
                          {game.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {(game.playtime / 60).toFixed(1)} hours played
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status & Performance */}
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Connection</h2>
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Status</span>
              <div className="flex items-center space-x-2">
                {status.connected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-400">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {status.connected && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-400">FPS</span>
                  </div>
                  <span className="font-bold text-white">{status.fps || 60}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-400">Temperature</span>
                  </div>
                  <span className="font-bold text-white">{status.temperature || 65}°C</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Battery</span>
                  </div>
                  <span className="font-bold text-white">{status.battery || 85}%</span>
                </div>
              </div>

              {/* Battery Indicator */}
              <div className="mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-400"
                    style={{ width: `${status.battery || 85}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Current Game */}
          {status.currentGame && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Now Streaming</h2>
              <div className="text-center">
                <Gamepad2 className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <p className="font-bold text-white text-lg">{status.currentGame}</p>
                <div className="mt-4 flex items-center justify-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Live</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
