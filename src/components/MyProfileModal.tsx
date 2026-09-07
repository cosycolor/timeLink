import React, { useState } from 'react';
import { X, User, ShieldCheck, Phone, CheckCircle, AlertCircle, Flame, Save } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { api } from '../api.ts';

interface MyProfileModalProps {
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: () => void;
  onOpenPhoneVerify: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  userProfile,
  onClose,
  onProfileUpdated,
  onOpenPhoneVerify
}) => {
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.updateMyProfile({
        nickname: nickname.trim(),
        phoneNumber: phoneNumber.trim() || undefined
      });
      setSuccessMsg('회원 정보가 성공적으로 수정되었습니다.');
      onProfileUpdated();
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || '정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
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
            <User size={20} color="#0f172a" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              내 정보 수정 및 계정 설정
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {/* Notifications */}
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

          {successMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle size={15} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Account Status Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '2px' }}>계정 이메일</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                {userProfile?.email || 'collector@watchp2p.com'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '2px' }}>매너온도</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                {userProfile?.mannerScore || 36.5}℃
              </div>
            </div>
          </div>

          {/* 1. Nickname Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              활동 닉네임 *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* 2. Phone Number & Verification */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                휴대폰 번호
              </label>
              {userProfile?.isPhoneVerified ? (
                <span style={{ fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                  <ShieldCheck size={13} /> 본인인증 완료됨
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPhoneVerify}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  지금 인증받기
                </button>
              )}
            </div>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-input"
            />
          </div>

          {/* 3. Daily Quota Status */}
          <div style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: '#475569',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={15} color="#d97706" />
              <span>오늘 등록 가능 횟수:</span>
            </div>
            <strong style={{ color: (userProfile?.remainingDailyQuota ?? 3) > 0 ? '#059669' : '#dc2626' }}>
              {userProfile?.remainingDailyQuota ?? 3}/3건 남음
            </strong>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ padding: '9px 20px' }}
            >
              <Save size={15} />
              <span>{isSaving ? '저장 중...' : '변경사항 저장'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
