import React from 'react';
import { Watch, PlusCircle, ShieldCheck, AlertCircle, Flame, MessageSquare, LogIn, LogOut, User, Package, Heart, Shield } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface HeaderProps {
  userProfile: UserProfile | null;
  onOpenCreate: () => void;
  onOpenPhoneVerify: () => void;
  onOpenMyProfile: () => void;
  onOpenMyListings: () => void;
  onOpenChatList: () => void;
  onOpenAdmin?: () => void;
  unreadChatCount: number;
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
  likedCount: number;
  onOpenAuth: (tab?: 'LOGIN' | 'SIGNUP') => void;
  onLogout: () => void;
  onSwitchUser?: (userId: number) => void;
  currentUserId?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenCreate,
  onOpenPhoneVerify,
  onOpenMyProfile,
  onOpenMyListings,
  onOpenChatList,
  onOpenAdmin,
  unreadChatCount,
  wishlistOnly,
  onToggleWishlistOnly,
  likedCount,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  currentUserId
}) => {

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #e2e8f0', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)'
          }}>
            <Watch size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="luxury-title brand-text-gradient" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                TIMELINK
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                타임링크
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              시계 동호인을 위한 중고마켓
            </p>
          </div>
        </div>

        {/* User Status & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {userProfile ? (
            /* Logged-In User Actions */
            <>
              {/* User Badge with Temperature */}
              <div
                onClick={onOpenMyProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                title="내 정보 보기 및 수정"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={14} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                  {userProfile.nickname || '회원'}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: (userProfile.mannerScore ?? 36.5) >= 40 ? '#2563eb' : '#059669',
                  backgroundColor: (userProfile.mannerScore ?? 36.5) >= 40 ? '#eff6ff' : '#ecfdf5',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {(userProfile.mannerScore ?? 36.5).toFixed(1)}℃
                </span>
              </div>

              {/* Admin Dashboard Button */}
              {userProfile.userRole === 'ADMIN' && (
                <button
                  onClick={onOpenAdmin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)'
                  }}
                  title="관리자 센터 열기"
                >
                  <Shield size={14} />
                  <span>관리자 센터</span>
                </button>
              )}

              {/* Phone Verification Status */}

              {userProfile.isPhoneVerified ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#047857',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={13} />
                  <span>인증됨</span>
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#b45309',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <AlertCircle size={13} />
                  <span>본인인증</span>
                </button>
              )}

              {/* 24h Daily Quota Badge */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Flame size={12} color="#f59e0b" />
                <span>등록가능: <strong style={{ color: (userProfile.remainingDailyQuota ?? 0) > 0 ? '#10b981' : '#ef4444' }}>
                  {userProfile.remainingDailyQuota ?? 0}/3건
                </strong></span>
              </div>

              {/* My Listings Button */}
              <button
                onClick={onOpenMyListings}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="내가 등록한 매물 관리"
              >
                <Package size={15} color="#2563eb" />
                <span>내 매물</span>
              </button>

              {/* Wishlist Toggle Button */}
              <button
                onClick={onToggleWishlistOnly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: wishlistOnly ? '#fef2f2' : '#ffffff',
                  border: wishlistOnly ? '1px solid #f87171' : '1px solid #e2e8f0',
                  color: wishlistOnly ? '#ef4444' : '#64748b',
                  borderRadius: '6px',
                  padding: '6px 11px',
                  fontSize: '0.82rem',
                  fontWeight: wishlistOnly ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={wishlistOnly ? '전체 매물 보기' : '내가 찜한 매물만 모아보기'}
              >
                <Heart size={14} fill={wishlistOnly || likedCount > 0 ? '#ef4444' : 'none'} color="#ef4444" />
                <span>찜</span>
                {likedCount > 0 && (
                  <span style={{
                    backgroundColor: wishlistOnly ? '#ef4444' : '#f1f5f9',
                    color: wishlistOnly ? '#ffffff' : '#475569',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {likedCount}
                  </span>
                )}
              </button>

              {/* Chat List Button */}
              <button
                onClick={onOpenChatList}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 12px', position: 'relative' }}
                title="직거래 채팅 목록"
              >
                <MessageSquare size={15} color="#0f172a" />
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

              {/* Logout Button */}
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                title="로그아웃"
              >
                <LogOut size={14} />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            /* Guest (Unauthenticated) Actions */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onOpenAuth('LOGIN')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              >
                <LogIn size={15} color="#2563eb" />
                <span>로그인</span>
              </button>

              <button
                onClick={() => onOpenAuth('SIGNUP')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
              >
                <span>회원가입</span>
              </button>
            </div>
          )}

          {/* Create Item Button (Prominent) */}
          <button
            onClick={onOpenCreate}
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
          >
            <PlusCircle size={16} strokeWidth={2.5} />
            <span>매물 등록하기</span>
          </button>

        </div>
      </div>
    </header>
  );
};

