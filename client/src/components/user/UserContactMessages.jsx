import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock, Reply, User, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

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
      console.log('Fetching messages for user:', user?.email);
      
      const response = await api.get('/contact/user/messages');
      console.log('Messages response:', response.data);
      
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

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
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

  // Format date only
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time only
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'unread':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">⏳ Pending</span>;
      case 'read':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">📖 Read</span>;
      case 'replied':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">✅ Replied</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Messages</h1>
          <p className="text-gray-600 mt-1">View all your contact messages and admin replies</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {messages.filter(m => m.status === 'unread' || m.status === 'read').length}
              </p>
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
              <p className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'replied').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message._id} 
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${
                message.status === 'unread' ? 'border-l-4 border-yellow-500' : 
                message.status === 'replied' ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <User className="w-5 h-5 text-primary-600" />
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
                      <span className="font-medium">Your Message:</span><br />
                      {message.message}
                    </p>
                  </div>
                  
                  {message.replyMessage && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Reply className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-green-700">Admin Reply</p>
                      </div>
                      <p className="text-gray-700 bg-white p-3 rounded-lg border border-green-100">
                        {message.replyMessage}
                      </p>
                      {message.repliedAt && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTime(message.repliedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Sent: {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {message.status === 'replied' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Replied
                    </span>
                  )}
                  {message.status === 'unread' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Reply
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Messages Found</h3>
          <p className="text-gray-600 mt-2">
            You haven't sent any contact messages yet.
          </p>
          <button
            onClick={() => window.location.href = '/contact'}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Contact Us
          </button>
        </div>
      )}
    </div>
  );
};

export default UserContactMessages;