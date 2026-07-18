import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Award, DollarSign, Calendar, Download, CheckCircle, XCircle } from 'lucide-react';

const StudentOffers: React.FC = () => {
  const offers = [
    {
      id: 1,
      role: 'Backend Engineer',
      company: 'CloudWorks',
      ctc: '₹14,00,000 / year',
      base: '₹12,00,000',
      bonus: '₹2,00,000',
      location: 'Hyderabad, India',
      deadline: 'Oct 30, 2026',
      status: 'pending' // pending, accepted, rejected
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Offer Letters</h1>
          <p className="text-muted-foreground mt-1">Review and manage your job offers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {offers.length === 0 ? (
           <div className="p-12 flex flex-col items-center justify-center text-center gap-3 border border-border rounded-xl bg-card">
             <Award className="h-12 w-12 text-muted-foreground/40" />
             <span className="text-lg font-bold text-muted-foreground">No offers yet</span>
             <p className="text-sm text-muted-foreground">Keep applying and preparing for interviews. Your first offer is waiting!</p>
           </div>
        ) : offers.map(offer => (
          <Card key={offer.id} className="p-0 overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/5">
            <div className="bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 border-b border-border">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-3xl shadow-md">
                  {offer.company.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black">{offer.role}</h2>
                    <span className="px-3 py-1 bg-warning/20 text-warning text-xs font-bold rounded-full animate-pulse">Action Required</span>
                  </div>
                  <p className="text-lg font-semibold text-muted-foreground">{offer.company} • {offer.location}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total CTC</p>
                <p className="text-3xl font-black text-primary">{offer.ctc}</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8 bg-card">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Base Salary</p>
                  <p className="text-lg font-bold flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground"/> {offer.base}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Joining Bonus & Stocks</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground"/> {offer.bonus}</p>
                </div>
                <div className="col-span-2 p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Decision Deadline</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3"/> Must respond by {offer.deadline}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4"/> Download PDF</Button>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-3 w-full md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                <Button className="w-full bg-success hover:bg-success/90 text-white gap-2 py-6"><CheckCircle className="h-5 w-5"/> Accept Offer</Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-2"><XCircle className="h-4 w-4"/> Decline</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentOffers;
