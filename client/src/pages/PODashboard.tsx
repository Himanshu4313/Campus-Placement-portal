import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Mail,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import api from '../services/api';

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

const PODashboard: React.FC = () => {
  const [stats, setStats] = useState<PODashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load PO stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  const overview = stats?.overview;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">University Placement Dashboard</h1>
          <p className="text-muted-foreground mt-1">Supervise campus hiring campaigns, verification gates, and analytical data.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/drives/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Drive
            </Button>
          </Link>
          <Link to="/dashboard/bulk-email">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Bulk Email
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Placement Rate', value: `${overview?.placementRate || 0}%`, desc: 'Of eligible students placed', icon: GraduationCap, color: 'text-primary bg-primary/10' },
          { label: 'Avg Package', value: `₹${((overview?.avgPackage || 0) / 100000).toFixed(1)} LPA`, desc: 'Annual base median ctc', icon: TrendingUp, color: 'text-success bg-success/10' },
          { label: 'Highest Package', value: `₹${((overview?.highestPackage || 0) / 100000).toFixed(1)} LPA`, desc: 'Lakhs Per Annum ceiling', icon: Sparkles, color: 'text-warning bg-warning/10' },
          { label: 'Recruitment Drives', value: overview?.totalDrives || 0, desc: 'Organized campus events', icon: Calendar, color: 'text-accent bg-accent/10' }
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

      {/* Second Level Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 flex flex-col gap-5">
          <h3 className="font-bold text-lg flex items-center gap-2">
            University Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            <Link to="/dashboard/companies" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">Verify Recruiter Companies</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/reports" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">Generate Placement Reports</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 flex flex-col gap-6">
          <h3 className="font-bold text-lg">System Metrics Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Enrolled', count: overview?.totalStudents || 0 },
              { label: 'Registered Recruiters', count: overview?.totalRecruiters || 0 },
              { label: 'Total Job Openings', count: overview?.totalJobs || 0 }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <span className="text-2xl font-bold">{stat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PODashboard;
