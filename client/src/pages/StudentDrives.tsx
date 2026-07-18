import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, MapPin, Users, Building, ArrowRight } from 'lucide-react';

const StudentDrives: React.FC = () => {
  const drives = [
    {
      id: 1,
      title: 'Mega Tech Hiring Drive 2026',
      companies: ['Google', 'Microsoft', 'Amazon', '+12 more'],
      date: 'November 15, 2026',
      venue: 'Main University Auditorium',
      eligible: true,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'FinTech Startup Showcase',
      companies: ['Stripe', 'Razorpay', 'Zerodha'],
      date: 'December 05, 2026',
      venue: 'Virtual (Zoom)',
      eligible: true,
      status: 'registering'
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Placement Drives</h1>
          <p className="text-muted-foreground mt-1">Register for upcoming campus recruitment events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {drives.map(drive => (
          <Card key={drive.id} className="p-0 overflow-hidden flex flex-col group">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 border-b border-border">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  drive.status === 'upcoming' ? 'bg-background/50 text-foreground' : 'bg-primary text-white'
                }`}>
                  {drive.status}
                </span>
                {drive.eligible && (
                  <span className="text-xs font-bold text-success bg-success/20 px-2 py-1 rounded">You are eligible</span>
                )}
              </div>
              <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{drive.title}</h3>
              <p className="text-sm font-medium flex items-center gap-1.5 text-foreground/80">
                <Building className="h-4 w-4" /> {drive.companies.join(', ')}
              </p>
            </div>
            
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase">Date & Time</span>
                  <span className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {drive.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase">Venue</span>
                  <span className="text-sm font-medium flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {drive.venue}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex gap-3">
                <Button className="flex-1">Register Now</Button>
                <Button variant="outline" className="px-4"><ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentDrives;
