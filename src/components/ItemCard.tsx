import React, { useState } from 'react';
import { MapPin, Eye, Crown, Watch } from 'lucide-react';
import { WatchItem } from '../types.ts';

interface ItemCardProps {
  item: WatchItem;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const isSold = item.itemStatus === 'SOLD';
  const isReserved = item.itemStatus === 'RESERVED';

  const repImage = item.images.find(img => img.isRepresentative) || item.images[0];

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      const eok = Math.floor(price / 100000000);
      const man = Math.floor((price % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만 원` : `${eok}억 원`;
    } else if (price >= 10000) {
      return `${(price / 10000).toLocaleString()}만 원`;
    }
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

  const renderTierBadge = () => {
    if (item.categoryTier === 'HIGH_END') {
      return (
        <span className="badge-high-end">
          <Crown size={11} /> 1,000만원 이상
        </span>
      );
    }
    if (item.categoryTier === 'MID') {
      return (
        <span className="badge-mid">
          <Watch size={11} /> 300만~1,000만
        </span>
      );
    }
    return (
      <span className="badge-entry">
        300만원 미만
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className={isSold ? 'card-sold' : ''}
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Thumbnail Area */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '72%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        {repImage && !imgError ? (
          <img
            src={repImage.imageUrl}
            alt={item.modelName}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            gap: '6px'
          }}>
            <Watch size={32} color="#94a3b8" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.brand} {item.modelName}</span>
          </div>
        )}

        {/* Top Badges (Tier only, verification badge removed) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          gap: '4px',
          zIndex: 2
        }}>
          {renderTierBadge()}
        </div>

        {/* Reserved Status Tag */}
        {isReserved && !isSold && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#f59e0b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: '4px',
            zIndex: 2
          }}>
            예약중
          </div>
        )}

        {/* SOLD OUT OVERLAY */}
        {isSold && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            backdropFilter: 'blur(1px)'
          }}>
            <div style={{
              border: '2px solid #ef4444',
              color: '#ffffff',
              backgroundColor: '#ef4444',
              padding: '4px 14px',
              borderRadius: '6px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: '0.95rem'
            }}>
              SOLD OUT
            </div>
            <span style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '6px' }}>
              거래 완료
            </span>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Brand & Ref */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#2563eb',
            letterSpacing: '0.02em'
          }}>
            {item.brand}
          </span>
          {item.refNumber && (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              Ref. {item.refNumber}
            </span>
          )}
        </div>

        {/* Model Name */}
        <h3 style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '6px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.modelName}
        </h3>

        {/* Location & Updated Time (Moved to Top for instant visibility) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#475569',
          marginBottom: '8px'
        }}>
          <MapPin size={13} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.preferredLocation || '직거래 장소 협의'}
          </span>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{timeAgo(item.updatedAt || item.createdAt)}</span>
        </div>

        {/* Specifications snippet (Case size, Movement, Dial color) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.74rem',
          color: '#64748b',
          marginBottom: '10px'
        }}>
          {item.caseSizeMm && <span>{item.caseSizeMm}mm</span>}
          {item.caseSizeMm && <span>·</span>}
          <span>{item.movementType === 'AUTOMATIC' ? '오토매틱' : item.movementType === 'MANUAL' ? '수동' : '쿼츠'}</span>
          {item.dialColor && <span>·</span>}
          {item.dialColor && <span>{item.dialColor}</span>}
        </div>

        {/* Accessories tags */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: item.hasBox ? '#eff6ff' : '#f8fafc',
            color: item.hasBox ? '#1d4ed8' : '#94a3b8',
            border: item.hasBox ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
          }}>
            박스 {item.hasBox ? 'O' : 'X'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: item.hasGuaranteeCard ? '#ecfdf5' : '#f8fafc',
            color: item.hasGuaranteeCard ? '#047857' : '#94a3b8',
            border: item.hasGuaranteeCard ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
          }}>
            보증서 {item.hasGuaranteeCard ? 'O' : 'X'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: item.extraLinksCount > 0 ? '#fef3c7' : '#f8fafc',
            color: item.extraLinksCount > 0 ? '#b45309' : '#94a3b8',
            border: item.extraLinksCount > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0'
          }}>
            여분코 {item.extraLinksCount > 0 ? `+${item.extraLinksCount}` : 'X'}
          </span>
        </div>

        {/* Footer: Price & Trade Method */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
              {item.tradeType === 'DIRECT_ONLY' ? '대면 직거래 원칙' : '직거래 / 택배'}
            </span>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: isSold ? '#94a3b8' : '#0f172a',
              fontFamily: 'var(--font-sans)'
            }}>
              {formatPrice(item.price)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#94a3b8', justifyContent: 'flex-end' }}>
              <Eye size={12} />
              <span>조회 {item.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
