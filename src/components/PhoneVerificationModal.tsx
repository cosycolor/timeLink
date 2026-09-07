import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

interface PhoneVerificationModalProps {
  onClose: () => void;
  onVerify: (phone: string) => Promise<void>;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  onClose,
  onVerify
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setError(null);
    setCodeSent(true);
    setAuthCode('7890');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      handleSendCode();
      return;
    }
    if (!authCode) {
      setError('인증번호 4자리를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onVerify(phoneNumber);
      onClose();
    } catch (err: any) {
      setError(err.message || '인증 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#059669" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              판매자 휴대폰 본인인증
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '0.82rem',
            color: '#065f46',
            marginBottom: '18px',
            lineHeight: '1.5'
          }}>
            안전한 직거래 질서 확립을 위해 <strong>최초 1회 본인 명의 휴대폰 인증</strong>이 완료된 회원만 매물 등록이 가능합니다.
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={15} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
              휴대폰 번호
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-input"
                disabled={codeSent}
                style={{ flex: 1 }}
              />
              {!codeSent && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  인증번호 전송
                </button>
              )}
            </div>
          </div>

          {codeSent && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                인증번호 4자리
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="인증번호 4자리"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="form-input"
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
              />
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px', textAlign: 'right' }}>
                ✓ 모의 인증번호(7890) 자동 입력됨
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          >
            {isLoading ? '인증 처리 중...' : codeSent ? '인증 완료' : '인증번호 받기'}
          </button>
        </form>
      </div>
    </div>
  );
};
