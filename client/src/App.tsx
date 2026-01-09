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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
        <Route path="ai-tools" element={<AITools />} />
        <Route path="podcast" element={<Podcast />} />
        <Route path="prism" element={<PrismLive />} />
        <Route path="vdo" element={<VDONinja />} />
        <Route path="steam" element={<SteamDeck />} />
        <Route path="projects" element={<Projects />} />
        <Route path="clients" element={<Clients />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="notes" element={<Notes />} />
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
