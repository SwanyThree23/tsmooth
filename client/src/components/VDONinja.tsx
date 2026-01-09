import React, { useState, useEffect } from 'react';
import { Video, Plus, Copy, CheckCircle, ExternalLink, Users } from 'lucide-react';
import { api } from '../services/api';
import { VDORoom } from '../types';

export default function VDONinja() {
  const [rooms, setRooms] = useState<VDORoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getVDORooms();
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
    }
  };

  const createRoom = async () => {
    try {
      setLoading(true);
      const room = await api.createVDORoom();
      setRooms((prev) => [room, ...prev]);
      showSuccess('Room created successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      showSuccess(`${type} copied to clipboard`);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
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
            <Video className="w-8 h-8 mr-3 text-purple-500" />
            VDO.Ninja Integration
          </h1>
          <p className="text-gray-400 mt-1">Create and manage VDO.Ninja rooms for remote guests</p>
        </div>
        <button
          onClick={createRoom}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{loading ? 'Creating...' : 'Create Room'}</span>
        </button>
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

      {/* Info Card */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Users className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">How it works</h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Create a room to get unique Push and View URLs</li>
              <li>• Share the Push URL with your remote guest</li>
              <li>• Use the View URL in your streaming software (OBS, etc.)</li>
              <li>• Guest can join directly from their browser, no account needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-12 text-center">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No rooms yet</h3>
            <p className="text-gray-400 mb-6">Create your first VDO.Ninja room to get started</p>
            <button
              onClick={createRoom}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Room</span>
            </button>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Video className="w-5 h-5 mr-2 text-purple-500" />
                    Room: {room.roomId}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Created {new Date(room.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Active</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Push URL */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Push URL (For Guest)</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(room.pushUrl, '_blank')}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(room.pushUrl, 'Push URL')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedUrl === room.pushUrl ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded px-3 py-2 text-sm text-gray-300 font-mono break-all">
                    {room.pushUrl}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this URL with your remote guest to allow them to push their video/audio
                  </p>
                </div>

                {/* View URL */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      View URL (For OBS/Streaming Software)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(room.viewUrl, '_blank')}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(room.viewUrl, 'View URL')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedUrl === room.viewUrl ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded px-3 py-2 text-sm text-gray-300 font-mono break-all">
                    {room.viewUrl}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Add this URL as a browser source in OBS or your streaming software
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pro Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
              <CheckCircle className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Low Latency</p>
              <p className="text-gray-400 text-xs">VDO.Ninja provides near-zero latency streaming</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">No Installation</p>
              <p className="text-gray-400 text-xs">
                Guests can join directly from their browser
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg mt-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">High Quality</p>
              <p className="text-gray-400 text-xs">Supports up to 4K video quality</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg mt-1">
              <CheckCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Free & Open Source</p>
              <p className="text-gray-400 text-xs">Completely free to use, no limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
