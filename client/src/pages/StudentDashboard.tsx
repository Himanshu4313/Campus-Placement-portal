import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  shortlisted: number;
  interviews: number;
  selected: number;
  offers: number;
  pendingOffers: number;
  registeredDrives: number;
  profileCompletion: number;
  recentApplications: any[];
}

const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/students/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
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
        <div className="h-96 bg-muted rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here is a snapshot of your career application progress.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link to="/dashboard/jobs">
            <Button>Explore Jobs</Button>
          </Link>
        </div>
      </div>

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Applications', value: stats?.totalApplications || 0, desc: 'Jobs applied to', icon: FileText, color: 'text-primary bg-primary/10' },
          { label: 'Shortlisted', value: stats?.shortlisted || 0, desc: 'Under review & shortlisted', icon: Clock, color: 'text-warning bg-warning/10' },
          { label: 'Interviews Scheduled', value: stats?.interviews || 0, desc: 'Upcoming sessions', icon: Calendar, color: 'text-accent bg-accent/10' },
          { label: 'Offer Letters', value: stats?.offers || 0, desc: 'Selected and released', icon: Award, color: 'text-success bg-success/10' }
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

      {/* Main Content Splitted Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Progress & Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-lg">Profile Completion</h3>
              <p className="text-xs text-muted-foreground">Keep your profile updated for higher recruiter visibility.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-muted">
                <span className="text-lg font-extrabold">{stats?.profileCompletion || 0}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Perfect ATS alignment</span>
                <span className="text-xs text-muted-foreground">Upload certifications & projects.</span>
              </div>
            </div>

            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full">Update Details <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link to="/dashboard/profile#resume" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
                <span className="text-sm font-medium">Build & Manage Resumes</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/dashboard/drives" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
                <span className="text-sm font-medium">Placement Drives</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/dashboard/offers" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
                <span className="text-sm font-medium">View Offer Letters</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Applications & Activity */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Applications</h3>
              <Link to="/dashboard/applications" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {(!stats?.recentApplications || stats.recentApplications.length === 0) ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <Briefcase className="h-12 w-12 text-muted-foreground/40" />
                <span className="text-sm font-semibold text-muted-foreground">No recent applications</span>
                <p className="text-xs text-muted-foreground">Browse jobs and submit applications to start.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {stats.recentApplications.map((app: any, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {app.job?.company?.name.charAt(0) || 'C'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">{app.job?.title || 'Software Engineer'}</span>
                        <span className="text-xs text-muted-foreground">{app.job?.company?.name || 'Company'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        app.status === 'applied' ? 'bg-primary/10 text-primary' :
                        app.status === 'shortlisted' ? 'bg-warning/10 text-warning' :
                        app.status === 'selected' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <Link to={`/dashboard/applications/${app._id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
