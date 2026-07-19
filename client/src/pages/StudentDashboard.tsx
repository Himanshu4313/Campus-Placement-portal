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
  Clock,
  Award,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Bell,
  CheckCircle,
  HelpCircle
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/students/dashboard'),
          api.get('/notifications')
        ]);
        setStats(statsRes.data.data);
        setNotifications(notifRes.data.data.notifications || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  // Calculate coordinates for circle progress
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((stats?.profileCompletion || 0) / 100) * circumference;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{todayDate}</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here is an overview of your campus placement statistics.</p>
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
          { label: 'Applications', value: stats?.totalApplications || 0, desc: 'Submitted job roles', icon: FileText, color: 'text-primary bg-primary/10 border-primary/10' },
          { label: 'Shortlisted', value: stats?.shortlisted || 0, desc: 'Awaiting interview slots', icon: Clock, color: 'text-warning bg-warning/10 border-warning/10' },
          { label: 'Interviews Scheduled', value: stats?.interviews || 0, desc: 'Active interview sessions', icon: Calendar, color: 'text-accent bg-accent/10 border-accent/10' },
          { label: 'Offer Letters', value: stats?.offers || 0, desc: 'Provisional selections', icon: Award, color: 'text-success bg-success/10 border-success/10' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className={`p-6 flex items-start justify-between border border-border/80 bg-white dark:bg-card`}>
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

      {/* Main Content Splitted Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Strength & Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Profile Completion Circle Gauge */}
          <Card className="p-6 flex flex-col gap-6 bg-white dark:bg-card">
            <div>
              <h3 className="font-bold text-lg">Profile Strength</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Build a complete profile to appeal to recruiters.</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-muted"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-primary transition-all duration-500 ease-in-out"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="absolute text-sm font-extrabold">{stats?.profileCompletion || 0}%</span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-bold text-foreground">ATS Compliance Score</span>
                <span className="text-xs text-muted-foreground">Keep experience, certifications, and skills updated.</span>
              </div>
            </div>

            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full text-xs font-semibold">Update Details <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 flex flex-col gap-4 bg-white dark:bg-card">
            <h3 className="font-bold text-lg">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link to="/dashboard/profile" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-800/10 hover:bg-muted transition-all">
                <span className="text-xs font-bold text-foreground">Upload and Manage Resumes</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/dashboard/resume-builder" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-800/10 hover:bg-muted transition-all">
                <span className="text-xs font-bold text-foreground">Launch Stepper Resume Builder</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/dashboard/drives" className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-800/10 hover:bg-muted transition-all">
                <span className="text-xs font-bold text-foreground">Browse Recruiting Drives</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </Card>

          {/* Recent Notifications stream */}
          <Card className="p-6 flex flex-col gap-4 bg-white dark:bg-card">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Announcements</h3>
              <Link to="/dashboard/notifications" className="text-xs font-bold text-primary hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif._id} className="flex gap-3 text-xs leading-relaxed border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground line-clamp-1">{notif.title}</p>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No unread notifications</p>
              )}
            </div>
          </Card>

        </div>

        {/* Right Column: Applications & Analytical Charts */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Pure-CSS Bar Chart mapping application history */}
          <Card className="p-6 flex flex-col gap-6 bg-white dark:bg-card">
            <div>
              <h3 className="font-bold text-lg">Hiring Funnel Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Visualization of your selection performance.</p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Applications Submitted', count: stats?.totalApplications || 0, max: 20, color: 'bg-primary' },
                { label: 'Shortlisted for rounds', count: stats?.shortlisted || 0, max: 20, color: 'bg-warning' },
                { label: 'Interviews Scheduled', count: stats?.interviews || 0, max: 20, color: 'bg-accent' },
                { label: 'Offer Letters Released', count: stats?.offers || 0, max: 20, color: 'bg-success' }
              ].map((bar, idx) => {
                const percentage = Math.min((bar.count / (bar.max || 1)) * 100, 100);
                return (
                  <div key={idx} className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="text-foreground">{bar.count}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Applications table / cards */}
          <Card className="p-6 flex flex-col gap-6 bg-white dark:bg-card">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Applications</h3>
              <Link to="/dashboard/applications" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View all Applications <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {(!stats?.recentApplications || stats.recentApplications.length === 0) ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <Briefcase className="h-10 w-10 text-muted-foreground/35" />
                <span className="text-sm font-semibold text-muted-foreground">No recent applications</span>
                <p className="text-xs text-muted-foreground">Submit applications to explore opportunities.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentApplications.map((app: any, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-slate-50/30 dark:bg-zinc-800/10">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold shrink-0">
                        {app.job?.company?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate text-foreground">{app.job?.title || 'Software Engineer'}</span>
                        <span className="text-xs text-muted-foreground">{app.job?.company?.name || 'Company'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'applied' ? 'bg-primary/15 text-primary' :
                        app.status === 'shortlisted' ? 'bg-warning/15 text-warning' :
                        app.status === 'selected' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <Link to="/dashboard/applications">
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
