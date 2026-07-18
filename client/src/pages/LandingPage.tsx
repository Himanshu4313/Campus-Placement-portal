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
  ShieldCheck,
  Zap,
  Star,
  Quote
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
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden flex flex-col justify-between">
      {/* Premium Gradient Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="tracking-tight text-white">Campus Placement</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium hover:text-white transition-all text-slate-400">
            Log In
          </Link>
          <Link
            to="/register"
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center transition-all shadow-premium"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1 text-xs text-primary font-semibold tracking-wide uppercase">
              <Zap className="h-3.5 w-3.5" /> Next-Gen Career Engine
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
              Connecting Top Talents <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                With Global Companies
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-400 max-w-3xl leading-relaxed mt-2">
              A comprehensive university placement ecosystem empowering Students, Recruiters, and Placement Officers. Scale recruitment drives with advanced workflows, real-time analytics, and automated tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                to="/register"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-premium text-base"
              >
                Start Hiring / Apply <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="h-12 px-8 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-white font-semibold flex items-center justify-center transition-all text-base"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </section>

        {/* Live Counters */}
        <section className="border-y border-slate-900 bg-slate-950/40 py-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Highest Package', value: `₹${(stats.highestPackage / 100000).toFixed(1)} LPA`, icon: TrendingUp },
              { label: 'Average Package', value: `₹${(stats.averagePackage / 100000).toFixed(1)} LPA`, icon: Star },
              { label: 'Active Openings', value: stats.activeJobs, icon: Briefcase },
              { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: CheckCircle }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Ecosystem Roles</h2>
            <p className="text-slate-400 max-w-2xl">One single source of truth for universities, companies, and applicants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Students',
                desc: 'Upload portfolios, manage multiple resumes, verify transcripts, track applications from submission to final acceptance.',
                icon: GraduationCap,
                color: 'from-blue-600 to-indigo-600'
              },
              {
                title: 'Recruiters',
                desc: 'Post job listings, check applicants, coordinate calendars, schedule interviews, issue digitally signed offers.',
                icon: Users,
                color: 'from-purple-600 to-violet-600'
              },
              {
                title: 'Placement Officers',
                desc: 'Coordinate campus drives, run eligibility filters, verification cycles, broadcast emails, and pull analytical reports.',
                icon: Building,
                color: 'from-cyan-600 to-teal-600'
              }
            ].map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-900 bg-slate-950/80 p-8 flex flex-col justify-between gap-6 hover:border-slate-800 transition-all hover:shadow-premium group"
                >
                  <div className="flex flex-col gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{role.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{role.desc}</p>
                  </div>
                  <Link to="/register" className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    Register as {role.title.slice(0, -1)} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 border-t border-slate-900 bg-slate-950/30 px-6 md:px-12 flex flex-col items-center gap-16">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Success Stories</h2>
            <p className="text-slate-400">What top institutions and recruiters say about our system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            {[
              {
                quote: "Scaling our software engineering drives with automated eligibility criteria saved us over 40 hours of manual resume vetting.",
                author: "Director of HR, Vercel",
                icon: Quote
              },
              {
                quote: "Having digital offer tracking and real-time dashboard notifications for the students increased our placement turnaround speed by 60%.",
                author: "Placement Head, VIT University",
                icon: Quote
              }
            ].map((story, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-900 bg-slate-950 p-8 flex flex-col gap-6 relative overflow-hidden">
                <story.icon className="absolute right-6 top-6 h-16 w-16 text-slate-900/50" />
                <p className="text-slate-300 italic text-base md:text-lg leading-relaxed z-10">"{story.quote}"</p>
                <div className="flex flex-col gap-0.5 mt-auto z-10">
                  <span className="text-white font-bold">{story.author}</span>
                  <span className="text-xs text-primary font-semibold uppercase tracking-wider">Verified User</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 md:px-12 text-center text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Placement Ecosystem</span>
          </div>
          <span>© 2026 Campus Placement Portal. Built with React 19 + TypeScript.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-all">Terms of Service</a>
            <a href="#" className="hover:text-white transition-all">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
