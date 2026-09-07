import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, ShieldCheck, Clock, User, CheckCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { WatchItem } from '../types.ts';

interface ChatMessage {
  id: string;
  sender: 'ME' | 'SELLER';
  text: string;
  timestamp: string;
}

interface ChatModalProps {
  item: WatchItem;
  currentUserId: number;
  onClose: () => void;
  onBackToList?: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ item, currentUserId, onClose, onBackToList }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'SELLER',
      text: `안녕하세요! [${item.brand} ${item.modelName}] 매물에 관심 가져주셔서 감사합니다. 궁금하신 점이나 직거래 일정 편하게 말씀해주세요.`,
      timestamp: '방금 전'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ME',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate realistic seller auto-reply after 1 second
    setTimeout(() => {
      let replyText = '네, 문의 확인했습니다! 안전을 위해 평일 낮 은행 객장 대면 직거래 가능합니다.';
      if (text.includes('네고') || text.includes('할인') || text.includes('가격')) {
        replyText = '쿨거래 해주시면 소정의 차비 정도는 네고 고려해보겠습니다 ^^';
      } else if (text.includes('장소') || text.includes('시간') || text.includes('직거래')) {
        replyText = `${item.preferredLocation || '서울 인근 은행'}에서 계좌이체 확인 후 시계 인계 가능합니다.`;
      } else if (text.includes('보증서') || text.includes('상태') || text.includes('스크래치')) {
        replyText = '보증서 및 정품 풀세트 모두 보관 중이며, 현장에서 타임그래퍼 오차 및 외관 함께 확인 가능합니다.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'SELLER',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  const quickActions = [
    '직거래 장소 및 시간 조율 문의',
    '보증서 및 실물 상태 문의',
    '쿨거래 시 가격 네고 가능한가요?',
    '은행 객장 직거래 희망합니다'
  ];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', height: '640px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBackToList && (
              <button
                onClick={onBackToList}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                title="대화 목록으로 돌아가기"
              >
                <ArrowLeft size={15} />
                <span>대화 목록</span>
              </button>
            )}

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} color="#475569" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {item.seller?.nickname || '판매자'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                  매너온도 {item.seller?.mannerScore || 36.5}℃
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                1:1 직거래 안심 채팅
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Watch Item Snippet Bar */}
        <div style={{
          padding: '10px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img
            src={item.images[0]?.imageUrl}
            alt={item.modelName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>';
            }}
            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#f1f5f9' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{item.brand}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.modelName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {item.tradeType === 'DIRECT_ONLY' ? '대면 직거래 원칙' : '직거래 / 택배'} · {item.preferredLocation || '지역 협의'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {formatPrice(item.price)}
            </div>
          </div>
        </div>

        {/* Safety Warning */}
        <div style={{
          background: '#fffbeb',
          padding: '6px 14px',
          fontSize: '0.72rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid #fef3c7'
        }}>
          <ShieldCheck size={14} color="#d97706" />
          <span>안전한 거래를 위해 은행 객장 대면 직거래 및 계좌 실입금 확인을 권장합니다.</span>
        </div>

        {/* Messages List Area */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((msg) => {
            const isMe = msg.sender === 'ME';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: isMe ? '#0f172a' : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  wordBreak: 'break-word'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '8px 14px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.74rem',
                padding: '4px 10px',
                borderRadius: '16px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="판매자에게 메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.88rem', height: '40px' }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ height: '40px', padding: '0 16px', whiteSpace: 'nowrap' }}
          >
            <Send size={15} />
            <span>전송</span>
          </button>
        </form>
      </div>
    </div>
  );
};
