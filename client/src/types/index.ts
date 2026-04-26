export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  priority: string;
  budget: number;
  progress: number;
  deadline: string;
  description?: string;
  tags: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  totalPaid: number;
  projectCount: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  project?: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  embedUrl: string;
  thumbnail?: string;
  source?: string;
  category?: string;
  tags: string[];
  views: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamingPlatforms {
  youtube: boolean;
  twitch: boolean;
  kick: boolean;
  facebook: boolean;
  linkedin: boolean;
}

export interface StreamingStatus {
  isStreaming: boolean;
  platforms: StreamingPlatforms;
  viewers: number;
  startedAt?: string;
}

export interface SteamDeckStatus {
  connected: boolean;
  currentGame?: string;
  fps?: number;
  temperature?: number;
  battery?: number;
  streaming: boolean;
}

export interface VDORoom {
  roomId: string;
  pushUrl: string;
  viewUrl: string;
  createdAt: string;
}

export interface PodcastSource {
  type: 'pdf' | 'website' | 'document' | 'youtube';
  url?: string;
  content?: string;
  title: string;
}
