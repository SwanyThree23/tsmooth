import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Film, BarChart3, Video, Radio, Brain, Mic, Monitor, Cast,
  Folder, Users, DollarSign, CheckCircle, FileText, LogOut,
  Menu, X, Tv2, MessageSquare, Heart, Trophy, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navSections = [
  {
    label: 'Production',
    items: [
      { name: 'Dashboard',     path: '/',            icon: BarChart3,      end: true },
      { name: 'Videos',        path: '/videos',      icon: Video },
      { name: 'Streaming',     path: '/streaming',   icon: Radio },
      { name: 'RTMP Fanout',   path: '/rtmp',        icon: Zap },
    ],
  },
  {
    label: 'AI & Studio',
    items: [
      { name: 'AI Tools',      path: '/ai-tools',    icon: Brain },
      { name: 'Podcast Studio',path: '/podcast',     icon: Mic },
      { name: 'PRISM Live',    path: '/prism',       icon: Monitor },
      { name: 'VDO.Ninja',     path: '/vdo',         icon: Cast },
      { name: 'Steam Deck',    path: '/steam',       icon: Film },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Watch Party',   path: '/watch-party', icon: Tv2 },
      { name: 'Live Chat',     path: '/chat',        icon: MessageSquare },
      { name: 'Tip Jar',       path: '/tips',        icon: Heart },
      { name: 'Leaderboard',   path: '/leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Projects',      path: '/projects',    icon: Folder },
      { name: 'Clients',       path: '/clients',     icon: Users },
      { name: 'Invoices',      path: '/invoices',    icon: DollarSign },
      { name: 'Tasks',         path: '/tasks',       icon: CheckCircle },
      { name: 'Notes',         path: '/notes',       icon: FileText },
    ],
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full glass transition-all duration-300 z-50 flex flex-col ${
          sidebarOpen ? 'w-60' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-purple-500/30 flex items-center gap-3 flex-shrink-0">
          <div className="bg-purple-600 p-2 rounded-lg flex-shrink-0">
            <Film className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm leading-tight">T-Smooth</h1>
              <p className="text-gray-500 text-xs truncate">Productions</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map(section => (
            <div key={section.label} className="mb-3">
              {sidebarOpen && (
                <p className="text-gray-600 text-[10px] uppercase tracking-widest px-2 mb-1">{section.label}</p>
              )}
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:bg-purple-600/20 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm truncate">{item.name}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-purple-500/30 flex-shrink-0">
          {sidebarOpen && user && (
            <div className="mb-2 px-3 py-2 bg-black/40 rounded-lg">
              <p className="text-white font-medium text-xs truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-5 bg-purple-600 text-white p-1 rounded-full hover:bg-purple-700 transition-colors z-10"
        >
          {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'} min-h-screen`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
