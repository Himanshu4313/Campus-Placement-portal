import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Briefcase, ChevronRight, Search, Filter, ExternalLink } from 'lucide-react';

const StudentApplications: React.FC = () => {
  const applications = [
    {
      id: 1,
      role: 'Software Development Engineer',
      company: 'TechCorp Inc.',
      date: 'Oct 12, 2026',
      status: 'shortlisted',
      stage: 'Technical Round 1',
    },
    {
      id: 2,
      role: 'Frontend Developer Intern',
      company: 'Designify Studios',
      date: 'Oct 10, 2026',
      status: 'applied',
      stage: 'Resume Screening',
    },
    {
      id: 3,
      role: 'Backend Engineer',
      company: 'CloudWorks',
      date: 'Sep 28, 2026',
      status: 'selected',
      stage: 'Offer Released',
    },
    {
      id: 4,
      role: 'Data Analyst',
      company: 'FinServe Global',
      date: 'Sep 15, 2026',
      status: 'rejected',
      stage: 'Aptitude Test',
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of all your job applications in one place.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none w-48 lg:w-64"
            />
          </div>
          <Button variant="outline" className="gap-2 px-3"><Filter className="h-4 w-4" /> Filter</Button>
        </div>
      </div>

      {/* Applications Table Card */}
      <Card className="overflow-hidden border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Company & Role</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center font-bold text-primary">
                        {app.company.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{app.role}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{app.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                    {app.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-foreground font-medium">{app.stage}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      app.status === 'applied' ? 'bg-primary/10 text-primary border border-primary/20' :
                      app.status === 'shortlisted' ? 'bg-warning/10 text-warning border border-warning/20' :
                      app.status === 'selected' ? 'bg-success/10 text-success border border-success/20' : 
                      'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
            <Briefcase className="h-12 w-12 text-muted-foreground/40" />
            <span className="text-lg font-bold text-muted-foreground">No applications found</span>
            <p className="text-sm text-muted-foreground">You haven't applied to any jobs yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentApplications;
