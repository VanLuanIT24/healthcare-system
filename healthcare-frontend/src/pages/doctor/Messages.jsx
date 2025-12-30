// src/pages/doctor/Messages.jsx - Tin nhắn / Trao đổi
import { Avatar, Badge, Button, Card, Col, Divider, Empty, Input, List, Row, Space, Spin, Tag, Tooltip, message } from 'antd';
import {
  LoadingOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import messageAPI from '@/services/api/messageAPI';
import { useAuth } from '@/contexts/AuthContext';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const messagesEndRef = useRef(null);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await messageAPI.getConversations();
      const data = res.data?.data || [];

      const formatted = data.map(conv => {
        const currentUserId = user?._id?.toString() || user?.id?.toString();
        const otherParticipant = conv.participants.find(p => p.user?._id?.toString() !== currentUserId);
        const u = otherParticipant?.user || {};
        const info = u.personalInfo || {};

        return {
          ...conv,
          participantName: info.firstName ? `${info.firstName} ${info.lastName}` : (otherParticipant?.user?.fullName || 'Người dùng'),
          participantRole: u.role || otherParticipant?.role || 'patient',
          lastMessageText: conv.lastMessage?.text || 'Bắt đầu trò chuyện',
          lastMessageTime: conv.lastMessage?.createdAt || conv.updatedAt
        };
      });

      console.log('📬 Formatted conversations:', formatted);

      let finalConversations = [...formatted];

      // Handle direct patient messaging from location state
      const targetPatientId = location.state?.patientId;
      console.log('🎯 Target patient ID from state:', targetPatientId);

      if (targetPatientId) {
        const existingConv = formatted.find(conv =>
          conv.participants.some(p => p.user?._id?.toString() === targetPatientId.toString())
        );

        if (existingConv) {
          console.log('✅ Found existing conversation:', existingConv._id);
          setSelectedConversation(existingConv);
        } else {
          console.log('🆕 Creating temporary conversation for patient:', targetPatientId);
          const tempConv = {
            _id: 'temp',
            participantName: location.state?.patientName || 'Bệnh nhân',
            participantRole: 'patient',
            participants: [
              { user: { _id: user?._id, role: user?.role } },
              { user: { _id: targetPatientId, role: 'PATIENT' } }
            ],
            isNew: true,
            lastMessageText: 'Tin nhắn mới',
            lastMessageTime: new Date()
          };

          setSelectedConversation(tempConv);
          setMessages([]);

          // Prepend to list so it shows in sidebar
          finalConversations = [tempConv, ...finalConversations];
        }
      } else if (formatted.length > 0 && !selectedConversation) {
        setSelectedConversation(formatted[0]);
      }

      setConversations(finalConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      message.error('Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (convId) => {
    try {
      const res = await messageAPI.getMessages(convId);
      setMessages(res.data?.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn.');
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

      // Setup polling for new messages (simple real-time substitute)
      const interval = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, 5000);

      return () => clearInterval(interval);
    } else if (selectedConversation?._id === 'temp') {
      setMessages([]);
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const recipient = selectedConversation.participants.find(p => p.user?._id?.toString() !== user?._id?.toString());
      if (!recipient || !recipient.user) {
        console.error('Cannot find recipient in conversation:', selectedConversation);
        return;
      }

      const res = await messageAPI.sendMessage({
        recipientId: recipient.user._id,
        text: messageText
      });

      const newMessage = res.data?.data;
      if (newMessage) {
        setMessages([...messages, newMessage]);
        setMessageText('');
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn.');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    (conv.participantName || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMessage = (msg) => {
    const isDoctor = (msg.sender?._id || msg.sender) === user?._id;
    return (
      <motion.div
        key={msg._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: isDoctor ? 'flex-end' : 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            maxWidth: '60%',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: isDoctor ? '#1890ff' : '#f0f0f0',
            color: isDoctor ? 'white' : 'black',
            wordBreak: 'break-word',
          }}
        >
          <div>{msg.text}</div>
          <div
            style={{
              fontSize: '11px',
              marginTop: '4px',
              opacity: 0.7,
            }}
          >
            {dayjs(msg.createdAt).format('HH:mm')}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DoctorLayout>
      <div
        style={{
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '20px' }}
        >
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            💬 Tin nhắn
          </h1>
        </motion.div>

        {/* Main Layout */}
        <Card
          style={{
            borderRadius: '8px',
            height: 'calc(100vh - 200px)',
            overflow: 'hidden',
          }}
        >
          <Row style={{ height: '100%' }} gutter={0}>
            {/* Conversations List */}
            <Col
              xs={24}
              sm={8}
              style={{
                borderRight: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
              }}
            >
              {/* Search */}
              <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <Input
                  placeholder="Tìm kiếm trò chuyện..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Conversations */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  paddingTop: '8px',
                }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="small" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <Empty description="Chưa có tin nhắn" style={{ padding: '20px' }} />
                ) : (
                  <List
                    dataSource={filteredConversations}
                    renderItem={(conv) => (
                      <List.Item
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor:
                            selectedConversation?._id === conv._id
                              ? '#e6f7ff'
                              : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                        onClick={() => {
                          setSelectedConversation(conv);
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              count={conv.unreadCount}
                              color="#ff4d4f"
                            >
                              <Avatar
                                size="large"
                                icon={<UserOutlined />}
                                style={{
                                  backgroundColor:
                                    conv.participantRole === 'staff'
                                      ? '#52c41a'
                                      : '#1890ff',
                                }}
                              >
                                {(conv.participantName || 'U').charAt(0)}
                              </Avatar>
                            </Badge>
                          }
                          title={
                            <div
                              style={{
                                fontWeight: selectedConversation?._id === conv._id ? 600 : 400,
                              }}
                            >
                              {conv.participantName}
                              {conv.participantRole === 'staff' && (
                                <Tag
                                  color="green"
                                  style={{ marginLeft: '8px', fontSize: '10px' }}
                                >
                                  Staff
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <div
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  marginBottom: '4px',
                                }}
                              >
                                {conv.lastMessageText}
                              </div>
                              <div style={{ color: '#999' }}>
                                {dayjs(conv.lastMessageTime).fromNow()}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Col>

            {/* Chat Area */}
            <Col xs={24} sm={16} style={{ display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Space>
                      <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor:
                            selectedConversation.participantRole === 'staff'
                              ? '#52c41a'
                              : '#1890ff',
                        }}
                      >
                        {(selectedConversation.participantName || 'U').charAt(0)}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {selectedConversation.participantName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {selectedConversation.participantRole === 'patient'
                            ? 'Bệnh nhân'
                            : 'Nhân viên'}
                        </div>
                      </div>
                    </Space>
                    <Button type="primary" icon={<PhoneOutlined />} disabled>
                      Gọi
                    </Button>
                  </div>

                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {messages.map((msg) => renderMessage(msg))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div
                    style={{
                      padding: '12px',
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onPressEnter={handleSendMessage}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      Gửi
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Empty description="Chọn cuộc trò chuyện để bắt đầu" />
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default Messages;
