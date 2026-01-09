import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Film, BarChart3, Video, Radio, Brain, Mic, Monitor, Cast,
  Folder, Users, DollarSign, CheckCircle, FileText, LogOut,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: BarChart3 },
  { name: 'Videos', path: '/videos', icon: Video },
  { name: 'Streaming', path: '/streaming', icon: Radio },
  { name: 'AI Tools', path: '/ai-tools', icon: Brain },
  { name: 'Podcast Studio', path: '/podcast', icon: Mic },
  { name: 'PRISM Live', path: '/prism', icon: Monitor },
  { name: 'VDO.Ninja', path: '/vdo', icon: Cast },
  { name: 'Steam Deck', path: '/steam', icon: Film },
  { name: 'Projects', path: '/projects', icon: Folder },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Invoices', path: '/invoices', icon: DollarSign },
  { name: 'Tasks', path: '/tasks', icon: CheckCircle },
  { name: 'Notes', path: '/notes', icon: FileText },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full glass transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-white font-bold text-lg">T-Smooth</h1>
                  <p className="text-gray-400 text-xs">Productions</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-purple-600/20'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-purple-500/30">
            {sidebarOpen && user && (
              <div className="mb-3 px-3 py-2 bg-black/40 rounded-lg">
                <p className="text-white font-medium text-sm truncate">{user.name}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 bg-purple-600 text-white p-1 rounded-full hover:bg-purple-700 transition-colors"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
