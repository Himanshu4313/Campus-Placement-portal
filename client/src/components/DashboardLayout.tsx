import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useTheme } from '../hooks/useTheme';
import {
  LayoutDashboard,
  Briefcase,
  User,
  GraduationCap,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  Calendar,
  Settings,
  Database,
  Mail,
  Award
} from 'lucide-react';
import api from '../services/api';

const DashboardLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    // Fetch notifications count
    const fetchNotificationsCount = async () => {
      try {
        const res = await api.get('/notifications');
        setNotificationsCount(res.data.data.unreadCount || 0);
      } catch (err) {
        console.error('Failed to load notifications count', err);
      }
    };
    if (user) {
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    dispatch(logout());
    navigate('/login');
  };

  const getNavigationLinks = () => {
    const role = user?.role;
    const base = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ];

    if (role === 'student') {
      return [
        ...base,
        { name: 'My Profile', path: '/dashboard/profile', icon: User },
        { name: 'Jobs', path: '/dashboard/jobs', icon: Briefcase },
        { name: 'Applications', path: '/dashboard/applications', icon: FileText },
        { name: 'Placement Drives', path: '/dashboard/drives', icon: GraduationCap },
        { name: 'Interviews', path: '/dashboard/interviews', icon: Calendar },
        { name: 'Offers', path: '/dashboard/offers', icon: Award }
      ];
    }

    if (role === 'recruiter') {
      return [
        ...base,
        { name: 'Company Profile', path: '/dashboard/company', icon: GraduationCap },
        { name: 'Manage Jobs', path: '/dashboard/jobs', icon: Briefcase },
        { name: 'Applications', path: '/dashboard/applications', icon: FileText },
        { name: 'Candidate Search', path: '/dashboard/candidates', icon: User }
      ];
    }

    if (role === 'placement_officer') {
      return [
        ...base,
        { name: 'Manage Drives', path: '/dashboard/drives', icon: GraduationCap },
        { name: 'Companies', path: '/dashboard/companies', icon: Briefcase },
        { name: 'Bulk Communications', path: '/dashboard/bulk-email', icon: Mail },
        { name: 'Analytics & Reports', path: '/dashboard/reports', icon: Database }
      ];
    }

    if (role === 'admin') {
      return [
        ...base,
        { name: 'User Management', path: '/dashboard/users', icon: User },
        { name: 'System Settings', path: '/dashboard/settings', icon: Settings },
        { name: 'Platform Audit', path: '/dashboard/audit', icon: Shield },
        { name: 'System Health', path: '/dashboard/health', icon: Database }
      ];
    }

    return base;
  };

  const navLinks = getNavigationLinks();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <GraduationCap className="h-6 w-6" />
          <span>Campus Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card/90 backdrop-blur-lg p-6 flex flex-col justify-between transform transition-transform duration-300 md:relative md:transform-none md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <GraduationCap className="h-7 w-7" />
              <span>Placement Portal</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white shadow-premium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Theme toggler and logout for desktop */}
          <div className="hidden md:flex items-center justify-between px-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <button onClick={handleLogout} className="md:hidden flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-all">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden md:flex h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-40 items-center justify-between px-8">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Workspace / <span className="text-foreground capitalize">{user?.role.replace('_', ' ')} Portal</span>
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </Link>
          </div>
        </header>

        {/* Dashboard Pages Scroll Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
