import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Settings,
  Activity,
  Plus,
  ArrowUpRight,
  Database,
  Terminal,
  ShieldAlert as AuditIcon
} from 'lucide-react';
import api from '../services/api';

interface AdminStats {
  overview: {
    totalUsers: number;
    placedStudents: number;
    totalCompanies: number;
    totalJobs: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/system-health')
        ]);
        setStats(statsRes.data.data);
        setHealth(healthRes.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-12 bg-muted rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground mt-1">Global platform settings, user controls, security policies, and live analytics.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/announcements">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Global Announcement
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Key Admin Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Accounts', value: stats?.overview?.totalUsers || 0, desc: 'Active platform users', icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Registered Companies', value: stats?.overview?.totalCompanies || 0, desc: 'Partner industries', icon: Database, color: 'text-success bg-success/10' },
          { label: 'Database Status', value: health?.database?.status || 'Online', desc: 'MongoDB connection pool', icon: Activity, color: 'text-warning bg-warning/10' },
          { label: 'Node Server Uptime', value: `${(health?.server?.uptime / 3600 || 0).toFixed(1)} hrs`, desc: 'Continuous operation runtime', icon: Terminal, color: 'text-accent bg-accent/10' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-6 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="text-3xl font-bold tracking-tight">{item.value}</span>
                <span className="text-xs text-muted-foreground mt-1">{item.desc}</span>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Links & Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 flex flex-col gap-5">
          <h3 className="font-bold text-lg">Platform Management</h3>
          <div className="flex flex-col gap-2">
            <Link to="/dashboard/users" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">Manage User Accounts</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/audit" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">View Security Audit Logs</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 flex flex-col gap-4">
          <h3 className="font-bold text-lg">Server Diagnostics</h3>
          <div className="p-4 rounded-xl border border-border bg-card/50 font-mono text-xs flex flex-col gap-2 overflow-x-auto text-slate-400">
            <p><span className="text-primary">Environment:</span> {health?.server?.environment || 'development'}</p>
            <p><span className="text-primary">Node.js Version:</span> {health?.server?.nodeVersion || 'v19.0.0'}</p>
            <p><span className="text-primary">Heap Total:</span> {((health?.server?.memory?.heapTotal || 0) / 1024 / 1024).toFixed(2)} MB</p>
            <p><span className="text-primary">Heap Used:</span> {((health?.server?.memory?.heapUsed || 0) / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
