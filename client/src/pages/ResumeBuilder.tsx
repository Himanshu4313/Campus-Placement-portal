import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Check, ChevronRight, ChevronLeft, Download, FileText, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  
  college: string;
  degree: string;
  branch: string;
  cgpa: string;
  gradYear: string;
  
  expCompany: string;
  expRole: string;
  expDuration: string;
  expDesc: string;
  
  projName: string;
  projDesc: string;
  projLink: string;
  skills: string;
}

const ResumeBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ResumeData>({
    name: 'John Doe',
    email: 'johndoe@university.edu',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    github: 'github.com/johndoe',
    linkedin: 'linkedin.com/in/johndoe',
    college: 'State Technical University',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    cgpa: '8.7',
    gradYear: '2027',
    expCompany: 'TechCorp Inc.',
    expRole: 'Software Developer Intern',
    expDuration: 'Summer 2026',
    expDesc: 'Developed and optimized React dashboards, speeding up API data render by 20%. Integrated REST services and maintained TypeScript schemas.',
    projName: 'Campus Placement Portal',
    projDesc: 'A premium, modern SaaS placement platform built with React, Node.js, and MongoDB. Supports Kanban application pipelines and resume parsers.',
    projLink: 'github.com/johndoe/placement-portal',
    skills: 'React, Node.js, TypeScript, Express, MongoDB, Python, Git'
  });

  const steps = [
    { num: 1, title: 'Contact', desc: 'Basic info' },
    { num: 2, title: 'Education', desc: 'Academics' },
    { num: 3, title: 'Experience', desc: 'Internships' },
    { num: 4, title: 'Projects', desc: 'Extra details' }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleDownloadPDF = () => {
    // Inject custom print styles and call window.print
    const printContent = document.getElementById('resume-preview-container')?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Resume - ${formData.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 28px; font-weight: 800; margin-bottom: 5px; color: #0f172a; }
            h2 { font-size: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; }
            h3 { font-size: 14px; font-weight: 700; margin: 0; color: #1e293b; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
            .desc { font-size: 13px; color: #334155; margin-top: 8px; }
            .skills-list { font-size: 13px; font-weight: 500; }
            .grid-cols { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 15px; }
            .contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 12px; color: #475569; margin-top: 8px; }
            .bold { font-weight: 600; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('Generated PDF Print View!');
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Construct a professional, ATS-compliant PDF resume in minutes.</p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Stepper Input Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Stepper Navigation Indicator */}
          <Card className="p-4 flex justify-between items-center bg-white dark:bg-card">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setCurrentStep(s.num)}>
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num ? 'step-dot-active' :
                    currentStep > s.num ? 'step-dot-completed' : 'step-dot-inactive'
                  }`}>
                    {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.title}</span>
                </div>
                {idx < 3 && <div className="h-[2px] bg-border flex-1 mx-2 mt-[-15px]" />}
              </React.Fragment>
            ))}
          </Card>

          {/* Stepper Forms */}
          <Card className="p-6 flex flex-col gap-6 bg-white dark:bg-card">
            
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base flex items-center gap-1.5"><FileText className="h-5 w-5 text-primary"/> Contact Details</h3>
                <Input label="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input label="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <Input label="GitHub Link" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} />
                <Input label="LinkedIn Link" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base flex items-center gap-1.5"><GraduationCap className="h-5 w-5 text-primary"/> Education Profile</h3>
                <Input label="College / Institution" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Degree" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
                  <Input label="CGPA" value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} />
                </div>
                <Input label="Branch / Specialization" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} />
                <Input label="Graduation Year" value={formData.gradYear} onChange={e => setFormData({ ...formData, gradYear: e.target.value })} />
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base flex items-center gap-1.5"><Briefcase className="h-5 w-5 text-primary"/> Work Experience</h3>
                <Input label="Company Name" value={formData.expCompany} onChange={e => setFormData({ ...formData, expCompany: e.target.value })} />
                <Input label="Role Title" value={formData.expRole} onChange={e => setFormData({ ...formData, expRole: e.target.value })} />
                <Input label="Duration" value={formData.expDuration} onChange={e => setFormData({ ...formData, expDuration: e.target.value })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <textarea 
                    value={formData.expDesc} 
                    onChange={e => setFormData({ ...formData, expDesc: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base flex items-center gap-1.5"><Sparkles className="h-5 w-5 text-primary"/> Projects & Skills</h3>
                <Input label="Project Name" value={formData.projName} onChange={e => setFormData({ ...formData, projName: e.target.value })} />
                <Input label="Code Repository / Link" value={formData.projLink} onChange={e => setFormData({ ...formData, projLink: e.target.value })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Project Description</label>
                  <textarea 
                    value={formData.projDesc} 
                    onChange={e => setFormData({ ...formData, projDesc: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <Input label="Skills (Comma separated)" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between border-t border-border/50 pt-4 mt-2">
              <Button 
                variant="outline" 
                onClick={handlePrev} 
                disabled={currentStep === 1}
                className="gap-1.5 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  className="gap-1.5 text-xs font-bold"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleDownloadPDF}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Download className="h-4 w-4" /> Generate PDF
                </Button>
              )}
            </div>

          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-7">
          <h2 className="font-bold text-lg mb-3">Live Preview</h2>
          <Card className="p-8 border border-border shadow-md bg-white text-slate-800 rounded-none overflow-x-auto min-h-[700px] max-w-[650px] mx-auto select-text">
            <div id="resume-preview-container">
              
              {/* Header Contact Block */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">{formData.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                  <span>{formData.email}</span>
                  <span>{formData.phone}</span>
                  <span>{formData.location}</span>
                </div>
                <div className="flex gap-4 text-xs text-primary font-bold mt-2">
                  {formData.github && <a href={`https://${formData.github}`} target="_blank" rel="noreferrer">{formData.github}</a>}
                  {formData.linkedin && <a href={`https://${formData.linkedin}`} target="_blank" rel="noreferrer">{formData.linkedin}</a>}
                </div>
              </div>

              {/* Education section */}
              {formData.college && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mt-6 uppercase tracking-wider">Education</h2>
                  <div className="flex justify-between items-start mt-2 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-800">{formData.college}</h3>
                      <p className="text-slate-500 font-medium mt-0.5">{formData.degree} in {formData.branch}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">CGPA: {formData.cgpa}/10.0</p>
                      <p className="text-slate-500 font-medium mt-0.5">Class of {formData.gradYear}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience section */}
              {formData.expCompany && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mt-6 uppercase tracking-wider">Experience</h2>
                  <div className="flex justify-between items-start mt-2 text-xs">
                    <div>
                      <h3 className="font-bold text-slate-800">{formData.expCompany}</h3>
                      <p className="text-slate-500 font-semibold mt-0.5">{formData.expRole}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{formData.expDuration}</span>
                  </div>
                  {formData.expDesc && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-3 border-l-2 border-slate-200">{formData.expDesc}</p>
                  )}
                </div>
              )}

              {/* Projects section */}
              {formData.projName && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mt-6 uppercase tracking-wider">Projects</h2>
                  <div className="flex justify-between items-start mt-2 text-xs">
                    <h3 className="font-bold text-slate-800">{formData.projName}</h3>
                    {formData.projLink && <span className="text-xs text-primary font-bold">{formData.projLink}</span>}
                  </div>
                  {formData.projDesc && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-3 border-l-2 border-slate-200">{formData.projDesc}</p>
                  )}
                </div>
              )}

              {/* Skills section */}
              {formData.skills && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mt-6 uppercase tracking-wider">Skills</h2>
                  <p className="text-xs text-slate-700 leading-relaxed mt-2 font-medium">{formData.skills}</p>
                </div>
              )}

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ResumeBuilder;
