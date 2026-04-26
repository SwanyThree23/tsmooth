import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Task } from '../types';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
      } else {
        await api.createTask(formData);
      }
      await loadTasks();
      closeModal();
    } catch (error: any) {
      alert(error.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      await loadTasks();
    } catch (error: any) {
      alert(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      await loadTasks();
    } catch (error: any) {
      alert(error.message || 'Failed to update task');
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-yellow-500' },
    { id: 'in-progress', title: 'In Progress', color: 'border-blue-500' },
    { id: 'done', title: 'Done', color: 'border-green-500' },
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-red-400',
    };
    return colors[priority] || 'text-gray-400';
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
          <p className="text-gray-400">Organize your tasks with Kanban board</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="glass rounded-xl p-4">
            <div className={`border-l-4 ${column.color} pl-3 mb-4`}>
              <h2 className="text-xl font-bold text-white">{column.title}</h2>
              <p className="text-sm text-gray-400">
                {tasks.filter(t => t.status === column.id).length} tasks
              </p>
            </div>

            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div key={task.id} className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold flex-1">{task.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(task)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      {column.id !== 'todo' && (
                        <button
                          onClick={() => handleStatusChange(task, column.id === 'done' ? 'in-progress' : 'todo')}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          ê Move Left
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button
                          onClick={() => handleStatusChange(task, column.id === 'todo' ? 'in-progress' : 'done')}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Move Right í
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingTask ? 'Edit Task' : 'Add Task'}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingTask ? 'Update' : 'Create'}
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
