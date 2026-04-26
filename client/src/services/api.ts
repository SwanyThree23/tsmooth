const API_URL = '/api';

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    return data.data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
  }

  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }, false);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(data: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients
  async getClients() {
    return this.request('/clients');
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices() {
    return this.request('/invoices');
  }

  async createInvoice(data: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: any) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Videos
  async getVideos() {
    return this.request('/videos');
  }

  async createVideo(data: any) {
    return this.request('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVideo(id: string, data: any) {
    return this.request(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVideo(id: string) {
    return this.request(`/videos/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementVideoView(id: string) {
    return this.request(`/videos/${id}/view`, {
      method: 'POST',
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Notes
  async getNotes() {
    return this.request('/notes');
  }

  async createNote(data: any) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: any) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // AI
  async chat(message: string, conversationHistory: any[] = []) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });
  }

  async generateHeyGenVideo(script: string, avatar: string) {
    return this.request('/ai/heygen/generate', {
      method: 'POST',
      body: JSON.stringify({ script, avatar }),
    });
  }

  async generateElevenLabsVoice(text: string, voiceId: string) {
    return this.request('/ai/elevenlabs/generate', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
    });
  }

  async transcribeWisprFlow(audioUrl: string) {
    return this.request('/ai/wisprflow/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioUrl }),
    });
  }

  async compressLLMLingua(text: string, ratio: number) {
    return this.request('/ai/llmlingua/compress', {
      method: 'POST',
      body: JSON.stringify({ text, ratio }),
    });
  }

  // Podcast
  async addPodcastSource(source: any) {
    return this.request('/podcast/sources', {
      method: 'POST',
      body: JSON.stringify(source),
    });
  }

  async getPodcastSources() {
    return this.request('/podcast/sources');
  }

  async generatePodcast(data: any) {
    return this.request('/podcast/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Streaming
  async getStreamingStatus() {
    return this.request('/streaming/status');
  }

  async startStreaming(platforms: any) {
    return this.request('/streaming/start', {
      method: 'POST',
      body: JSON.stringify({ platforms }),
    });
  }

  async stopStreaming() {
    return this.request('/streaming/stop', {
      method: 'POST',
    });
  }

  // VDO.Ninja
  async createVDORoom() {
    return this.request('/vdo/create-room', {
      method: 'POST',
    });
  }

  async getVDORooms() {
    return this.request('/vdo/rooms');
  }

  // Steam Deck
  async connectSteamDeck() {
    return this.request('/steam/connect', {
      method: 'POST',
    });
  }

  async getSteamDeckStatus() {
    return this.request('/steam/status');
  }

  async getSteamGames() {
    return this.request('/steam/games');
  }

  async startGameStream(gameId: number) {
    return this.request('/steam/stream/start', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  async stopGameStream() {
    return this.request('/steam/stream/stop', {
      method: 'POST',
    });
  }

  // Tips & Stripe Connect
  async stripeConnectOnboard() {
    return this.request('/tips/connect/onboard', { method: 'POST' });
  }

  async getStripeConnectStatus() {
    return this.request('/tips/connect/status');
  }

  async createTipPaymentIntent(amount: number, receiverId: string, message?: string) {
    return this.request('/tips/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, receiverId, message }),
    });
  }

  async getTipLeaderboard() {
    return this.request('/tips/leaderboard');
  }

  async getTipHistory() {
    return this.request('/tips/history');
  }

  // Watch Party
  async getWatchParties() {
    return this.request('/watchparty');
  }

  async getWatchParty(roomCode: string) {
    return this.request(`/watchparty/${roomCode}`);
  }

  async createWatchParty(data: { title: string; videoUrl: string; maxMembers?: number }) {
    return this.request('/watchparty', { method: 'POST', body: JSON.stringify(data) });
  }

  async joinWatchParty(roomCode: string) {
    return this.request(`/watchparty/${roomCode}/join`, { method: 'POST' });
  }

  async syncWatchParty(roomCode: string, state: { playing: boolean; currentTime: number; videoUrl?: string }) {
    return this.request(`/watchparty/${roomCode}/sync`, { method: 'POST', body: JSON.stringify(state) });
  }

  async setWatchPartyLive(roomCode: string, isLive: boolean) {
    return this.request(`/watchparty/${roomCode}/live`, { method: 'POST', body: JSON.stringify({ isLive }) });
  }

  async promoteWatchPartyMember(roomCode: string, userId: string) {
    return this.request(`/watchparty/${roomCode}/promote/${userId}`, { method: 'POST' });
  }

  async removeWatchPartyMember(roomCode: string, userId: string) {
    return this.request(`/watchparty/${roomCode}/members/${userId}`, { method: 'DELETE' });
  }

  // Live Chat
  async getChatHistory(roomId: string, limit = 50) {
    return this.request(`/chat/${roomId}?limit=${limit}`);
  }

  async sendChatMessage(roomId: string, content: string, messageType = 'text') {
    return this.request(`/chat/${roomId}`, { method: 'POST', body: JSON.stringify({ content, messageType }) });
  }

  async deleteChatMessage(roomId: string, messageId: string) {
    return this.request(`/chat/${roomId}/${messageId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
