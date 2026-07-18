import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FileText, Edit2, Plus, UploadCloud, GraduationCap, MapPin, Loader2, Star, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Resume {
  _id: string;
  name: string;
  url: string;
  isDefault: boolean;
  createdAt: string;
}

const StudentProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'resume'>('personal');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'resume') {
      fetchResumes();
    }
  }, [activeTab]);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/students/resumes');
      setResumes(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load resumes');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', file.name);

    try {
      await api.post('/students/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded successfully!');
      fetchResumes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume (Check Cloudinary config)');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const setDefaultResume = async (id: string) => {
    try {
      await api.put(`/students/resumes/${id}/default`);
      toast.success('Default resume updated');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to set default resume');
    }
  };

  const deleteResume = async (id: string) => {
    try {
      await api.delete(`/students/resumes/${id}`);
      toast.success('Resume deleted');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-10">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {/* Header Profile Card */}
      <Card className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative group cursor-pointer">
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-accent p-1">
            <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-black text-primary">{user?.name.charAt(0) || 'S'}</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="h-4 w-4" />
          </div>
        </div>
        
        <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left gap-2">
          <h1 className="text-3xl font-extrabold">{user?.name || 'Student Name'}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> B.Tech Computer Science & Engineering
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Batch of 2026</span>
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full flex items-center gap-1">
              <MapPin className="h-3 w-3" /> New Delhi, India
            </span>
          </div>
        </div>
        
        <Button 
          className="shrink-0 gap-2" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>} 
          {isUploading ? 'Uploading...' : 'Update Resume'}
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {['personal', 'education', 'resume'].map((tab) => (
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

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'personal' && (
          <Card className="p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <Button variant="ghost" size="sm" className="gap-2"><Edit2 className="h-4 w-4"/> Edit</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" defaultValue={user?.name} disabled />
              <Input label="Email Address" defaultValue={user?.email} disabled />
              <Input label="Phone Number" defaultValue="+91 9876543210" disabled />
              <Input label="Date of Birth" type="date" defaultValue="2002-05-15" disabled />
              <Input label="LinkedIn Profile" defaultValue="linkedin.com/in/rohit" disabled className="md:col-span-2" />
            </div>
          </Card>
        )}

        {activeTab === 'education' && (
          <Card className="p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Academic History</h2>
              <Button variant="outline" size="sm" className="gap-2"><Plus className="h-4 w-4"/> Add Details</Button>
            </div>
            
            <div className="flex flex-col gap-6 border-l-2 border-muted pl-6 ml-2">
              <div className="relative">
                <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background"></div>
                <h3 className="font-bold text-lg">B.Tech Computer Science</h3>
                <p className="text-sm font-semibold text-muted-foreground">University Institute of Technology</p>
                <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
                  <span>2022 - 2026</span>
                  <span>CGPA: 8.8 / 10.0</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-muted ring-4 ring-background"></div>
                <h3 className="font-bold text-lg">Senior Secondary (Class XII)</h3>
                <p className="text-sm font-semibold text-muted-foreground">Delhi Public School</p>
                <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
                  <span>2020 - 2022</span>
                  <span>Percentage: 92%</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-6 border-2 border-dashed border-muted hover:border-primary/50 transition-colors bg-muted/20 flex flex-col items-center justify-center gap-4 text-center cursor-pointer min-h-[250px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="font-bold">{isUploading ? 'Uploading...' : 'Upload New Resume'}</h3>
                <p className="text-xs text-muted-foreground mt-1">PDF format, max 5MB</p>
              </div>
            </Card>
            
            {resumes.map(resume => (
              <Card key={resume._id} className={`p-6 flex flex-col gap-4 min-h-[250px] relative ${resume.isDefault ? 'border-primary/50 shadow-md shadow-primary/5' : ''}`}>
                {resume.isDefault && (
                  <div className="absolute top-4 right-4 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" /> Default
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-sm truncate w-40 md:w-48" title={resume.name}>{resume.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Uploaded {new Date(resume.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <a href={resume.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full">View PDF</Button>
                  </a>
                  {!resume.isDefault && (
                    <Button onClick={() => setDefaultResume(resume._id)} className="flex-1">Set Default</Button>
                  )}
                  <Button variant="outline" className="px-3 text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => deleteResume(resume._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
