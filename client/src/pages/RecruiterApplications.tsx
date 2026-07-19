import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, User, Calendar, FileText, CheckCircle, XCircle, ChevronRight, X, Loader2, Award, Clock, MapPin, Video, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  atsScore?: number;
  matchScore?: number;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  job: {
    _id: string;
    title: string;
    type: string;
  };
  resume?: {
    _id: string;
    name: string;
    url: string;
  };
  statusHistory: Array<{
    status: string;
    changedAt: string;
    note?: string;
  }>;
}

const RecruiterApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Status Action States
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Interview Modal States
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [roundNum, setRoundNum] = useState(1);
  const [roundType, setRoundType] = useState('technical');
  const [scheduledAt, setScheduledAt] = useState('');
  const [interviewMode, setInterviewMode] = useState<'online' | 'offline' | 'phone'>('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [interviewers, setInterviewers] = useState('');
  const [duration, setDuration] = useState(45);
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // Offer Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [ctc, setCtc] = useState(0);
  const [stipend, setStipend] = useState(0);
  const [offerRole, setOfferRole] = useState('');
  const [offerLocation, setOfferLocation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruiters/applications');
      setApplications(res.data.data.applications || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string, note = '') => {
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/recruiters/applications/${appId}/status`, { status, note });
      toast.success(`Application updated to ${status.replace('_', ' ')}!`);
      fetchApplications();
      setSelectedApp(res.data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmittingInterview(true);
    try {
      await api.post(`/recruiters/applications/${selectedApp._id}/interview`, {
        round: roundNum,
        type: roundType,
        scheduledAt,
        mode: interviewMode,
        meetingLink,
        location,
        interviewers: interviewers.split(',').map(i => i.trim()).filter(Boolean),
        duration
      });
      toast.success('Interview scheduled successfully!');
      setShowInterviewModal(false);
      fetchApplications();
      // Reload selected app details
      const detailRes = await api.get(`/applications/${selectedApp._id}`);
      setSelectedApp(detailRes.data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule interview');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleReleaseOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmittingOffer(true);
    try {
      const formData = new FormData();
      formData.append('ctc', String(ctc));
      if (stipend) formData.append('stipend', String(stipend));
      formData.append('role', offerRole);
      formData.append('location', offerLocation);
      if (joiningDate) formData.append('joiningDate', joiningDate);
      if (offerDeadline) formData.append('offerDeadline', offerDeadline);
      if (offerFile) formData.append('offerLetter', offerFile);

      await api.post(`/recruiters/applications/${selectedApp._id}/offer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Offer letter released successfully! 🎉');
      setShowOfferModal(false);
      fetchApplications();
      // Reload selected app
      const detailRes = await api.get(`/applications/${selectedApp._id}`);
      setSelectedApp(detailRes.data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to release offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAppClick = (app: Application) => {
    setSelectedApp(app);
    setOfferRole(app.job?.title || '');
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-1">Review student resumes, update status history, and schedule interviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Applications List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Submitted Profiles</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No applications submitted yet.
            </Card>
          ) : (
            <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-2">
              {applications.map(app => (
                <Card 
                  key={app._id} 
                  onClick={() => handleAppClick(app)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all ${
                    selectedApp?._id === app._id ? 'border-primary shadow-sm bg-primary/5' : 'border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-semibold shrink-0">
                      {app.student?.avatar ? (
                        <img src={app.student.avatar} alt={app.student.name} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        app.student?.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className="font-semibold text-sm truncate">{app.student?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.job?.title}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    app.status === 'applied' ? 'bg-primary/15 text-primary' :
                    app.status === 'under_review' ? 'bg-info/15 text-info' :
                    ['shortlisted', 'interview_scheduled'].includes(app.status) ? 'bg-warning/15 text-warning' :
                    ['selected', 'offer_released', 'offer_accepted'].includes(app.status) ? 'bg-success/15 text-success' : 
                    'bg-destructive/15 text-destructive'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Selected Application Details */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <Card className="p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-lg shrink-0 border border-border">
                    {selectedApp.student?.avatar ? (
                      <img src={selectedApp.student.avatar} alt={selectedApp.student.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      selectedApp.student?.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedApp.student?.name}</h2>
                    <p className="text-muted-foreground text-sm font-semibold mt-0.5">{selectedApp.job?.title} ({selectedApp.job?.type})</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedApp.status === 'applied' ? 'bg-primary/15 text-primary border border-primary/20' :
                    selectedApp.status === 'under_review' ? 'bg-info/15 text-info border border-info/20' :
                    ['shortlisted', 'interview_scheduled'].includes(selectedApp.status) ? 'bg-warning/15 text-warning border border-warning/20' :
                    ['selected', 'offer_released', 'offer_accepted'].includes(selectedApp.status) ? 'bg-success/15 text-success border border-success/20' : 
                    'bg-destructive/15 text-destructive border border-destructive/20'
                  }`}>
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                  {selectedApp.matchScore !== undefined && (
                    <span className="text-xs text-muted-foreground font-medium">Match: <span className="text-success font-bold">{selectedApp.matchScore}%</span></span>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <h3 className="font-bold text-sm mb-2 text-foreground/80">Candidate Statement / Cover Note</h3>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-4 border border-border/40 rounded-xl leading-relaxed">{selectedApp.coverLetter}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedApp.resume?.url && (
                  <a href={selectedApp.resume.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> View Resume</Button>
                  </a>
                )}

                {/* Status Transitions */}
                {selectedApp.status === 'applied' && (
                  <Button onClick={() => handleUpdateStatus(selectedApp._id, 'under_review', 'Reviewing resume')} disabled={updatingStatus}>
                    Mark Under Review
                  </Button>
                )}
                {['applied', 'under_review'].includes(selectedApp.status) && (
                  <>
                    <Button onClick={() => handleUpdateStatus(selectedApp._id, 'shortlisted', 'Candidate shortlisted')} disabled={updatingStatus}>
                      Shortlist Candidate
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleUpdateStatus(selectedApp._id, 'rejected', 'Application rejected')} disabled={updatingStatus}>
                      Reject
                    </Button>
                  </>
                )}
                {['shortlisted', 'interview_scheduled'].includes(selectedApp.status) && (
                  <>
                    <Button onClick={() => setShowInterviewModal(true)} disabled={updatingStatus}>
                      Schedule Interview Round
                    </Button>
                    <Button onClick={() => handleUpdateStatus(selectedApp._id, 'selected', 'Selected for offer release')} disabled={updatingStatus}>
                      Select for Offer
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleUpdateStatus(selectedApp._id, 'rejected', 'Interview process failed')} disabled={updatingStatus}>
                      Reject
                    </Button>
                  </>
                )}
                {selectedApp.status === 'selected' && (
                  <Button onClick={() => setShowOfferModal(true)} className="bg-success hover:bg-success/90 text-white gap-2">
                    <Award className="h-4 w-4" /> Release Offer Letter
                  </Button>
                )}
              </div>
              
              {/* Timeline Progress */}
              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-sm mb-4 text-foreground/80">Application Progress Timeline</h3>
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
            </Card>
          ) : (
            <Card className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
              <User className="h-10 w-10 text-muted-foreground/30" />
              <span>Select an application from the sidebar to review details and take actions.</span>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowInterviewModal(false)}><X className="h-5 w-5"/></button>

            <div>
              <h2 className="text-xl font-bold">Schedule Interview Round</h2>
              <p className="text-xs text-muted-foreground mt-1">For candidate: {selectedApp.student?.name}</p>
            </div>

            <form onSubmit={handleScheduleInterview} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Round Number</label>
                  <input type="number" min="1" value={roundNum} onChange={e => setRoundNum(Number(e.target.value))} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Round Type</label>
                  <select value={roundType} onChange={e => setRoundType(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                    <option value="technical">Technical</option>
                    <option value="coding">Coding Test</option>
                    <option value="gd">Group Discussion</option>
                    <option value="aptitude">Aptitude</option>
                    <option value="hr">HR Round</option>
                    <option value="final">Final Managerial</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Scheduled Date & Time</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Duration (Minutes)</label>
                  <input type="number" min="15" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Interview Mode</label>
                  <select value={interviewMode} onChange={e => setInterviewMode(e.target.value as any)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                    <option value="online">Online Video</option>
                    <option value="offline">On-site Offline</option>
                    <option value="phone">Phone call</option>
                  </select>
                </div>
              </div>

              {interviewMode === 'online' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Meeting Link (Zoom / Teams / Meet)</label>
                  <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="https://zoom.us/..." />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Office Address / Room Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Building 3, Floor 2, Room A" />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Interviewer Names (Comma separated)</label>
                <input type="text" value={interviewers} onChange={e => setInterviewers(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="E.g., John Smith, Alice Brown" />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingInterview}>
                  {submittingInterview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Schedule Round
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Release Offer Letter Modal */}
      {showOfferModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowOfferModal(false)}><X className="h-5 w-5"/></button>

            <div>
              <h2 className="text-xl font-bold">Release Offer Letter</h2>
              <p className="text-xs text-muted-foreground mt-1">For candidate: {selectedApp.student?.name}</p>
            </div>

            <form onSubmit={handleReleaseOffer} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Offered Role Title</label>
                  <input type="text" value={offerRole} onChange={e => setOfferRole(e.target.value)} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Office Location</label>
                  <input type="text" value={offerLocation} onChange={e => setOfferLocation(e.target.value)} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="E.g., Bangalore, India" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Annual CTC (INR)</label>
                  <input type="number" value={ctc} onChange={e => setCtc(Number(e.target.value))} required className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="E.g., 1200000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Monthly Internship Stipend (INR, optional)</label>
                  <input type="number" value={stipend} onChange={e => setStipend(Number(e.target.value))} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="E.g., 35000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Tentative Joining Date</label>
                  <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Offer Response Deadline</label>
                  <input type="date" value={offerDeadline} onChange={e => setOfferDeadline(e.target.value)} className="p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Upload Offer Letter PDF (optional)</label>
                <input type="file" accept="application/pdf" onChange={e => setOfferFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowOfferModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingOffer} className="bg-success hover:bg-success/90 text-white">
                  {submittingOffer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Release Offer
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
