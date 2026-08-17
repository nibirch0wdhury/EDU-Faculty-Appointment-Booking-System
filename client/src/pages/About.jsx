import React, { useState } from 'react';
import { 
  Code2, Database, ShieldCheck, Server, Globe, Mail, Copy, Check, 
  Sparkles, Terminal, Cpu, Layers, Users, ExternalLink, GraduationCap, BookOpen
} from 'lucide-react';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';
import { toast } from 'react-toastify';

const teamMembers = [
  {
    id: 1,
    name: 'Sadman Chowdhury',
    email: '242021012@eastdelta.edu.bd',
    role: 'Backend & DevOps Specialist',
    responsibilities: ['Backend', 'Deployment and Hosting'],
    icon: Database,
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    borderGradient: 'hover:border-amber-500/50',
    tags: ['JWT Auth', 'Bcrypt Security', 'CORS Middleware', 'Cloud Hosting']
  },
  {
    id: 2,
    name: 'Muhammad Sharfuddin',
    email: '242020612@eastdelta.edu.bd',
    role: 'Database Engineer & Security',
    responsibilities: ['Database Integration', 'User Authentication & Security'],
    icon: ShieldCheck,
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    borderGradient: 'hover:border-emerald-500/50',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose REST API']
  },
  {
    id: 3,
    name: 'Yeaser Bin Osman Esmam',
    email: '242019112@eastdelta.edu.bd',
    role: 'Frontend UI/UX Architect',
    responsibilities: ['Frontend Development'],
    icon: Code2,
    gradient: 'from-indigo-500 via-purple-600 to-pink-600',
    borderGradient: 'hover:border-indigo-500/50',
    tags: ['React.js', 'Vite', 'Tailwind CSS', 'Framer Motion']
  },
  {
    id: 4,
    name: 'Ashraful Islam Sikder',
    email: '242024212@eastdelta.edu.bd',
    role: 'Frontend & Interactive Engineer',
    responsibilities: ['Frontend Development'],
    icon: Layers,
    gradient: 'from-blue-500 via-indigo-600 to-violet-600',
    borderGradient: 'hover:border-blue-500/50',
    tags: ['Component Architecture', 'Client State Sync', 'Responsive UI']
  }
];

const About = () => {
  const [copiedEmail, setCopiedEmail] = useState(null);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success(`Copied ${email} to clipboard!`);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  return (
    <PageTransition className="py-12 md:py-20 bg-slate-50/80 pattern-dots">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <MotionContainer className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-500/20 text-primary-600 text-xs font-semibold tracking-wide">
            <Users className="w-4 h-4 text-primary-500" />
            <span>Meet The Engineering Team</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 tracking-tight">
            About the <span className="brand-text-gradient">Developers</span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            The talented team of East Delta University students behind the design, architecture, 
            and deployment of the <strong className="text-slate-900">EDU Faculty Appointment Booking System</strong>.
          </p>
        </MotionContainer>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {teamMembers.map((member, index) => {
            const IconComponent = member.icon;
            const isCopied = copiedEmail === member.email;

            return (
              <MotionContainer
                key={member.id}
                delay={index * 0.15}
                className={`bg-white rounded-2xl border border-primary-500/10 shadow-card p-6 sm:p-8 space-y-6 relative overflow-hidden group transition-all duration-300 hover:shadow-card-hover hover:border-primary-500/30 ${member.borderGradient}`}
              >
                {/* Background Accent */}
                <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${member.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${member.gradient} p-0.5 shadow-lg shadow-primary-500/10 group-hover:scale-105 transition-transform duration-300`}>
                      <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-slate-700" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-500">
                        Team Member 0{member.id}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Section */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <a 
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-primary-500 truncate font-mono transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>

                  <button
                    onClick={() => handleCopyEmail(member.email)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50 transition-all shrink-0"
                    title="Copy Email"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary-500" />
                    Responsibilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.responsibilities.map((resp, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-primary-50 border border-primary-500/10 text-primary-600 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-primary-500" />
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {member.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionContainer>
            );
          })}
        </div>

        {/* Academic Mission Banner */}
        <MotionContainer delay={0.6} className="bg-white rounded-3xl p-8 md:p-10 bg-gradient-to-r from-slate-50 via-primary-50/50 to-slate-50 border border-primary-500/20 text-center space-y-4 shadow-card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/25 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900">East Delta University Engineering Project</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Built as part of our academic excellence initiative to connect students and faculty through 
            real-time digital consultation booking, secure user authentication, and centralized administration.
          </p>
          <div className="academic-divider mx-auto" />
        </MotionContainer>

      </div>
    </PageTransition>
  );
};

export default About;