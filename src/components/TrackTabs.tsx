import React from 'react';
import { Crown, Watch, Layers, Sparkles } from 'lucide-react';
import { CategoryTier } from '../types.ts';

interface TrackTabsProps {
  currentTier: CategoryTier | 'ALL';
  onChangeTier: (tier: CategoryTier | 'ALL') => void;
  itemCounts: { all: number; entry: number; mid: number; highEnd: number };
}

export const TrackTabs: React.FC<TrackTabsProps> = ({
  currentTier,
  onChangeTier,
  itemCounts
}) => {
  return (
    <div style={{ margin: '20px 0 16px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {/* Tab 1: ALL */}
        <div
          onClick={() => onChangeTier('ALL')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: '10px',
            background: currentTier === 'ALL' ? '#0f172a' : '#ffffff',
            color: currentTier === 'ALL' ? '#ffffff' : '#0f172a',
            border: currentTier === 'ALL' ? '1px solid #0f172a' : '1px solid #e2e8f0',
            boxShadow: currentTier === 'ALL' ? '0 4px 14px rgba(15, 23, 42, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color={currentTier === 'ALL' ? '#94a3b8' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                전체 매물
              </div>
              <div style={{ fontSize: '0.72rem', color: currentTier === 'ALL' ? '#94a3b8' : '#64748b' }}>
                모든 시계 직거래 매물
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            background: currentTier === 'ALL' ? '#334155' : '#f1f5f9',
            color: currentTier === 'ALL' ? '#ffffff' : '#475569',
            padding: '2px 8px',
            borderRadius: '16px'
          }}>
            {itemCounts.all}
          </span>
        </div>

        {/* Tab 2: ENTRY */}
        <div
          onClick={() => onChangeTier('ENTRY')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: '10px',
            background: currentTier === 'ENTRY' ? '#eff6ff' : '#ffffff',
            color: currentTier === 'ENTRY' ? '#1e40af' : '#0f172a',
            border: currentTier === 'ENTRY' ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
            boxShadow: currentTier === 'ENTRY' ? '0 4px 14px rgba(59, 130, 246, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Watch size={18} color={currentTier === 'ENTRY' ? '#2563eb' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                엔트리
              </div>
              <div style={{ fontSize: '0.72rem', color: currentTier === 'ENTRY' ? '#3b82f6' : '#64748b' }}>
                론진, 세이코, 해밀턴 등
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            background: currentTier === 'ENTRY' ? '#dbeafe' : '#f1f5f9',
            color: currentTier === 'ENTRY' ? '#1d4ed8' : '#475569',
            padding: '2px 8px',
            borderRadius: '16px'
          }}>
            {itemCounts.entry}
          </span>
        </div>

        {/* Tab 3: MID */}
        <div
          onClick={() => onChangeTier('MID')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: '10px',
            background: currentTier === 'MID' ? '#f5f3ff' : '#ffffff',
            color: currentTier === 'MID' ? '#5b21b6' : '#0f172a',
            border: currentTier === 'MID' ? '1.5px solid #8b5cf6' : '1px solid #e2e8f0',
            boxShadow: currentTier === 'MID' ? '0 4px 14px rgba(139, 92, 246, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Watch size={18} color={currentTier === 'MID' ? '#7c3aed' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                미드
              </div>
              <div style={{ fontSize: '0.72rem', color: currentTier === 'MID' ? '#7c3aed' : '#64748b' }}>
                오메가, 튜더, 태그호이어 등
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            background: currentTier === 'MID' ? '#ede9fe' : '#f1f5f9',
            color: currentTier === 'MID' ? '#6d28d9' : '#475569',
            padding: '2px 8px',
            borderRadius: '16px'
          }}>
            {itemCounts.mid}
          </span>
        </div>

        {/* Tab 4: HIGH_END */}
        <div
          onClick={() => onChangeTier('HIGH_END')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            borderRadius: '10px',
            background: currentTier === 'HIGH_END' ? '#fffbeb' : '#ffffff',
            color: currentTier === 'HIGH_END' ? '#92400e' : '#0f172a',
            border: currentTier === 'HIGH_END' ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
            boxShadow: currentTier === 'HIGH_END' ? '0 4px 14px rgba(245, 158, 11, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown size={18} color={currentTier === 'HIGH_END' ? '#d97706' : '#64748b'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                하이엔드
              </div>
              <div style={{ fontSize: '0.72rem', color: currentTier === 'HIGH_END' ? '#b45309' : '#64748b' }}>
                롤렉스, 까르띠에, AP 등
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            background: currentTier === 'HIGH_END' ? '#fef3c7' : '#f1f5f9',
            color: currentTier === 'HIGH_END' ? '#b45309' : '#475569',
            padding: '2px 8px',
            borderRadius: '16px'
          }}>
            {itemCounts.highEnd}
          </span>
        </div>
      </div>
    </div>
  );
};
