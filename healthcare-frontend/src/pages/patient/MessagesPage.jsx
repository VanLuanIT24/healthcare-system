// src/pages/patient/MessagesPage.jsx - Facebook Messenger Style
import { 
  SendOutlined, 
  UserOutlined, 
  CheckOutlined, 
  CheckCircleFilled, 
  SmileOutlined, 
  PaperClipOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  PictureOutlined,
  FileOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Empty, Input, List, Spin, message, Tooltip, Modal, Upload, Image } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import messageAPI from '@/services/api/messageAPI';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// Sound for new message
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgoODg4SDg4N8eHBnX1lUUU9OTU1OT1JWW2BlaW9zdnl7fX19fn9/f39+fX18e3p5eHd2dnV1dXV1dXV1dXZ2d3h4eXp7fH1+f4CAgICAgIB/f35+fX18fHt7enp5eXl5eHh4eHh4eHh4eXl5enp7e3x8fX1+fn9/gICAgICAgH9/fn5+fX19fHx8e3t7e3t7e3t7e3t7e3t7e3t8fHx8fHx9fX19fn5+fn5/f39/f4CAgICAgICAgICAgH9/f39/f35+fn5+fn19fX19fX19fX19fX19fX19fX5+fn5+fn5+f39/f39/f3+AgICAgICAgICAgICAgH9/f39/fn5+fn5+fX19fX19fX19fX19fX19fX19fn5+fn5+fn5/f39/f39/gICAgICAgICAgICAf39/f39/f35+fn5+fn5+fn19fX19fX19fX19fX19fX5+fn5+fn5+fn5/f39/f39/f4CAgICAgICAgIB/f39/f39/f35+fn5+fn5+fn59fX19fX19fX19fX19fn5+fn5+fn5+fn5/f39/f39/f3+AgICAgICAgIB/f39/f39/f39+fn5+fn5+fn5+fn19fX19fX19fX19fn5+fn5+fn5+fn5+f39/f39/f39/gICAgICAgIB/f39/f39/f39/fn5+fn5+fn5+fn5+fX19fX19fX1+fn5+fn5+fn5+fn5+fn9/f39/f39/f4CAgICAgICAf39/f39/f39/f35+fn5+fn5+fn5+fn5+fX19fX19fn5+fn5+fn5+fn5+fn5/f39/f39/f3+AgICAgICAgH9/f39/f39/f39+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+f39/f39/f39/gICAgICAgIB/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn9/f39/f39/f4CAgICAgICAf39/f39/f39/f35+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5/f39/f39/f3+AgA==');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore audio errors
  }
};

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoCallVisible, setVideoCallVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Common emojis for quick picker
  const commonEmojis = [
    '😀', '😂', '😍', '🥰', '😘', '😊', '🤗', '🙂', '😉', '😎',
    '🤔', '😮', '😢', '😭', '😡', '🥺', '😴', '🤒', '🤮', '🤧',
    '👍', '👎', '👏', '🙏', '💪', '🤝', '❤️', '💕', '💖', '💔',
    '🔥', '✨', '⭐', '🎉', '🎊', '🎁', '🏥', '💊', '💉', '🩺',
    '✅', '❌', '⚠️', '❓', '❗', '🆗', '👋', '🤞', '👌', '✌️'
  ];

  // Handle emoji select
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle file upload
  const handleFileUpload = async (file, type = 'file') => {
    if (!selectedConversation) return;
    
    try {
      setUploadingFile(true);
      const recipient = selectedConversation.participants.find(p => p.user?._id?.toString() !== user?._id?.toString());
      if (!recipient?.user) return;

      // Create temp message with file preview
      const isImage = file.type?.startsWith('image/');
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        text: isImage ? '' : `📎 ${file.name}`,
        sender: { _id: user?._id },
        createdAt: new Date().toISOString(),
        status: 'sending',
        attachment: {
          type: isImage ? 'image' : 'file',
          name: file.name,
          size: file.size,
          url: isImage ? URL.createObjectURL(file) : null
        }
      };
      setMessages(prev => [...prev, tempMessage]);

      // Upload file (simulated - in real app, upload to server)
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('recipientId', recipient.user._id);
      // const res = await messageAPI.sendFile(formData);

      // Simulate upload success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status
      setMessages(prev => prev.map(m => 
        m._id === tempMessage._id ? { ...m, status: 'sent' } : m
      ));
      
      message.success(`Đã gửi ${isImage ? 'hình ảnh' : 'tài liệu'}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Gửi file thất bại');
      setMessages(prev => prev.filter(m => !m._id.startsWith('temp-')));
    } finally {
      setUploadingFile(false);
    }
  };

  // Start video call
  const handleVideoCall = () => {
    if (!selectedConversation) return;
    setVideoCallVisible(true);
    message.info('Đang kết nối cuộc gọi video...');
  };

  // Start voice call
  const handleVoiceCall = () => {
    if (!selectedConversation) return;
    message.info('Đang kết nối cuộc gọi thoại...');
  };

  // Simulate online status (in real app, use WebSocket)
  useEffect(() => {
    // Simulate some users being online
    const simulateOnline = () => {
      const online = new Set();
      conversations.forEach(conv => {
        // Random online status for demo (30% chance)
        if (Math.random() > 0.7) {
          const otherUser = conv.participants?.find(p => p.user?._id !== user?._id);
          if (otherUser?.user?._id) {
            online.add(otherUser.user._id);
          }
        }
      });
      setOnlineUsers(online);
    };

    if (conversations.length > 0) {
      simulateOnline();
      const interval = setInterval(simulateOnline, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [conversations, user?._id]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await messageAPI.getConversations();
      const data = res.data?.data || [];

      const currentUserId = user?._id?.toString() || user?.id?.toString();
      const formatted = data.map(conv => {
        const otherParticipant = conv.participants.find(p => p.user?._id?.toString() !== currentUserId);
        const u = otherParticipant?.user || {};
        const info = u.personalInfo || {};

        return {
          ...conv,
          name: info.firstName ? `${info.firstName} ${info.lastName}` : (otherParticipant?.user?.fullName || 'Bác sĩ'),
          specialty: u.specialty || (u.role === 'DOCTOR' ? 'Bác sĩ' : 'Nhân viên'),
          avatar: info.profilePicture || u.profilePicture,
          lastMessage: conv.lastMessage?.text || 'Bắt đầu trò chuyện',
          timestamp: conv.lastMessage?.createdAt || conv.updatedAt,
          unread: conv.unreadCount || 0,
          otherUserId: u._id
        };
      });

      let finalConversations = [...formatted];

      // Handle direct doctor messaging from location state
      const targetDoctorId = location.state?.doctorId;

      if (targetDoctorId) {
        const existingConv = formatted.find(conv =>
          conv.participants.some(p => p.user?._id?.toString() === targetDoctorId.toString())
        );

        if (existingConv) {
          setSelectedConversation(existingConv);
        } else {
          const tempConv = {
            _id: 'temp',
            name: location.state?.doctorName || 'Bác sĩ',
            specialty: 'Tư vấn',
            participants: [
              { user: { _id: user?._id, role: user?.role } },
              { user: { _id: targetDoctorId, role: 'DOCTOR' } }
            ],
            isNew: true,
            lastMessage: 'Bắt đầu trò chuyện',
            timestamp: new Date().toISOString(),
            otherUserId: targetDoctorId
          };
          setSelectedConversation(tempConv);
          setMessages([]);
          finalConversations = [tempConv, ...finalConversations];
        }
      } else if (formatted.length > 0 && !selectedConversation) {
        setSelectedConversation(formatted[0]);
      }

      setConversations(finalConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      message.error('Không thể tải danh sách tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = useCallback(async (convId) => {
    try {
      const res = await messageAPI.getMessages(convId);
      const newMessages = res.data?.data || [];
      
      // Check for new messages and play sound
      if (newMessages.length > lastMessageCount && lastMessageCount > 0) {
        const latestMsg = newMessages[newMessages.length - 1];
        if (latestMsg?.sender?._id !== user?._id && latestMsg?.sender !== user?._id) {
          playNotificationSound();
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('Tin nhắn mới', {
              body: latestMsg.text?.substring(0, 50) || 'Bạn có tin nhắn mới',
              icon: '/favicon.ico'
            });
          }
        }
      }
      
      setLastMessageCount(newMessages.length);
      setMessages(newMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [lastMessageCount, user?._id]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadConversations();
    }
  }, [user?._id, user?.id, location.key]);

  useEffect(() => {
    if (selectedConversation?._id && selectedConversation._id !== 'temp') {
      loadMessages(selectedConversation._id);

      const interval = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    } else if (selectedConversation?._id === 'temp') {
      setMessages([]);
      setLastMessageCount(0);
    }
  }, [selectedConversation?._id, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setLastMessageCount(0);
    // Mark as read
    setUnreadCounts(prev => ({ ...prev, [conversation._id]: 0 }));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const recipient = selectedConversation.participants.find(p => p.user?._id?.toString() !== user?._id?.toString());
      if (!recipient || !recipient.user) {
        console.error('No recipient found');
        return;
      }

      // Optimistic update
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        text: newMessage,
        sender: { _id: user?._id },
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      const res = await messageAPI.sendMessage({
        recipientId: recipient.user._id,
        text: newMessage
      });

      if (res.data?.success) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? { ...res.data.data, status: 'sent' } : m
        ));
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Gửi tin nhắn thất bại.');
      // Remove failed message
      setMessages(prev => prev.filter(m => !m._id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const isUserOnline = (userId) => onlineUsers.has(userId);
  const isUserTyping = (userId) => typingUsers.has(userId);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = dayjs(timestamp);
    const now = dayjs();
    
    if (now.diff(date, 'day') === 0) {
      return date.format('HH:mm');
    } else if (now.diff(date, 'day') === 1) {
      return 'Hôm qua';
    } else if (now.diff(date, 'day') < 7) {
      return date.format('dddd');
    } else {
      return date.format('DD/MM');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-120px)]"
    >
      <div className="flex h-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Sidebar - Conversations */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Tin nhắn</h2>
            <p className="text-sm text-gray-500 mb-3">Chat với bác sĩ</p>
            {/* Search Bar */}
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-gray-100 border-0"
              allowClear
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Spin /></div>
            ) : filteredConversations.length > 0 ? (
              <div className="py-2">
                {filteredConversations.map((conv) => {
                  const online = isUserOnline(conv.otherUserId);
                  const hasUnread = conv.unread > 0 || unreadCounts[conv._id] > 0;
                  
                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedConversation?._id === conv._id ? 'bg-blue-50 hover:bg-blue-50' : ''
                      }`}
                    >
                      {/* Avatar with online indicator */}
                      <div className="relative flex-shrink-0">
                        <Avatar 
                          size={48} 
                          icon={<UserOutlined />}
                          src={conv.avatar}
                          className="bg-gradient-to-r from-blue-400 to-blue-600"
                        />
                        {/* Online dot */}
                        <span 
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            online ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {conv.name}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(conv.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {conv.lastMessage}
                          </p>
                          {hasUnread && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        {online && (
                          <span className="text-xs text-green-500">Đang hoạt động</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty description="Chưa có cuộc trò chuyện" className="py-8" />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-white">
                <div className="relative">
                  <Avatar 
                    size={44} 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-r from-blue-400 to-blue-600"
                  />
                  <span 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isUserOnline(selectedConversation.otherUserId) ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    {isUserOnline(selectedConversation.otherUserId) ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span>{selectedConversation.specialty}</span>
                    )}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Tooltip title="Gọi thoại">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<PhoneOutlined className="text-lg" />}
                      onClick={handleVoiceCall}
                      className="text-blue-500 hover:bg-blue-50"
                    />
                  </Tooltip>
                  <Tooltip title="Gọi video">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<VideoCameraOutlined className="text-lg" />}
                      onClick={handleVideoCall}
                      className="text-blue-500 hover:bg-blue-50"
                    />
                  </Tooltip>
                  <Tooltip title="Thông tin">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<InfoCircleOutlined className="text-lg" />}
                      className="text-gray-500 hover:bg-gray-50"
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="max-w-3xl mx-auto space-y-3">
                  <AnimatePresence>
                    {messages.length > 0 ? (
                      messages.map((msg, index) => {
                        const isMe = (msg.sender?._id || msg.sender) === user?._id;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1]?.sender?._id !== msg.sender?._id);
                        
                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                          >
                            {!isMe && showAvatar && (
                              <Avatar size={28} icon={<UserOutlined />} className="bg-blue-500 flex-shrink-0" />
                            )}
                            {!isMe && !showAvatar && <div className="w-7" />}
                            
                            <Tooltip title={dayjs(msg.createdAt).format('DD/MM/YYYY HH:mm')} placement={isMe ? 'left' : 'right'}>
                              <div
                                className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                                  isMe 
                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                } ${msg.status === 'sending' ? 'opacity-70' : ''}`}
                              >
                                {/* Image attachment */}
                                {msg.attachment?.type === 'image' && (
                                  <div className="mb-2">
                                    <Image
                                      src={msg.attachment.url}
                                      alt="Hình ảnh"
                                      className="rounded-lg max-w-full cursor-pointer"
                                      style={{ maxHeight: 200 }}
                                      preview={{
                                        mask: <EyeOutlined className="text-white" />
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {/* File attachment */}
                                {msg.attachment?.type === 'file' && (
                                  <div className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${isMe ? 'bg-blue-400' : 'bg-gray-100'}`}>
                                    <FileOutlined className={`text-2xl ${isMe ? 'text-white' : 'text-blue-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium truncate text-sm ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                        {msg.attachment.name}
                                      </p>
                                      <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {(msg.attachment.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                    <Button 
                                      type="text" 
                                      size="small"
                                      icon={<DownloadOutlined />}
                                      className={isMe ? 'text-white' : 'text-blue-500'}
                                    />
                                  </div>
                                )}
                                
                                {/* Text message */}
                                {msg.text && (
                                  <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                )}
                                
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                  <span className="text-[10px]">{dayjs(msg.createdAt).format('HH:mm')}</span>
                                  {isMe && (
                                    msg.status === 'sending' ? (
                                      <span className="text-[10px]">Đang gửi...</span>
                                    ) : msg.read ? (
                                      <CheckCircleFilled className="text-xs text-blue-200" />
                                    ) : (
                                      <CheckOutlined className="text-xs" />
                                    )
                                  )}
                                </div>
                              </div>
                            </Tooltip>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Avatar size={80} icon={<UserOutlined />} className="bg-gradient-to-r from-blue-400 to-blue-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">{selectedConversation.name}</h3>
                        <p className="text-gray-500 text-sm">{selectedConversation.specialty}</p>
                        <p className="text-gray-400 text-sm mt-2">Bắt đầu cuộc trò chuyện</p>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isUserTyping(selectedConversation.otherUserId) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Avatar size={28} icon={<UserOutlined />} className="bg-blue-500" />
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 max-w-3xl mx-auto relative">
                  {/* Image Button */}
                  <Tooltip title="Gửi hình ảnh">
                    <Button 
                      type="text" 
                      icon={<PictureOutlined />} 
                      className="text-gray-500 hover:text-green-500"
                      onClick={() => imageInputRef.current?.click()}
                      loading={uploadingFile}
                    />
                  </Tooltip>
                  
                  {/* File Button */}
                  <Tooltip title="Gửi tài liệu">
                    <Button 
                      type="text" 
                      icon={<PaperClipOutlined />} 
                      className="text-gray-500 hover:text-blue-500"
                      onClick={() => fileInputRef.current?.click()}
                      loading={uploadingFile}
                    />
                  </Tooltip>
                  
                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                      e.target.value = '';
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'file');
                      e.target.value = '';
                    }}
                  />
                  
                  {/* Emoji Picker */}
                  <div className="relative" ref={emojiPickerRef}>
                    <Tooltip title="Biểu tượng cảm xúc">
                      <Button 
                        type="text" 
                        icon={<SmileOutlined />} 
                        className={`text-gray-500 hover:text-yellow-500 ${showEmojiPicker ? 'text-yellow-500' : ''}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      />
                    </Tooltip>
                    
                    {/* Emoji Picker Panel */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50"
                          style={{ width: '280px' }}
                        >
                          <div className="grid grid-cols-10 gap-1">
                            {commonEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-lg transition-transform hover:scale-125"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Input
                    ref={inputRef}
                    placeholder="Aa"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={handleSendMessage}
                    className="flex-1 rounded-full border-gray-200 bg-gray-100 hover:bg-gray-50 focus:bg-white px-4 py-2"
                    disabled={sending}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!newMessage.trim()}
                    className="rounded-full w-10 h-10 flex items-center justify-center"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SendOutlined className="text-3xl text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tin nhắn của bạn</h3>
                <p className="text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      <Modal
        title={null}
        open={videoCallVisible}
        onCancel={() => setVideoCallVisible(false)}
        footer={null}
        width={800}
        centered
        className="video-call-modal"
        styles={{ body: { padding: 0, background: '#1a1a2e' } }}
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden">
          {/* Video Area */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Remote Video (placeholder) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 mb-4"
                />
                <h3 className="text-white text-xl font-semibold">{selectedConversation?.name}</h3>
                <p className="text-gray-400 mt-2">Đang kết nối...</p>
                <div className="flex justify-center gap-1 mt-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>

            {/* Self Video (placeholder) */}
            <div className="absolute bottom-4 right-4 w-40 h-28 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
              <Avatar size={48} icon={<UserOutlined />} className="bg-blue-500" />
            </div>

            {/* Call Timer */}
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">00:00</span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 py-6 bg-gray-900">
            <Tooltip title="Tắt mic">
              <Button
                type="text"
                shape="circle"
                size="large"
                className="bg-gray-700 hover:bg-gray-600 text-white w-14 h-14"
                icon={<PhoneOutlined className="text-xl" />}
              />
            </Tooltip>
            <Tooltip title="Tắt camera">
              <Button
                type="text"
                shape="circle"
                size="large"
                className="bg-gray-700 hover:bg-gray-600 text-white w-14 h-14"
                icon={<VideoCameraOutlined className="text-xl" />}
              />
            </Tooltip>
            <Tooltip title="Kết thúc cuộc gọi">
              <Button
                type="primary"
                danger
                shape="circle"
                size="large"
                className="w-16 h-16"
                icon={<PhoneOutlined className="text-2xl rotate-[135deg]" />}
                onClick={() => {
                  setVideoCallVisible(false);
                  message.info('Đã kết thúc cuộc gọi');
                }}
              />
            </Tooltip>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default MessagesPage;