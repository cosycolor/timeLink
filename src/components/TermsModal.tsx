import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, Database } from 'lucide-react';

export type TermsTab = 'TERMS' | 'PRIVACY' | 'SAFETY_GUIDE' | 'ARCHIVE_POLICY';

interface TermsModalProps {
  initialTab?: TermsTab;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  initialTab = 'TERMS',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TermsTab>(initialTab);

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              타임링크(TIMELINK) 서비스 운영 정책 및 약관
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '4px 16px 0 16px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'TERMS', label: '서비스 이용약관', icon: FileText },
            { id: 'PRIVACY', label: '개인정보 처리방침', icon: Lock },
            { id: 'SAFETY_GUIDE', label: '안전 직거래 가이드', icon: AlertTriangle },
            { id: 'ARCHIVE_POLICY', label: '실거래 시세 정책', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TermsTab)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', fontSize: '0.88rem', lineHeight: '1.7', color: '#334155' }}>
          
          {/* TAB 1: 서비스 이용약관 */}
          {activeTab === 'TERMS' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                타임링크 서비스 이용약관
              </h3>
              
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.82rem', color: '#92400e' }}>
                <strong>[전자상거래법에 따른 통신판매중개 면책 고지]</strong><br />
                타임링크(TIMELINK)는 시계 동호인 간의 자유로운 개인 간 직거래(C2C)를 위한 온라인 중개 시스템 및 정보 공유 플랫폼만을 제공하며, 거래의 당사자가 아닙니다. 등록된 상품의 진위 여부, 상태 보증, 대금 결제 및 배송에 대한 법적 책임은 거래 당사자(판매자 및 구매자)에게 귀속됩니다.
              </div>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                제1조 (목적)
              </h4>
              <p style={{ margin: '0 0 12px 0' }}>
                본 약관은 타임링크(이하 "회사")가 제공하는 시계 직거래 중개 플랫폼 및 관련 제반 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                제2조 (매물 등록 및 이용 제한 규칙)
              </h4>
              <ul style={{ paddingLeft: '20px', margin: '0 0 12px 0' }}>
                <li><strong>일일 등록 제한:</strong> 전문 업자들의 무차별 도배 방지 및 개인 거래 활성화를 위해 회원 1인당 24시간 내 최대 3건까지만 매물을 등록할 수 있습니다.</li>
                <li><strong>실명 인증:</strong> 신뢰도 높은 거래를 위해 매물 등록 시 휴대폰 SMS 실명 인증을 완료하여야 합니다.</li>
                <li><strong>금지 행위:</strong> 가품(레플리카/모조품) 등록, 타인의 사진 무단 도용, 외부 불법 결제 유도, 허위 매물 등록 행위는 엄격히 금지되며 즉시 계정 정지 및 영구 제재 대상이 됩니다.</li>
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                제3조 (신고 및 매물 잠금 처리)
              </h4>
              <p style={{ margin: '0 0 12px 0' }}>
                가품 의심 또는 사기 정황으로 동일 매물에 누적 3회 이상 신고가 접수될 경우, 피해 예방을 위해 해당 매물은 즉시 목록에서 자동 격리(REPORTED_LOCKED) 처리되며 운영팀의 정밀 검토가 진행됩니다.
              </p>
            </div>
          )}

          {/* TAB 2: 개인정보 처리방침 */}
          {activeTab === 'PRIVACY' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                개인정보 처리방침
              </h3>

              <p style={{ margin: '0 0 12px 0' }}>
                타임링크는 「개인정보 보호법」 및 관계 법령을 준수하여 회원의 개인정보를 안전하게 보호하고 있습니다.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                1. 수집하는 개인정보 항목
              </h4>
              <ul style={{ paddingLeft: '20px', margin: '0 0 12px 0' }}>
                <li><strong>회원가입 시:</strong> 이메일 주소, 비밀번호(단방향 암호화), 닉네임</li>
                <li><strong>본인인증 시:</strong> 휴대폰 번호, SMS 인증 기록 (인증 확인 용도 외 미사용)</li>
                <li><strong>서비스 이용 과정:</strong> 접속 로그, IP 주소, 직거래 채팅 메시지 및 첨부 이미지</li>
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '16px', marginBottom: '6px' }}>
                2. 개인정보의 보유 및 파기
              </h4>
              <p style={{ margin: '0 0 12px 0' }}>
                회원 탈퇴 시 개인 식별 정보(비밀번호, 이메일, 채팅 내역)는 지체 없이 파기됩니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령에 따라 보존이 필요한 기록은 일정 기간 보관됩니다.
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.82rem' }}>
                ※ 실거래 시세 조회를 위해 판매완료(SOLD) 처리된 시계 제원 및 가격 데이터는 익명화되어 시세 아카이브에 영구 보존됩니다.
              </p>
            </div>
          )}

          {/* TAB 3: 안전 직거래 가이드 */}
          {activeTab === 'SAFETY_GUIDE' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                안전한 시계 직거래 5대 수칙
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.92rem', marginBottom: '4px' }}>
                    1. 고가 시계는 은행 객장 또는 백화점 라운지 대면 거래
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    CCTV가 설치되어 있고 현금 입출금 및 계좌이체 현장 확인이 용이한 <strong>은행 지점 객장 내</strong>에서의 거래를 적극 권장합니다.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.92rem', marginBottom: '4px' }}>
                    2. 입금 확인은 모바일 뱅킹 '실제 입금 잔액'으로 직접 확인
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    입금 문자나 상대방이 보여주는 스마트폰 송금 완료 캡처 화면만 믿지 마시고, <strong>본인의 은행 앱에서 실제 잔액이 증가했는지</strong> 직접 확인하세요.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.92rem', marginBottom: '4px' }}>
                    3. 보증서 시리얼 넘버와 시계 인그레이빙 각인 일치 대조
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    정품 게런티 카드에 적힌 시리얼 번호와 시계 케이스백/이너베젤에 각인된 고유 번호가 정확히 일치하는지 현장에서 루페나 돋보기로 대조하세요.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.92rem', marginBottom: '4px' }}>
                    4. 외부 메신저 유도 및 선입금 요구 사기 주의
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    타임링크 인앱 채팅을 벗어나 외부 메신저나 안전결제를 빙자한 가짜 결제 사이트 링크(URL)를 보내는 경우 100% 사기이므로 즉시 신고해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 실거래 시세 아카이브 정책 */}
          {activeTab === 'ARCHIVE_POLICY' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                실거래 시세 아카이브 영구 보존 정책
              </h3>

              <p style={{ margin: '0 0 12px 0' }}>
                타임링크는 시계 시장의 가격 불투명성과 호가 왜곡을 방지하고 동호인들의 합리적인 시세 파악을 돕기 위해 <strong>실거래 아카이브 시스템</strong>을 운영합니다.
              </p>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                  🔒 판매완료(SOLD) 매물 영구 보존 원칙
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#1e3a8a', lineHeight: '1.6' }}>
                  <li>매물을 [거래완료(SOLD)]로 변경하면 실거래 데이터의 투명성을 위해 이후 상태 복구(판매중)나 게시글 삭제가 영구적으로 제한됩니다.</li>
                  <li>거래가 완료된 후 가격을 지우거나 0원으로 수정하는 행위가 원천 차단되어 실제 거래 체결 가격이 보존됩니다.</li>
                  <li>판매자 개인의 개인정보는 안전하게 보호되며, 시계 모델/스펙/실거래가만 시세 참고용으로 영구 제공됩니다.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
