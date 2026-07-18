import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

interface RecruiterStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  interviews: number;
  selected: number;
  offersReleased: number;
  offersAccepted: number;
}

const RecruiterDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/recruiters/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load recruiter stats', err);
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

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Command Center</h1>
          <p className="text-muted-foreground mt-1">Manage positions, view candidates, and coordinate interviews.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/jobs/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Jobs', value: stats?.activeJobs || 0, desc: 'Currently hiring', icon: Briefcase, color: 'text-primary bg-primary/10' },
          { label: 'Total Applications', value: stats?.totalApplications || 0, desc: 'Awaiting process', icon: FileText, color: 'text-warning bg-warning/10' },
          { label: 'Interviews Scheduled', value: stats?.interviews || 0, desc: 'This week', icon: Calendar, color: 'text-accent bg-accent/10' },
          { label: 'Offers Issued', value: stats?.offersReleased || 0, desc: 'Selected candidates', icon: CheckCircle, color: 'text-success bg-success/10' }
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

      {/* Quick Actions & Shortlists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 flex flex-col gap-5">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Recruiter Actions
          </h3>
          <div className="flex flex-col gap-2">
            <Link to="/dashboard/candidates" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">Search Candidates</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/jobs" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">Manage Job Postings</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/applications" className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all">
              <span className="text-sm font-medium">View All Submissions</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Hiring Funnel Details</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Shortlisted', count: stats?.shortlisted || 0, desc: 'Awaiting initial screen' },
              { label: 'Selected Candidates', count: stats?.selected || 0, desc: 'Vetted profiles' },
              { label: 'Offers Accepted', count: stats?.offersAccepted || 0, desc: 'Joined' }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <span className="text-2xl font-bold">{stat.count}</span>
                <span className="text-xs text-muted-foreground">{stat.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
