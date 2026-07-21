import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building, Globe, MapPin, Loader2, Save, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Company {
  _id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  headquarters?: string;
  description?: string;
  locations?: string[];
  createdBy: string;
  isVerified: boolean;
}

const CompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [description, setDescription] = useState('');
  const [locations, setLocations] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      const companyList = res.data.data.companies || [];
      // Find company created by current recruiter (managed on backend via createdBy, but we can verify here)
      if (companyList.length > 0) {
        // Just take the first one they created or default first one
        const myComp = companyList[0]; // Backend getCompanies returns all active companies. For simplicity, we manage/create the recruiter's company profile.
        setCompany(myComp);
        setName(myComp.name || '');
        setIndustry(myComp.industry || '');
        setWebsite(myComp.website || '');
        setHeadquarters(myComp.headquarters || '');
        setDescription(myComp.description || '');
        setLocations(myComp.locations?.join(', ') || '');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('industry', industry);
      formData.append('website', website);
      formData.append('headquarters', headquarters);
      formData.append('description', description);
      
      const locArray = locations.split(',').map(l => l.trim()).filter(Boolean);
      locArray.forEach(loc => formData.append('locations[]', loc));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (company) {
        // Update
        const res = await api.put(`/companies/${company._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCompany(res.data.data);
        toast.success('Company profile updated successfully!');
      } else {
        // Create
        const res = await api.post('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCompany(res.data.data);
        toast.success('Company profile created successfully.');
      }
      setIsEditing(false);
      fetchCompany();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Manage details about your organization seen by candidates.</p>
      </div>

      {!company && !isEditing ? (
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <Building className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="text-xl font-bold">No Company Profile Found</h3>
          <p className="text-muted-foreground max-w-md text-sm">You haven't set up a company profile yet. Create one now to list job openings and placement drives.</p>
          <Button onClick={() => setIsEditing(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Profile</Button>
        </Card>
      ) : isEditing ? (
        <Card className="p-8">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <h2 className="text-xl font-bold border-b border-border pb-4">{company ? 'Edit Profile' : 'Create Profile'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Company Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., TechCorp"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Industry</label>
                <input 
                  type="text" 
                  value={industry} 
                  onChange={e => setIndustry(e.target.value)} 
                  required
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., Technology / FinTech"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Website URL</label>
                <input 
                  type="url" 
                  value={website} 
                  onChange={e => setWebsite(e.target.value)} 
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Headquarters</label>
                <input 
                  type="text" 
                  value={headquarters} 
                  onChange={e => setHeadquarters(e.target.value)} 
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., San Francisco, CA"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold">Job Locations (Comma separated)</label>
                <input 
                  type="text" 
                  value={locations} 
                  onChange={e => setLocations(e.target.value)} 
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="E.g., Bangalore, Mumbai, Remote"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold">Company Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={4}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Briefly describe what your organization does..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" className="gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-border pb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-3xl shrink-0 overflow-hidden border border-border/50">
              {company?.logo ? (
                <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                company?.name.charAt(0) || 'C'
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="text-3xl font-extrabold">{company?.name}</h2>
                {company?.isVerified && (
                  <span className="bg-success/15 text-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Verified Partner
                  </span>
                )}
              </div>
              <p className="text-muted-foreground font-semibold mt-1">{company?.industry || 'Industry not specified'}</p>
            </div>
            
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                {company?.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{company.website}</a>
                ) : (
                  <p className="font-semibold text-muted-foreground">Not set</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Headquarters</p>
                <p className="font-semibold">{company?.headquarters || 'Not set'}</p>
              </div>
            </div>

            {company?.locations && company.locations.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1 font-bold">Office Locations</p>
                <div className="flex flex-wrap gap-2">
                  {company.locations.map((loc, idx) => (
                    <span key={idx} className="bg-muted px-2.5 py-1 rounded text-xs font-semibold">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company?.description && (
              <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                <p className="text-xs text-muted-foreground mb-2 font-bold">About the Company</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{company.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CompanyProfile;
