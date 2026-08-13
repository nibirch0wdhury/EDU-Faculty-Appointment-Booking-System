import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar background & shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
      case 'student':
        return '/student/dashboard';
      case 'faculty':
        return '/faculty/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200/80' 
          : 'bg-white/75 backdrop-blur-md shadow-sm border-b border-gray-200/50'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              EDU
            </span>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
              Appointment System
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-slate-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-slate-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-slate-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm transition duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/messages" 
                  className="text-slate-700 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span>📧</span> Messages
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 font-medium border border-gray-200 transition duration-200"
                >
                  Logout
                </button>
                <span className="text-sm font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
                  Welcome, {user?.name?.split(' ')[0] || 'User'}!
                </span>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm transition duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 font-medium border border-gray-200 transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-3 mb-3 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-100 shadow-xl space-y-3">
            <Link 
              to="/" 
              className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="block px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-center shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/messages" 
                  className="block px-4 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📧 Messages
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 font-medium transition duration-200"
                >
                  Logout
                </button>
                <div className="px-4 py-2 text-sm font-medium text-slate-500 text-center">
                  Welcome, {user?.name?.split(' ')[0] || 'User'}!
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link 
                  to="/login" 
                  className="block px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-center shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 font-medium text-center border border-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;