import React from 'react';
import { X, MessageSquare, Clock, User, CheckCircle2, ChevronRight } from 'lucide-react';
import { WatchItem } from '../types.ts';

export interface ChatThread {
  threadId: string;
  item: WatchItem;
  otherUser: {
    userId: number;
    nickname: string;
    mannerScore: number;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatListModalProps {
  threads: ChatThread[];
  onClose: () => void;
  onSelectThread: (thread: ChatThread) => void;
}

export const ChatListModal: React.FC<ChatListModalProps> = ({
  threads,
  onClose,
  onSelectThread
}) => {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={19} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              직거래 채팅 목록
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: '#ffffff',
              background: '#2563eb',
              padding: '1px 7px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              {threads.reduce((acc, t) => acc + t.unreadCount, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thread List */}
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {threads.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              진행 중인 직거래 대화가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {threads.map((thread) => (
                <div
                  key={thread.threadId}
                  onClick={() => onSelectThread(thread)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {/* Watch Thumbnail */}
                  <img
                    src={thread.item.images[0]?.imageUrl}
                    alt={thread.item.modelName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>';
                    }}
                    style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f1f5f9' }}
                  />

                  {/* Message & Partner Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {thread.otherUser.nickname}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {thread.lastMessageTime}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {thread.item.brand} {thread.item.modelName} · {formatPrice(thread.item.price)}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: thread.unreadCount > 0 ? '#0f172a' : '#64748b', fontWeight: thread.unreadCount > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {thread.lastMessage}
                    </div>
                  </div>

                  {/* Unread badge & arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {thread.unreadCount > 0 && (
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {thread.unreadCount}
                      </span>
                    )}
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
