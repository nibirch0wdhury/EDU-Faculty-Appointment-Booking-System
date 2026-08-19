import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, MapPin, Phone, Heart, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 overflow-hidden z-10">
      {/* Top red accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent dark:shadow-[0_0_30px_rgba(153,0,0,0.3)]" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pattern-dots pointer-events-none" />
      
      {/* Dark mode glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent dark:from-primary-500/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50 group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                EDU<span className="text-primary-400">Book</span>
              </span>
            </Link>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md leading-relaxed">
              East Delta University's next-generation faculty appointment portal. 
              Streamlining academic scheduling, student consultations, and campus 
              productivity with ease.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live System Operational
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Home Page' },
                { to: '/about', label: 'About System' },
                { to: '/contact', label: 'Contact Support' },
                { to: '/login', label: 'User Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary-400 dark:hover:text-primary-400 transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 dark:text-slate-500">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span>East Delta University, Chittagong, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:242020612@eastdelta.edu.bd" className="hover:text-primary-300 transition-colors">
                  242020612@eastdelta.edu.bd
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>+8801XXXXXXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-600">
          <p>© {new Date().getFullYear()} EDU Faculty Appointment Booking System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-primary-400 fill-primary-400 inline" />
            <span>for East Delta University</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;