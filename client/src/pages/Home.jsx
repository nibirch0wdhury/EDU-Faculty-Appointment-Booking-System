import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/ui/SpotlightCard';
import MagneticButton from '../components/ui/MagneticButton';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';

const Home = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-indigo-400" />,
      title: 'Real-time Schedules',
      description: 'View faculty consultation hours live and reserve your time slot with instant sync.',
      spotlight: 'rgba(99, 102, 241, 0.25)',
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      title: 'Instant Booking',
      description: 'Book, manage, or reschedule consultations effortlessly in just two taps.',
      spotlight: 'rgba(168, 85, 247, 0.25)',
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-400" />,
      title: 'Role-Based Dashboards',
      description: 'Tailored workspace portals designed specifically for Students, Faculty, and Admin.',
      spotlight: 'rgba(16, 185, 129, 0.25)',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-cyan-400" />,
      title: 'Streamlined Approval',
      description: 'Automated email notifications, status tracking, and clear academic coordination.',
      spotlight: 'rgba(6, 182, 212, 0.25)',
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

  return (
    <PageTransition className="relative z-10 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Top pill badge */}
            <MotionContainer delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Next-Gen East Delta University Portal</span>
              </div>
            </MotionContainer>

            {/* Headline */}
            <MotionContainer delay={0.2}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
                Book Faculty Meetings <br />
                <span className="animated-gradient-text">With Effortless Speed</span>
              </h1>
            </MotionContainer>

            {/* Subtitle */}
            <MotionContainer delay={0.3}>
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                East Delta University's centralized appointment system. Discover live faculty availability, book 1-on-1 consultations, and streamline your academic schedule.
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

            {/* Quick Stats Strip */}
            <MotionContainer delay={0.5} className="pt-12">
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 backdrop-blur-xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Real-Time Sync</p>
                </div>
                <div className="border-x border-slate-800">
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">24/7</p>
                  <p className="text-xs text-slate-400 font-medium">Online Access</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0</p>
                  <p className="text-xs text-slate-400 font-medium">Schedule Conflicts</p>
                </div>
              </div>
            </MotionContainer>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Choose EDU Appointment System?
            </h2>
            <p className="text-slate-400">
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
                <SpotlightCard spotlightColor={feature.spotlight} className="h-full p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center shadow-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How It Works
            </h2>
            <p className="text-slate-400">
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
                className="relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 text-center group hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xl font-extrabold flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;