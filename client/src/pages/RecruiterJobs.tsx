import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, MapPin, DollarSign, Plus, Edit2, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  type: string;
  workMode: string;
  location: string;
  status: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  description: string;
  eligibility?: {
    minCGPA?: number;
    maxBacklogs?: number;
  };
  openings: number;
  category: string;
}

interface Company {
  _id: string;
  name: string;
}

const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('full-time');
  const [workMode, setWorkMode] = useState('on-site');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState(0);
  const [maxSalary, setMaxSalary] = useState(0);
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [minCGPA, setMinCGPA] = useState(0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [openings, setOpenings] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('published');

  useEffect(() => {
    fetchCompanyAndJobs();
  }, []);

  const fetchCompanyAndJobs = async () => {
    setLoading(true);
    try {
      // 1. Fetch Company
      const compRes = await api.get('/companies');
      const companyList = compRes.data.data.companies || [];
      if (companyList.length > 0) {
        setCompany(companyList[0]);
      }

      // 2. Fetch Jobs
      const jobsRes = await api.get('/recruiters/jobs');
      setJobs(jobsRes.data.data.jobs || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      toast.error('You must set up your Company Profile first before posting a job.');
      return;
    }

    setSaving(true);
    const jobPayload = {
      title,
      company: company._id,
      description,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      type,
      workMode,
      location,
      salary: {
        min: Number(minSalary),
        max: Number(maxSalary),
        currency: 'INR',
        period: 'annual'
      },
      eligibility: {
        minCGPA: Number(minCGPA),
        maxBacklogs: Number(maxBacklogs)
      },
      openings: Number(openings),
      category,
      status
    };

    try {
      if (editingJob) {
        // Edit
        await api.put(`/jobs/${editingJob._id}`, jobPayload);
        toast.success('Job posting updated successfully!');
      } else {
        // Create
        await api.post('/jobs', jobPayload);
        toast.success('Job posting created successfully!');
      }
      setIsEditing(false);
      setEditingJob(null);
      resetForm();
      fetchCompanyAndJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setType(job.type);
    setWorkMode(job.workMode);
    setLocation(job.location);
    setMinSalary(job.salary.min);
    setMaxSalary(job.salary.max);
    setSkills(job.skills.join(', '));
    setDescription(job.description);
    setMinCGPA(job.eligibility?.minCGPA || 0);
    setMaxBacklogs(job.eligibility?.maxBacklogs || 0);
    setOpenings(job.openings);
    setCategory(job.category);
    setStatus(job.status);
    setIsEditing(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchCompanyAndJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete job');
    }
  };

  const resetForm = () => {
    setTitle('');
    setType('full-time');
    setWorkMode('on-site');
    setLocation('');
    setMinSalary(0);
    setMaxSalary(0);
    setSkills('');
    setDescription('');
    setMinCGPA(0);
    setMaxBacklogs(0);
    setOpenings(1);
    setCategory('');
    setStatus('published');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1">Post new hiring openings and view status of current postings.</p>
        </div>
        {!isEditing && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              resetForm();
              setEditingJob(null);
              setIsEditing(true);
            }}
          >
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        )}
      </div>

      {!company && (
        <Card className="p-4 border border-warning/30 bg-warning/5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-warning">Company Profile Needed</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Please set up your Company Profile before listing any jobs, so candidates can view details about your company.</p>
          </div>
        </Card>
      )}

      {isEditing ? (
        <Card className="p-8">
          <form onSubmit={handleCreateOrEdit} className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-bold">{editingJob ? 'Edit Job Posting' : 'Post a New Job'}</h2>
              <button type="button" onClick={() => setIsEditing(false)}><X className="h-5 w-5 text-muted-foreground hover:text-foreground"/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Job Title</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., Software Development Engineer"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Category</label>
                <input 
                  type="text" value={category} onChange={e => setCategory(e.target.value)} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., Tech / Finance / Marketing"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Job Type</label>
                <select 
                  value={type} onChange={e => setType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Work Mode</label>
                <select 
                  value={workMode} onChange={e => setWorkMode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Location</label>
                <input 
                  type="text" value={location} onChange={e => setLocation(e.target.value)} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., Bangalore, India"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Openings Available</label>
                <input 
                  type="number" min="1" value={openings} onChange={e => setOpenings(Number(e.target.value))} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Min Annual Salary (INR)</label>
                <input 
                  type="number" value={minSalary} onChange={e => setMinSalary(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., 800000"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Max Annual Salary (INR)</label>
                <input 
                  type="number" value={maxSalary} onChange={e => setMaxSalary(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., 1200000"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Minimum CGPA Required</label>
                <input 
                  type="number" step="0.01" min="0" max="10" value={minCGPA} onChange={e => setMinCGPA(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., 7.5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Max Backlogs Allowed</label>
                <input 
                  type="number" min="0" value={maxBacklogs} onChange={e => setMaxBacklogs(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., 0"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold">Required Skills (Comma separated)</label>
                <input 
                  type="text" value={skills} onChange={e => setSkills(e.target.value)} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., React, Node.js, Express, MongoDB"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold">Job Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)} rows={5} required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Provide responsibilities, requirements, and information about the role..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Publish Status</label>
                <select 
                  value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Job
              </Button>
            </div>
          </form>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <Briefcase className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-bold text-lg">No Jobs Posted Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">Click "Post New Job" to start listing career opportunities for students.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job._id} className="p-6 flex flex-col gap-4 relative">
              <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                job.status === 'published' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {job.status}
              </span>

              <div>
                <h3 className="font-extrabold text-xl line-clamp-1 pr-14">{job.title}</h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">{job.category}</p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-foreground/80 my-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{job.location} ({job.workMode})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{job.type} • {job.openings} Openings</span>
                </div>
                {job.salary && (job.salary.min || job.salary.max) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L LPA</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-auto">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded font-semibold">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-semibold px-1 py-0.5">+{job.skills.length - 3}</span>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-border/50 pt-4 mt-2">
                <Button size="sm" variant="outline" className="px-3" onClick={() => handleEditClick(job)}>
                  <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button size="sm" variant="outline" className="px-3 border-destructive/20 hover:bg-destructive/10" onClick={() => handleDelete(job._id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
