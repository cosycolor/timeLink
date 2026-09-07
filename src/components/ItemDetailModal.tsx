import React, { useState } from 'react';
import {
  X,
  Crown,
  Watch,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  Eye,
  AlertTriangle,
  User,
  Trash2,
  MessageCircle,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { WatchItem, ItemStatus } from '../types.ts';

interface ItemDetailModalProps {
  item: WatchItem;
  onClose: () => void;
  onStatusChange: (itemId: number, newStatus: ItemStatus) => Promise<void>;
  onDelete: (itemId: number) => Promise<void>;
  onOpenSellerProfile?: (sellerId: number) => void;
  onOpenChat?: (item: WatchItem) => void;
  currentUserId: number;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onStatusChange,
  onDelete,
  onOpenSellerProfile,
  onOpenChat,
  currentUserId
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isOwner = item.sellerId === currentUserId;

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

  const currentImage = item.images[selectedImgIndex] || item.images[0];

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImgIndex(prev => (prev === 0 ? item.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImgIndex(prev => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  const handleStatusUpdate = async (status: ItemStatus) => {
    setActionError(null);
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(item.itemId, status);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setActionError(null);
    if (!confirm('정말로 이 매물을 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      await onDelete(item.itemId);
      onClose();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const originLabel = (type: string) => {
    switch (type) {
      case 'DOMESTIC_STORE': return '국내 백화점 / 정식 부틱';
      case 'OVERSEAS': return '해외 정식 매장';
      case 'PARALLEL': return '병행 수입';
      default: return '기타 / 미상';
    }
  };

  const renderTierBadge = () => {
    if (item.categoryTier === 'HIGH_END') {
      return (
        <span className="badge-high-end" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
          <Crown size={14} /> 하이엔드
        </span>
      );
    }
    if (item.categoryTier === 'MID') {
      return (
        <span className="badge-mid" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
          <Watch size={14} /> 미드
        </span>
      );
    }
    return (
      <span className="badge-entry" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
        엔트리
      </span>
    );
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '880px', padding: '0', overflow: 'hidden' }}
        >
          {/* Header Bar */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {renderTierBadge()}

              {item.itemStatus === 'SOLD' && (
                <span style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  거래 완료 (시세 참고용)
                </span>
              )}
              {item.itemStatus === 'RESERVED' && (
                <span style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  예약중
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Notification */}
          {actionError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{actionError}</span>
            </div>
          )}

          <div style={{ padding: '24px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
            
            {/* Main Grid: Gallery & Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              
              {/* Gallery Column */}
              <div>
                {/* Main Preview with Zoom trigger */}
                <div
                  onClick={() => setIsZoomOpen(true)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '80%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                    cursor: 'zoom-in'
                  }}
                  title="클릭하여 고화질 사진 확대 보기"
                >
                  {currentImage && !imgError ? (
                    <img
                      src={currentImage.imageUrl}
                      alt="Watch main preview"
                      onError={() => setImgError(true)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px' }}>
                      <Watch size={40} color="#94a3b8" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.brand} {item.modelName}</span>
                    </div>
                  )}

                  {/* Zoom badge overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Maximize2 size={12} />
                    <span>사진 확대 ({selectedImgIndex + 1}/{item.images.length})</span>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {item.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {item.images.map((img, idx) => (
                      <div
                        key={img.imageId || idx}
                        onClick={() => setSelectedImgIndex(idx)}
                        style={{
                          position: 'relative',
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selectedImgIndex === idx ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          opacity: selectedImgIndex === idx ? 1 : 0.6,
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={img.imageUrl}
                          alt="Thumbnail"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Column */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                  {item.brand}
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                  {item.modelName}
                </h1>

                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  fontFamily: 'var(--font-sans)',
                  marginBottom: '12px'
                }}>
                  {formatPrice(item.price)}
                </div>

                {/* Location & Updated Time Bar (Prominently placed at top) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  fontSize: '0.82rem',
                  color: '#334155',
                  marginBottom: '16px',
                  padding: '9px 12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#1e3a8a' }}>
                    <MapPin size={15} color="#2563eb" />
                    <span>{item.preferredLocation || '직거래 장소 협의'}</span>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                    <Clock size={14} />
                    <span>등록 {timeAgo(item.updatedAt || item.createdAt)}</span>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                    <Eye size={14} />
                    <span>조회 {item.viewCount}</span>
                  </span>
                </div>

              {/* Seller Profile Box */}
              <div
                onClick={() => onOpenSellerProfile && onOpenSellerProfile(item.sellerId)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                title="판매자 프로필 및 거래 이력 보기"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
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
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                          {item.seller?.nickname || `판매자 (ID: ${item.sellerId})`}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>프로필 &gt;</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        거래 완료 {item.seller?.completedSalesCount ?? 0}건
                      </div>
                    </div>
                  </div>

                  {/* Manner Score & Verification */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                      매너온도 {item.seller?.mannerScore || 36.5}℃
                    </div>
                    {item.seller?.isPhoneVerified && (
                      <div style={{ fontSize: '0.7rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                        <ShieldCheck size={12} /> 본인인증 완료
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>거래 방식: <strong>{item.tradeType === 'DIRECT_ONLY' ? '대면 직거래' : '직거래 / 택배'}</strong></span>
                  <span>지역: <strong>{item.preferredLocation || '협의'}</strong></span>
                </div>
              </div>

              {/* Owner Action Panel or Buyer Chat Button */}
              {isOwner ? (
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    내 등록 매물 관리
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => handleStatusUpdate('FOR_SALE')}
                      disabled={isUpdatingStatus}
                      className={item.itemStatus === 'FOR_SALE' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      판매중
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('RESERVED')}
                      disabled={isUpdatingStatus}
                      className={item.itemStatus === 'RESERVED' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      예약중
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('SOLD')}
                      disabled={isUpdatingStatus}
                      className={item.itemStatus === 'SOLD' ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.78rem', padding: '6px 12px', background: item.itemStatus === 'SOLD' ? '#dc2626' : undefined, color: item.itemStatus === 'SOLD' ? '#fff' : undefined }}
                    >
                      거래완료(SOLD)
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="거래 완료 매물은 실거래 시세 참고용으로 보존됩니다."
                    >
                      <Trash2 size={13} />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact / Deal button for buyers */
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                    onClick={() => onOpenChat && onOpenChat(item)}
                  >
                    <MessageCircle size={18} />
                    <span>판매자와 1:1 직거래 채팅하기</span>
                  </button>
                </div>
              )}

              {/* Direct Trade Safety Rules Guide */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}>
                  <ShieldCheck size={14} color="#2563eb" />
                  <span>타임링크 직거래 안심 가이드</span>
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.6' }}>
                  <li>고가 시계는 <strong>은행 객장 내 대면 직거래</strong>를 권장합니다.</li>
                  <li>입금 확인은 현장에서 <strong>실제 은행 잔액 증가</strong>를 직접 확인하세요.</li>
                  <li>보증서 시리얼 넘버와 시계 인그레이빙 각인을 대조하세요.</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Section 2: Detailed Specification Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              시계 상세 제원 및 부속품
            </h3>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ width: '20%', padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>브랜드</th>
                    <td style={{ width: '30%', padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>{item.brand}</td>
                    <th style={{ width: '20%', padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>모델명</th>
                    <td style={{ width: '30%', padding: '10px 14px', color: '#0f172a' }}>{item.modelName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>레퍼런스(Ref.)</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a', fontFamily: 'monospace' }}>{item.refNumber || '미기재'}</td>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>무브먼트</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>
                      {item.movementType === 'AUTOMATIC' ? '오토매틱 (자동)' : item.movementType === 'MANUAL' ? '수동 와인딩' : '쿼츠'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>케이스 직경</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>{item.caseSizeMm ? `${item.caseSizeMm} mm` : '미기재'}</td>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>다이얼 색상</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>{item.dialColor || '미기재'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>구매 시기 (스탬핑 일자)</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>{item.stampingDate || '미상'}</td>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>출처</th>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>{originLabel(item.originType)}</td>
                  </tr>
                  <tr>
                    <th style={{ padding: '10px 14px', background: '#f8fafc', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>부속품 구성</th>
                    <td colSpan={3} style={{ padding: '10px 14px', color: '#0f172a' }}>
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <span style={{ color: item.hasBox ? '#059669' : '#94a3b8' }}>
                          {item.hasBox ? '☑ 정품 박스 있음' : '☒ 박스 없음'}
                        </span>
                        <span style={{ color: item.hasGuaranteeCard ? '#059669' : '#94a3b8' }}>
                          {item.hasGuaranteeCard ? '☑ 보증서 카드 있음' : '☒ 보증서 없음'}
                        </span>
                        <span style={{ color: item.hasManual ? '#059669' : '#94a3b8' }}>
                          {item.hasManual ? '☑ 설명서 있음' : '☒ 설명서 없음'}
                        </span>
                        <span style={{ color: item.extraLinksCount > 0 ? '#b45309' : '#94a3b8' }}>
                          {item.extraLinksCount > 0 ? `☑ 여분 코 (${item.extraLinksCount}마디)` : '☒ 여분 코 없음'}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Detailed Description */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              판매자 상세 설명
            </h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.88rem',
              color: '#334155',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap'
            }}>
              {item.description}
            </div>
          </div>

          {/* Bottom Legal Notice */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.75rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <span>
              <strong>[안내]</strong> 본 거래는 개인 간 직거래(C2C)로서 플랫폼은 대금 보관이나 감정 서비스를 대행하지 않습니다.
            </span>
          </div>

        </div>
      </div>
    </div>

      {/* Fullscreen Photo Zoom / Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsZoomOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            userSelect: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Lightbox Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              padding: '8px 16px',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                {item.brand} {item.modelName}
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {selectedImgIndex + 1} / {item.images.length}
              </span>
            </div>

            <button
              onClick={() => setIsZoomOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
              title="닫기 (ESC 또는 바깥 클릭)"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Zoomed Image with Nav Arrows */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flex: 1,
              maxHeight: 'calc(100vh - 170px)'
            }}
          >
            {item.images.length > 1 && (
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '20px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)')}
                title="이전 사진"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img
              src={currentImage?.imageUrl}
              alt="High resolution watch preview"
              style={{
                maxHeight: '100%',
                maxWidth: '90vw',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
              }}
            />

            {item.images.length > 1 && (
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)')}
                title="다음 사진"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {item.images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                maxWidth: '90vw',
                overflowX: 'auto'
              }}
            >
              {item.images.map((img, idx) => (
                <div
                  key={img.imageId || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImgIndex === idx ? '2px solid #3b82f6' : '2px solid transparent',
                    opacity: selectedImgIndex === idx ? 1 : 0.5,
                    transform: selectedImgIndex === idx ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt="Thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
