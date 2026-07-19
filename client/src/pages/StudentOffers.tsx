import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Award, DollarSign, Calendar, Download, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Offer {
  _id: string;
  role: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  job: {
    _id: string;
    title: string;
  };
  ctc: number;
  stipend?: number;
  location: string;
  offerDeadline?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  offerLetterUrl?: string;
}

const StudentOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      setOffers(res.data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (offerId: string, status: 'accepted' | 'rejected') => {
    let rejectionReason = '';
    if (status === 'rejected') {
      const reason = prompt('Please enter the reason for declining this offer:');
      if (reason === null) return; // User cancelled prompt
      rejectionReason = reason;
    } else {
      if (!window.confirm('Are you sure you want to accept this offer? Once accepted, other applications might be affected.')) {
        return;
      }
    }

    setProcessingId(offerId);
    try {
      await api.put(`/offers/${offerId}/status`, { status, rejectionReason });
      toast.success(`Offer ${status} successfully!`);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || `Failed to update offer status`);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Offer Letters</h1>
          <p className="text-muted-foreground mt-1">Review and manage your job offers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3 border border-border rounded-xl bg-card">
            <Award className="h-12 w-12 text-muted-foreground/40" />
            <span className="text-lg font-bold text-muted-foreground">No offers yet</span>
            <p className="text-sm text-muted-foreground">Keep applying and preparing for interviews. Your first offer is waiting!</p>
          </div>
        ) : (
          offers.map(offer => {
            const isPending = offer.status === 'pending';
            
            // Approximate base and bonus from total CTC for visualization
            const baseSalaryVal = Math.round(offer.ctc * 0.85);
            const bonusVal = offer.ctc - baseSalaryVal;
            
            return (
              <Card key={offer._id} className={`p-0 overflow-hidden border-2 shadow-lg shadow-primary/5 ${
                offer.status === 'accepted' ? 'border-success/30 bg-success/5' : 
                offer.status === 'rejected' ? 'border-destructive/20' : 'border-primary/20'
              }`}>
                <div className="bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 border-b border-border">
                  <div className="flex items-start gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-3xl shadow-md shrink-0">
                      {offer.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black">{offer.role}</h2>
                        {isPending ? (
                          <span className="px-3 py-1 bg-warning/20 text-warning text-xs font-bold rounded-full animate-pulse">Action Required</span>
                        ) : (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                            offer.status === 'accepted' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            {offer.status}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-muted-foreground">{offer.company?.name} • {offer.location}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Total CTC</p>
                    <p className="text-3xl font-black text-primary">{formatCurrency(offer.ctc)} / year</p>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8 bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold mb-1">Estimated Base Salary</p>
                      <p className="text-lg font-bold flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground"/> {formatCurrency(baseSalaryVal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold mb-1">Estimated Joining Bonus & Benefits</p>
                      <p className="text-lg font-bold flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground"/> {formatCurrency(bonusVal)}</p>
                    </div>
                    
                    {offer.stipend && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground font-semibold mb-1">Monthly Internship Stipend</p>
                        <p className="text-lg font-bold flex items-center gap-2 text-accent"><DollarSign className="h-4 w-4 text-muted-foreground"/> {formatCurrency(offer.stipend)} / month</p>
                      </div>
                    )}
                    
                    <div className="sm:col-span-2 p-4 bg-muted/30 rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold">Decision Deadline</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3"/> 
                          {offer.offerDeadline ? `Must respond by ${new Date(offer.offerDeadline).toLocaleDateString()}` : 'No deadline specified'}
                        </p>
                      </div>
                      {offer.offerLetterUrl && (
                        <a href={offer.offerLetterUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4"/> Download PDF</Button>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {isPending && (
                    <div className="flex flex-col justify-center gap-3 w-full md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                      <Button 
                        className="w-full bg-success hover:bg-success/90 text-white gap-2 py-6"
                        onClick={() => handleUpdateStatus(offer._id, 'accepted')}
                        disabled={processingId !== null}
                      >
                        {processingId === offer._id ? <Loader2 className="h-5 w-5 animate-spin"/> : <CheckCircle className="h-5 w-5"/>}
                        Accept Offer
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:text-white hover:bg-destructive border-destructive/20 gap-2"
                        onClick={() => handleUpdateStatus(offer._id, 'rejected')}
                        disabled={processingId !== null}
                      >
                        <XCircle className="h-4 w-4"/> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentOffers;
