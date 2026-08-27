import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, GraduationCap, AlertTriangle, Shield } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Check maintenance mode status on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        setCheckingMaintenance(true);
        const response = await api.get('/admin/settings');
        if (response.data?.data?.maintenanceMode) {
          setMaintenanceMode(true);
        }
      } catch (error) {
        // Ignore errors - maintenance check is optional
        console.log('Maintenance check skipped:', error.message);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(email, password);
      setLoading(false);
      
      if (result?.success && result?.user && result?.user?.role) {
        switch (result.user.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'faculty':
            navigate('/faculty/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      setLoading(false);
      
      // ✅ Handle maintenance mode error
      if (error.response?.data?.maintenanceMode) {
        setMaintenanceMode(true);
        toast.error('🚧 System is under maintenance. Please try again later.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <MotionContainer className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-8 sm:p-10 space-y-8 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ✅ Maintenance Mode Warning Banner */}
          {maintenanceMode && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3 relative z-10">
              <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">⚠️ Maintenance Mode</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  The system is currently under maintenance. Only administrators can log in.
                </p>
              </div>
            </div>
          )}

          <div className="text-center space-y-2 relative z-10">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50">
                {maintenanceMode ? <Shield className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>{maintenanceMode ? 'Admin Access Only' : 'Welcome Back'}</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              {maintenanceMode ? 'Admin Login' : 'Sign In to EDU System'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {maintenanceMode 
                ? '🔒 System is under maintenance. Admin access only.' 
                : 'Enter your university credentials to continue'
              }
            </p>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-11"
                    placeholder="242021012@eastdelta.edu.bd"
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <span>Use your institutional email (@eastdelta.edu.bd)</span>
                </p>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <MagneticButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3.5 shadow-lg shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{maintenanceMode ? 'Admin Login' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </MagneticButton>

            {!maintenanceMode && (
              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            )}

            {maintenanceMode && (
              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="inline-block w-3.5 h-3.5 mr-1" />
                  Only administrators can access the system during maintenance.
                </p>
              </div>
            )}
          </form>
        </div>
      </MotionContainer>
    </PageTransition>
  );
};

export default Login;