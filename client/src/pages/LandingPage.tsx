import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Users,
  Building,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Star,
  Quote,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    activeJobs: 12,
    totalStudents: 154,
    totalOffers: 84,
    highestPackage: 3500000,
    averagePackage: 1240000,
    placementRate: 86.4
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics/public');
        if (res.data.success) {
          setStats((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.warn('Analytics API not reachable, using default values', err);
      }
    };
    fetchPublicStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden flex flex-col justify-between">
      {/* Premium Minimal grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="tracking-tight">PlacementHub</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold hover:text-slate-900 transition-colors text-slate-500">
            Log In
          </Link>
          <Link
            to="/register"
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center justify-center transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-24 pb-28 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1 text-[11px] text-primary font-bold tracking-wide uppercase">
              Unified Campus Recruitment
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Connecting university talent <br />
              with <span className="text-primary">world-class companies</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mt-1">
              A streamlined placement ecosystem built for Students, Recruiters, and Placement Officers. Automate tracking, coordinate drives, and launch careers with modern analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link
                to="/register"
                className="h-11 px-6 rounded-lg bg-primary hover:bg-primary/95 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
              >
                Start Hiring / Apply <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="h-11 px-6 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center transition-all shadow-sm text-sm"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </section>

        {/* Live Counters */}
        <section className="border-y border-slate-200 bg-white/50 py-10 px-6 md:px-12">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Highest Package', value: `₹${(stats.highestPackage / 100000).toFixed(1)} LPA`, icon: TrendingUp },
              { label: 'Average Package', value: `₹${(stats.averagePackage / 100000).toFixed(1)} LPA`, icon: Star },
              { label: 'Active Openings', value: stats.activeJobs, icon: Briefcase },
              { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: CheckCircle }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-primary mb-1 shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-14">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">One platform, three key roles</h2>
            <p className="text-slate-500 max-w-xl text-sm md:text-base">A single source of truth connecting universities, recruiting agencies, and applicants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Students',
                desc: 'Upload portfolios, manage multiple resumes, verify transcripts, and track your applications from submission to final acceptance.',
                icon: GraduationCap,
                color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
              },
              {
                title: 'Recruiters',
                desc: 'Post job openings, review candidate resumes, coordinate calendars, schedule interview rounds, and issue offer letters.',
                icon: Users,
                color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
              },
              {
                title: 'Placement Officers',
                desc: 'Coordinate campus drives, run eligibility criteria filters, verification cycles, broadcast emails, and pull analytical reports.',
                icon: Building,
                color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }
            ].map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col justify-between gap-6 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="flex flex-col gap-4">
                    <div className={`h-11 w-11 rounded-lg border ${role.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{role.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{role.desc}</p>
                  </div>
                  <Link to="/register" className="text-xs font-bold text-primary inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    Register as {role.title.slice(0, -1)} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 border-t border-slate-200 bg-slate-100/30 px-6 md:px-12 flex flex-col items-center gap-14">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Success stories</h2>
            <p className="text-slate-500 text-sm md:text-base">What institutions and recruiting teams are saying about us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {[
              {
                quote: "Scaling our software engineering drives with automated eligibility criteria saved our HR department over 40 hours of manual vetting.",
                author: "Director of Talent Acquisition, TechCorp",
                icon: Quote
              },
              {
                quote: "Digitizing our placement workflow and providing real-time dashboard notifications for the students cut our overall cycle time in half.",
                author: "Head of Training & Placements, City College",
                icon: Quote
              }
            ].map((story, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden">
                <p className="text-slate-600 italic text-sm md:text-base leading-relaxed z-10">"{story.quote}"</p>
                <div className="flex flex-col gap-0.5 mt-auto z-10">
                  <span className="text-slate-900 font-bold text-sm">{story.author}</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Verified User</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-6 md:px-12 text-center text-slate-500 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>PlacementHub</span>
          </div>
          <span>© 2026 Campus Placement Portal. Built with React + TypeScript.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
