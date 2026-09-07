import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, ShieldCheck, Clock, User, CheckCheck, AlertCircle, ArrowLeft, RefreshCw, Image, Paperclip, LogOut, CheckCircle, Check } from 'lucide-react';
import { WatchItem, ChatMessage, ItemStatus } from '../types.ts';
import { api } from '../api.ts';

interface ChatModalProps {
  item: WatchItem;
  initialThreadId?: string;
  initialOtherUser?: { userId: number; nickname: string; mannerScore: number; isLeft?: boolean };
  currentUserId: number;
  onClose: () => void;
  onBackToList?: () => void;
  onOpenReview?: (sellerId: number, sellerNickname: string, itemSummary?: string) => void;
  onItemStatusChanged?: (itemId: number, newStatus: ItemStatus) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  item,
  initialThreadId,
  initialOtherUser,
  currentUserId,
  onClose,
  onBackToList,
  onOpenReview,
  onItemStatusChanged
}) => {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId || null);
  const [partnerUser, setPartnerUser] = useState<{ userId: number; nickname: string; mannerScore: number; isLeft?: boolean } | null>(initialOtherUser || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemState, setItemState] = useState<WatchItem>(item);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isSeller = currentUserId === itemState.sellerId;

  const checkReviewStatus = async (sellerId: number) => {
    try {
      const reviews = await api.getSellerReviews(sellerId);
      const itemSummary = `${itemState.brand} ${itemState.modelName}`;
      const reviewed = reviews.some((r: any) => r.reviewerId === currentUserId && r.itemSummary === itemSummary);
      setHasReviewed(reviewed);
    } catch {}
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  // Initialize or fetch Thread
  useEffect(() => {
    let isMounted = true;

    const initThread = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let activeId = initialThreadId;
        if (initialThreadId) {
          const res = await api.getChatThreadById(initialThreadId);
          if (isMounted) {
            setThreadId(res.thread.threadId);
            setItemState(res.item || item);
            setPartnerUser(res.otherUser);
            activeId = res.thread.threadId;
          }
        } else {
          const res = await api.getOrCreateItemChatThread(item.itemId);
          if (isMounted) {
            setThreadId(res.thread.threadId);
            setItemState(res.item || item);
            setPartnerUser(res.otherUser);
            activeId = res.thread.threadId;
          }
        }

        if (isMounted && activeId) {
          const msgList = await api.getChatMessages(activeId);
          setMessages(msgList);
          checkReviewStatus(item.sellerId);
          setTimeout(() => scrollToBottom('auto'), 50);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || '채팅방을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initThread();

    return () => {
      isMounted = false;
    };
  }, [item.itemId, initialThreadId]);

  // Polling for incoming messages without unnecessary scrollbar yanking
  useEffect(() => {
    if (!threadId) return;

    const interval = setInterval(async () => {
      try {
        const msgList = await api.getChatMessages(threadId);
        setMessages(prev => {
          const isDifferent = msgList.length !== prev.length ||
            (msgList.length > 0 && prev[prev.length - 1]?.messageId !== msgList[msgList.length - 1]?.messageId);

          if (!isDifferent) {
            return prev; // keep identical reference to avoid unnecessary re-renders
          }

          // Check if user is scrolled near bottom before auto-scrolling
          if (chatContainerRef.current) {
            const container = chatContainerRef.current;
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
            if (isNearBottom) {
              setTimeout(() => scrollToBottom('smooth'), 50);
            }
          }

          return msgList;
        });
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [threadId]);

  // Send Text / Image Message
  const handleSendMessage = async (textToSend?: string, imageUrlToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if ((!text && !imageUrlToSend) || !threadId || isSending) return;

    setIsSending(true);
    if (!imageUrlToSend) setInputText('');

    try {
      const newMsg = await api.sendChatMessage(threadId, text, imageUrlToSend);
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      setError(err.message || '메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedUrls = await api.uploadImages([file]);
      if (uploadedUrls.length > 0) {
        await handleSendMessage('', uploadedUrls[0]);
      }
    } catch (err: any) {
      alert(err.message || '사진 전송에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Seller: Mark as SOLD directly in chat
  const handleMarkAsSold = async () => {
    if (!window.confirm('이 구매자와의 직거래를 [판매 완료(SOLD)]로 변경하시겠습니까?\n\n※ 판매완료 처리된 매물은 타임링크 실거래가 아카이브에 영구 보존되며 수정/삭제가 제한됩니다.')) {
      return;
    }

    try {
      const updated = await api.updateItemStatus(itemState.itemId, 'SOLD');
      setItemState(updated);
      if (onItemStatusChanged) {
        onItemStatusChanged(itemState.itemId, 'SOLD');
      }
      // Send automated status message
      await handleSendMessage('🤝 [알림] 판매자가 해당 매물을 [판매 완료]로 변경하였습니다.');
      alert('거래가 성공적으로 완료되었습니다! 상호 매너 평가를 진행해주세요.');
      if (onOpenReview) {
        onOpenReview(itemState.sellerId, itemState.seller?.nickname || '판매자', `${itemState.brand} ${itemState.modelName}`);
      }
    } catch (err: any) {
      alert(err.message || '거래 완료 처리에 실패했습니다.');
    }
  };

  // Leave Chat Room
  const handleLeaveChat = async () => {
    if (!threadId) return;
    if (!window.confirm('정말 이 대화방을 나가시겠습니까? 대화 목록에서 삭제됩니다.')) {
      return;
    }

    try {
      await api.deleteChatThread(threadId);
      alert('대화방을 나갔습니다.');
      if (onBackToList) {
        onBackToList();
      } else {
        onClose();
      }
    } catch (err: any) {
      alert(err.message || '대화방 나가기에 실패했습니다.');
    }
  };

  const quickActions = [
    '직거래 장소 및 시간 조율 문의',
    '보증서 및 실물 상태 문의',
    '쿨거래 시 가격 네고 가능한가요?',
    '은행 객장 대면 직거래 희망합니다'
  ];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '방금 전';
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', height: '660px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBackToList && (
              <button
                onClick={onBackToList}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
                title="대화 목록으로 돌아가기"
              >
                <ArrowLeft size={15} />
                <span>목록</span>
              </button>
            )}

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  {partnerUser?.nickname || (isSeller ? '구매자' : (itemState.seller?.nickname || '판매자'))}
                </span>
                {partnerUser?.isLeft ? (
                  <span style={{
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    대화 상대 나감
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                    매너온도 {(partnerUser?.mannerScore ?? itemState.seller?.mannerScore ?? 36.5).toFixed(1)}℃
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {partnerUser?.isLeft ? '상대방이 대화방을 나갔습니다' : '1:1 안심 직거래 대화방'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Leave Room Button */}
            <button
              onClick={handleLeaveChat}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 9px',
                color: '#f87171',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="대화방 나가기"
            >
              <LogOut size={13} />
              <span>방 나가기</span>
            </button>

            {onOpenReview && !isSeller && !partnerUser?.isLeft && (
              hasReviewed ? (
                <span
                  style={{
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid #059669',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    color: '#34d399',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="해당 거래에 대한 매너 후기 작성을 완료했습니다."
                >
                  <CheckCheck size={13} />
                  <span>후기 작성완료</span>
                </span>
              ) : (
                <button
                  onClick={() => onOpenReview(itemState.sellerId, partnerUser?.nickname || itemState.seller?.nickname || '판매자', `${itemState.brand} ${itemState.modelName}`)}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="판매자 매너온도 평가하기"
                >
                  후기 남기기
                </button>
              )
            )}

            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
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
            src={itemState.images[0]?.imageUrl}
            alt={itemState.modelName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>';
            }}
            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#f1f5f9' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{itemState.brand}</span>
              {itemState.itemStatus === 'SOLD' ? (
                <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  🔒 판매완료 (SOLD)
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  판매중
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {itemState.modelName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {formatPrice(itemState.price)} · {itemState.preferredLocation || '지역 협의'}
            </div>
          </div>

          {/* Seller Direct Action: Mark as SOLD */}
          {isSeller && itemState.itemStatus !== 'SOLD' && !partnerUser?.isLeft && (
            <button
              onClick={handleMarkAsSold}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
              }}
              title="이 매물을 거래완료로 변경합니다"
            >
              <Check size={14} />
              <span>거래완료 확정</span>
            </button>
          )}
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
          <span>안전한 거래를 위해 은행 객장 대면 직거래 및 시리얼 각인 대조를 권장합니다.</span>
        </div>

        {/* Messages List Area */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              대화 내역을 불러오는 중...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              아직 메시지가 없습니다. 아래 추천 버튼이나 입력창으로 첫 메시지를 보내보세요.
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.messageId} style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
                    <div style={{
                      fontSize: '0.76rem',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      padding: '5px 14px',
                      borderRadius: '16px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <AlertCircle size={13} color="#94a3b8" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.messageId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '78%',
                    padding: msg.imageUrl ? '6px' : '10px 14px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isMe ? '#0f172a' : '#ffffff',
                    color: isMe ? '#ffffff' : '#0f172a',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}>
                    {msg.imageUrl && (
                      <div style={{ marginBottom: msg.text ? '6px' : '0' }}>
                        <img
                          src={msg.imageUrl}
                          alt="첨부 사진"
                          style={{
                            maxWidth: '240px',
                            maxHeight: '240px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            display: 'block',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      </div>
                    )}
                    {msg.text && (
                      <div style={{ padding: msg.imageUrl ? '4px 6px' : '0' }}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* If partner has left: Show disabled notice. Otherwise: Show Input & Chips */}
        {partnerUser?.isLeft ? (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={16} color="#94a3b8" />
            <span>대화 상대가 대화방을 나갔으므로 더 이상 메시지를 보낼 수 없습니다.</span>
          </div>
        ) : (
          <>
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
                  disabled={isSending || isLoading}
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
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Hidden File Input for Photos */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isLoading || isUploadingImage}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                  color: '#475569',
                  flexShrink: 0
                }}
                title="실물 사진 첨부"
              >
                <Image size={18} />
              </button>

              <input
                type="text"
                placeholder={isUploadingImage ? '사진 업로드 중...' : '메시지를 입력하세요...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending || isLoading || isUploadingImage}
                className="form-input"
                style={{ fontSize: '0.88rem', height: '40px' }}
              />

              <button
                type="submit"
                disabled={isSending || isLoading || !inputText.trim() || isUploadingImage}
                className="btn-primary"
                style={{ height: '40px', padding: '0 16px', whiteSpace: 'nowrap', opacity: !inputText.trim() ? 0.6 : 1, flexShrink: 0 }}
              >
                <Send size={15} />
                <span>전송</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

