import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Edit, Trash2, Mail, Phone, Building2,
  DollarSign, FolderKanban, X
} from 'lucide-react';
import { api } from '../services/api';
import { Client } from '../types';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    totalPaid: '',
    projectCount: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients();
      setClients(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientData = {
        ...formData,
        totalPaid: parseFloat(formData.totalPaid || '0'),
        projectCount: parseInt(formData.projectCount || '0'),
      };

      if (selectedClient) {
        await api.updateClient(selectedClient.id, clientData);
        showSuccess('Client updated successfully');
      } else {
        await api.createClient(clientData);
        showSuccess('Client created successfully');
      }

      loadClients();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      industry: client.industry || '',
      totalPaid: client.totalPaid.toString(),
      projectCount: client.projectCount.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await api.deleteClient(id);
      showSuccess('Client deleted successfully');
      loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      totalPaid: '',
      projectCount: '',
    });
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-500" />
            Client Management
          </h1>
          <p className="text-gray-400 mt-1">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Client</span>
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No clients yet</h3>
            <p className="text-gray-400 mb-6">Add your first client to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Client</span>
            </button>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
              {client.company && (
                <div className="flex items-center space-x-2 text-gray-400 mb-3">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{client.company}</span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}
                {client.industry && (
                  <div className="text-sm text-gray-400">
                    Industry: <span className="text-gray-300">{client.industry}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total Paid</span>
                  </div>
                  <span className="font-bold text-green-400">
                    ${client.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <FolderKanban className="w-4 h-4" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <span className="font-bold text-white">{client.projectCount}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedClient ? 'Edit Client' : 'New Client'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Paid</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalPaid}
                    onChange={(e) => setFormData({ ...formData, totalPaid: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.projectCount}
                    onChange={(e) => setFormData({ ...formData, projectCount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  {selectedClient ? 'Update Client' : 'Create Client'}
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
    </div>
  );
}
