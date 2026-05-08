import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Videos from './components/Videos';
import Streaming from './components/Streaming';
import AITools from './components/AITools';
import Podcast from './components/Podcast';
import PrismLive from './components/PrismLive';
import VDONinja from './components/VDONinja';
import SteamDeck from './components/SteamDeck';
import Projects from './components/Projects';
import Clients from './components/Clients';
import Invoices from './components/Invoices';
import Tasks from './components/Tasks';
import Notes from './components/Notes';
import WatchParty from './components/WatchParty';
import LiveChat from './components/LiveChat';
import TipJar from './components/TipJar';
import Leaderboard from './components/Leaderboard';
import RTMPFanout from './components/RTMPFanout';
import SeeWhyLive from './components/SeeWhyLive';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading T-Smooth Productions...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="videos" element={<Videos />} />
        <Route path="streaming" element={<Streaming />} />
        <Route path="rtmp" element={<RTMPFanout />} />
        <Route path="ai-tools" element={<AITools />} />
        <Route path="podcast" element={<Podcast />} />
        <Route path="prism" element={<PrismLive />} />
        <Route path="vdo" element={<VDONinja />} />
        <Route path="steam" element={<SteamDeck />} />
        <Route path="watch-party" element={<WatchParty />} />
        <Route path="chat" element={<LiveChat roomId="general" />} />
        <Route path="tips" element={<TipJar />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="clients" element={<Clients />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="notes" element={<Notes />} />
        <Route path="seewhy" element={<SeeWhyLive />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
