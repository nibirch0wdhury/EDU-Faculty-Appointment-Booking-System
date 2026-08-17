import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, GraduationCap } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.success) {
      navigate('/');
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80 pattern-dots">
      <MotionContainer className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-8 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Top red accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />

          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-500/20 text-primary-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Welcome Back</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Sign In to EDU System</h2>
            <p className="text-slate-500 text-sm">Enter your university credentials to continue</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-11"
                    placeholder="you@eastdelta.edu.bd"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full py-3.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </MagneticButton>

            <div className="text-center pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </MotionContainer>
    </PageTransition>
  );
};

export default Login;