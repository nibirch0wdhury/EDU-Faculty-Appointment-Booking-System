import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Mail, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminNavTabs = () => {
  const location = useLocation();

  const tabs = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/manage-users', label: 'Manage Users', icon: Users },
    { path: '/admin/manage-faculties', label: 'Faculty Members', icon: GraduationCap },
    { path: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
    { path: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full mb-6">
      <nav className="flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-primary-500/10 dark:border-primary-500/20 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="adminActiveTab"
                  className="absolute inset-0 bg-primary-500 rounded-xl shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-white' : 'text-primary-500 dark:text-primary-400'}`} />
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminNavTabs;
