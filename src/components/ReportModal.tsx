import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { api } from '../api.ts';

interface ReportModalProps {
  targetItemId?: number;
  targetSellerId?: number;
  itemSummary?: string;
  sellerNickname?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetItemId,
  targetSellerId,
  itemSummary,
  sellerNickname,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState<'FAKE_SUSPECTED' | 'STOLEN_PHOTO' | 'NO_SHOW' | 'FRAUD_SUSPECTED' | 'OTHER'>('FAKE_SUSPECTED');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('신고 상세 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.submitReport({
        targetItemId,
        targetSellerId,
        reason,
        details: details.trim()
      });
      alert('🚨 신고가 정상적으로 접수되었습니다.\n\n운영팀에서 검토 후 해당 매물 격리 및 매너온도 페널티 조치가 진행됩니다.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#991b1b',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#fca5a5" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              허위매물 / 사기 의심 신고하기
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Target Info Badge */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '0.82rem',
            color: '#334155',
            lineHeight: '1.5'
          }}>
            <div><strong>신고 대상:</strong> {itemSummary || sellerNickname || '선택된 대상'}</div>
            {sellerNickname && <div><strong>판매자 닉네임:</strong> {sellerNickname}</div>}
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              신고 사유 선택 *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="form-input"
              required
            >
              <option value="FAKE_SUSPECTED">가품(레플리카) / 위조품 의심</option>
              <option value="STOLEN_PHOTO">인터넷 도용 사진 / 허위 매물</option>
              <option value="FRAUD_SUSPECTED">외부 메신저 유도 / 비정상 계좌 입금 사기 의심</option>
              <option value="NO_SHOW">직거래 당일 일방적 노쇼 / 연락 두절</option>
              <option value="OTHER">기타 비매너 / 악성 행위</option>
            </select>
          </div>

          {/* Detail Text */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              신고 상세 내용 (구체적인 정황 기재) *
            </label>
            <textarea
              rows={4}
              placeholder="발견하신 허위 사실이나 가품 의심 정황, 대화 내용 등을 최대한 구체적으로 작성해주세요."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="form-input"
              style={{ resize: 'vertical', minHeight: '90px' }}
              required
            />
          </div>

          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.74rem',
            color: '#9f1239',
            marginBottom: '22px',
            lineHeight: '1.4'
          }}>
            ※ 허위 신고 시 본인의 서비스 이용이 제한될 수 있습니다. 접수된 내용은 운영팀의 신속한 전수 검토 후 매물 잠금 및 매너온도 감점 페널티가 부여됩니다.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !details.trim()}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: (isLoading || !details.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !details.trim()) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={14} />
              <span>{isLoading ? '신고 접수 중...' : '신고 접수하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
