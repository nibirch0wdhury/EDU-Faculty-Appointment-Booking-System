import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, BookOpen, GraduationCap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/ui/SpotlightCard';
import MagneticButton from '../components/ui/MagneticButton';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';

const Home = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-primary-500" />,
      title: 'Real-time Schedules',
      description: 'View faculty consultation hours live and reserve your time slot with instant sync.',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: 'Instant Booking',
      description: 'Book, manage, or reschedule consultations effortlessly in just two taps.',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <Users className="w-8 h-8 text-primary-500" />,
      title: 'Role-Based Dashboards',
      description: 'Tailored workspace portals designed specifically for Students, Faculty, and Admin.',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-500" />,
      title: 'Streamlined Approval',
      description: 'Automated email notifications, status tracking, and clear academic coordination.',
      spotlight: 'rgba(153, 0, 0, 0.08)',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up with your university credentials as a student or faculty member.',
    },
    {
      step: '02',
      title: 'Select Faculty & Slot',
      description: 'Search available professors by department and select a open time slot.',
    },
    {
      step: '03',
      title: 'Instant Confirmation',
      description: 'Receive real-time confirmation and manage your upcoming consultations.',
    },
  ];

  const stats = [
    { value: '100%', label: 'Real-Time Sync' },
    { value: '24/7', label: 'Online Access' },
    { value: '0', label: 'Schedule Conflicts' },
  ];

  return (
    <PageTransition className="relative z-10 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-500/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-primary-500/5 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Top badge */}
            <MotionContainer delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
                <span>Next-Gen East Delta University Portal</span>
              </div>
            </MotionContainer>

            {/* Headline */}
            <MotionContainer delay={0.2}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Book Faculty Meetings <br />
                <span className="brand-text-gradient">With Effortless Speed</span>
              </h1>
            </MotionContainer>

            {/* Subtitle */}
            <MotionContainer delay={0.3}>
              <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                East Delta University's centralized appointment system. Discover live faculty availability, 
                book 1-on-1 consultations, and streamline your academic schedule.
              </p>
            </MotionContainer>

            {/* CTAs */}
            <MotionContainer delay={0.4} className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <Link to="/register">
                <MagneticButton variant="primary" className="px-8 py-3.5 text-base">
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link to="/about">
                <MagneticButton variant="secondary" className="px-8 py-3.5 text-base">
                  <span>Learn More</span>
                </MagneticButton>
              </Link>
            </MotionContainer>

            {/* Stats */}
            <MotionContainer delay={0.5} className="pt-12">
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-primary-500/10 shadow-card">
                {stats.map((stat, index) => (
                  <div key={index} className={index === 1 ? 'border-x border-slate-200' : ''}>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary-500">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </MotionContainer>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative bg-slate-50/80">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full border border-primary-200">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              Why Choose EDU Appointment System?
            </h2>
            <p className="text-slate-500">
              Designed with precision to enhance campus communication between students and faculty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SpotlightCard spotlightColor={feature.spotlight} className="h-full p-8 bg-white border-primary-500/10 hover:border-primary-500/30 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-500/10 flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full border border-primary-200">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-500">
              Simple 3-step process to book your appointment in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative p-8 rounded-3xl bg-white border border-primary-500/10 shadow-card space-y-4 text-center group hover:shadow-card-hover hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white text-xl font-display font-extrabold flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-primary-500 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <GraduationCap className="w-16 h-16 text-white/80 mx-auto" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands of students and faculty members using EDUBook to streamline their academic appointments.
          </p>
          <div className="pt-4">
            <Link to="/register">
              <MagneticButton 
                variant="secondary" 
                className="px-8 py-3.5 text-base bg-white text-primary-500 hover:bg-slate-50 shadow-lg shadow-black/20"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;