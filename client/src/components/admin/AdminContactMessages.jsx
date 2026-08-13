import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Eye, 
  Trash2, 
  Reply, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      setMessages(response.data.data || []);
      setStats({
        total: response.data.pagination?.total || 0,
        unread: response.data.unreadCount || 0,
        read: response.data.data?.filter(m => m.status === 'read').length || 0,
        replied: response.data.data?.filter(m => m.status === 'replied').length || 0,
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'unread':
        return <span className="badge badge-danger">Unread</span>;
      case 'read':
        return <span className="badge badge-info">Read</span>;
      case 'replied':
        return <span className="badge badge-success">Replied</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const filteredMessages = messages.filter(msg => {
    const searchLower = searchTerm.toLowerCase();
    return msg.name.toLowerCase().includes(searchLower) ||
           msg.email.toLowerCase().includes(searchLower) ||
           msg.message.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage messages from visitors</p>
        </div>
        <button
          onClick={fetchMessages}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold">{stats.read}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Messages List */}
      {filteredMessages.length > 0 ? (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div 
              key={message._id} 
              className={`card hover:shadow-lg transition-shadow ${
                !message.isRead ? 'border-l-4 border-primary-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      !message.isRead ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <User className={`w-5 h-5 ${
                        !message.isRead ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{message.name}</h3>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-sm text-gray-600">{message.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {message.message}
                    </p>
                  </div>
                  
                  {message.replyMessage && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Reply:</p>
                      <p className="text-sm text-green-600">{message.replyMessage}</p>
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                    {message.repliedAt && (
                      <span className="flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        Replied: {new Date(message.repliedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!message.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(message._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Messages Found</h3>
          <p className="text-gray-600 mt-2">
            {searchTerm ? 'Try adjusting your search' : 'No contact messages yet'}
          </p>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reply to {selectedMessage.name}</h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 font-medium">Original Message:</p>
              <p className="text-gray-700 mt-1">{selectedMessage.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                From: {selectedMessage.name} ({selectedMessage.email})
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReply(selectedMessage._id)}
                  className="btn-primary flex-1"
                >
                  <Reply className="inline-block w-4 h-4 mr-2" />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;