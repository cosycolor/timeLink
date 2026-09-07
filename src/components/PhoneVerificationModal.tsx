import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Phone, KeyRound, Timer, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';

interface PhoneVerificationModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialPhoneNumber?: string;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  onClose,
  onSuccess,
  initialPhoneNumber = ''
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [authCode, setAuthCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (codeSent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [codeSent, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSendCode = async () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
      setError('올바른 휴대폰 번호(10~11자리)를 입력해주세요.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSending(true);

    try {
      const res = await api.sendSmsCode(phoneNumber);
      setCodeSent(true);
      setTimeLeft(180);
      setAuthCode(''); // Leave completely empty for realistic typing test
      if (res.devCode) {
        setDevCodeHint(res.devCode);
      }
      setSuccessMsg('휴대폰으로 6자리 인증번호가 발송되었습니다.');
    } catch (err: any) {
      setError(err.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      handleSendCode();
      return;
    }

    if (!authCode || authCode.trim().length < 6) {
      setError('6자리 인증번호를 모두 입력해주세요.');
      return;
    }

    if (timeLeft <= 0) {
      setError('인증번호 유효시간(3분)이 만료되었습니다. 다시 발송해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await api.verifySmsCode(phoneNumber, authCode.trim());
      onSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || '인증번호 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              판매자 휴대폰 실명 본인인증
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerify} style={{ padding: '24px' }}>
          {/* Trust Banner */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: '#065f46',
            marginBottom: '18px',
            lineHeight: '1.5',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              안전한 명품 시계 1:1 직거래 질서 확립을 위해 <strong>최초 1회 본인 명의 휴대폰 인증</strong>이 완료된 회원만 매물 등록 권한이 부여됩니다.
            </div>
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
              <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && !error && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1: Phone Number Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
              휴대폰 번호
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={codeSent}
                  maxLength={13}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: codeSent ? '#f1f5f9' : '#ffffff'
                  }}
                />
              </div>

              {!codeSent ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.2)'
                  }}
                >
                  {isSending ? '발송 중...' : '인증번호 발송'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setAuthCode('');
                  }}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="번호 수정"
                >
                  <RefreshCw size={13} />
                  <span>재입력</span>
                </button>
              )}
            </div>
          </div>

          {/* Step 2: 6-Digit Auth Code Input with Timer */}
          {codeSent && (
            <div style={{ marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                  SMS 인증번호 6자리
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: timeLeft <= 30 ? '#ef4444' : '#2563eb'
                }}>
                  <Timer size={14} />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6자리 숫자 입력"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Dev Test Code Guidance without auto-fill */}
              {devCodeHint && (
                <div style={{
                  marginTop: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>💡 콘솔 발송 인증번호: <strong style={{ color: '#0f172a' }}>{devCodeHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setAuthCode(devCodeHint)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    번호 채우기
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isSending}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: (isLoading || isSending) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || isSending) ? 0.7 : 1,
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {isLoading ? '본인인증 처리 중...' : codeSent ? '본인인증 완료' : '인증번호 받기'}
          </button>
        </form>
      </div>
    </div>
  );
};

