import React, { useEffect, useState } from 'react';
import {
  Play, Plus, Edit, Trash2, Eye, X, Video as VideoIcon,
  Image as ImageIcon, Tag, Grid, Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { Video } from '../types';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    embedUrl: '',
    thumbnail: '',
    source: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getVideos();
      setVideos(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (selectedVideo) {
        await api.updateVideo(selectedVideo.id, videoData);
        showSuccess('Video updated successfully');
      } else {
        await api.createVideo(videoData);
        showSuccess('Video added successfully');
      }

      loadVideos();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save video');
    }
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      embedUrl: video.embedUrl,
      thumbnail: video.thumbnail || '',
      source: video.source || '',
      category: video.category || '',
      tags: video.tags.join(', '),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await api.deleteVideo(id);
      showSuccess('Video deleted successfully');
      loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  const handlePlayVideo = async (video: Video) => {
    try {
      await api.incrementVideoView(video.id);
      setSelectedVideo(video);
      setShowPlayerModal(true);
      // Update local state
      setVideos(prev => prev.map(v =>
        v.id === video.id ? { ...v, views: v.views + 1 } : v
      ));
    } catch (err) {
      setError('Failed to load video');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
    setFormData({
      title: '',
      description: '',
      embedUrl: '',
      thumbnail: '',
      source: '',
      category: '',
      tags: '',
    });
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <VideoIcon className="w-8 h-8 mr-3 text-purple-500" />
            Video Showcase
          </h1>
          <p className="text-gray-400 mt-1">Manage and showcase your videos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Video</span>
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

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
          >
            <div
              className="aspect-video bg-gray-900 relative overflow-hidden cursor-pointer"
              onClick={() => handlePlayVideo(video)}
            >
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <VideoIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-16 h-16 text-white" />
              </div>
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded text-xs text-white">
                <Eye className="w-3 h-3" />
                <span>{video.views.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{video.description}</p>
              )}

              {video.category && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                    {video.category}
                  </span>
                </div>
              )}

              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-3 border-t border-gray-700/50">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No videos yet. Add your first video!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedVideo ? 'Edit Video' : 'Add Video'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Embed URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    placeholder="YouTube, Vimeo, etc."
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Tutorial, Vlog, etc."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="react, tutorial, coding"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  {selectedVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayerModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <button
                onClick={() => setShowPlayerModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={selectedVideo.embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            {selectedVideo.description && (
              <p className="text-gray-300 mt-4">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
