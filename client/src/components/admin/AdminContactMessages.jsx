import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Eye, 
  Trash2, 
  Reply, 
  CheckCircle, 
  Clock,
  Search,
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

  // Format date and time (same as user side)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    
    // Format date
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    } else {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${date.toLocaleDateString('en-US', options)} at ${timeStr}`;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'unread':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">🔴 Unread</span>;
      case 'read':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">📖 Read</span>;
      case 'replied':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">✅ Replied</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{status}</span>;
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
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
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
        <div className="bg-white rounded-xl shadow-md p-6">
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
        <div className="bg-white rounded-xl shadow-md p-6">
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
        <div className="bg-white rounded-xl shadow-md p-6">
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
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
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
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Reply className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-green-700">Reply Sent:</p>
                      </div>
                      <p className="text-gray-700 bg-white p-3 rounded-lg border border-green-100">
                        {message.replyMessage}
                      </p>
                      {message.repliedAt && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Replied: {formatDateTime(message.repliedAt)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Received: {formatDateTime(message.createdAt)}
                    </span>
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
        <div className="bg-white rounded-xl shadow-md p-6 text-center py-12">
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
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <User className="w-3 h-3" />
                <span>{selectedMessage.name} ({selectedMessage.email})</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Received: {formatDateTime(selectedMessage.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReply(selectedMessage._id)}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
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