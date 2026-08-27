import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Calendar, User, LogOut, MessageSquare, LayoutDashboard, Sparkles, BookOpen, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student': return '/student/dashboard';
      case 'faculty': return '/faculty/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/login';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-primary-500/10 dark:border-primary-500/20 shadow-lg dark:shadow-slate-900/50' 
          : 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-primary-500/5 dark:border-primary-500/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 dark:shadow-primary-500/50 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
              <div className="absolute inset-0 rounded-xl bg-primary-400/20 animate-ping opacity-20" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                EDU<span className="text-primary-500">Meet</span>
              </span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
                Appointment Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-primary-500/5 dark:border-primary-500/10 backdrop-blur-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {(user?.role === 'admin' ? [
              { path: '/', label: 'Home' },
              { path: '/admin/manage-faculties', label: 'Faculty Members' },
              { path: '/admin/manage-users', label: 'Users' },
              { path: '/about', label: 'About' },
            ] : user?.role === 'student' ? [
              { path: '/', label: 'Home' },
              { path: '/student/faculty-members', label: 'Faculty Members' },
              { path: '/about', label: 'About' },
              { path: '/contact', label: 'Contact' },
            ] : [
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
              { path: '/contact', label: 'Contact' },
            ]).map((navItem) => (
              <Link
                key={navItem.path}
                to={navItem.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(navItem.path)
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isActive(navItem.path) && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-primary-500 rounded-xl shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{navItem.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                {/* ✅ FIXED: Message Icon redirects to contact messages */}
                <Link 
                  to="/user/messages" 
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200 relative"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <Link 
                    to="/user/profile"
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 px-3 py-1.5 rounded-xl transition-all duration-200 group"
                    title="View Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-500 dark:group-hover:text-primary-400 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-sm font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-primary-500/10 dark:border-primary-500/20 px-4 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link 
                    to="/admin/manage-faculties" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/admin/manage-faculties') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Faculty Members
                  </Link>
                  <Link 
                    to="/admin/manage-users" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/admin/manage-users') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Manage Users
                  </Link>
                </>
              )}
              {user?.role === 'student' && (
                <Link 
                  to="/student/faculty-members" 
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/student/faculty-members') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Faculty Members
                </Link>
              )}
              <Link 
                to="/about" 
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/about') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {user?.role !== 'admin' && (
                <Link 
                  to="/contact" 
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive('/contact') ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 dark:hover:text-primary-400'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link 
                    to={getDashboardLink()} 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md dark:shadow-primary-500/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/user/profile" 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-primary-500" />
                    <span>My Profile</span>
                  </Link>
                  {/* ✅ FIXED: Mobile message link */}
                  <Link 
                    to="/user/messages" 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 text-primary-500" />
                    <span>Messages</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium text-sm border border-red-200 dark:border-red-800/50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md dark:shadow-primary-500/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;