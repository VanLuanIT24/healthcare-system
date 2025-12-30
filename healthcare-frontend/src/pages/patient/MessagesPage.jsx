// src/pages/patient/MessagesPage.jsx
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Card, Empty, Input, List, Spin, message } from 'antd';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import messageAPI from '@/services/api/messageAPI';
import dayjs from 'dayjs';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
          lastMessage: conv.lastMessage?.text || 'Bắt đầu trò chuyện',
          timestamp: dayjs(conv.lastMessage?.createdAt || conv.updatedAt).fromNow(),
          unread: 0
        };
      });

      console.log('📬 Formatted patient conversations:', formatted);

      let finalConversations = [...formatted];

      // Handle direct doctor messaging from location state
      const targetDoctorId = location.state?.doctorId;
      console.log('🎯 Target doctor ID from state:', targetDoctorId);

      if (targetDoctorId) {
        const existingConv = formatted.find(conv =>
          conv.participants.some(p => p.user?._id?.toString() === targetDoctorId.toString())
        );

        if (existingConv) {
          console.log('✅ Found existing conversation:', existingConv._id);
          setSelectedConversation(existingConv);
        } else {
          console.log('🆕 Creating temporary conversation for doctor:', targetDoctorId);
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
            timestamp: 'Vừa xong'
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

  const loadMessages = async (convId) => {
    try {
      const res = await messageAPI.getMessages(convId);
      setMessages(res.data?.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải nội dung tin nhắn.');
    }
  };

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
      }, 5000);

      return () => clearInterval(interval);
    } else if (selectedConversation?._id === 'temp') {
      setMessages([]);
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const recipient = selectedConversation.participants.find(p => p.user?._id?.toString() !== user?._id?.toString());
        if (!recipient || !recipient.user) {
          console.error('No recipient found in conversation:', selectedConversation);
          return;
        }

        const res = await messageAPI.sendMessage({
          recipientId: recipient.user._id,
          text: newMessage
        });

        if (res.data?.success) {
          setMessages([...messages, res.data.data]);
          setNewMessage('');
          loadConversations();
        }
      } catch (error) {
        console.error('Error sending message:', error);
        message.error('Gửi tin nhắn thất bại.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin nhắn</h1>
        <p className="text-gray-500">Giao tiếp với bác sĩ và đội ngũ hỗ trợ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl" title="Cuộc trò chuyện">
            {loading ? (
              <div className="flex justify-center py-8"><Spin /></div>
            ) : conversations.length > 0 ? (
              <List
                dataSource={conversations}
                renderItem={(conv) => (
                  <List.Item
                    className={`px-3 py-3 border-0 border-b last:border-0 cursor-pointer transition-colors rounded-lg ${selectedConversation?._id === conv._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge
                          count={conv.unread}
                          style={{
                            backgroundColor: conv.unread > 0 ? '#ff4d4f' : 'transparent',
                          }}
                        >
                          <Avatar icon={<UserOutlined />} />
                        </Badge>
                      }
                      title={
                        <div className="font-semibold text-gray-900">
                          {conv.name}
                        </div>
                      }
                      description={
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{conv.specialty}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conv.timestamp}
                          </p>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có cuộc trò chuyện" />
            )}
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="rounded-xl h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar icon={<UserOutlined />} size="large" />
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.specialty}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[400px] max-h-[500px]">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = (msg.sender?._id || msg.sender) === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <div>{msg.text}</div>
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                            {dayjs(msg.createdAt).format('HH:mm')}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Bắt đầu cuộc trò chuyện</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  className="rounded-lg"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className="rounded-lg"
                >
                  Gửi
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="rounded-xl flex items-center justify-center h-full min-h-[500px]">
              <Empty description="Chọn cuộc trò chuyện để bắt đầu" />
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessagesPage;

