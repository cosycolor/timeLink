import React, { useState, useEffect, useCallback } from 'react';
import { LegalBanner } from './components/LegalBanner.tsx';
import { Header } from './components/Header.tsx';
import { TrackTabs } from './components/TrackTabs.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { ItemCard } from './components/ItemCard.tsx';
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { ItemCreateModal } from './components/ItemCreateModal.tsx';
import { PhoneVerificationModal } from './components/PhoneVerificationModal.tsx';
import { SellerProfileModal } from './components/SellerProfileModal.tsx';
import { ChatModal } from './components/ChatModal.tsx';
import { ChatListModal, ChatThread } from './components/ChatListModal.tsx';
import { MyProfileModal } from './components/MyProfileModal.tsx';
import { CategoryTier, ItemStatus, UserProfile, WatchItem } from './types.ts';
import { api, setAuthUserId } from './api.ts';
import { Shield, Sparkles, TrendingUp, AlertCircle, CheckCircle, Check, ArrowRight, MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  // State
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<WatchItem[]>([]);
  const [tabCounts, setTabCounts] = useState<{ all: number; entry: number; mid: number; highEnd: number }>({
    all: 0,
    entry: 0,
    mid: 0,
    highEnd: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [currentTier, setCurrentTier] = useState<CategoryTier | 'ALL'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'LATEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'VIEWS'>('LATEST');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modals
  const [selectedItem, setSelectedItem] = useState<WatchItem | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [chatItem, setChatItem] = useState<WatchItem | null>(null);
  const [isChatListOpen, setIsChatListOpen] = useState<boolean>(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);

  // Chat Threads state
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);

  // Global Toast / Message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load User Profile
  const loadProfile = useCallback(async () => {
    try {
      setAuthUserId(currentUserId);
      const profile = await api.getMyProfile();
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    }
  }, [currentUserId]);

  // Load Items with current filters
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getItems({
        tier: currentTier === 'ALL' ? undefined : currentTier,
        brand: selectedBrand === 'ALL' ? undefined : selectedBrand,
        status: availableOnly ? 'AVAILABLE_ONLY' : undefined,
        sort: sortOrder,
        keyword: searchKeyword
      });
      setItems(res.data);
      if (res.counts) {
        setTabCounts(res.counts);
      }

      // Initialize initial sample chat threads if empty
      if (res.data.length > 0) {
        setChatThreads(prev => {
          if (prev.length > 0) return prev;
          const rolexItem = res.data.find(i => i.brand === 'ROLEX') || res.data[0];
          const omegaItem = res.data.find(i => i.brand === 'OMEGA') || res.data[1] || res.data[0];
          return [
            {
              threadId: 't1',
              item: rolexItem,
              otherUser: {
                userId: 2,
                nickname: '빈티지워치스',
                mannerScore: 38
              },
              lastMessage: '안녕하세요! 서브마리너 매물 평일 낮 강남역 인근 은행 직거래 가능할까요?',
              lastMessageTime: '10분 전',
              unreadCount: 1
            },
            {
              threadId: 't2',
              item: omegaItem,
              otherUser: {
                userId: 1,
                nickname: '강남타임마스터',
                mannerScore: 42
              },
              lastMessage: '보증서 풀세트 확인 완료했습니다. 내일 오후 2시에 뵙겠습니다.',
              lastMessageTime: '1시간 전',
              unreadCount: 0
            }
          ];
        });
      }
    } catch (err: any) {
      showToast(err.message || '매물 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentTier, selectedBrand, availableOnly, sortOrder, searchKeyword]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handler for user switcher
  const handleSwitchUser = (userId: number) => {
    setCurrentUserId(userId);
    setAuthUserId(userId);
    showToast(`테스트 계정이 [ID: ${userId}] 로 변경되었습니다.`, 'info');
  };

  // Handler for item detail click
  const handleOpenDetail = async (item: WatchItem) => {
    try {
      const fullItem = await api.getItemById(item.itemId);
      setSelectedItem(fullItem);
      // Update local view count in items list
      setItems(prev => prev.map(i => i.itemId === item.itemId ? { ...i, viewCount: i.viewCount + 1 } : i));
    } catch (err: any) {
      showToast(err.message || '매물 상세 정보를 가져오지 못했습니다.', 'error');
    }
  };

  // Handler for item status change
  const handleStatusChange = async (itemId: number, newStatus: ItemStatus) => {
    try {
      const updated = await api.updateItemStatus(itemId, newStatus);
      setSelectedItem(updated);
      setItems(prev => prev.map(i => i.itemId === itemId ? updated : i));
      loadProfile();
      showToast(`매물 상태가 [${newStatus === 'SOLD' ? '거래완료 (SOLD)' : newStatus === 'RESERVED' ? '예약중' : '판매중'}] 으로 변경되었습니다.`, 'success');
    } catch (err: any) {
      showToast(err.message || '상태 변경에 실패했습니다.', 'error');
      throw err;
    }
  };

  // Handler for item delete
  const handleDeleteItem = async (itemId: number) => {
    try {
      await api.deleteItem(itemId);
      setSelectedItem(null);
      loadItems();
      loadProfile();
      showToast('매물이 정상적으로 삭제되었습니다.', 'success');
    } catch (err: any) {
      showToast(err.message || '매물 삭제에 실패했습니다.', 'error');
      throw err;
    }
  };

  // Handler for phone verification
  const handleVerifyPhone = async (phoneNumber: string) => {
    try {
      await api.verifyPhone(phoneNumber);
      await loadProfile();
      showToast('휴대폰 본인인증이 완료되었습니다. 매물 등록 권한이 활성화되었습니다!', 'success');
    } catch (err: any) {
      showToast(err.message || '인증에 실패했습니다.', 'error');
      throw err;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* 1. Legal Disclaimer Fixed Banner */}
      <LegalBanner />

      {/* 2. Header & Controls */}
      <Header
        userProfile={userProfile}
        onOpenCreate={() => {
          if (!userProfile?.isPhoneVerified) {
            setIsPhoneModalOpen(true);
            showToast('매물 등록을 위해 먼저 휴대폰 본인인증을 진행해주세요.', 'info');
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        onOpenPhoneVerify={() => setIsPhoneModalOpen(true)}
        onOpenMyProfile={() => setIsMyProfileOpen(true)}
        onOpenChatList={() => setIsChatListOpen(true)}
        unreadChatCount={chatThreads.reduce((acc, t) => acc + t.unreadCount, 0)}
        onSwitchUser={handleSwitchUser}
        currentUserId={currentUserId}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: toastMessage.type === 'error' ? '#dc2626' : toastMessage.type === 'success' ? '#059669' : '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          maxWidth: '420px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 20px 60px 20px' }}>
        
        {/* Sleek Minimalist Luxury Hero Section */}
        <section style={{
          margin: '22px 0 18px 0',
          padding: '30px 32px',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '12px'
            }}>
              <Sparkles size={13} color="#2563eb" />
              <span>시계 애호가를 위한 순수 P2P 직거래 마켓</span>
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: '1.3',
              marginBottom: '10px'
            }}>
              투명하고 안전한 시계 직거래의 새로운 기준
            </h1>

            <p style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: '1.65',
              margin: 0
            }}>
              구매자와 판매자가 직접 소통하는 투명하고 안전한 대면 직거래 플랫폼입니다.<br />
              실거래 완료된 매물 정보를 실시간으로 확인하여 합리적인 시세를 파악할 수 있습니다.
            </p>
          </div>

          {/* Minimal 3-Point Value Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', width: '100%', maxWidth: '440px' }}>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>거래 방식</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>안심 대면 직거래</div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>일일 등록 쿼터</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>최대 3건</div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>시세 정보</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>실거래 아카이브</div>
            </div>
          </div>
        </section>

        {/* 3. Category Tabs: 전체, 엔트리, 미드, 하이엔드 */}
        <TrackTabs
          currentTier={currentTier}
          onChangeTier={setCurrentTier}
          itemCounts={tabCounts}
        />

        {/* 4. Filter & Search Bar */}
        <FilterBar
          selectedBrand={selectedBrand}
          onChangeBrand={setSelectedBrand}
          availableOnly={availableOnly}
          onToggleAvailableOnly={() => setAvailableOnly(prev => !prev)}
          sortOrder={sortOrder}
          onChangeSortOrder={setSortOrder}
          searchKeyword={searchKeyword}
          onChangeSearchKeyword={setSearchKeyword}
        />

        {/* 5. Watch Items Grid List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            매물 목록을 불러오는 중입니다...
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
            <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              조건에 일치하는 매물이 없습니다.
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              검색어나 브랜드 필터를 변경하거나 새로운 매물을 등록해보세요.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {items.map(item => (
              <ItemCard
                key={item.itemId}
                item={item}
                onClick={() => handleOpenDetail(item)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteItem}
          onOpenSellerProfile={(sellerId) => setSelectedSellerId(sellerId)}
          onOpenChat={(item) => setChatItem(item)}
          currentUserId={currentUserId}
        />
      )}

      {/* Seller Profile Modal */}
      {selectedSellerId !== null && (
        <SellerProfileModal
          sellerId={selectedSellerId}
          onClose={() => setSelectedSellerId(null)}
          onSelectItem={(item) => {
            setSelectedItem(item);
          }}
        />
      )}

      {/* 1:1 Direct Chat Modal */}
      {chatItem && (
        <ChatModal
          item={chatItem}
          currentUserId={currentUserId}
          onClose={() => setChatItem(null)}
          onBackToList={() => {
            setChatItem(null);
            setIsChatListOpen(true);
          }}
        />
      )}

      {/* Chat List Modal */}
      {isChatListOpen && (
        <ChatListModal
          threads={chatThreads}
          onClose={() => setIsChatListOpen(false)}
          onSelectThread={(thread) => {
            setIsChatListOpen(false);
            setChatItem(thread.item);
          }}
        />
      )}

      {/* My Profile Modal */}
      {isMyProfileOpen && (
        <MyProfileModal
          userProfile={userProfile}
          onClose={() => setIsMyProfileOpen(false)}
          onProfileUpdated={() => {
            loadProfile();
            loadItems();
          }}
          onOpenPhoneVerify={() => {
            setIsMyProfileOpen(false);
            setIsPhoneModalOpen(true);
          }}
        />
      )}

      {/* Item Create Modal */}
      {isCreateModalOpen && (
        <ItemCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            loadItems();
            loadProfile();
            showToast('신규 매물이 등록되었습니다.', 'success');
          }}
          userProfile={userProfile}
          onOpenPhoneVerify={() => {
            setIsCreateModalOpen(false);
            setIsPhoneModalOpen(true);
          }}
        />
      )}

      {/* Phone Verification Modal */}
      {isPhoneModalOpen && (
        <PhoneVerificationModal
          onClose={() => setIsPhoneModalOpen(false)}
          onVerify={handleVerifyPhone}
        />
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '30px 20px',
        color: '#64748b',
        fontSize: '0.78rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              TIMELINK <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>타임링크</span>
            </span>
            <div style={{ display: 'flex', gap: '16px', color: '#475569' }}>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>안전직거래가이드</span>
              <span>시세아카이브정책</span>
            </div>
          </div>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            (주)타임링크 | 대표이사: 팀 타임링크 | 사업자등록번호: 000-00-00000 | 통신판매업신고: 제2024-서울강남-0000호<br />
            <strong>[책임의 한계 및 법적 고지]</strong> 타임링크(TIMELINK)는 시계 개인 간 직거래를 위한 중개 시스템만을 제공하며, 거래 당사자가 아닙니다. 상품의 상태, 대금 결제 및 배송에 대한 법적 책임은 거래 당사자에게 귀속됩니다.
          </p>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px' }}>
            © 2024 TIMELINK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
