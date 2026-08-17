import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock, Reply, User, RefreshCw, Sparkles } from 'lucide-react';
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
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-500/20 text-primary-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Support Requests History</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">My Support Messages</h1>
          </div>

          <MagneticButton variant="secondary" onClick={handleRefresh} disabled={refreshing} className="py-2.5 px-4 text-xs">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </MagneticButton>
        </MotionContainer>

        {/* Stats */}
        <MotionContainer delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 border border-primary-500/10 rounded-2xl text-primary-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Messages Sent</p>
                <p className="text-2xl font-extrabold text-slate-900">{messages.length}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 border border-amber-500/10 rounded-2xl text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Awaiting Response</p>
                <p className="text-2xl font-extrabold text-amber-600">
                  {messages.filter(m => m.status === 'unread' || m.status === 'read').length}
                </p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-500/10 rounded-2xl text-emerald-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Official Replies</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {messages.filter(m => m.status === 'replied').length}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </MotionContainer>

        {/* Messages List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
            <span>Loading support tickets...</span>
          </div>
        ) : messages.length > 0 ? (
          <MotionContainer delay={0.2} className="space-y-4">
            {messages.map((message) => (
              <SpotlightCard 
                key={message._id} 
                spotlightColor="rgba(153, 0, 0, 0.06)"
                className={`p-6 border-l-4 ${
                  message.status === 'replied' ? 'border-l-emerald-500' : 'border-l-amber-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary-50 border border-primary-500/10 rounded-full text-primary-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{message.name}</h3>
                          <Badge status={message.status} />
                        </div>
                        <p className="text-xs text-slate-500">{message.email}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-700 block mb-1">Your Message:</strong>
                      {message.message}
                    </div>
                    
                    {message.replyMessage && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <Reply className="w-3.5 h-3.5" />
                          <span>University Support Reply:</span>
                        </div>
                        <p className="text-slate-700">{message.replyMessage}</p>
                        {message.repliedAt && (
                          <p className="text-[11px] text-slate-400 pt-1">
                            Replied: {formatDateTime(message.repliedAt)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sent: {formatDateTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2} className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-12 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900">No Support Messages Sent</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any support inquiries or messages yet.
            </p>
            <Link to="/contact" className="inline-block pt-2">
              <MagneticButton variant="primary" className="py-2.5 px-6 text-xs">
                <span>Send Us a Message</span>
              </MagneticButton>
            </Link>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default UserContactMessages;