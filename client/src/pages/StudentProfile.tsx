import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FileText, Edit2, Plus, UploadCloud, GraduationCap, MapPin, Loader2, Star, Trash2, Award, Trash } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'resume'>('personal');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  
  // Skills Tab States
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [savingSkill, setSavingSkill] = useState(false);

  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    location: '',
    linkedin: '',
    github: '',
    college: '',
    university: '',
    department: '',
    branch: '',
    cgpa: 0,
    tenthPercentage: 0,
    twelfthPercentage: 0,
    graduationYear: new Date().getFullYear() + 4
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
    if (activeTab === 'resume') {
      fetchResumes();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      const data = res.data.data;
      setProfile(data);
      setFormData({
        headline: data?.headline || '',
        bio: data?.bio || '',
        location: data?.location || '',
        linkedin: data?.socialLinks?.linkedin || '',
        github: data?.socialLinks?.github || '',
        college: data?.college || '',
        university: data?.university || '',
        department: data?.department || '',
        branch: data?.branch || '',
        cgpa: data?.cgpa || 0,
        tenthPercentage: data?.tenthPercentage || 0,
        twelfthPercentage: data?.twelfthPercentage || 0,
        graduationYear: data?.graduationYear || new Date().getFullYear() + 4
      });
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put('/students/profile', {
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github
        }
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEducation = async () => {
    setIsSaving(true);
    try {
      await api.put('/students/profile', {
        college: formData.college,
        university: formData.university,
        department: formData.department,
        branch: formData.branch,
        cgpa: Number(formData.cgpa),
        tenthPercentage: Number(formData.tenthPercentage),
        twelfthPercentage: Number(formData.twelfthPercentage),
        graduationYear: Number(formData.graduationYear)
      });
      toast.success('Education details updated successfully');
      setIsEditingEducation(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update education details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const currentSkills = profile?.skills || [];
    if (currentSkills.some((s: any) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error('Skill already exists!');
      return;
    }

    setSavingSkill(true);
    const updatedSkills = [...currentSkills, { name: newSkillName.trim(), level: newSkillLevel }];
    
    try {
      await api.put('/students/profile', { skills: updatedSkills });
      toast.success('Skill added!');
      setNewSkillName('');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add skill');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    const updatedSkills = (profile?.skills || []).filter((s: any) => s.name !== skillName);
    try {
      await api.put('/students/profile', { skills: updatedSkills });
      toast.success('Skill removed');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove skill');
    }
  };

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
      <Card className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden border border-border bg-card">
        <div className="relative group cursor-pointer">
          <div className="h-28 w-28 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
            <span className="text-4xl font-bold text-foreground">{user?.name.charAt(0) || 'S'}</span>
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="h-4 w-4" />
          </div>
        </div>
        
        <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left gap-2">
          <h1 className="text-3xl font-extrabold">{user?.name || 'Student Name'}</h1>
          <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-muted-foreground/80" /> {profile?.department || 'Department'} - {profile?.branch || 'Branch'}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">Batch of {profile?.graduationYear || new Date().getFullYear() + 4}</span>
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5"/> {profile?.location || 'Location Not Specified'}
            </span>
          </div>
        </div>
        
        <Button 
          className="shrink-0 gap-2 text-xs" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>} 
          {isUploading ? 'Uploading...' : 'Update Resume'}
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {['personal', 'education', 'skills', 'resume'].map((tab) => (
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
          <Card className="p-8 flex flex-col gap-6 bg-white dark:bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Personal Information</h2>
              {!isEditing ? (
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4"/> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" defaultValue={user?.name} disabled />
              <Input label="Email Address" defaultValue={user?.email} disabled />
              <Input 
                label="Headline" 
                value={formData.headline} 
                onChange={(e) => setFormData({...formData, headline: e.target.value})} 
                disabled={!isEditing} 
                className="md:col-span-2"
                placeholder="E.g., Aspiring Software Engineer | Competitive Programmer"
              />
              <Input 
                label="Bio" 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                disabled={!isEditing} 
                className="md:col-span-2"
              />
              <Input 
                label="Location" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                disabled={!isEditing} 
              />
              <Input 
                label="LinkedIn Profile" 
                value={formData.linkedin} 
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})} 
                disabled={!isEditing} 
              />
              <Input 
                label="GitHub Profile" 
                value={formData.github} 
                onChange={(e) => setFormData({...formData, github: e.target.value})} 
                disabled={!isEditing} 
              />
            </div>
          </Card>
        )}

        {activeTab === 'education' && (
          <Card className="p-8 flex flex-col gap-6 bg-white dark:bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Academic History</h2>
              {!isEditingEducation ? (
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsEditingEducation(true)}>
                  <Edit2 className="h-4 w-4"/> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingEducation(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveEducation} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="College" 
                value={formData.college} 
                onChange={(e) => setFormData({...formData, college: e.target.value})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="University" 
                value={formData.university} 
                onChange={(e) => setFormData({...formData, university: e.target.value})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Department" 
                value={formData.department} 
                onChange={(e) => setFormData({...formData, department: e.target.value})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Branch" 
                value={formData.branch} 
                onChange={(e) => setFormData({...formData, branch: e.target.value})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Current CGPA" 
                type="number"
                step="0.01"
                value={formData.cgpa} 
                onChange={(e) => setFormData({...formData, cgpa: parseFloat(e.target.value) || 0})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Graduation Year" 
                type="number"
                value={formData.graduationYear} 
                onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value) || 0})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Class 12th Percentage" 
                type="number"
                step="0.01"
                value={formData.twelfthPercentage} 
                onChange={(e) => setFormData({...formData, twelfthPercentage: parseFloat(e.target.value) || 0})} 
                disabled={!isEditingEducation} 
              />
              <Input 
                label="Class 10th Percentage" 
                type="number"
                step="0.01"
                value={formData.tenthPercentage} 
                onChange={(e) => setFormData({...formData, tenthPercentage: parseFloat(e.target.value) || 0})} 
                disabled={!isEditingEducation} 
              />
            </div>
          </Card>
        )}

        {activeTab === 'skills' && (
          <Card className="p-8 flex flex-col gap-6 bg-white dark:bg-card">
            <div>
              <h2 className="text-xl font-bold">Skills & Expertise</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage the technical capabilities displayed to companies.</p>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="E.g., React, TypeScript, Python..."
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="w-40">
                <select
                  value={newSkillLevel}
                  onChange={e => setNewSkillLevel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <Button type="submit" disabled={savingSkill}>Add</Button>
            </form>

            <div className="border-t border-border/50 pt-4 mt-2">
              <h3 className="font-semibold text-sm mb-3">Your Skills</h3>
              <div className="flex flex-wrap gap-2.5">
                {(profile?.skills || []).map((skill: any, idx: number) => (
                  <span 
                    key={idx} 
                    className="flex items-center gap-2 bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/10"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{skill.level}</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="text-primary hover:text-danger ml-1 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {(profile?.skills || []).length === 0 && (
                  <p className="text-xs text-muted-foreground">Add your first technical skill above.</p>
                )}
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
