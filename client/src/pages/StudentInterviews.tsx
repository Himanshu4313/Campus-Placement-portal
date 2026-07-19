import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Clock, Video, Users, AlertCircle, Loader2, MapPin, PhoneCall } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface InterviewItem {
  applicationId: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  round: number;
  type: string;
  scheduledAt: string;
  mode: 'online' | 'offline' | 'phone';
  meetingLink?: string;
  location?: string;
  interviewers: string[];
}

const StudentInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/applications');
      const applications = res.data.data.applications || [];
      
      const extractedInterviews: InterviewItem[] = [];
      
      applications.forEach((app: any) => {
        if (app.interviewRounds && app.interviewRounds.length > 0) {
          app.interviewRounds.forEach((round: any) => {
            // Only show rounds that have a scheduled date and are not completed or failed
            if (round.scheduledAt && round.result === 'pending') {
              extractedInterviews.push({
                applicationId: app._id,
                companyName: app.job?.company?.name || 'Unknown Company',
                companyLogo: app.job?.company?.logo,
                jobTitle: app.job?.title || 'Unknown Role',
                round: round.round,
                type: round.type,
                scheduledAt: round.scheduledAt,
                mode: round.mode,
                meetingLink: round.meetingLink,
                location: round.location,
                interviewers: round.interviewers || [],
              });
            }
          });
        }
      });

      // Sort by scheduled date (soonest first)
      extractedInterviews.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      
      setInterviews(extractedInterviews);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch interview schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleClick = () => {
    toast.error('To reschedule this interview, please contact your Placement Officer or reach out to the recruiter directly.');
  };

  // Helper to format date
  const formatInterviewDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[d.getMonth()],
      day: d.getDate(),
      year: d.getFullYear(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming interview schedules.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading interview schedules...</p>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-bold text-lg">No Upcoming Interviews</h3>
          <p className="text-muted-foreground max-w-md text-sm">You don't have any scheduled interviews at this moment. You will see scheduled rounds here once a recruiter shortlists you.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {interviews.map((interview, index) => {
            const dateObj = formatInterviewDate(interview.scheduledAt);
            
            return (
              <Card key={index} className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-primary">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-2xl min-w-[140px] text-center shrink-0">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">{dateObj.month}</span>
                  <span className="text-4xl font-black text-primary my-1">{dateObj.day}</span>
                  <span className="text-xs font-semibold text-primary/80">{dateObj.year}</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 text-center md:text-left min-w-0">
                  <div className="overflow-hidden">
                    <h3 className="text-2xl font-black text-foreground truncate">{interview.companyName}</h3>
                    <p className="text-lg font-semibold text-muted-foreground capitalize">
                      Round {interview.round}: {interview.type.replace('_', ' ')} • {interview.jobTitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-md">
                      <Clock className="h-4 w-4 text-primary animate-pulse" /> {dateObj.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-md capitalize">
                      {interview.mode === 'online' ? (
                        <><Video className="h-4 w-4 text-primary" /> Online</>
                      ) : interview.mode === 'phone' ? (
                        <><PhoneCall className="h-4 w-4 text-primary" /> Phone Interview</>
                      ) : (
                        <><MapPin className="h-4 w-4 text-primary" /> {interview.location || 'On-site'}</>
                      )}
                    </span>
                    {interview.interviewers.length > 0 && (
                      <span className="flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-md truncate max-w-xs" title={interview.interviewers.join(', ')}>
                        <Users className="h-4 w-4 text-primary" /> {interview.interviewers.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
                  {interview.mode === 'online' && interview.meetingLink ? (
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full gap-2 px-8 py-4"><Video className="h-5 w-5"/> Join Meeting</Button>
                    </a>
                  ) : interview.mode === 'online' ? (
                    <Button className="w-full gap-2 px-8 py-4" disabled><Video className="h-5 w-5"/> Link Pending</Button>
                  ) : null}
                  <Button variant="outline" className="w-full" onClick={handleRescheduleClick}>Reschedule</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentInterviews;
