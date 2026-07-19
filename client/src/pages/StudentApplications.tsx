import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, ChevronRight, Search, Filter, X, Loader2, Info, Calendar, Ban, Award, CheckCircle, Kanban, TableProperties } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  atsScore?: number;
  matchScore?: number;
  job: {
    _id: string;
    title: string;
    description?: string;
    location?: string;
    type?: string;
    company: {
      _id: string;
      name: string;
      logo?: string;
    };
  };
  statusHistory: Array<{
    status: string;
    changedAt: string;
    note?: string;
  }>;
  interviewRounds?: Array<{
    round: number;
    type: string;
    scheduledAt?: string;
    mode: string;
    meetingLink?: string;
    feedback?: string;
    result?: string;
  }>;
}

const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // Details Modal State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/applications');
      setApplications(res.data.data.applications || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawingId(appId);
    try {
      await api.put(`/applications/${appId}/withdraw`);
      toast.success('Application withdrawn successfully');
      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  // Client-side filtering for search & status
  const filteredApps = applications.filter((app) => {
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const companyName = app.job?.company?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = jobTitle.includes(query) || companyName.includes(query);
    const matchesStatus = selectedStatus ? app.status === selectedStatus : true;

    return matchesSearch && matchesStatus;
  });

  // Kanban Columns Definition
  const kanbanColumns = [
    { id: 'applied', title: 'Applied', color: 'border-t-primary' },
    { id: 'under_review', title: 'Under Review', color: 'border-t-info' },
    { id: 'shortlisted', title: 'Shortlisted', color: 'border-t-warning' },
    { id: 'selected', title: 'Selected', color: 'border-t-success' },
    { id: 'rejected', title: 'Rejected', color: 'border-t-destructive' }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of all your job applications in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* View mode toggle */}
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button 
              onClick={() => setViewMode('table')} 
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" /> Table
            </button>
            <button 
              onClick={() => setViewMode('kanban')} 
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Kanban
            </button>
          </div>

          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full md:w-48 lg:w-60"
            />
          </div>
          
          {viewMode === 'table' && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="selected">Selected</option>
                <option value="offer_released">Offer Released</option>
                <option value="offer_accepted">Offer Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Applications Table / Kanban */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <Briefcase className="h-12 w-12 text-muted-foreground/40" />
          <span className="text-lg font-bold text-muted-foreground">No applications found</span>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center font-bold text-primary shrink-0">
                          {app.job?.company?.name?.charAt(0) || 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate" title={app.job?.title}>
                            {app.job?.title || 'Unknown Role'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.job?.company?.name || 'Unknown Company'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'applied' ? 'bg-primary/10 text-primary border border-primary/20' :
                        app.status === 'under_review' ? 'bg-info/10 text-info border border-info/20' :
                        ['shortlisted', 'interview_scheduled'].includes(app.status) ? 'bg-warning/10 text-warning border border-warning/20' :
                        ['selected', 'offer_released', 'offer_accepted'].includes(app.status) ? 'bg-success/10 text-success border border-success/20' : 
                        'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedApp(app)}>
                        Details <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Kanban Board View */
        <div className="kanban-board select-none">
          {kanbanColumns.map(col => {
            const colApps = filteredApps.filter(app => {
              if (col.id === 'selected') {
                return ['selected', 'offer_released', 'offer_accepted'].includes(app.status);
              }
              if (col.id === 'rejected') {
                return ['rejected', 'withdrawn'].includes(app.status);
              }
              return app.status === col.id;
            });

            return (
              <div key={col.id} className={`kanban-column border-t-4 ${col.color}`}>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="font-bold text-sm text-foreground">{col.title}</span>
                  <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{colApps.length}</span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-1">
                  {colApps.map(app => (
                    <Card 
                      key={app._id} 
                      onClick={() => setSelectedApp(app)}
                      className="p-4 border border-border/80 bg-white dark:bg-card hover:border-primary/50 cursor-pointer shadow-sm hover:shadow transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {app.job?.company?.name?.charAt(0) || 'C'}
                        </div>
                        <span className="text-xs font-bold text-muted-foreground truncate">{app.job?.company?.name}</span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 leading-snug">{app.job?.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-2">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </Card>
                  ))}
                  {colApps.length === 0 && (
                    <div className="border border-dashed border-border/60 rounded-xl py-8 text-center text-xs text-muted-foreground/60">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSelectedApp(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {selectedApp.job?.company?.name?.charAt(0) || 'C'}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-xl font-bold leading-tight">{selectedApp.job?.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedApp.job?.company?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-border py-6 my-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied On</p>
                  <p className="text-sm font-semibold">{new Date(selectedApp.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <p className="text-sm font-semibold capitalize">{selectedApp.status.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedApp.matchScore !== undefined && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Match Score</p>
                    <p className="text-sm font-semibold">{selectedApp.matchScore}%</p>
                  </div>
                </div>
              )}

              {selectedApp.job?.location && (
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location & Type</p>
                    <p className="text-sm font-semibold">{selectedApp.job.location} ({selectedApp.job.type})</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedApp.job?.description && (
              <div>
                <h3 className="font-bold text-sm mb-2 text-foreground/80">Job Description Snippet</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{selectedApp.job.description}</p>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApp.coverLetter && (
              <div>
                <h3 className="font-bold text-sm mb-2 text-foreground/80">Cover Letter / Note</h3>
                <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50 max-h-[100px] overflow-y-auto">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Interview Rounds */}
            {selectedApp.interviewRounds && selectedApp.interviewRounds.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 text-foreground/80">Interview Schedule</h3>
                <div className="flex flex-col gap-3">
                  {selectedApp.interviewRounds.map((round) => (
                    <div key={round.round} className="p-4 bg-muted/20 border border-border/40 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold capitalize">Round {round.round}: {round.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-1">Mode: <span className="capitalize">{round.mode}</span></p>
                        {round.scheduledAt && (
                          <p className="text-xs text-muted-foreground">Date: {new Date(round.scheduledAt).toLocaleString()}</p>
                        )}
                      </div>
                      {round.meetingLink && (
                        <a href={round.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Join Call</Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="font-bold text-sm mb-4 text-foreground/80">Application Progress</h3>
              <div className="flex flex-col gap-4 border-l border-border ml-3 pl-5 relative">
                {selectedApp.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></span>
                    <p className="text-sm font-bold capitalize">{hist.status.replace('_', ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(hist.changedAt).toLocaleString()}</p>
                    {hist.note && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded border border-border/20 max-w-md">{hist.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              {!['selected', 'offer_released', 'offer_accepted', 'rejected', 'withdrawn'].includes(selectedApp.status) ? (
                <Button 
                  variant="outline" 
                  className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                  onClick={() => handleWithdraw(selectedApp._id)}
                  disabled={withdrawingId !== null}
                >
                  {withdrawingId === selectedApp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Withdraw Application
                </Button>
              ) : <div />}
              <Button onClick={() => setSelectedApp(null)}>Close Details</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default StudentApplications;
