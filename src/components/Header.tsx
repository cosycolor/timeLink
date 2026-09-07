import React from 'react';
import { Watch, PlusCircle, ShieldCheck, AlertCircle, Flame, UserCheck, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface HeaderProps {
  userProfile: UserProfile | null;
  onOpenCreate: () => void;
  onOpenPhoneVerify: () => void;
  onOpenMyProfile: () => void;
  onOpenChatList: () => void;
  unreadChatCount: number;
  onSwitchUser: (userId: number) => void;
  currentUserId: number;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenCreate,
  onOpenPhoneVerify,
  onOpenMyProfile,
  onOpenChatList,
  unreadChatCount,
  onSwitchUser,
  currentUserId
}) => {
  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #e2e8f0' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
          }}>
            <Watch size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="luxury-title brand-text-gradient" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                TIMELINK
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                타임링크
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              시계 애호가를 위한 안심 직거래 마켓
            </p>
          </div>
        </div>

        {/* User Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Demo User Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: '#64748b' }}>테스트 계정:</span>
            <select
              value={currentUserId}
              onChange={(e) => onSwitchUser(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0f172a',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={1}>1. 강남타임마스터 (본인인증 완료 회원)</option>
              <option value={2}>2. 빈티지워치스 (본인인증 완료 회원)</option>
              <option value={3}>3. 시계입문자 (미인증 회원)</option>
            </select>
          </div>

          {/* User Verification & Quota info */}
          {userProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {userProfile.isPhoneVerified ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: '#047857',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={14} />
                  <span>인증 완료</span>
                </div>
              ) : (
                <button
                  onClick={onOpenPhoneVerify}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#b45309',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>휴대폰 인증</span>
                </button>
              )}

              {/* 24h Quota badge */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Flame size={13} color="#f59e0b" />
                <span>오늘 등록 가능: <strong style={{ color: (userProfile.remainingDailyQuota ?? 0) > 0 ? '#10b981' : '#ef4444' }}>
                  {userProfile.remainingDailyQuota ?? 0}/3건
                </strong></span>
              </div>
            </div>
          )}

          {/* Chat Notifications Button */}
          <button
            onClick={onOpenChatList}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px', position: 'relative' }}
            title="직거래 채팅 목록"
          >
            <MessageSquare size={16} color="#0f172a" />
            <span>채팅</span>
            {unreadChatCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 800,
                marginLeft: '4px'
              }}>
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* My Profile Button */}
          <button
            onClick={onOpenMyProfile}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            title="내 정보 수정 및 계정 관리"
          >
            <UserCheck size={15} color="#2563eb" />
            <span>내 정보 수정</span>
          </button>

          {/* Create Item Button (Prominent & High-Impact) */}
          <button
            onClick={onOpenCreate}
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
            }}
          >
            <PlusCircle size={17} strokeWidth={2.5} />
            <span>매물 등록하기</span>
          </button>

        </div>
      </div>
    </header>
  );
};
