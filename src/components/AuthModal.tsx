import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';
import { TermsTab } from './TermsModal';

interface AuthModalProps {
  initialTab?: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenTerms?: (tab: TermsTab) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialTab = 'LOGIN',
  onClose,
  onSuccess,
  onOpenTerms
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form states - Login / Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form states - Forgot Password
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotNewPasswordConfirm, setForgotNewPasswordConfirm] = useState('');
  const [demoSmsCodeNotice, setDemoSmsCodeNotice] = useState<string | null>(null);

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({
        email: email.trim(),
        password
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!nickname.trim() || nickname.trim().length < 2) {
      setErrorMsg('닉네임은 2자 이상 입력해 주세요.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('타임링크 이용약관 및 안전거래 수칙에 동의해 주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.signup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        phoneNumber: phoneNumber.trim() || undefined
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 1: Request SMS verification code
  const handleSendForgotCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoSmsCodeNotice(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('가입 시 등록한 올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!forgotPhone.trim()) {
      setErrorMsg('가입 시 등록한 휴대폰 번호를 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.sendForgotPasswordCode({
        email: forgotEmail.trim(),
        phoneNumber: forgotPhone.trim()
      });
      setSuccessMsg('인증번호 6자리가 발송되었습니다. 확인 후 입력해주세요.');
      if (res.devCode) {
        setDemoSmsCodeNotice(`[시뮬레이션 발송] 인증번호: ${res.devCode}`);
        setForgotCode(res.devCode);
      }
      setForgotStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || '인증번호 발송에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 2: Verify code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotCode.trim() || forgotCode.trim().length !== 6) {
      setErrorMsg('6자리 인증번호를 정확히 입력해 주세요.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setErrorMsg('새 비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (forgotNewPassword !== forgotNewPasswordConfirm) {
      setErrorMsg('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      await api.resetForgotPassword({
        email: forgotEmail.trim(),
        phoneNumber: forgotPhone.trim(),
        code: forgotCode.trim(),
        newPassword: forgotNewPassword
      });

      setSuccessMsg('비밀번호가 성공적으로 재설정되었습니다! 새 비밀번호로 로그인해주세요.');
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setActiveTab('LOGIN');
        setForgotStep(1);
        setDemoSmsCodeNotice(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || '비밀번호 재설정에 실패했습니다. 인증번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Brand Banner Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '24px 24px 18px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.5)'
            }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              TIMELINK
            </span>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#93c5fd',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              시계 직거래 마켓
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            시계 동호인을 위한 중고마켓, 타임링크
          </p>

          {/* Navigation Tabs */}
          {activeTab !== 'FORGOT_PASSWORD' ? (
            <div style={{
              display: 'flex',
              marginTop: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '3px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOGIN');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'LOGIN' ? '#ffffff' : 'transparent',
                  color: activeTab === 'LOGIN' ? '#0f172a' : '#94a3b8',
                  boxShadow: activeTab === 'LOGIN' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SIGNUP');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'SIGNUP' ? '#ffffff' : 'transparent',
                  color: activeTab === 'SIGNUP' ? '#0f172a' : '#94a3b8',
                  boxShadow: activeTab === 'SIGNUP' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                회원가입
              </button>
            </div>
          ) : (
            <div style={{
              marginTop: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              <KeyRound size={16} />
              <span>비밀번호 찾기 및 재설정</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '16px',
              fontWeight: 500
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  이메일 계정
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요 (예: seller@timelink.kr)"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    비밀번호
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('FORGOT_PASSWORD');
                      setForgotStep(1);
                      setForgotEmail(email);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Login Preset */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  <Sparkles size={13} color="#2563eb" />
                  <span>빠른 테스트 계정 체험</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('seller@timelink.kr', '1234')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer'
                    }}
                  >
                    판매자 (롤렉스마스터)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('buyer@timelink.kr', '1234')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#059669',
                      cursor: 'pointer'
                    }}
                  >
                    구매자 (시계러버)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  padding: '12px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                {loading ? '로그인 중...' : '로그인하기'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  아직 회원이 아니신가요?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('SIGNUP');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    회원가입하기
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {activeTab === 'SIGNUP' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  이메일 계정 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    비밀번호 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="4자 이상"
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 32px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    비밀번호 확인 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="password"
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="재입력"
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 32px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  활동 닉네임 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="타임링크에서 사용할 닉네임 (2~12자)"
                    maxLength={12}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  휴대폰 번호 (선택)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="010-0000-0000 (안전거래 인증용)"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 10px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px'
              }}>
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <label htmlFor="agree-terms" style={{ fontSize: '0.78rem', color: '#475569', cursor: 'pointer', lineHeight: '1.4' }}>
                  [필수]{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenTerms?.('TERMS');
                    }}
                    style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    이용약관
                  </span>{' '}
                  및{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenTerms?.('SAFETY_GUIDE');
                    }}
                    style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    직거래 안전수칙
                  </span>
                  에 동의합니다.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
                }}
              >
                {loading ? '가입 진행 중...' : '회원가입 완료'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('LOGIN');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    로그인하기
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT_PASSWORD */}
          {activeTab === 'FORGOT_PASSWORD' && (
            <div>
              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotCode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.5' }}>
                    가입 시 등록하신 <strong>이메일</strong>과 <strong>휴대폰 번호</strong>를 입력하시면 비밀번호 재설정용 SMS 인증번호를 보내드립니다.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      가입 이메일 주소
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="가입했던 이메일 입력 (예: seller@timelink.kr)"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      가입 휴대폰 번호
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="tel"
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="010-0000-0000 (가입 시 등록 번호)"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Demo helper tip */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    💡 데모 판매자: <strong>seller@timelink.kr</strong> / <strong>010-1234-5678</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '4px',
                      padding: '12px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    {loading ? '인증번호 발송 중...' : 'SMS 인증번호 받기'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('LOGIN');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>로그인 화면으로 돌아가기</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {demoSmsCodeNotice && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      color: '#1d4ed8',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {demoSmsCodeNotice}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      SMS 인증번호 6자리
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      placeholder="6자리 숫자 입력"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        letterSpacing: '0.2em',
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      새로운 비밀번호 (4자 이상)
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      새로운 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPasswordConfirm}
                      onChange={(e) => setForgotNewPasswordConfirm(e.target.value)}
                      placeholder="새 비밀번호 재입력"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    {loading ? '재설정 처리 중...' : '비밀번호 재설정 완료'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>이전 단계로 가기</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

