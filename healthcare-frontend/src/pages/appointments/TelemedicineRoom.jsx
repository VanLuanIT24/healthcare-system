import { CheckCircleOutlined, ClockCircleOutlined, FileImageOutlined, PaperClipOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Empty, Input, message, Row, Space, Tag, Timeline, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import './TelemedicineRoom.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const TelemedicineRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Load session info from URL params or storage
    loadSessionInfo();
    
    // Start session timer
    startSession();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessionInfo = () => {
    // Mock session data - replace with actual API call
    const mockSession = {
      appointmentId: 'APT-12345',
      patientName: 'Nguyễn Văn A',
      patientAge: 35,
      patientGender: 'Nam',
      doctorName: 'BS. Trần Thị B',
      specialization: 'Tim mạch',
      appointmentDate: dayjs().format('DD/MM/YYYY HH:mm'),
      reason: 'Khám tim định kỳ',
      medicalHistory: 'Tiền sử cao huyết áp'
    };
    setSessionInfo(mockSession);
  };

  const startSession = () => {
    setSessionActive(true);
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    // Add welcome message
    addSystemMessage('Phiên khám đã bắt đầu. Xin chào!');
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSessionActive(false);
    addSystemMessage('Phiên khám đã kết thúc. Cảm ơn bạn!');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addSystemMessage = (content) => {
    const systemMsg = {
      id: Date.now(),
      type: 'system',
      content,
      timestamp: dayjs().format('HH:mm')
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      message.warning('Vui lòng nhập tin nhắn');
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: 'user',
      sender: 'Bệnh nhân',
      content: inputMessage,
      timestamp: dayjs().format('HH:mm'),
      attachments: attachments.length > 0 ? [...attachments] : null
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setAttachments([]);

    // Simulate doctor response after 2 seconds
    setTimeout(() => {
      const doctorResponse = {
        id: Date.now(),
        type: 'doctor',
        sender: 'Bác sĩ',
        content: 'Cảm ơn bạn đã chia sẻ thông tin. Tôi sẽ xem xét và tư vấn cho bạn.',
        timestamp: dayjs().format('HH:mm')
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 2000);
  };

  const handleFileUpload = ({ file, fileList }) => {
    if (file.status === 'done' || file.status === 'uploading') {
      setAttachments(fileList);
      message.success(`${file.name} đã tải lên thành công`);
    } else if (file.status === 'error') {
      message.error(`${file.name} tải lên thất bại`);
    }
  };

  const handleSavePrescription = () => {
    if (!notes.trim()) {
      message.warning('Vui lòng nhập nội dung đơn thuốc');
      return;
    }

    message.success('Đơn thuốc đã được lưu và gửi cho bệnh nhân');
    addSystemMessage('Bác sĩ đã kê đơn thuốc');
    setNotes('');
  };

  return (
    <div className="telemedicine-room">
      {/* Header */}
      <Card className="session-header glass">
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div className="session-status">
                {sessionActive ? (
                  <>
                    <div className="status-indicator active" />
                    <Text strong style={{ fontSize: '16px' }}>Phiên khám đang diễn ra</Text>
                  </>
                ) : (
                  <>
                    <div className="status-indicator ended" />
                    <Text strong style={{ fontSize: '16px' }}>Phiên khám đã kết thúc</Text>
                  </>
                )}
              </div>
              <Tag icon={<ClockCircleOutlined />} color="blue" style={{ padding: '4px 12px', fontSize: '14px' }}>
                {formatTimer(sessionTimer)}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button
              danger={sessionActive}
              type={sessionActive ? 'primary' : 'default'}
              size="large"
              onClick={sessionActive ? endSession : startSession}
              style={{ borderRadius: '12px' }}
            >
              {sessionActive ? 'Kết thúc phiên khám' : 'Bắt đầu lại'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Panel - Patient Info */}
        <Col xs={24} md={6}>
          <Card className="patient-info-card glass" title="Thông tin bệnh nhân">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="info-item">
                <Avatar size={80} icon={<UserOutlined />} style={{ margin: '0 auto 16px', display: 'block' }} />
                <Text strong style={{ fontSize: '16px', display: 'block', textAlign: 'center' }}>
                  {sessionInfo?.patientName}
                </Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="info-item">
                <Text type="secondary">Tuổi:</Text>
                <Text strong>{sessionInfo?.patientAge}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Giới tính:</Text>
                <Text strong>{sessionInfo?.patientGender}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Lý do khám:</Text>
                <Text strong>{sessionInfo?.reason}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Tiền sử:</Text>
                <Text>{sessionInfo?.medicalHistory}</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="info-item">
                <Text type="secondary">Bác sĩ:</Text>
                <Text strong>{sessionInfo?.doctorName}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Chuyên khoa:</Text>
                <Tag color="blue">{sessionInfo?.specialization}</Tag>
              </div>
            </Space>
          </Card>

          {/* Session Timeline */}
          <Card className="timeline-card glass" title="Diễn biến phiên khám" style={{ marginTop: '24px' }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Bắt đầu phiên khám</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {sessionInfo?.appointmentDate}
                      </Text>
                    </>
                  )
                },
                {
                  color: sessionActive ? 'blue' : 'gray',
                  children: (
                    <>
                      <Text strong>Trao đổi với bệnh nhân</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {messages.filter(m => m.type !== 'system').length} tin nhắn
                      </Text>
                    </>
                  )
                },
                {
                  color: 'gray',
                  children: (
                    <>
                      <Text>Kê đơn thuốc</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Chưa thực hiện
                      </Text>
                    </>
                  )
                },
                {
                  color: 'gray',
                  dot: <CheckCircleOutlined />,
                  children: <Text>Kết thúc phiên khám</Text>
                }
              ]}
            />
          </Card>
        </Col>

        {/* Middle Panel - Chat */}
        <Col xs={24} md={12}>
          <Card
            className="chat-card glass"
            title={
              <Space>
                <Text strong style={{ fontSize: '16px' }}>Trao đổi trực tuyến</Text>
                <Tag color="green">{messages.length} tin nhắn</Tag>
              </Space>
            }
          >
            {/* Messages Area */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <Empty
                  description="Chưa có tin nhắn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '60px 0' }}
                />
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-item ${msg.type === 'system' ? 'system-message' : msg.type === 'user' ? 'user-message' : 'doctor-message'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="system-content">
                        <Text type="secondary" style={{ fontSize: '13px' }}>{msg.content}</Text>
                      </div>
                    ) : (
                      <div className="message-bubble">
                        <div className="message-header">
                          <Text strong style={{ fontSize: '13px' }}>{msg.sender}</Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>{msg.timestamp}</Text>
                        </div>
                        <div className="message-content">
                          <Text>{msg.content}</Text>
                        </div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="message-attachments">
                            {msg.attachments.map((file, index) => (
                              <div key={index} className="attachment-item">
                                <FileImageOutlined />
                                <Text style={{ fontSize: '12px' }}>{file.name}</Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
              <Space.Compact style={{ width: '100%' }}>
                <Upload
                  beforeUpload={() => false}
                  onChange={handleFileUpload}
                  fileList={attachments}
                  showUploadList={false}
                >
                  <Button icon={<PaperClipOutlined />} style={{ borderRadius: '12px 0 0 12px' }}>
                    Đính kèm
                  </Button>
                </Upload>
                <TextArea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!sessionActive}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!sessionActive}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '0 12px 12px 0'
                  }}
                >
                  Gửi
                </Button>
              </Space.Compact>
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  {attachments.map((file, index) => (
                    <Tag key={index} closable onClose={() => setAttachments(attachments.filter((_, i) => i !== index))}>
                      {file.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Panel - Notes & Prescription */}
        <Col xs={24} md={6}>
          <Card className="notes-card glass" title="Ghi chú & Đơn thuốc">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Ghi chú khám bệnh:</Text>
                <TextArea
                  rows={6}
                  placeholder="Nhập triệu chứng, chẩn đoán..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!sessionActive}
                  style={{ borderRadius: '12px' }}
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Đơn thuốc:</Text>
                <TextArea
                  rows={6}
                  placeholder="Nhập tên thuốc, liều lượng, cách dùng..."
                  disabled={!sessionActive}
                  style={{ borderRadius: '12px' }}
                />
              </div>

              <Button
                type="primary"
                block
                size="large"
                onClick={handleSavePrescription}
                disabled={!sessionActive}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                Lưu & Gửi đơn thuốc
              </Button>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>File đính kèm:</Text>
                <Upload
                  beforeUpload={() => false}
                  onChange={handleFileUpload}
                  multiple
                  disabled={!sessionActive}
                >
                  <Button icon={<FileImageOutlined />} block style={{ borderRadius: '12px' }}>
                    Tải lên hình ảnh/file
                  </Button>
                </Upload>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TelemedicineRoom;
