import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar as CalendarIcon, Clock, Video, Users } from 'lucide-react';

const StudentInterviews: React.FC = () => {
  const interviews = [
    {
      id: 1,
      company: 'TechCorp Inc.',
      role: 'Software Development Engineer',
      type: 'Technical Round 1',
      date: 'Oct 25, 2026',
      time: '10:00 AM - 11:00 AM',
      interviewer: 'Rahul Sharma (Sr. Engineer)',
      link: 'https://zoom.us/j/123456789'
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming interview schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {interviews.map(interview => (
          <Card key={interview.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-primary">
            <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-2xl min-w-[140px]">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">{interview.date.split(' ')[0]}</span>
              <span className="text-4xl font-black text-primary my-1">{interview.date.split(' ')[1].replace(',', '')}</span>
              <span className="text-xs font-semibold text-primary/80">{interview.date.split(' ')[2]}</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-black text-foreground">{interview.company}</h3>
                <p className="text-lg font-semibold text-muted-foreground">{interview.type} • {interview.role}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-md">
                  <Clock className="h-4 w-4 text-primary" /> {interview.time}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-md">
                  <Users className="h-4 w-4 text-primary" /> {interview.interviewer}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
              <Button className="w-full gap-2 px-8 py-6"><Video className="h-5 w-5"/> Join Meeting</Button>
              <Button variant="outline" className="w-full">Reschedule</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentInterviews;
