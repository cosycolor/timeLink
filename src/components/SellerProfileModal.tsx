import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Watch, ThumbsUp, MessageSquare, Star, Sparkles } from 'lucide-react';
import { UserProfile, WatchItem, UserReview } from '../types.ts';
import { api } from '../api.ts';

interface SellerProfileModalProps {
  sellerId: number;
  onClose: () => void;
  onSelectItem: (item: WatchItem) => void;
  onOpenReview?: (sellerId: number, nickname: string) => void;
  currentUserId?: number;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  sellerId,
  onClose,
  onSelectItem,
  onOpenReview,
  currentUserId
}) => {
  const [profile, setProfile] = useState<(UserProfile & { reviews?: UserReview[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FOR_SALE' | 'SOLD' | 'REVIEWS'>('FOR_SALE');

  const fetchSeller = async () => {
    setLoading(true);
    try {
      const data: any = await api.getSellerProfile(sellerId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load seller profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [sellerId]);

  const forSaleItems = (profile?.items || []).filter(i => i.itemStatus === 'FOR_SALE' || i.itemStatus === 'RESERVED');
  const soldItems = (profile?.items || []).filter(i => i.itemStatus === 'SOLD');
  const reviews = profile?.reviews || [];

  const isSelf = currentUserId === sellerId;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '0', overflow: 'hidden' }}
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
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            판매자 프로필 정보
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', maxHeight: 'calc(85vh - 100px)', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              판매자 정보를 불러오는 중입니다...
            </div>
          ) : profile ? (
            <>
              {/* Profile Summary Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={28} color="#475569" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {profile.nickname}
                      </span>
                      {profile.isPhoneVerified && (
                        <span className="badge-verified" style={{ fontSize: '0.72rem' }}>
                          <ShieldCheck size={13} /> 본인인증 완료
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      누적 거래 완료 {profile.completedSalesCount ?? 0}건 · 받은 후기 {reviews.length}건
                    </div>
                  </div>
                </div>

                {/* Manner Score & Rate Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>매너온도</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                      {profile.mannerScore || 36.5}℃
                    </div>
                  </div>

                  {!isSelf && onOpenReview && (
                    <button
                      onClick={() => onOpenReview(profile.userId, profile.nickname)}
                      className="btn-primary"
                      style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px' }}
                    >
                      <ThumbsUp size={13} />
                      <span>매너 평가</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('FOR_SALE')}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'FOR_SALE' ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeTab === 'FOR_SALE' ? '#2563eb' : '#64748b',
                    fontWeight: activeTab === 'FOR_SALE' ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  판매 중인 매물 ({forSaleItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('SOLD')}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'SOLD' ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeTab === 'SOLD' ? '#2563eb' : '#64748b',
                    fontWeight: activeTab === 'SOLD' ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  거래 완료 내역 ({soldItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('REVIEWS')}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'REVIEWS' ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeTab === 'REVIEWS' ? '#2563eb' : '#64748b',
                    fontWeight: activeTab === 'REVIEWS' ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  받은 거래 후기 ({reviews.length})
                </button>
              </div>

              {/* Tab 1: For Sale */}
              {activeTab === 'FOR_SALE' && (
                forSaleItems.length === 0 ? (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                    현재 판매 중인 매물이 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {forSaleItems.map(item => (
                      <div
                        key={item.itemId}
                        onClick={() => {
                          onSelectItem(item);
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <img
                          src={item.images[0]?.imageUrl}
                          alt={item.modelName}
                          style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{item.brand}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{item.modelName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.preferredLocation || '지역 협의'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{formatPrice(item.price)}</div>
                          <div style={{ fontSize: '0.7rem', color: item.itemStatus === 'RESERVED' ? '#d97706' : '#059669', fontWeight: 600 }}>
                            {item.itemStatus === 'RESERVED' ? '예약중' : '판매중'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 2: Sold Items */}
              {activeTab === 'SOLD' && (
                soldItems.length === 0 ? (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                    완료된 거래 내역이 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {soldItems.map(item => (
                      <div
                        key={item.itemId}
                        onClick={() => {
                          onSelectItem(item);
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#fafafa',
                          opacity: 0.8,
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={item.images[0]?.imageUrl}
                          alt={item.modelName}
                          style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', filter: 'grayscale(20%)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{item.brand}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>{item.modelName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>거래 완료 매물</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>{formatPrice(item.price)}</div>
                          <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>거래완료</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 3: Reviews */}
              {activeTab === 'REVIEWS' && (
                reviews.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                    <ThumbsUp size={36} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>아직 등록된 거래 후기가 없습니다.</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>첫 번째 거래 후기를 남겨보세요!</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.map(rev => (
                      <div
                        key={rev.reviewId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                              {rev.reviewerNickname}
                            </span>
                            <span style={{
                              background: rev.rating === 'BAD' ? '#fef2f2' : '#ecfdf5',
                              color: rev.rating === 'BAD' ? '#dc2626' : '#059669',
                              border: rev.rating === 'BAD' ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {rev.rating === 'GREAT' ? '😊 최고예요 (+0.5℃)' : rev.rating === 'GOOD' ? '🙂 좋아요 (+0.2℃)' : '🙁 아쉬워요 (-0.5℃)'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {timeAgo(rev.createdAt)}
                          </span>
                        </div>

                        {rev.tags && rev.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {rev.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 500
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {rev.comment && (
                          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            "{rev.comment}"
                          </div>
                        )}

                        {rev.itemSummary && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #f1f5f9', paddingTop: '4px' }}>
                            거래 모델: {rev.itemSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#ef4444' }}>판매자 정보를 찾을 수 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};
