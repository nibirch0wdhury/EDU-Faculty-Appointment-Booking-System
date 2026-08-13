import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';

const About = () => {
  const benefits = [
    'Real-time faculty availability live sync',
    'Seamless appointment booking and 1-click cancellation',
    'Automated email notifications and reminder alerts',
    'Centralized management for system administrators',
    'Responsive dark glass mobile-optimized experience'
  ];

  return (
    <PageTransition className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <MotionContainer className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Empowering Academic Connections</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            About <span className="animated-gradient-text">EDU Appointment System</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Providing East Delta University students and faculty members with a state-of-the-art digital scheduling ecosystem.
          </p>
        </MotionContainer>

        <MotionContainer delay={0.2} className="glass-panel space-y-8 p-8 md:p-10">
          <div className="space-y-4 leading-relaxed text-slate-300 text-base">
            <p>
              The <strong className="text-white">EDU Appointment System</strong> is a high-performance web platform crafted to modernize the consultation workflow between students and faculty at East Delta University.
            </p>
            <p>
              Our mission is to eliminate physical queuing, overlap friction, and delayed response times, replacing them with live scheduling transparency, automated tracking, and clear administrative tools.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/40 border border-indigo-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Key Core Platform Advantages</h2>
            </div>
            
            <ul className="grid sm:grid-cols-1 gap-3.5 text-slate-300">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </MotionContainer>
      </div>
    </PageTransition>
  );
};

export default About;