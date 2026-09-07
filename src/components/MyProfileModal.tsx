import React, { useState } from 'react';
import { X, User, ShieldCheck, Phone, CheckCircle, AlertCircle, Flame, Save, KeyRound, UserX, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { api } from '../api.ts';

interface MyProfileModalProps {
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: () => void;
  onOpenPhoneVerify: () => void;
  onWithdrawSuccess?: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  userProfile,
  onClose,
  onProfileUpdated,
  onOpenPhoneVerify,
  onWithdrawSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD' | 'WITHDRAW'>('PROFILE');

  // Profile Edit State
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Withdrawal State
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('거래 완료 후 더 이상 이용하지 않음');
  const [withdrawAgreed, setWithdrawAgreed] = useState(false);

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleTabChange = (tab: 'PROFILE' | 'PASSWORD' | 'WITHDRAW') => {
    setActiveTab(tab);
    resetMessages();
  };

  // 1. Submit Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('활동 닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    resetMessages();

    try {
      await api.updateMyProfile({
        nickname: nickname.trim(),
        phoneNumber: phoneNumber.trim() || undefined
      });
      setSuccessMsg('회원 정보가 성공적으로 수정되었습니다.');
      onProfileUpdated();
    } catch (err: any) {
      setError(err.message || '정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('새 비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    resetMessages();

    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccessMsg('비밀번호가 안전하게 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Withdrawal
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawPassword) {
      setError('탈퇴 확인을 위해 비밀번호를 입력해주세요.');
      return;
    }
    if (!withdrawAgreed) {
      setError('탈퇴 유의사항 안내에 동의해주세요.');
      return;
    }

    if (!window.confirm('정말로 타임링크 서비스를 탈퇴하시겠습니까? 등록 중인 매물과 모든 세션이 즉시 종료됩니다.')) {
      return;
    }

    setIsLoading(true);
    resetMessages();

    try {
      await api.withdrawUser(withdrawPassword, withdrawReason);
      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '회원 탈퇴 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              내 계정 설정 & 보안 관리
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('PROFILE')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === 'PROFILE' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'PROFILE' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'PROFILE' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'PROFILE' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <User size={15} />
            <span>프로필 정보</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('PASSWORD')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === 'PASSWORD' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'PASSWORD' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'PASSWORD' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'PASSWORD' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={15} />
            <span>비밀번호 변경</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('WITHDRAW')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === 'WITHDRAW' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'WITHDRAW' ? '2px solid #ef4444' : '2px solid transparent',
              color: activeTab === 'WITHDRAW' ? '#ef4444' : '#64748b',
              fontWeight: activeTab === 'WITHDRAW' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserX size={15} />
            <span>회원 탈퇴</span>
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '22px 24px' }}>
          
          {/* Global Error/Success Alerts */}
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

          {/* TAB 1: Profile Edit */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleProfileSubmit}>
              {/* Account Status Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '18px',
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
                    {(userProfile?.mannerScore ?? 36.5).toFixed(1)}℃
                  </div>
                </div>
              </div>

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

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    휴대폰 번호
                  </label>
                  {userProfile?.isPhoneVerified ? (
                    <span style={{ fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <ShieldCheck size={13} /> 실명인증 완료됨
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

              <div style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#475569',
                marginBottom: '20px',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary">
                  닫기
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '9px 20px' }}>
                  <Save size={15} />
                  <span>{isLoading ? '저장 중...' : '프로필 저장'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  현재 비밀번호 *
                </label>
                <input
                  type="password"
                  placeholder="현재 사용 중인 비밀번호"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  새 비밀번호 (6자 이상) *
                </label>
                <input
                  type="password"
                  placeholder="새로운 비밀번호 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  새 비밀번호 확인 *
                </label>
                <input
                  type="password"
                  placeholder="새로운 비밀번호 재입력"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary">
                  닫기
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '9px 20px' }}>
                  <KeyRound size={15} />
                  <span>{isLoading ? '변경 중...' : '비밀번호 변경하기'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Account Withdrawal */}
          {activeTab === 'WITHDRAW' && (
            <form onSubmit={handleWithdrawSubmit}>
              {/* Warning Banner */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                color: '#9f1239',
                lineHeight: '1.5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                  <AlertTriangle size={16} color="#e11d48" />
                  <span>회원 탈퇴 시 유의사항 안내</span>
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.76rem', color: '#be123c' }}>
                  <li>등록 중인 판매중/예약중 매물과 진행 중인 채팅방이 즉시 삭제됩니다.</li>
                  <li>거래 완료(`SOLD`)된 매물은 실거래 시세 조회를 위해 익명 보존됩니다.</li>
                  <li>탈퇴 처리 즉시 모든 로그인 세션이 영구 파기됩니다.</li>
                </ul>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  탈퇴 사유
                </label>
                <select
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="form-input"
                >
                  <option value="거래 완료 후 더 이상 이용하지 않음">거래 완료 후 더 이상 이용하지 않음</option>
                  <option value="원하는 시계 매물이 부족함">원하는 시계 매물이 부족함</option>
                  <option value="서비스 이용 및 직거래 절차가 불편함">서비스 이용 및 직거래 절차가 불편함</option>
                  <option value="개인정보 및 보안 우려">개인정보 및 보안 우려</option>
                  <option value="기타 사유">기타 사유</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  본인 확인 비밀번호 *
                </label>
                <input
                  type="password"
                  placeholder="계정 비밀번호를 입력해주세요"
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={withdrawAgreed}
                    onChange={(e) => setWithdrawAgreed(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>유의사항을 모두 확인하였으며, 회원 탈퇴에 동의합니다.</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !withdrawAgreed}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: (isLoading || !withdrawAgreed) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !withdrawAgreed) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserX size={15} />
                  <span>{isLoading ? '탈퇴 처리 중...' : '회원 탈퇴 확정'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

