import React, { useState, useEffect } from 'react';
import { X, Package, Eye, Heart, AlertCircle, Trash2, CheckCircle2, ChevronRight, RefreshCw, ExternalLink, Edit3 } from 'lucide-react';
import { WatchItem, ItemStatus } from '../types.ts';
import { api } from '../api.ts';

interface MyListingsModalProps {
  onClose: () => void;
  onSelectItem: (item: WatchItem) => void;
  onEditItem?: (item: WatchItem) => void;
  onItemUpdated: () => void;
}

export const MyListingsModal: React.FC<MyListingsModalProps> = ({
  onClose,
  onSelectItem,
  onEditItem,
  onItemUpdated
}) => {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_SALE' | 'RESERVED' | 'SOLD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMyItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyItems(statusFilter === 'ALL' ? undefined : statusFilter);
      setItems(data);
    } catch (err: any) {
      setError(err.message || '매물 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [statusFilter]);

  const handleStatusChange = async (itemId: number, newStatus: ItemStatus) => {
    setActionLoadingId(itemId);
    setError(null);
    setSuccessMsg(null);

    if (newStatus === 'SOLD') {
      if (!window.confirm('매물을 [판매완료(SOLD)]로 변경하시겠습니까?\n\n※ 판매완료 처리된 매물은 실거래 시세 아카이브 정책에 따라 영구 보존되며, 다시 판매중으로 되돌리거나 삭제할 수 없습니다.')) {
        setActionLoadingId(null);
        return;
      }
    }

    try {
      await api.updateItemStatus(itemId, newStatus);
      setSuccessMsg('매물 상태가 성공적으로 변경되었습니다.');
      fetchMyItems();
      onItemUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || '상태 변경에 실패했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('정말 이 매물을 삭제하시겠습니까?')) return;

    setActionLoadingId(itemId);
    setError(null);
    try {
      await api.deleteItem(itemId);
      setSuccessMsg('매물이 정상적으로 삭제되었습니다.');
      fetchMyItems();
      onItemUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || '매물 삭제에 실패했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              내 등록 매물 관리
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: '#ffffff',
              background: '#2563eb',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              {items.length}건
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '4px 16px 0 16px'
        }}>
          {[
            { id: 'ALL', label: '전체 매물' },
            { id: 'FOR_SALE', label: '판매중' },
            { id: 'RESERVED', label: '예약중' },
            { id: 'SOLD', label: '판매완료 (아카이브)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              style={{
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: statusFilter === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                color: statusFilter === tab.id ? '#2563eb' : '#64748b',
                fontWeight: statusFilter === tab.id ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 20px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={15} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '10px 20px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={15} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* List Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              내 매물을 불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              해당 조건의 등록 매물이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item) => {
                const isSold = item.itemStatus === 'SOLD';
                const isLocked = item.itemStatus === 'REPORTED_LOCKED';
                const isActionBusy = actionLoadingId === item.itemId;

                return (
                  <div
                    key={item.itemId}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      backgroundColor: isSold ? '#fafafa' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'border-color 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* Watch Thumbnail */}
                    <img
                      src={item.images[0]?.imageUrl}
                      alt={item.modelName}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>';
                      }}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f1f5f9' }}
                    />

                    {/* Information */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb' }}>{item.brand}</span>
                        {isSold ? (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            🔒 판매완료 (시세보존)
                          </span>
                        ) : isLocked ? (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            🚨 신고누적 잠금
                          </span>
                        ) : item.itemStatus === 'RESERVED' ? (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            예약중
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            판매중
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.modelName}
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {formatPrice(item.price)}
                      </div>

                      {/* Stats: Views, Likes */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={13} /> {item.viewCount}회 조회
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
                          <Heart size={13} fill="#ef4444" /> {item.likeCount || 0}개 찜
                        </span>
                        <span>· {item.preferredLocation || '지역 협의'}</span>
                      </div>
                    </div>

                    {/* Actions Controller */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      {/* Status Dropdown (Disabled if SOLD) */}
                      {!isSold && !isLocked ? (
                        <select
                          value={item.itemStatus}
                          disabled={isActionBusy}
                          onChange={(e) => handleStatusChange(item.itemId, e.target.value as ItemStatus)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="FOR_SALE">판매중</option>
                          <option value="RESERVED">예약중</option>
                          <option value="SOLD">판매완료(SOLD)</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                          상태 고정됨
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isSold && !isLocked && onEditItem && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => {
                              onClose();
                              onEditItem(item);
                            }}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: '#1d4ed8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="매물 정보 수정"
                          >
                            <Edit3 size={12} />
                            <span>수정</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectItem(item);
                          }}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="매물 상세 보기"
                        >
                          <ExternalLink size={12} />
                          <span>상세보기</span>
                        </button>

                        {!isSold && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleDelete(item.itemId)}
                            style={{
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: '#e11d48',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="매물 삭제"
                          >
                            <Trash2 size={12} />
                            <span>삭제</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
