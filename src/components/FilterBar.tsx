import React from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';

interface FilterBarProps {
  selectedBrand: string;
  onChangeBrand: (brand: string) => void;
  availableOnly: boolean;
  onToggleAvailableOnly: () => void;
  sortOrder: 'LATEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'VIEWS';
  onChangeSortOrder: (order: 'LATEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'VIEWS') => void;
  searchKeyword: string;
  onChangeSearchKeyword: (val: string) => void;
}

const BRANDS = [
  'ALL',
  'ROLEX',
  'AUDEMARS PIGUET',
  'CARTIER',
  'OMEGA',
  'TUDOR',
  'IWC',
  'LONGINES',
  'TAG HEUER',
  'BREITLING',
  'SEIKO',
  'HAMILTON'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedBrand,
  onChangeBrand,
  availableOnly,
  onToggleAvailableOnly,
  sortOrder,
  onChangeSortOrder,
  searchKeyword,
  onChangeSearchKeyword
}) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search input */}
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
          maxWidth: '450px'
        }}>
          <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="브랜드, 모델명, 레퍼런스(126610LN 등) 검색..."
            value={searchKeyword}
            onChange={(e) => onChangeSearchKeyword(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Right filters: Available toggle & Sort order */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Available only toggle */}
          <button
            onClick={onToggleAvailableOnly}
            style={{
              background: availableOnly ? '#ecfdf5' : '#f8fafc',
              border: availableOnly ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              color: availableOnly ? '#047857' : '#64748b',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            {availableOnly ? <CheckSquare size={16} color="#059669" /> : <Square size={16} />}
            <span>거래 가능만 보기</span>
          </button>

          {/* Sort order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>정렬:</span>
            <select
              value={sortOrder}
              onChange={(e) => onChangeSortOrder(e.target.value as any)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto', height: '38px' }}
            >
              <option value="LATEST">최신 등록순</option>
              <option value="PRICE_DESC">높은 가격순</option>
              <option value="PRICE_ASC">낮은 가격순</option>
              <option value="VIEWS">인기 조회순</option>
            </select>
          </div>

        </div>
      </div>

      {/* Brand Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '2px',
        scrollbarWidth: 'none'
      }}>
        {BRANDS.map(brand => {
          const isSelected = selectedBrand === brand;
          return (
            <button
              key={brand}
              onClick={() => onChangeBrand(brand)}
              style={{
                background: isSelected ? '#0f172a' : '#f1f5f9',
                color: isSelected ? '#ffffff' : '#475569',
                border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {brand === 'ALL' ? '전체 브랜드' : brand}
            </button>
          );
        })}
      </div>
    </div>
  );
};
