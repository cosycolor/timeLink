import React from 'react';
import { X, MessageSquare, Clock, User, CheckCircle2, ChevronRight, Trash2 } from 'lucide-react';
import { WatchItem } from '../types.ts';

export interface ChatThread {
  threadId: string;
  item: WatchItem;
  otherUser: {
    userId: number;
    nickname: string;
    mannerScore: number;
    isLeft?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPartnerLeft?: boolean;
}

interface ChatListModalProps {
  threads: ChatThread[];
  onClose: () => void;
  onSelectThread: (thread: ChatThread) => void;
  onDeleteThread?: (threadId: string) => void;
}

export const ChatListModal: React.FC<ChatListModalProps> = ({
  threads,
  onClose,
  onSelectThread,
  onDeleteThread
}) => {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              직거래 1:1 대화 목록
            </span>
            {totalUnread > 0 && (
              <span style={{
                fontSize: '0.72rem',
                color: '#ffffff',
                background: '#ef4444',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 800
              }}>
                {totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Thread List */}
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {threads.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: thread.otherUser.isLeft || thread.isPartnerLeft ? '#94a3b8' : '#0f172a' }}>
                          {thread.otherUser.nickname}
                        </span>
                        {(thread.otherUser.isLeft || thread.isPartnerLeft) && (
                          <span style={{
                            fontSize: '0.65rem',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            대화 상대 나감
                          </span>
                        )}
                      </div>
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

                  {/* Actions & Unread */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                    {onDeleteThread && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('이 대화방을 나가시겠습니까?')) {
                            onDeleteThread(thread.threadId);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="대화방 나가기"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <Trash2 size={15} />
                      </button>
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

