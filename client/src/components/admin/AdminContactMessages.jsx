import React, { useState, useEffect } from 'react';
import { 
  Mail, Eye, Trash2, Reply, CheckCircle2, Search, RefreshCw,
  AlertCircle, User, Calendar, Sparkles, X, Send
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import Badge from '../ui/Badge';
import PageTransition, { MotionContainer } from '../ui/PageTransition';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contact/admin/messages?status=${filter}`);
      const dataList = response.data.data || [];
      setMessages(dataList);
      setStats({
        total: response.data.pagination?.total || dataList.length,
        unread: response.data.unreadCount || dataList.filter(m => m.status === 'unread').length,
        read: dataList.filter(m => m.status === 'read').length,
        replied: dataList.filter(m => m.status === 'replied').length,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/contact/admin/messages/${id}/read`);
      toast.success('Message marked as read');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/contact/admin/messages/${id}`);
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    try {
      await api.put(`/contact/admin/messages/${id}/reply`, { replyMessage: replyText });
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setReplyText('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const searchLower = searchTerm.toLowerCase();
    return msg.name?.toLowerCase().includes(searchLower) ||
           msg.email?.toLowerCase().includes(searchLower) ||
           msg.message?.toLowerCase().includes(searchLower);
  });

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-500/20 text-primary-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Support Messaging Center</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Contact Messages</h1>
          </div>
          <MagneticButton variant="secondary" onClick={fetchMessages} className="py-2.5 px-4 text-xs">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh List</span>
          </MagneticButton>
        </MotionContainer>

        {/* Stats Cards */}
        <MotionContainer delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard spotlightColor="rgba(153, 0, 0, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 border border-primary-500/10 rounded-2xl text-primary-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Messages</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 border border-amber-500/10 rounded-2xl text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Unread</p>
                <p className="text-2xl font-extrabold text-amber-600">{stats.unread}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 border border-blue-500/10 rounded-2xl text-blue-500">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Read</p>
                <p className="text-2xl font-extrabold text-slate-900">{stats.read}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.06)" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-500/10 rounded-2xl text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Replied</p>
                <p className="text-2xl font-extrabold text-emerald-600">{stats.replied}</p>
              </div>
            </div>
          </SpotlightCard>
        </MotionContainer>

        {/* Filters */}
        <MotionContainer delay={0.2} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by sender name, email or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-xs"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field md:w-48 bg-white text-xs"
          >
            <option value="all" className="bg-white">All Statuses</option>
            <option value="unread" className="bg-white">Unread</option>
            <option value="read" className="bg-white">Read</option>
            <option value="replied" className="bg-white">Replied</option>
          </select>
        </MotionContainer>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
            <span>Loading contact submissions...</span>
          </div>
        ) : filteredMessages.length > 0 ? (
          <MotionContainer delay={0.3} className="space-y-4">
            {filteredMessages.map((message) => (
              <SpotlightCard 
                key={message._id} 
                spotlightColor="rgba(153, 0, 0, 0.06)"
                className={`p-6 border-l-4 ${
                  message.status === 'unread' ? 'border-l-amber-500' :
                  message.status === 'replied' ? 'border-l-emerald-500' : 'border-l-slate-300'
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
                      {message.message}
                    </div>
                    
                    {message.replyMessage && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                        <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <Reply className="w-3.5 h-3.5" /> Admin Reply:
                        </p>
                        <p className="text-slate-700">{message.replyMessage}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Submitted: {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 shrink-0">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowReplyModal(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Reply to message"
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.3} className="bg-white rounded-3xl shadow-card border border-primary-500/10 p-12 text-center space-y-3">
            <Mail className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900">No Messages Found</h3>
            <p className="text-xs text-slate-500">No contact submissions match the current filter.</p>
          </MotionContainer>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-primary-500/10 max-w-lg w-full p-8 space-y-6 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-lg font-display font-bold text-slate-900">Reply to {selectedMessage.name}</h2>
                <button onClick={() => setShowReplyModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-500">Original Inquiry:</p>
                <p className="text-slate-700">{selectedMessage.message}</p>
                <p className="text-[11px] text-slate-400 pt-1">Sender: {selectedMessage.name} ({selectedMessage.email})</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Your Response</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Type your official response here..."
                  />
                </div>
                <div className="flex gap-3">
                  <MagneticButton variant="primary" className="flex-1 py-2.5" onClick={() => handleReply(selectedMessage._id)}>
                    <Send className="w-4 h-4" />
                    <span>Send Response</span>
                  </MagneticButton>
                  <MagneticButton variant="secondary" className="flex-1 py-2.5" onClick={() => setShowReplyModal(false)}>
                    <span>Cancel</span>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminContactMessages;