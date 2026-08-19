import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import SpotlightCard from '../components/ui/SpotlightCard';
import MagneticButton from '../components/ui/MagneticButton';
import PageTransition, { MotionContainer } from '../components/ui/PageTransition';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const contactInfo = {
    email: '242020612@eastdelta.edu.bd',
    phone: '+880XXXXXXXXXXX',
    address: 'East Delta University, Chittagong, Bangladesh'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/contact', formData);
      toast.success(response.data.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="py-16 md:py-24 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <MotionContainer className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
            <span>We're Here To Help</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
            Get In <span className="brand-text-gradient">Touch With Us</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Have questions, feedback, or need system support? Drop us a message anytime.
          </p>
        </MotionContainer>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Info Cards */}
          <MotionContainer delay={0.2} className="md:col-span-1 space-y-4">
            <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 hover:border-primary-500/30 dark:hover:border-primary-500/40 shadow-card dark:shadow-card-dark transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 text-primary-500 dark:text-primary-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Email</h3>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{contactInfo.email}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 hover:border-emerald-500/30 dark:hover:border-emerald-500/40 shadow-card dark:shadow-card-dark transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/10 dark:border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Phone</h3>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{contactInfo.phone}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 hover:border-purple-500/30 dark:hover:border-purple-500/40 shadow-card dark:shadow-card-dark transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-500/10 dark:border-purple-500/20 text-purple-500 dark:text-purple-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Location</h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-snug">East Delta University, Chittagong</p>
                </div>
              </div>
            </SpotlightCard>
          </MotionContainer>

          {/* Form */}
          <MotionContainer delay={0.3} className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-8 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="input-label">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="input-label">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="you@eastdelta.edu.bd"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="input-label">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field"
                    rows="4"
                    placeholder="Write your message or inquiry here..."
                    required
                    disabled={loading}
                  />
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
                      <span>Sending Message...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </span>
                  )}
                </MagneticButton>
              </form>
            </div>
          </MotionContainer>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;