import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-primary-600' : 'text-white'
            }`}>
              EDU
            </span>
            <span className={`text-sm transition-colors duration-300 ${
              isScrolled ? 'text-gray-600' : 'text-white/80'
            }`}>
              Appointment System
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/messages" 
                  className={`transition-colors duration-300 flex items-center gap-1 ${
                    isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  📧 Messages
                </Link>
                <button 
                  onClick={handleLogout} 
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  Logout
                </button>
                <span className={`text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`}>
                  Welcome, {user?.name?.split(' ')[0] || 'User'}!
                </span>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-lg transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`block px-4 py-2 rounded-lg transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`block px-4 py-2 rounded-lg transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className={`block px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/user/messages" 
                  className={`block px-4 py-2 rounded-lg transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📧 Messages
                </Link>
                <button 
                  onClick={handleLogout} 
                  className={`block w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  Logout
                </button>
                <div className={`px-4 py-2 text-sm ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`}>
                  Welcome, {user?.name?.split(' ')[0] || 'User'}!
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`block px-4 py-2 rounded-lg transition duration-200 ${
                    isScrolled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;