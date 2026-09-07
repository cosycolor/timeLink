import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const LegalBanner: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#f1f5f9',
      borderBottom: '1px solid #e2e8f0',
      padding: '8px 16px',
      fontSize: '0.78rem',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textAlign: 'center',
      lineHeight: '1.4'
    }}>
      <ShieldAlert size={15} color="#d97706" style={{ flexShrink: 0 }} />
      <span>
        <strong style={{ color: '#1e293b' }}>[통신판매중개자 고지]</strong> 타임링크(TIMELINK)는 시계 애호가 간의 순수 직거래를 위한 중개 플랫폼이며 통신판매의 당사자가 아닙니다. 상품 정보, 거래 및 대금 결제, 하자 분쟁의 책임은 거래 당사자에게 있습니다.
      </span>
    </div>
  );
};
