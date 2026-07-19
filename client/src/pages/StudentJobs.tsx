import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, MapPin, Briefcase, DollarSign, Filter, ChevronRight, Building, Loader2, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  workMode?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  skills?: string[];
  description?: string;
  eligibility?: {
    minCGPA?: number;
    maxBacklogs?: number;
  };
}

interface Resume {
  _id: string;
  name: string;
  isDefault: boolean;
}

const StudentJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarked_jobs') || '[]');
    } catch {
      return [];
    }
  });
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  
  // Filter States
  const [selectedType, setSelectedType] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Application Modal States
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const toggleBookmark = (jobId: string) => {
    const updated = bookmarks.includes(jobId)
      ? bookmarks.filter(id => id !== jobId)
      : [...bookmarks, jobId];
    setBookmarks(updated);
    localStorage.setItem('bookmarked_jobs', JSON.stringify(updated));
    toast.success(bookmarks.includes(jobId) ? 'Job removed from bookmarks' : 'Job bookmarked!');
  };

  const fetchJobs = async (search = searchQuery, type = selectedType, workMode = selectedWorkMode, loc = locationQuery) => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (workMode) params.workMode = workMode;
      if (loc) params.location = loc;

      const res = await api.get('/jobs', { params });
      setJobs(res.data.data.jobs || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get('/students/resumes');
      const resumeList = res.data.data || [];
      setResumes(resumeList);
      
      // Auto-select default resume
      const defaultRes = resumeList.find((r: Resume) => r.isDefault);
      if (defaultRes) {
        setSelectedResumeId(defaultRes._id);
      } else if (resumeList.length > 0) {
        setSelectedResumeId(resumeList[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch resumes', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApplyClick = (job: Job) => {
    if (resumes.length === 0) {
      toast.error('Please upload a resume in your profile page first before applying.');
      return;
    }
    setApplyingJob(job);
  };

  const submitApplication = async () => {
    if (!applyingJob) return;
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${applyingJob._id}/apply`, {
        resumeId: selectedResumeId,
        coverLetter
      });
      toast.success(`Applied to ${applyingJob.title} successfully!`);
      setApplyingJob(null);
      setCoverLetter('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side filter for Bookmarks
  const displayedJobs = filterBookmarkedOnly
    ? jobs.filter(job => bookmarks.includes(job._id))
    : jobs;

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header and Search */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Discover Opportunities</h1>
          <p className="text-muted-foreground mt-1">Find and apply to jobs that match your skills.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by job title, company, or keywords..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="button"
              variant="outline" 
              className={`gap-2 h-auto py-3 px-6 ${showFilters ? 'bg-primary/10 text-primary border-primary' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4"/> Filters
            </Button>
            <Button type="submit" className="h-auto py-3 px-8">Search</Button>
          </div>

          {/* Filters Area */}
          {showFilters && (
            <Card className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Job Type</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    fetchJobs(searchQuery, e.target.value, selectedWorkMode, locationQuery);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Work Mode</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={selectedWorkMode}
                  onChange={(e) => {
                    setSelectedWorkMode(e.target.value);
                    fetchJobs(searchQuery, selectedType, e.target.value, locationQuery);
                  }}
                >
                  <option value="">All Modes</option>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Location</label>
                <input 
                  type="text"
                  placeholder="E.g., Bangalore, Delhi"
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchJobs(searchQuery, selectedType, selectedWorkMode, locationQuery);
                    }
                  }}
                />
              </div>

              <div className="flex flex-col justify-center gap-2">
                <label className="text-sm font-semibold">Saved Opportunities</label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer mt-1">
                  <input 
                    type="checkbox"
                    checked={filterBookmarkedOnly}
                    onChange={(e) => setFilterBookmarkedOnly(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Show Bookmarked Only</span>
                </label>
              </div>
            </Card>
          )}
        </form>
      </div>

      {/* Recommended Jobs Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Available Jobs 
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {displayedJobs.length} Opportunities
          </span>
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Fetching job listings...</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-bold text-lg">No Jobs Found</h3>
            <p className="text-muted-foreground max-w-md text-sm">We couldn't find any job opportunities matching your criteria. Try adjusting your search query or filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedJobs.map(job => (
              <Card key={job._id} className="p-6 flex flex-col gap-5 border border-border bg-card hover:shadow-md hover:border-border-hover transition-all duration-200 group cursor-pointer relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-primary/10">
                      {job.company?.name?.charAt(0) || 'J'}
                    </div>
                    <div className="overflow-hidden w-full pr-8">
                      <h3 className="font-bold text-base leading-tight text-foreground transition-colors group-hover:text-primary truncate" title={job.title}>
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-1.5 truncate">
                        <Building className="h-3.5 w-3.5 text-muted-foreground/80" /> {job.company?.name || 'Unknown Company'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bookmark Button */}
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(job._id);
                    }}
                    className="absolute top-6 right-6 text-muted-foreground hover:text-warning transition-colors"
                  >
                    <svg 
                      className={`h-5 w-5 ${bookmarks.includes(job._id) ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                    <Briefcase className="h-3 w-3" /> {job.type} {job.workMode ? `(${job.workMode})` : ''}
                  </span>
                  {job.salary && (job.salary.min || job.salary.max) && (
                    <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                      <DollarSign className="h-3 w-3" /> 
                      {job.salary.min ? `${job.salary.min / 100000}L` : ''}
                      {job.salary.min && job.salary.max ? ' - ' : ''}
                      {job.salary.max ? `${job.salary.max / 100000}L` : ''} LPA
                    </span>
                  )}
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded font-semibold">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {job.eligibility?.minCGPA && (
                      <div>Min CGPA: <span className="font-semibold text-foreground">{job.eligibility.minCGPA}</span></div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-1 rounded-full px-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyClick(job);
                    }}
                  >
                    Apply <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <button 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setApplyingJob(null)}
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold">Apply for {applyingJob.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{applyingJob.company?.name}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Select Resume</label>
                <select 
                  className="w-full p-3 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.name} {r.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Cover Letter / Note (Optional)</label>
                <textarea 
                  placeholder="Briefly explain why you are a good fit for this role..." 
                  className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setApplyingJob(null)}>Cancel</Button>
              <Button onClick={submitApplication} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
