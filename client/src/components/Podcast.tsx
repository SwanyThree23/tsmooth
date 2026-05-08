import { useState, useEffect } from 'react';
import {
  Mic, Plus, Trash2, FileText, Globe, Youtube, File,
  Play, Radio, Loader
} from 'lucide-react';
import { api } from '../services/api';
import { PodcastSource } from '../types';

export default function Podcast() {
  const [sources, setSources] = useState<PodcastSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [showSourceModal, setShowSourceModal] = useState(false);

  const [sourceForm, setSourceForm] = useState({
    type: 'pdf' as PodcastSource['type'],
    url: '',
    content: '',
    title: '',
  });

  const [podcastConfig, setPodcastConfig] = useState({
    host1: 'Alex',
    host2: 'Sarah',
    duration: 10,
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const data = await api.getPodcastSources();
      setSources(data);
    } catch (err) {
      setError('Failed to load sources');
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addPodcastSource(sourceForm);
      showSuccess('Source added successfully');
      loadSources();
      setShowSourceModal(false);
      setSourceForm({ type: 'pdf', url: '', content: '', title: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add source');
    }
  };

  const handleDeleteSource = async (index: number) => {
    // For simplicity, we'll just remove from state
    // In a real app, you'd call an API endpoint
    setSources(prev => prev.filter((_, i) => i !== index));
    showSuccess('Source removed');
  };

  const handleGeneratePodcast = async () => {
    if (sources.length === 0) {
      setError('Please add at least one source');
      return;
    }

    try {
      setLoading(true);
      const response = await api.generatePodcast({
        sources,
        ...podcastConfig,
      });
      setGeneratedScript(response.script);
      showSuccess('Podcast script generated successfully');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate podcast');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const sourceIcons = {
    pdf: FileText,
    website: Globe,
    youtube: Youtube,
    document: File,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Mic className="w-8 h-8 mr-3 text-purple-500" />
          NotebookLM Podcast Studio
        </h1>
        <p className="text-gray-400 mt-1">Generate AI-powered podcast scripts from your sources</p>
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
        {/* Sources Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Source Materials</h2>
              <button
                onClick={() => setShowSourceModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Source</span>
              </button>
            </div>

            <div className="space-y-3">
              {sources.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>No sources added yet</p>
                </div>
              ) : (
                sources.map((source, idx) => {
                  const Icon = sourceIcons[source.type];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Icon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{source.title}</p>
                          <p className="text-sm text-gray-400 capitalize">{source.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSource(idx)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Generated Script */}
          {generatedScript && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Generated Script</h2>
              <div className="p-4 bg-gray-900/50 rounded-lg text-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap">
                {generatedScript}
              </div>
            </div>
          )}
        </div>

        {/* Configuration & Controls */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Host Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host 1 Name
                </label>
                <input
                  type="text"
                  value={podcastConfig.host1}
                  onChange={(e) =>
                    setPodcastConfig({ ...podcastConfig, host1: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host 2 Name
                </label>
                <input
                  type="text"
                  value={podcastConfig.host2}
                  onChange={(e) =>
                    setPodcastConfig({ ...podcastConfig, host2: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={podcastConfig.duration}
                  onChange={(e) =>
                    setPodcastConfig({ ...podcastConfig, duration: parseInt(e.target.value) })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                </select>
              </div>

              <button
                onClick={handleGeneratePodcast}
                disabled={loading || sources.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Generate Podcast</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Streaming Controls */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Radio className="w-5 h-5 mr-2 text-purple-500" />
              Streaming Controls
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all">
                <Play className="w-4 h-4" />
                <span>Start Live Stream</span>
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all">
                <Mic className="w-4 h-4" />
                <span>Record Audio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Add Source</h2>

            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source Type
                </label>
                <select
                  value={sourceForm.type}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, type: e.target.value as PodcastSource['type'] })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="website">Website URL</option>
                  <option value="youtube">YouTube Video</option>
                  <option value="document">Text Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={sourceForm.title}
                  onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {(sourceForm.type === 'pdf' ||
                sourceForm.type === 'website' ||
                sourceForm.type === 'youtube') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                  <input
                    type="url"
                    required
                    value={sourceForm.url}
                    onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {sourceForm.type === 'document' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    required
                    value={sourceForm.content}
                    onChange={(e) => setSourceForm({ ...sourceForm, content: e.target.value })}
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Add Source
                </button>
                <button
                  type="button"
                  onClick={() => setShowSourceModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
                >
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
