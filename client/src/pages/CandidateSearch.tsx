import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, MapPin, Award, GraduationCap, FileText, Filter, Loader2, X, Briefcase } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface StudentProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rollNumber: string;
  department: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  backlogs: number;
  skills: Array<{ name: string; level: string }>;
  experience?: Array<{ title: string; company: string; description: string; startDate: string; endDate?: string }>;
  projects?: Array<{ name: string; description: string; githubUrl?: string }>;
  location?: string;
  bio?: string;
}

const CandidateSearch: React.FC = () => {
  const [candidates, setCandidates] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Filters State
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCGPA, setMinCGPA] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (paramsObj: any = {}) => {
    setLoading(true);
    try {
      // If skills search is provided, we use the search candidates endpoint
      let url = '/recruiters/candidates';
      const params: any = { ...paramsObj };
      
      if (branch) params.branch = branch;
      if (department) params.department = department;
      if (minCGPA) params.minCGPA = minCGPA;
      if (maxBacklogs) params.maxBacklogs = maxBacklogs;

      if (skillSearch) {
        url = '/recruiters/candidates/search';
        params.skills = skillSearch;
      }

      const res = await api.get(url, { params });
      
      // Candidate Search endpoint returns a flat array of profiles, getCandidates returns { candidates, total }
      const data = res.data.data;
      if (Array.isArray(data)) {
        setCandidates(data);
      } else {
        setCandidates(data.candidates || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleClearFilters = () => {
    setBranch('');
    setDepartment('');
    setMinCGPA('');
    setMaxBacklogs('');
    setSkillSearch('');
    fetchCandidates({ branch: '', department: '', minCGPA: '', maxBacklogs: '', skills: '' });
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Candidate Search</h1>
          <p className="text-muted-foreground mt-1">Browse student profiles, verify transcripts, and find talent using granular filtering.</p>
        </div>

        <form onSubmit={handleApplyFilters} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by required skills (comma separated)..." 
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
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
            {(branch || department || minCGPA || maxBacklogs || skillSearch) && (
              <Button type="button" variant="ghost" onClick={handleClearFilters}>Clear</Button>
            )}
          </div>

          {/* Granular Filters Dropdown */}
          {showFilters && (
            <Card className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Department</label>
                <input 
                  type="text" placeholder="E.g., Engineering" value={department} onChange={e => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Branch</label>
                <input 
                  type="text" placeholder="E.g., CSE / ECE" value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Min CGPA</label>
                <input 
                  type="number" step="0.1" placeholder="E.g., 8.0" value={minCGPA} onChange={e => setMinCGPA(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Max Active Backlogs</label>
                <input 
                  type="number" placeholder="E.g., 0" value={maxBacklogs} onChange={e => setMaxBacklogs(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </Card>
          )}
        </form>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm mt-2">Scanning candidate database...</p>
        </div>
      ) : candidates.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          No candidates matched your search criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(candidate => (
            <Card key={candidate._id} className="p-6 flex flex-col gap-4 hover-glow group transition-all cursor-pointer" onClick={() => setSelectedStudent(candidate)}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {candidate.user?.avatar ? (
                    <img src={candidate.user.avatar} alt={candidate.user.name} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    candidate.user?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-extrabold text-lg group-hover:text-primary transition-colors truncate">{candidate.user?.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{candidate.department} • {candidate.branch}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground/80 my-2">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>CGPA: {candidate.cgpa} / 10.0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Batch of {candidate.graduationYear}</span>
                </div>
                {candidate.location && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{candidate.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-auto">
                {candidate.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded font-bold capitalize">
                    {skill.name}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1 py-0.5">+{candidate.skills.length - 3}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSelectedStudent(null)}><X className="h-5 w-5"/></button>

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shrink-0">
                {selectedStudent.user?.avatar ? (
                  <img src={selectedStudent.user.avatar} alt={selectedStudent.user.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  selectedStudent.user?.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black">{selectedStudent.user?.name}</h2>
                <p className="text-muted-foreground text-sm font-semibold">{selectedStudent.department} — {selectedStudent.branch}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Roll No: {selectedStudent.rollNumber}</p>
              </div>
            </div>

            {/* Bio */}
            {selectedStudent.bio && (
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">About</h3>
                <p className="text-sm text-foreground/90 leading-relaxed">{selectedStudent.bio}</p>
              </div>
            )}

            {/* Academic stats */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Academic Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-muted/20 border border-border/40 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground">CGPA</span>
                  <p className="font-bold mt-0.5">{selectedStudent.cgpa} / 10.0</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Active Backlogs</span>
                  <p className="font-bold mt-0.5">{selectedStudent.backlogs}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Graduation Batch</span>
                  <p className="font-bold mt-0.5">{selectedStudent.graduationYear}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.skills.map((skill, idx) => (
                  <span key={idx} className="bg-primary/5 text-primary text-xs font-semibold px-2.5 py-1 rounded-md border border-primary/10 capitalize">
                    {skill.name} ({skill.level})
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            {selectedStudent.experience && selectedStudent.experience.length > 0 && (
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Work Experience</h3>
                <div className="flex flex-col gap-4">
                  {selectedStudent.experience.map((exp, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold">{exp.title} — <span className="text-muted-foreground font-semibold">{exp.company}</span></h4>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {new Date(exp.startDate).toLocaleDateString()} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                        </span>
                        {exp.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Academic & Personal Projects</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedStudent.projects.map((proj, idx) => (
                    <Card key={idx} className="p-4 border border-border/50 text-sm">
                      <h4 className="font-bold truncate">{proj.name}</h4>
                      {proj.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{proj.description}</p>}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold mt-3 inline-block">
                          View Code Repository
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">{selectedStudent.user?.email}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                <a href={`mailto:${selectedStudent.user?.email}`}>
                  <Button>Contact Candidate</Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
