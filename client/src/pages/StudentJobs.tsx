import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Search, MapPin, Briefcase, DollarSign, Filter, ChevronRight, Building } from 'lucide-react';

const StudentJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const jobs = [
    {
      id: 1,
      title: 'Software Development Engineer',
      company: 'TechCorp Inc.',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: '₹12L - ₹15L',
      posted: '2 days ago',
      match: 94,
    },
    {
      id: 2,
      title: 'Frontend Developer Intern',
      company: 'Designify Studios',
      location: 'Remote',
      type: 'Internship',
      salary: '₹40k / month',
      posted: '5 hours ago',
      match: 88,
    },
    {
      id: 3,
      title: 'Data Analyst',
      company: 'FinServe Global',
      location: 'Mumbai, India',
      type: 'Full-time',
      salary: '₹10L - ₹12L',
      posted: '1 week ago',
      match: 76,
    },
    {
      id: 4,
      title: 'Backend Engineer',
      company: 'CloudWorks',
      location: 'Hyderabad, India',
      type: 'Full-time',
      salary: '₹14L - ₹18L',
      posted: '3 days ago',
      match: 91,
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header and Search */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Discover Opportunities</h1>
          <p className="text-muted-foreground mt-1">Find and apply to jobs that match your skills.</p>
        </div>
        
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
          <Button variant="outline" className="gap-2 h-auto py-3 px-6"><Filter className="h-4 w-4"/> Filters</Button>
          <Button className="h-auto py-3 px-8">Search</Button>
        </div>
      </div>

      {/* Recommended Jobs Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">Recommended for You <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">New</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="p-6 flex flex-col gap-5 hover-glow group cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xl">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mt-1">
                      <Building className="h-3.5 w-3.5" /> {job.company}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                  <MapPin className="h-3 w-3" /> {job.location}
                </span>
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                  <Briefcase className="h-3 w-3" /> {job.type}
                </span>
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold flex items-center gap-1 text-foreground">
                  <DollarSign className="h-3 w-3" /> {job.salary}
                </span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                    <span className="text-xs font-bold text-success">{job.match}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Match Score</span>
                </div>
                <Button size="sm" className="gap-1 rounded-full px-5">Apply <ChevronRight className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentJobs;
