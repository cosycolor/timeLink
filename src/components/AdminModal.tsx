import React, { useState, useEffect } from 'react';
import {
  Shield, X, Users, Package, AlertTriangle, BarChart3,
  CheckCircle, Lock, Unlock, Trash2, Edit2, RefreshCw,
  Search, ShieldAlert, Check, ArrowUpRight
} from 'lucide-react';
import { api } from '../api.ts';
import { AdminStats, AdminReport, AdminUser, WatchItem, ItemStatus } from '../types.ts';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshItems?: () => void;
}

type TabType = 'STATS' | 'REPORTS' | 'USERS' | 'ITEMS';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onRefreshItems
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('STATS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<WatchItem[]>([]);

  // Filter & Search states
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  // Edit User State
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editMannerScore, setEditMannerScore] = useState<number>(36.5);
  const [editRole, setEditRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, usersData, itemsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminReports().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getAdminItems().catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setReports(reportsData || []);
      setUsers(usersData || []);
      setItems(itemsData || []);
    } catch (err: any) {
      showMsg(err.message || '데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Report actions
  const handleUpdateReport = async (reportId: number, status: 'PENDING' | 'RESOLVED', action?: 'LOCK_ITEM' | 'UNLOCK_ITEM') => {
    try {
      await api.updateAdminReport(reportId, { status, action });
      showMsg('신고 처리가 완료되었습니다.');
      loadData();
      if (onRefreshItems) onRefreshItems();
    } catch (err: any) {
      showMsg(err.message || '신고 처리에 실패했습니다.', 'error');
    }
  };

  // User actions
  const handleSaveUser = async (userId: number) => {
    try {
      await api.updateAdminUser(userId, { mannerScore: editMannerScore, userRole: editRole });
      showMsg('회원 정보가 수정되었습니다.');
      setEditingUserId(null);
      loadData();
    } catch (err: any) {
      showMsg(err.message || '회원 수정에 실패했습니다.', 'error');
    }
  };

  const handleDeleteUser = async (userId: number, nickname: string) => {
    if (!window.confirm(`[${nickname}] 회원을 정말 강제 탈퇴 처리하시겠습니까?`)) return;
    try {
      await api.deleteAdminUser(userId);
      showMsg('회원이 탈퇴 처리되었습니다.');
      loadData();
    } catch (err: any) {
      showMsg(err.message || '회원 삭제에 실패했습니다.', 'error');
    }
  };

  // Item actions
  const handleUpdateItemStatus = async (itemId: number, status: ItemStatus) => {
    try {
      await api.updateAdminItemStatus(itemId, status);
      showMsg('매물 상태가 변경되었습니다.');
      loadData();
      if (onRefreshItems) onRefreshItems();
    } catch (err: any) {
      showMsg(err.message || '상태 변경에 실패했습니다.', 'error');
    }
  };

  const handleDeleteItem = async (itemId: number, title: string) => {
    if (!window.confirm(`[${title}] 매물을 정말 강제 삭제하시겠습니까?`)) return;
    try {
      await api.deleteAdminItem(itemId);
      showMsg('매물이 삭제되었습니다.');
      loadData();
      if (onRefreshItems) onRefreshItems();
    } catch (err: any) {
      showMsg(err.message || '매물 삭제에 실패했습니다.', 'error');
    }
  };

  // Filtered lists
  const filteredReports = reports.filter(r => {
    if (reportFilter === 'ALL') return true;
    return r.status === reportFilter;
  });

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.nickname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phoneNumber && u.phoneNumber.includes(q));
  });

  const filteredItems = items.filter(i => {
    if (!itemSearch.trim()) return true;
    const q = itemSearch.toLowerCase();
    return i.brand.toLowerCase().includes(q) || i.modelName.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
  });

  const pendingReportCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  타임링크 관리자 센터
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  ADMIN
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                플랫폼 통계, 허위매물/사기 신고 검토, 회원 및 매물 통합 관리 시스템
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              새로고침
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Global Alert Message */}
        {message && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            borderBottom: '1px solid',
            borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {message.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '0 16px'
        }}>
          <button
            onClick={() => setActiveTab('STATS')}
            style={{
              padding: '14px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'STATS' ? 700 : 500,
              color: activeTab === 'STATS' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'STATS' ? '3px solid #d97706' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BarChart3 size={18} />
            대시보드 요약
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            style={{
              padding: '14px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'REPORTS' ? 700 : 500,
              color: activeTab === 'REPORTS' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'REPORTS' ? '3px solid #d97706' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldAlert size={18} color={pendingReportCount > 0 ? '#ef4444' : '#64748b'} />
            신고 접수 관리
            {pendingReportCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}>
                {pendingReportCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            style={{
              padding: '14px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'USERS' ? 700 : 500,
              color: activeTab === 'USERS' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'USERS' ? '3px solid #d97706' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={18} />
            회원 관리 ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('ITEMS')}
            style={{
              padding: '14px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'ITEMS' ? 700 : 500,
              color: activeTab === 'ITEMS' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'ITEMS' ? '3px solid #d97706' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Package size={18} />
            매물 관리 ({items.length})
          </button>
        </div>

        {/* Tab Contents Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          
          {/* TAB 1: STATS */}
          {activeTab === 'STATS' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>총 가입 회원</span>
                    <Users size={20} color="#3b82f6" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
                    {stats?.totalUsers ?? users.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>명</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>등록된 시계 매물</span>
                    <Package size={20} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
                    {stats?.totalItems ?? items.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>개</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    판매중 {stats?.forSaleItems ?? items.filter(i => i.itemStatus === 'FOR_SALE').length} · 거래완료 {stats?.soldItems ?? items.filter(i => i.itemStatus === 'SOLD').length}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>접수된 신고</span>
                    <ShieldAlert size={20} color="#ef4444" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: pendingReportCount > 0 ? '#ef4444' : '#0f172a', marginTop: '10px' }}>
                    {stats?.totalReports ?? reports.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>건</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
                    미처리 대기 {pendingReportCount}건
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>잠금(Lock) 매물</span>
                    <Lock size={20} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
                    {stats?.reportedLockedItems ?? items.filter(i => i.itemStatus === 'REPORTED_LOCKED').length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>개</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    허위/사기 의심 자동 차단
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                  빠른 관리 바로가기
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setActiveTab('REPORTS'); setReportFilter('PENDING'); }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <AlertTriangle size={16} />
                    미처리 신고 확인하기 ({pendingReportCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('USERS')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Users size={16} />
                    회원 목록 조회 및 매너점수 관리
                  </button>

                  <button
                    onClick={() => setActiveTab('ITEMS')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Package size={16} />
                    전체 매물 상태 관리
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div>
              {/* Filter */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['ALL', 'PENDING', 'RESOLVED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setReportFilter(f)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: reportFilter === f ? '#d97706' : '#cbd5e1',
                      backgroundColor: reportFilter === f ? '#fffbeb' : '#ffffff',
                      color: reportFilter === f ? '#b45309' : '#64748b',
                      fontSize: '0.85rem',
                      fontWeight: reportFilter === f ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {f === 'ALL' ? `전체 (${reports.length})` : f === 'PENDING' ? `대기중 (${reports.filter(r => r.status === 'PENDING').length})` : `처리완료 (${reports.filter(r => r.status === 'RESOLVED').length})`}
                  </button>
                ))}
              </div>

              {filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  <CheckCircle size={40} style={{ margin: '0 auto 12px auto', color: '#10b981' }} />
                  <p style={{ fontWeight: 600, margin: 0 }}>해당 조건의 신고 내역이 없습니다.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredReports.map(report => {
                    const reasonMap: Record<string, string> = {
                      'FAKE_SUSPECTED': '가품 / 위조품 의심',
                      'STOLEN_PHOTO': '사진 도용 / 허위 매물',
                      'NO_SHOW': '직거래 노쇼 / 잠적',
                      'FRAUD_SUSPECTED': '사기 시도 의심',
                      'OTHER': '기타 사유'
                    };

                    return (
                      <div
                        key={report.reportId}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          padding: '16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                backgroundColor: report.status === 'PENDING' ? '#fef2f2' : '#f0fdf4',
                                color: report.status === 'PENDING' ? '#b91c1c' : '#15803d',
                                border: `1px solid ${report.status === 'PENDING' ? '#fecaca' : '#bbf7d0'}`
                              }}>
                                {report.status === 'PENDING' ? '검토 대기' : '처리 완료'}
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                #{report.reportId} · {reasonMap[report.reason] || report.reason}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                              접수 시각: {new Date(report.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {report.targetItemId && (
                              <>
                                <button
                                  onClick={() => handleUpdateReport(report.reportId, 'RESOLVED', 'LOCK_ITEM')}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Lock size={13} />
                                  매물 잠금(Lock)
                                </button>
                                <button
                                  onClick={() => handleUpdateReport(report.reportId, 'RESOLVED', 'UNLOCK_ITEM')}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Unlock size={13} />
                                  잠금 해제
                                </button>
                              </>
                            )}
                            {report.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateReport(report.reportId, 'RESOLVED')}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#3b82f6',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                처리 완료로 변경
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Report Detail Info */}
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          color: '#334155'
                        }}>
                          {report.targetItem && (
                            <div style={{ marginBottom: '6px' }}>
                              <strong style={{ color: '#0f172a' }}>대상 매물:</strong> [{report.targetItem.brand}] {report.targetItem.modelName} ({report.targetItem.price.toLocaleString()}원) · 상태: <span style={{ fontWeight: 700, color: report.targetItem.itemStatus === 'REPORTED_LOCKED' ? '#ef4444' : '#0f172a' }}>{report.targetItem.itemStatus}</span>
                            </div>
                          )}
                          {report.targetSeller && (
                            <div style={{ marginBottom: '6px' }}>
                              <strong style={{ color: '#0f172a' }}>피신고자:</strong> {report.targetSeller.nickname} (ID: {report.targetSeller.userId}, 매너온도: {report.targetSeller.mannerScore}°C)
                            </div>
                          )}
                          {report.details && (
                            <div>
                              <strong style={{ color: '#0f172a' }}>신고 상세 내용:</strong> {report.details}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'USERS' && (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="닉네임, 이메일, 전화번호로 회원 검색..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '12px 16px' }}>ID</th>
                        <th style={{ padding: '12px 16px' }}>닉네임</th>
                        <th style={{ padding: '12px 16px' }}>이메일</th>
                        <th style={{ padding: '12px 16px' }}>권한</th>
                        <th style={{ padding: '12px 16px' }}>매너온도</th>
                        <th style={{ padding: '12px 16px' }}>전화번호</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리 조치</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => {
                        const isEditing = editingUserId === user.userId;

                        return (
                          <tr key={user.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>
                              #{user.userId}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                              {user.nickname}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>
                              {user.email}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isEditing ? (
                                <select
                                  value={editRole}
                                  onChange={e => setEditRole(e.target.value as any)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="MEMBER">MEMBER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              ) : (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 700,
                                  backgroundColor: user.userRole === 'ADMIN' ? '#fef3c7' : '#f1f5f9',
                                  color: user.userRole === 'ADMIN' ? '#b45309' : '#475569'
                                }}>
                                  {user.userRole}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="99.9"
                                  value={editMannerScore}
                                  onChange={e => setEditMannerScore(parseFloat(e.target.value))}
                                  style={{ width: '70px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                              ) : (
                                <span style={{ fontWeight: 700, color: user.mannerScore >= 40 ? '#16a34a' : user.mannerScore <= 35 ? '#ef4444' : '#d97706' }}>
                                  {user.mannerScore}°C
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              {user.phoneNumber || '(미인증)'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleSaveUser(user.userId)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#16a34a',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#94a3b8',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.userId);
                                      setEditMannerScore(user.mannerScore);
                                      setEditRole(user.userRole);
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#f1f5f9',
                                      color: '#334155',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit2 size={12} style={{ display: 'inline', marginRight: '3px' }} />
                                    수정
                                  </button>
                                  {user.userRole !== 'ADMIN' && (
                                    <button
                                      onClick={() => handleDeleteUser(user.userId, user.nickname)}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#fef2f2',
                                        color: '#ef4444',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      강제탈퇴
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ITEMS */}
          {activeTab === 'ITEMS' && (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    placeholder="브랜드, 모델명, 설명 키워드로 매물 검색..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '12px 16px' }}>사진</th>
                        <th style={{ padding: '12px 16px' }}>매물 정보</th>
                        <th style={{ padding: '12px 16px' }}>가격</th>
                        <th style={{ padding: '12px 16px' }}>판매자</th>
                        <th style={{ padding: '12px 16px' }}>상태</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리 조치</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.itemId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 16px' }}>
                            <img
                              src={item.images?.[0]?.imageUrl || '/images/watches/rolex_submariner.jpg'}
                              alt={item.modelName}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>[{item.brand}] {item.modelName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              #{item.itemId} · {item.movementType} · {item.categoryTier}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: '#b45309' }}>
                            {item.price.toLocaleString()}원
                          </td>
                          <td style={{ padding: '10px 16px', color: '#475569' }}>
                            {item.seller?.nickname || `ID ${item.sellerId}`}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <select
                              value={item.itemStatus}
                              onChange={e => handleUpdateItemStatus(item.itemId, e.target.value as ItemStatus)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                backgroundColor: item.itemStatus === 'REPORTED_LOCKED' ? '#fef2f2' : item.itemStatus === 'FOR_SALE' ? '#f0fdf4' : '#f8fafc',
                                color: item.itemStatus === 'REPORTED_LOCKED' ? '#ef4444' : item.itemStatus === 'FOR_SALE' ? '#15803d' : '#475569'
                              }}
                            >
                              <option value="FOR_SALE">판매중 (FOR_SALE)</option>
                              <option value="RESERVED">예약중 (RESERVED)</option>
                              <option value="SOLD">판매완료 (SOLD)</option>
                              <option value="REPORTED_LOCKED">🚨 신고 잠금 (LOCKED)</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteItem(item.itemId, `[${item.brand}] ${item.modelName}`)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#fef2f2',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={13} />
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            🔐 타임링크 최고관리자 세션 활성화 중 (보안 접속)
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
