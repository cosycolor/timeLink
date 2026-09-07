import React, { useState } from 'react';
import { X, Star, ThumbsUp, Smile, Frown, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../api.ts';

interface ReviewModalProps {
  sellerId: number;
  sellerNickname: string;
  itemSummary?: string;
  onClose: () => void;
  onReviewSubmitted: (newScore?: number) => void;
}

const POSITIVE_TAGS = [
  '⏱️ 약속 시간과 장소를 잘 지켜요',
  '🔍 시계 실물 상태가 설명과 똑같아요',
  '💬 응답이 빠르고 매우 친절해요',
  '📦 보증서와 구성품을 꼼꼼하게 챙겨줬어요',
  '🛡️ 은행 객장 직거래 및 이체에 적극 협조했어요',
  '💎 시계 관리가 매우 훌륭해요'
];

const NEGATIVE_TAGS = [
  '⏱️ 약속 시간에 늦었어요',
  '🔍 시계 상태가 설명과 달랐어요',
  '💬 응답이 느리거나 불친절해요',
  '📦 구성품이 누락되었어요'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  sellerId,
  sellerNickname,
  itemSummary,
  onClose,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<'GREAT' | 'GOOD' | 'BAD'>('GREAT');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⏱️ 약속 시간과 장소를 잘 지켜요',
    '🔍 시계 실물 상태가 설명과 똑같아요'
  ]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRatingChange = (newRating: 'GREAT' | 'GOOD' | 'BAD') => {
    setRating(newRating);
    if (newRating === 'BAD') {
      setSelectedTags(['🔍 시계 상태가 설명과 달랐어요']);
    } else {
      setSelectedTags([
        '⏱️ 약속 시간과 장소를 잘 지켜요',
        '🔍 시계 실물 상태가 설명과 똑같아요'
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.createReview(sellerId, {
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        itemSummary
      });
      onReviewSubmitted(res?.sellerMannerScore);
      onClose();
    } catch (err: any) {
      setError(err.message || '후기 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTags = rating === 'BAD' ? NEGATIVE_TAGS : POSITIVE_TAGS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '0', overflow: 'hidden' }}
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
            <ThumbsUp size={18} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              거래 후기 및 매너온도 평가
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          
          {/* Target Info */}
          <div style={{
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '0.85rem'
          }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '2px' }}>평가 대상 판매자</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {sellerNickname} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>님과의 거래</span>
            </div>
            {itemSummary && (
              <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                거래 품목: {itemSummary}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Rating Selection (3 Options) */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              거래 경험은 어떠셨나요?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              
              <div
                onClick={() => handleRatingChange('GREAT')}
                style={{
                  cursor: 'pointer',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: rating === 'GREAT' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: rating === 'GREAT' ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>😊</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: rating === 'GREAT' ? '#1e40af' : '#334155' }}>
                  최고예요!
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  +0.5℃ 반영
                </div>
              </div>

              <div
                onClick={() => handleRatingChange('GOOD')}
                style={{
                  cursor: 'pointer',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: rating === 'GOOD' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: rating === 'GOOD' ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🙂</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: rating === 'GOOD' ? '#1e40af' : '#334155' }}>
                  좋아요
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  +0.2℃ 반영
                </div>
              </div>

              <div
                onClick={() => handleRatingChange('BAD')}
                style={{
                  cursor: 'pointer',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: rating === 'BAD' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: rating === 'BAD' ? '#fef2f2' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🙁</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: rating === 'BAD' ? '#b91c1c' : '#334155' }}>
                  아쉬워요
                </div>
                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                  -0.5℃ 반영
                </div>
              </div>

            </div>
          </div>

          {/* Quick Compliment / Feedback Tag Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              어떤 점이 좋았나요? (다중 선택 가능)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <div
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1e40af' : '#334155',
                      fontWeight: isSelected ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <span>{tag}</span>
                    {isSelected && <CheckCircle size={15} color="#2563eb" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              따뜻한 거래 후기 한줄 (선택)
            </label>
            <textarea
              rows={3}
              placeholder="상대방에게 전하고 싶은 감사 인사나 거래 후기를 작성해주세요."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 20px' }}
            >
              {isSubmitting ? '등록 중...' : '평가 완료 및 후기 남기기'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
