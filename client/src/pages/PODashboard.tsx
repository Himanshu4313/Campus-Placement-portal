import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  TrendingUp,
  Mail,
  Plus,
  ArrowUpRight,
  Download,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Building,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PODashboardStats {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalRecruiters: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalDrives: number;
    totalOffers: number;
    placedStudents: number;
    verifiedCompanies: number;
    placementRate: number;
    avgPackage: number;
    highestPackage: number;
  };
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  phone?: string;
  createdAt: string;
}

const PODashboard: React.FC = () => {
  const [stats, setStats] = useState<PODashboardStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'companies'>('overview');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load PO stats', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to load user list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/verify`, { isApproved: !currentStatus });
      toast.success(currentStatus ? 'User unverified successfully' : 'User verified successfully!');
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update verification status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCSV = (roleType: 'student' | 'recruiter') => {
    const targetUsers = users.filter(u => u.role === roleType);
    if (targetUsers.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Verified Status', 'Joined Date'];
    const rows = targetUsers.map(u => [
      u._id,
      u.name,
      u.email,
      u.phone || 'N/A',
      u.isApproved ? 'Verified' : 'Unverified',
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${roleType}_placement_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${roleType} CSV report!`);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'students') return u.role === 'student' && matchSearch;
    if (activeTab === 'companies') return u.role === 'recruiter' && matchSearch;
    return matchSearch;
  });

  const overview = stats?.overview;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Placement Officer Panel</h1>
          <p className="text-muted-foreground mt-1">Supervise campus drives, coordinate student verifications, and compile analytics.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/drives/new">
            <Button className="flex items-center gap-2 text-xs font-bold">
              <Plus className="h-4 w-4" /> Create Drive
            </Button>
          </Link>
          <Link to="/dashboard/bulk-email">
            <Button variant="outline" className="flex items-center gap-2 text-xs font-bold">
              <Mail className="h-4 w-4" /> Bulk Email
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {['overview', 'students', 'companies'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Placement Rate', value: `${overview?.placementRate || 0}%`, desc: 'Of eligible students placed', icon: GraduationCap, color: 'text-primary bg-primary/10 border-primary/10' },
              { label: 'Avg Package', value: `₹${((overview?.avgPackage || 0) / 100000).toFixed(1)} LPA`, desc: 'Annual base median ctc', icon: TrendingUp, color: 'text-success bg-success/10 border-success/10' },
              { label: 'Highest Package', value: `₹${((overview?.highestPackage || 0) / 100000).toFixed(1)} LPA`, desc: 'Lakhs Per Annum ceiling', icon: Sparkles, color: 'text-warning bg-warning/10 border-warning/10' },
              { label: 'Recruitment Drives', value: overview?.totalDrives || 0, desc: 'Organized campus events', icon: Calendar, color: 'text-accent bg-accent/10 border-accent/10' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-6 flex items-start justify-between bg-white dark:bg-card border border-border/80">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="text-3xl font-bold tracking-tight text-foreground mt-1">{item.value}</span>
                    <span className="text-xs text-muted-foreground mt-1">{item.desc}</span>
                  </div>
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions & Metrics Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 p-6 flex flex-col gap-5 bg-white dark:bg-card">
              <h3 className="font-bold text-lg">Quick Tasks</h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleExportCSV('student')}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-800/10 hover:bg-muted transition-all text-xs font-bold text-left"
                >
                  <span>Export Placed Students Report</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => handleExportCSV('recruiter')}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-800/10 hover:bg-muted transition-all text-xs font-bold text-left"
                >
                  <span>Export Recruiter Directory</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </Card>

            <Card className="lg:col-span-2 p-6 flex flex-col gap-6 bg-white dark:bg-card">
              <h3 className="font-bold text-lg">System Metrics Details</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Enrolled', count: overview?.totalStudents || 0 },
                  { label: 'Registered Recruiters', count: overview?.totalRecruiters || 0 },
                  { label: 'Total Job Openings', count: overview?.totalJobs || 0 }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-slate-50/30 dark:bg-zinc-800/10 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <span className="text-2xl font-bold">{stat.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {(activeTab === 'students' || activeTab === 'companies') && (
        <Card className="p-6 bg-white dark:bg-card flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bold text-lg capitalize">{activeTab} Directory</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-card text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-10">No users found under this category.</p>
          ) : (
            <div className="overflow-x-auto border border-border/50 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.map(record => (
                    <tr key={record._id} className="hover:bg-muted/10">
                      <td className="p-4 font-bold">{record.name}</td>
                      <td className="p-4">{record.email}</td>
                      <td className="p-4">{record.phone || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${record.isApproved ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {record.isApproved ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={record.isApproved ? 'outline' : 'primary'}
                          onClick={() => handleToggleVerification(record._id, record.isApproved)}
                          disabled={actionLoadingId === record._id}
                        >
                          {actionLoadingId === record._id ? <Loader2 className="h-3 w-3 animate-spin"/> : (record.isApproved ? 'Unverify' : 'Verify')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

    </div>
  );
};

export default PODashboard;
