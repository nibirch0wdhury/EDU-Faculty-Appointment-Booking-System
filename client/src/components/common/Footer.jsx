import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

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
            <div className="pt-1">
              <a
                href="https://github.com/nibirch0wdhury/EDU-Faculty-Appointment-Booking-System"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 dark:bg-slate-900 border border-slate-700/60 dark:border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub Repository</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
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
                <a href="mailto:edubook@eastdelta.edu.bd" className="hover:text-primary-300 transition-colors">
                  edubook@eastdelta.edu.bd  
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>+8801XXXXXXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Removed "Crafted with heart" */}
        <div className="mt-12 pt-8 border-t border-slate-800 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-600">
          <p>© {new Date().getFullYear()} EDU Faculty Appointment Booking System. All rights reserved.</p>
          <p className="text-slate-500 dark:text-slate-600">
            East Delta University
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;