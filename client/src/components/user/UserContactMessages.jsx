import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock, Reply, User, RefreshCw, Sparkles, Send, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import SpotlightCard from '../ui/SpotlightCard';
import MagneticButton from '../ui/MagneticButton';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const UserContactMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New message form state
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessage, setNewMessage] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await api.get('/contact/user/messages');
      setMessages(response.data.data || []);
      if (showToast) {
        toast.success(`Loaded ${response.data.data?.length || 0} messages`);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load your messages');
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(true);
  };

  const handleNewMessageChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', newMessage);
      toast.success('✅ Message sent successfully!');
      setNewMessage({
        name: user?.name || '',
        email: user?.email || '',
        message: '',
      });
      setShowNewMessageForm(false);
      await fetchMessages(true);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Support Requests History</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Support Messages</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              View all your messages and replies from the support team
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MagneticButton 
              variant="secondary" 
              onClick={() => setShowNewMessageForm(!showNewMessageForm)} 
              className="py-2.5 px-4 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Message</span>
            </MagneticButton>
            <MagneticButton 
              variant="secondary" 
              onClick={handleRefresh} 
              disabled={refreshing} 
              className="py-2.5 px-4 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </MagneticButton>
          </div>
        </MotionContainer>

        {/* Stats Cards */}
        <MotionContainer delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.08)" className="p-5 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-2xl text-primary-500 dark:text-primary-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Messages Sent</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{messages.length}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.08)" className="p-5 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl text-amber-500 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Awaiting Response</p>
                <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {messages.filter(m => m.status === 'unread' || m.status === 'read').length}
                </p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.08)" className="p-5 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Replies Received</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {messages.filter(m => m.status === 'replied').length}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </MotionContainer>

        {/* New Message Form */}
        {showNewMessageForm && (
          <MotionContainer delay={0.15}>
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 transition-all duration-300 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500 dark:shadow-[0_0_20px_rgba(153,0,0,0.3)]" />
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    Send New Support Message
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Our support team will respond to your inquiry</p>
                </div>
                <button 
                  onClick={() => setShowNewMessageForm(false)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitMessage} className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newMessage.name}
                      onChange={handleNewMessageChange}
                      className="input-field"
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newMessage.email}
                      onChange={handleNewMessageChange}
                      className="input-field"
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={newMessage.message}
                    onChange={handleNewMessageChange}
                    className="input-field"
                    rows="4"
                    required
                    placeholder="Write your message or inquiry here..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <MagneticButton
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="px-6 py-2.5 shadow-md shadow-primary-500/25 dark:shadow-primary-500/50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </MagneticButton>
                  <MagneticButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowNewMessageForm(false)}
                    className="px-6 py-2.5"
                  >
                    Cancel
                  </MagneticButton>
                </div>
              </form>
            </div>
          </MotionContainer>
        )}

        {/* Messages List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
            <span>Loading support tickets...</span>
          </div>
        ) : messages.length > 0 ? (
          <MotionContainer delay={0.2} className="space-y-4">
            {messages.map((message) => (
              <SpotlightCard 
                key={message._id} 
                spotlightColor="rgba(153, 0, 0, 0.08)"
                className={`p-6 border-l-4 ${
                  message.status === 'replied' ? 'border-l-emerald-500' : 
                  message.status === 'read' ? 'border-l-blue-500' : 'border-l-amber-500'
                } bg-white dark:bg-slate-900/95 border-r border-t border-b border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 rounded-full text-primary-500 dark:text-primary-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">{message.name}</h3>
                          <Badge status={message.status} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{message.email}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-300 block mb-1">Your Message:</strong>
                      {message.message}
                    </div>
                    
                    {message.replyMessage && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <Reply className="w-3.5 h-3.5" />
                          <span>University Support Reply:</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{message.replyMessage}</p>
                        {message.repliedAt && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                            Replied: {formatDateTime(message.repliedAt)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Sent: {formatDateTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-12 text-center space-y-4 transition-all duration-300">
            <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Support Messages Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You haven't submitted any support inquiries or messages yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 hover:shadow-primary-500/40 dark:hover:shadow-primary-500/70 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Send Your First Message</span>
              </button>
              <Link to="/contact">
                <MagneticButton variant="secondary" className="py-2.5 px-6 text-sm">
                  <span>Go to Contact Page</span>
                </MagneticButton>
              </Link>
            </div>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default UserContactMessages;