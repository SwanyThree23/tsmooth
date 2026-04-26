import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Note } from '../types';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      if (editingNote) {
        await api.updateNote(editingNote.id, noteData);
      } else {
        await api.createNote(noteData);
      }
      await loadNotes();
      closeModal();
    } catch (error: any) {
      alert(error.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id);
      await loadNotes();
    } catch (error: any) {
      alert(error.message || 'Failed to delete note');
    }
  };

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags.join(', '),
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        tags: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notes</h1>
          <p className="text-gray-400">Keep track of your ideas and thoughts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="glass rounded-xl p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white flex-1">{note.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(note)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded border border-purple-500/30 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-purple-500/30">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created: {formatDate(note.createdAt)}
                </div>
              </div>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Updated: {formatDate(note.updatedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingNote ? 'Edit Note' : 'Add Note'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                  placeholder="Note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 h-64 resize-none"
                  required
                  placeholder="Write your note here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags <span className="text-gray-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., ideas, work, personal"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingNote ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
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
