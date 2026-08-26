import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, BookOpen, GraduationCap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/ui/SpotlightCard';
import MagneticButton from '../components/ui/MagneticButton';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

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
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary-500/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-primary-500/15 to-transparent pointer-events-none" />
        
        {/* Enhanced Glow Effects for Dark Mode */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-[150px] dark:blur-[200px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-600/10 dark:bg-primary-600/25 rounded-full blur-[150px] dark:blur-[200px] pointer-events-none animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 dark:from-primary-500/10 dark:via-primary-500/20 dark:to-primary-500/10 rounded-full blur-3xl dark:blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Top badge - Enhanced for dark mode */}
            <MotionContainer delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/30 dark:border-primary-500/40 text-primary-600 dark:text-primary-300 text-xs font-semibold backdrop-blur-md dark:backdrop-blur-xl">
                <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400 animate-pulse" />
                <span>Next-Gen East Delta University Portal</span>
              </div>
            </MotionContainer>

            {/* Headline - Same text, better dark mode visibility */}
            <MotionContainer delay={0.2}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.15]">
                <span className="text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(153,0,0,0.15)]">
                  Book Faculty
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-5xl sm:text-7xl md:text-8xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_40px_rgba(153,0,0,0.2)]">
                    Meetings
                  </span>
                  {/* Dark mode glow underline */}
                  <span className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-[0_0_20px_rgba(153,0,0,0.3)] dark:shadow-[0_0_40px_rgba(153,0,0,0.5)]" />
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full blur-md opacity-60 dark:opacity-80" />
                  {/* Dark mode glow behind text */}
                  <span className="absolute inset-0 -z-10 blur-2xl bg-primary-500/20 dark:bg-primary-500/40 rounded-full animate-pulse" />
                </span>
              </h1>
            </MotionContainer>

            {/* Subtitle - Enhanced dark mode contrast */}
            <MotionContainer delay={0.3}>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium dark:drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                East Delta University's centralized appointment system. Discover live 
                faculty availability, book 1-on-1 consultations, and streamline your 
                academic schedule.
              </p>
            </MotionContainer>

            {/* CTAs - Enhanced for dark mode */}
            <MotionContainer delay={0.4} className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <Link to={isAuthenticated ? '/student/book-appointment' : '/register'}>
                <MagneticButton variant="primary" className="px-8 py-3.5 text-base shadow-lg shadow-primary-500/30 dark:shadow-primary-500/50 hover:shadow-primary-500/50 dark:hover:shadow-primary-500/70">
                  <span>{isAuthenticated ? 'Book Appointment' : 'Get Started Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link to="/about">
                <MagneticButton variant="secondary" className="px-8 py-3.5 text-base dark:border-primary-500/30 dark:hover:border-primary-500/50 dark:bg-primary-950/20 dark:hover:bg-primary-950/40">
                  <span>Learn More</span>
                </MagneticButton>
              </Link>
            </MotionContainer>

            {/* Stats - Enhanced dark mode */}
            <MotionContainer delay={0.5} className="pt-12">
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-primary-500/20 dark:border-primary-500/30 shadow-xl shadow-primary-500/5 dark:shadow-primary-500/10 dark:shadow-[0_0_60px_rgba(153,0,0,0.08)]">
                {stats.map((stat, index) => (
                  <div key={index} className={index === 1 ? 'border-x border-slate-200 dark:border-slate-700/50' : ''}>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary-500 dark:text-primary-400">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </MotionContainer>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced dark mode */}
      <section className="py-20 relative bg-slate-50/80 dark:bg-slate-950/80">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent dark:via-primary-500/10 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-950/40 rounded-full border border-primary-200 dark:border-primary-800/50">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">
              Why Choose EDU Meet?
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
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
                <SpotlightCard 
                  spotlightColor="rgba(153, 0, 0, 0.08)" 
                  className="h-full p-8 bg-white dark:bg-slate-900/80 border-primary-500/10 dark:border-primary-500/20 hover:border-primary-500/30 dark:hover:border-primary-500/40 dark:shadow-card-dark hover:dark:shadow-card-hover-dark flex flex-col justify-between transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 flex items-center justify-center shadow-sm dark:shadow-none">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced dark mode */}
      <section className="py-20 relative bg-white dark:bg-slate-950/90">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent dark:via-primary-500/10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-950/40 rounded-full border border-primary-200 dark:border-primary-800/50">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
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
                className="relative p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark space-y-4 text-center group hover:shadow-card-hover dark:hover:shadow-card-hover-dark hover:border-primary-500/30 dark:hover:border-primary-500/40 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white text-xl font-display font-extrabold flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25 dark:shadow-primary-500/40 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-white dark:bg-slate-950/90 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pattern-dots opacity-20 dark:opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent dark:via-primary-500/[0.06] pointer-events-none" />

        {/* Floating decorative orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 right-[15%] w-72 h-72 bg-primary-500/[0.06] dark:bg-primary-500/[0.12] rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -25, 35, 0], y: [0, 20, -30, 0], scale: [1, 1.08, 0.92, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-16 left-[10%] w-80 h-80 bg-primary-600/[0.05] dark:bg-primary-600/[0.10] rounded-full blur-[120px] pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl p-10 md:p-14 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-primary-500/15 dark:border-primary-500/25 shadow-xl shadow-primary-500/[0.04] dark:shadow-[0_0_80px_rgba(153,0,0,0.06)] text-center space-y-7 overflow-hidden"
          >
            {/* Card inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] via-transparent to-primary-500/[0.03] dark:from-primary-500/[0.04] dark:to-primary-500/[0.06] pointer-events-none rounded-3xl" />



            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-500/15 dark:border-primary-500/25 flex items-center justify-center mx-auto shadow-sm dark:shadow-none">
                <GraduationCap className="w-8 h-8 text-primary-500 dark:text-primary-400" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight"
            >
              Ready to Transform Your{' '}
              <span className="brand-text-gradient">Academic Journey?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="relative z-10 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of students and faculty members using EDU Meet to streamline their academic appointments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="relative z-10 pt-2"
            >
              <Link to={isAuthenticated ? '/student/book-appointment' : '/register'}>
                <MagneticButton
                  variant="primary"
                  className="px-8 py-3.5 text-base shadow-lg shadow-primary-500/25 dark:shadow-primary-500/40 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/60"
                >
                  <span>{isAuthenticated ? 'Book Appointment' : 'Get Started Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
            </motion.div>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent dark:via-primary-400/30 origin-center"
            />
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;