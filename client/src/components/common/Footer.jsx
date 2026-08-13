import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Phone, Heart, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-slate-800/80 bg-slate-950/90 text-slate-300 overflow-hidden z-10">
      {/* Background glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                EDU<span className="text-indigo-400 font-light">Book</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              East Delta University's next-generation faculty appointment portal. Streamlining academic scheduling, student consultations, and campus productivity with ease.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live System Operational
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100">
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
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>East Delta University, Chittagong, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <a href="mailto:242020612@eastdelta.edu.bd" className="hover:text-indigo-300 transition-colors">
                  242020612@eastdelta.edu.bd
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+8801XXXXXXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EDU Faculty Appointment Booking System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for East Delta University</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;