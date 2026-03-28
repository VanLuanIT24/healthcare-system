// src/pages/doctor/Messages.jsx - Giao diện Chat (Dark Theme Template - Real Data & Interactive UI)
import { Avatar, Button, Input, Dropdown, Menu, Tooltip, Empty, Spin } from 'antd';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  PaperClipOutlined,
  SmileOutlined,
  SendOutlined,
  AudioOutlined,
  LeftOutlined,
  RightOutlined,
  MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import messageAPI from '@/services/api/messageAPI';
import { useAuth } from '@/contexts/AuthContext';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// --- COLORS ---
const colors = {
  bgApp: '#151b2c',
  bgPanel: '#1a233a',
  bgBubbleFriend: '#27314f',
  bgBubbleMe: '#6754e2',
  textMain: '#ffffff',
  textMuted: '#8b9bb4',
  textAccent: '#6754e2',
  border: '#2a3553',
};

// Dummy Data for Calendar Sidebar events
const initialEvents = [
  { date: '8 March', title: 'Họp giao ban viện' },
  { date: '9 March', title: 'Hạn nộp báo cáo nghiên cứu' },
  { date: '10 March', title: 'Hội chẩn ca phẫu thuật tim mạch' },
  { date: '11 March', title: 'Công tác tại bệnh viện đa khoa' },
];

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');

  // Interactive UI states
  const [activeTab, setActiveTab] = useState('chat');
  const [currentDate, setCurrentDate] = useState(dayjs());

  const messagesEndRef = useRef(null);

  // Load conversations
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
          participantName: info.firstName ? `${info.lastName || ''} ${info.firstName}`.trim() : (otherParticipant?.user?.fullName || 'Bệnh nhân'),
          participantRole: u.role || otherParticipant?.role || 'patient',
          lastMessageText: conv.lastMessage?.text || 'Bắt đầu trò chuyện',
          lastMessageTime: conv.lastMessage?.createdAt || conv.updatedAt,
          unreadCount: conv.unreadCount || 0,
        };
      });

      let finalConversations = [...formatted];
      const targetPatientId = location.state?.patientId;

      if (targetPatientId) {
        const existingConv = formatted.find(conv =>
          conv.participants.some(p => p.user?._id?.toString() === targetPatientId.toString())
        );

        if (existingConv) {
          setSelectedConversation(existingConv);
        } else {
          const tempConv = {
            _id: 'temp',
            participantName: location.state?.patientName || 'Bệnh nhân mới',
            participantRole: 'patient',
            participants: [
              { user: { _id: user?._id, role: user?.role } },
              { user: { _id: targetPatientId, role: 'PATIENT' } }
            ],
            isNew: true,
            lastMessageText: 'Chưa có tin nhắn',
            lastMessageTime: new Date(),
            unreadCount: 0,
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
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await messageAPI.getMessages(convId);
      setMessages(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = colors.bgApp;
    if (user?._id || user?.id) {
      loadConversations();
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [user?._id, location.key]);

  useEffect(() => {
    if (selectedConversation?._id && selectedConversation._id !== 'temp') {
      loadMessages(selectedConversation._id);
      const interval = setInterval(() => loadMessages(selectedConversation._id), 5000);
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
      const recipient = selectedConversation.participants?.find(p => p.user?._id?.toString() !== user?._id?.toString());
      if (!recipient || !recipient.user) return;

      const res = await messageAPI.sendMessage({ recipientId: recipient.user._id, text: messageText });
      const newMessage = res.data?.data;
      if (newMessage) {
        setMessages([...messages, newMessage]);
        setMessageText('');
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Calendar logic
  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const dayOfWeek = startOfMonth.day(); // 0 is Sunday

  const moreIconMenu = (
    <Menu theme="dark" style={{ backgroundColor: colors.bgPanel }}>
      <Menu.Item key="1">Xóa cuộc trò chuyện</Menu.Item>
      <Menu.Item key="2">Tắt thông báo</Menu.Item>
    </Menu>
  );

  return (
    <DoctorLayout>
      <div
        className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden"
        style={{ backgroundColor: colors.bgApp, fontFamily: 'sans-serif' }}
      >

        {/* LEFT COLUMN: CHAT LIST */}
        <div
          className="col-span-1 md:col-span-4 lg:col-span-3 rounded-lg flex flex-col overflow-hidden shadow-lg border"
          style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: colors.border }}>
            <div
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center text-sm font-semibold cursor-pointer transition-colors ${activeTab === 'chat' ? '' : 'hover:bg-white/5'}`}
              style={{
                backgroundColor: activeTab === 'chat' ? colors.textAccent : 'transparent',
                color: activeTab === 'chat' ? colors.textMain : colors.textMuted
              }}
            >
              Chat
            </div>
            <div
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3 text-center text-sm font-semibold cursor-pointer transition-colors ${activeTab === 'new' ? '' : 'hover:bg-white/5'}`}
              style={{
                backgroundColor: activeTab === 'new' ? colors.textAccent : 'transparent',
                color: activeTab === 'new' ? colors.textMain : colors.textMuted
              }}
            >
              Mới
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {activeTab === 'new' ? (
              <div className="flex justify-center items-center h-full flex-col opacity-60 p-4">
                <MessageOutlined className="text-4xl mb-3" style={{ color: colors.textMuted }} />
                <span className="text-center text-sm" style={{ color: colors.textMuted }}>Danh sách người liên hệ mới<br />(Đang phát triển)</span>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-full">
                <Spin />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex justify-center items-center h-full opacity-50 p-4">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span style={{ color: colors.textMuted }}>Không có cuộc trò chuyện</span>}
                />
              </div>
            ) : (
              conversations.map((conv, idx) => {
                const active = selectedConversation?._id === conv._id;
                return (
                  <div
                    key={conv._id || idx}
                    onClick={() => setSelectedConversation(conv)}
                    className="flex items-center px-4 py-3 cursor-pointer transition-colors border-b last:border-0"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderColor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <Avatar
                      size={40}
                      className="shrink-0 font-bold bg-blue-600 border border-blue-400"
                    >
                      {conv.participantName.charAt(0)}
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="m-0 text-sm font-medium truncate" style={{ color: active ? colors.textMain : '#e5e7eb' }}>
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px]" style={{ color: colors.textMuted }}>
                          {dayjs(conv.lastMessageTime).format('HH:mm')}
                        </span>
                      </div>
                      <p className="m-0 text-xs truncate" style={{ color: colors.textMuted }}>
                        {conv.lastMessageText}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: CHAT HISTORY */}
        <div
          className="col-span-1 md:col-span-8 lg:col-span-6 rounded-lg flex flex-col overflow-hidden shadow-lg border"
          style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
        >
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar size={40} className="font-bold bg-blue-600 border border-blue-400">
                      {selectedConversation.participantName.charAt(0)}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: colors.bgPanel }}></div>
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-medium" style={{ color: colors.textMain }}>
                      {selectedConversation.participantName}
                    </h3>
                    <p className="m-0 text-xs" style={{ color: colors.textMuted }}>Đang trực tuyến</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Tooltip title="Gọi điện">
                    <PhoneOutlined className="text-xl hover:opacity-80 cursor-pointer" style={{ color: colors.textMuted }} />
                  </Tooltip>
                  <Tooltip title="Gọi video">
                    <VideoCameraOutlined className="text-xl hover:opacity-80 cursor-pointer" style={{ color: colors.textMuted }} />
                  </Tooltip>
                  <Dropdown overlay={moreIconMenu} trigger={['click']}>
                    <MoreOutlined className="text-xl hover:opacity-80 cursor-pointer" style={{ color: colors.textMuted }} />
                  </Dropdown>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 hide-scrollbar relative bg-[#1c243b]">
                {messages.length === 0 ? (
                  <div className="flex justify-center h-full items-center opacity-40">
                    <div className="text-center">
                      <MessageOutlined className="text-4xl mb-2" style={{ color: colors.textMuted }} />
                      <p style={{ color: colors.textMuted }}>Hãy gửi tin nhắn đầu tiên để bắt đầu tư vấn.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isDoctor = (msg.sender?._id || msg.sender) === user?._id;
                    const bubbleColor = isDoctor ? colors.bgBubbleMe : colors.bgBubbleFriend;
                    const alignMsg = isDoctor ? 'justify-end' : 'justify-start';
                    const senderName = isDoctor ? 'Bác sĩ' : (msg.sender?.name || selectedConversation.participantName);

                    return (
                      <div key={msg._id || index} className={`flex ${alignMsg} w-full`}>
                        <div
                          className="rounded-lg p-3 sm:p-4 shadow-sm max-w-[85%] sm:max-w-[70%]"
                          style={{ backgroundColor: bubbleColor }}
                        >
                          <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar size={20} className={isDoctor ? "bg-white text-blue-600" : "bg-gray-400"}>
                                {senderName.charAt(0)}
                              </Avatar>
                              <span className="text-sm font-medium" style={{ color: colors.textMain }}>{senderName}</span>
                            </div>
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {dayjs(msg.createdAt).format('HH:mm')}
                            </span>
                          </div>
                          <div className="text-sm tracking-wide leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)', wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#1c243b]">
                <div
                  className="flex items-center rounded-lg pl-3 pr-1 py-1 border overflow-hidden"
                  style={{ backgroundColor: colors.bgApp, borderColor: '#354366' }}
                >
                  <Tooltip title="Đính kèm file/ảnh">
                    <Button type="text" shape="circle" icon={<PaperClipOutlined style={{ color: colors.textMuted }} />} className="mr-1" />
                  </Tooltip>
                  <Input
                    bordered={false}
                    placeholder="Nhập tin nhắn..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onPressEnter={handleSendMessage}
                    className="flex-1 bg-transparent text-sm"
                    style={{ color: colors.textMain }}
                  />
                  <div className="flex items-center gap-1 mx-1">
                    <Button type="text" shape="circle" icon={<SmileOutlined style={{ color: colors.textMuted }} />} className="hidden sm:inline-flex" />
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="border-none shadow-none h-10 w-12 rounded"
                    style={{ backgroundColor: messageText.trim() ? colors.textAccent : '#3b4b72' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#1c243b] opacity-60">
              <MessageOutlined className="text-6xl mb-4" style={{ color: colors.textMuted }} />
              <span className="text-lg" style={{ color: colors.textMuted }}>Theo dõi cuộc trò chuyện từ danh sách</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EVENTS (INTERACTIVE CALENDAR) - ONLY VISIBLE ON LARGE SCREENS */}
        <div
          className="hidden lg:flex lg:col-span-3 rounded flex-col overflow-hidden shadow-lg border p-5"
          style={{ backgroundColor: colors.bgPanel, borderColor: colors.border }}
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className="m-0 text-base font-semibold" style={{ color: colors.textMain }}>Lịch khám nội bộ</h4>
            <MoreOutlined style={{ color: colors.textMuted }} className="cursor-pointer" />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 text-sm font-medium" style={{ color: colors.textMain }}>
              <span className="capitalize">{currentDate.format('MMMM yyyy')}</span>
              <div className="flex gap-1">
                <Button onClick={handlePrevMonth} size="small" type="text" icon={<LeftOutlined />} style={{ color: colors.textMain, backgroundColor: colors.textAccent, borderRadius: '4px' }} />
                <Button onClick={handleNextMonth} size="small" type="text" icon={<RightOutlined />} style={{ color: colors.textMain, backgroundColor: colors.textAccent, borderRadius: '4px' }} />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-medium" style={{ color: colors.textMuted }}>
              <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm" style={{ color: colors.textMain }}>
              {Array.from({ length: dayOfWeek }).map((_, i) => <div key={`empty-${i}`}></div>)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === dayjs().date() && currentDate.isSame(dayjs(), 'month');
                return (
                  <div
                    key={day}
                    className="py-2.5 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ backgroundColor: isToday ? colors.textAccent : 'transparent' }}
                  >
                    {day}
                    {isToday && <span className="absolute -bottom-1 text-[8px] bg-red-500 px-1 rounded font-bold">10:29</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 hide-scrollbar">
            {initialEvents.map((ev, i) => (
              <div key={i} className="pt-2 border-t border-white/5 first:border-0 border-dashed">
                <h5 className="m-0 text-sm font-semibold" style={{ color: colors.textMain }}>{ev.date}</h5>
                <p className="m-0 text-xs mt-1" style={{ color: colors.textMuted }}>{ev.title}</p>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-4 border-none font-semibold text-sm h-10 rounded shadow-none hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#212d4d', color: colors.textMain }}
          >
            THÊM LỊCH MỚI
          </Button>
        </div>

      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3553;
          border-radius: 4px;
        }
      `}</style>
    </DoctorLayout>
  );
};

export default Messages;
