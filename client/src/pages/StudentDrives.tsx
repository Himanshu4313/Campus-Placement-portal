import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, MapPin, Building, ArrowRight, Loader2, X, AlertCircle, Info, Award } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PlacementDrive {
  _id: string;
  title: string;
  description?: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  schedule: {
    registrationStart: string;
    registrationEnd: string;
    driveDate: string;
  };
  venue?: string;
  mode: string;
  meetingLink?: string;
  registeredStudents: string[];
  eligibility?: {
    minCGPA?: number;
    maxBacklogs?: number;
    branches?: string[];
    departments?: string[];
  };
  rounds?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  status: string;
}

const StudentDrives: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/drives');
      setDrives(res.data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load placement drives');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (driveId: string) => {
    setRegisteringId(driveId);
    try {
      await api.post(`/students/drives/${driveId}/register`);
      toast.success('Successfully registered for the placement drive!');
      fetchDrives();
      if (selectedDrive?._id === driveId) {
        const currentUserId = (user as any)?.id || (user as any)?._id || '';
        setSelectedDrive((prev) => prev ? { ...prev, registeredStudents: [...prev.registeredStudents, currentUserId] } : null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to register for placement drive');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Placement Drives</h1>
          <p className="text-muted-foreground mt-1">Register for upcoming campus recruitment events.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Fetching placement drives...</p>
        </div>
      ) : drives.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-bold text-lg">No Placement Drives</h3>
          <p className="text-muted-foreground max-w-md text-sm">There are no active or upcoming placement drives registered on the platform at the moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drives.map(drive => {
            const isRegistered = drive.registeredStudents.includes((user as any)?.id || (user as any)?._id || '');
            const isRegOpen = drive.status === 'registration_open';
            
            return (
              <Card key={drive._id} className="p-0 overflow-hidden flex flex-col group border border-border bg-card hover:shadow-md transition-all duration-200">
                <div className="bg-muted/30 p-6 border-b border-border/60">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      drive.status === 'registration_open' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {drive.status.replace('_', ' ')}
                    </span>
                    {isRegistered && (
                      <span className="text-[10px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded">
                        Registered
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{drive.title}</h3>
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Building className="h-4 w-4 text-muted-foreground/80" /> {drive.company?.name || 'Various Companies'}
                  </p>
                </div>
                
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase">Date & Time</span>
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" /> 
                        {new Date(drive.schedule.driveDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase">Venue / Mode</span>
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" /> 
                        {drive.venue || 'Virtual'} ({drive.mode})
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex gap-3">
                    {isRegistered ? (
                      <Button className="flex-1" variant="outline" disabled>
                        Already Registered
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1" 
                        disabled={!isRegOpen || registeringId !== null}
                        onClick={() => handleRegister(drive._id)}
                      >
                        {registeringId === drive._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isRegOpen ? 'Register Now' : 'Registration Closed'}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="px-4"
                      onClick={() => setSelectedDrive(drive)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drive Details Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-8 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSelectedDrive(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {selectedDrive.company?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedDrive.status === 'registration_open' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedDrive.status.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-bold leading-tight mt-1">{selectedDrive.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedDrive.company?.name}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-border py-4 my-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">Drive Date</span>
                <p className="font-semibold mt-0.5">{new Date(selectedDrive.schedule.driveDate).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">Venue / Mode</span>
                <p className="font-semibold mt-0.5">{selectedDrive.venue || 'Virtual'} ({selectedDrive.mode})</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">Registration Opens</span>
                <p className="font-semibold mt-0.5">{new Date(selectedDrive.schedule.registrationStart).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">Registration Closes</span>
                <p className="font-semibold mt-0.5">{new Date(selectedDrive.schedule.registrationEnd).toLocaleString()}</p>
              </div>
            </div>

            {/* Eligibility Requirements */}
            {selectedDrive.eligibility && (
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" /> Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/20 border border-border/40 rounded-xl text-sm">
                  {selectedDrive.eligibility.minCGPA !== undefined && (
                    <div>
                      <span className="text-xs text-muted-foreground">Min CGPA Required</span>
                      <p className="font-semibold mt-0.5">{selectedDrive.eligibility.minCGPA}</p>
                    </div>
                  )}
                  {selectedDrive.eligibility.maxBacklogs !== undefined && (
                    <div>
                      <span className="text-xs text-muted-foreground">Max Backlogs Allowed</span>
                      <p className="font-semibold mt-0.5">{selectedDrive.eligibility.maxBacklogs}</p>
                    </div>
                  )}
                  {selectedDrive.eligibility.branches && selectedDrive.eligibility.branches.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-xs text-muted-foreground">Eligible Branches</span>
                      <p className="font-semibold mt-0.5 capitalize">{selectedDrive.eligibility.branches.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedDrive.description && (
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-primary" /> About the Drive
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedDrive.description}</p>
              </div>
            )}

            {/* Round Details */}
            {selectedDrive.rounds && selectedDrive.rounds.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-foreground">Drive Process / Rounds</h3>
                <div className="flex flex-col gap-2">
                  {selectedDrive.rounds.map((round, idx) => (
                    <div key={idx} className="p-3 bg-muted/10 border border-border/30 rounded-lg text-sm flex justify-between items-center">
                      <div>
                        <span className="font-bold capitalize">{round.name}</span>
                        {round.description && <p className="text-xs text-muted-foreground mt-0.5">{round.description}</p>}
                      </div>
                      <span className="text-xs font-semibold capitalize bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {round.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedDrive(null)}>Close</Button>
              {selectedDrive.registeredStudents.includes((user as any)?.id || (user as any)?._id || '') ? (
                <Button variant="outline" disabled>Already Registered</Button>
              ) : (
                <Button 
                  disabled={selectedDrive.status !== 'registration_open' || registeringId !== null}
                  onClick={() => handleRegister(selectedDrive._id)}
                >
                  {registeringId === selectedDrive._id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {selectedDrive.status === 'registration_open' ? 'Register Now' : 'Registration Closed'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentDrives;
