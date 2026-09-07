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
import { MyListingsModal } from './components/MyListingsModal.tsx';
import { ItemEditModal } from './components/ItemEditModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TermsModal, TermsTab } from './components/TermsModal.tsx';
import { CategoryTier, ItemStatus, UserProfile, WatchItem } from './types.ts';
import { api, getAuthToken, setAuthUserId } from './api.ts';
import { Shield, Sparkles, TrendingUp, AlertCircle, CheckCircle, Check, ArrowRight, MessageSquare, Heart } from 'lucide-react';

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

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');

  // Terms Modal state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [termsModalTab, setTermsModalTab] = useState<TermsTab>('TERMS');

  // Filters & Wishlist state
  const [currentTier, setCurrentTier] = useState<CategoryTier | 'ALL'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'LATEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'VIEWS'>('LATEST');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [likedItemIds, setLikedItemIds] = useState<number[]>([]);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);

  // Modals
  const [selectedItem, setSelectedItem] = useState<WatchItem | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [chatTarget, setChatTarget] = useState<{ threadId?: string; item: WatchItem; otherUser?: any } | null>(null);
  const [isChatListOpen, setIsChatListOpen] = useState<boolean>(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState<boolean>(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);
  const [reportTarget, setReportTarget] = useState<{ targetItemId?: number; targetSellerId?: number; itemSummary?: string; sellerNickname?: string } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ sellerId: number; nickname: string; itemSummary?: string } | null>(null);
  const [detailBackAction, setDetailBackAction] = useState<{ label: string; action: () => void } | null>(null);

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

  // Require Auth Helper
  const requireAuth = (callback: () => void, message = '해당 기능을 이용하려면 로그인이 필요합니다.') => {
    if (!userProfile) {
      showToast(message, 'info');
      setAuthModalTab('LOGIN');
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  // Load User Profile (Session check)
  const loadProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // If no JWT stored, check if legacy currentUserId exists or default to guest
        // For smoother demo we can try loading profile
        try {
          const profile = await api.getMyProfile();
          setUserProfile(profile);
          setCurrentUserId(profile.userId);
        } catch {
          setUserProfile(null);
        }
        return;
      }
      const profile = await api.getMyProfile();
      setUserProfile(profile);
      setCurrentUserId(profile.userId);
    } catch (err: any) {
      console.warn('Session expired or guest state:', err);
      setUserProfile(null);
    }
  }, []);

  // Handle Login / Signup Success
  const handleAuthSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setCurrentUserId(user.userId);
    showToast(`환영합니다, ${user.nickname}님! 타임링크에 로그인되었습니다.`, 'success');
    loadItems();
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setUserProfile(null);
    showToast('안전하게 로그아웃되었습니다.', 'info');
  };

  // Load Chat Threads from persistent backend
  const loadChatThreads = useCallback(async () => {
    if (!userProfile) {
      setChatThreads([]);
      return;
    }
    try {
      const threadList = await api.getChatThreads();
      setChatThreads(threadList);
    } catch {}
  }, [userProfile]);

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
    } catch (err: any) {
      showToast(err.message || '매물 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentTier, selectedBrand, availableOnly, sortOrder, searchKeyword]);

  // Load Liked Item IDs
  const loadLikedItemIds = useCallback(async () => {
    if (!userProfile) {
      setLikedItemIds([]);
      return;
    }
    try {
      const ids = await api.getMyLikedItemIds();
      setLikedItemIds(ids);
    } catch {
      setLikedItemIds([]);
    }
  }, [userProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadLikedItemIds();
  }, [loadLikedItemIds]);

  useEffect(() => {
    loadChatThreads();
    const interval = setInterval(loadChatThreads, 5000);
    return () => clearInterval(interval);
  }, [loadChatThreads]);

  // Handler for toggle wishlist like
  const handleToggleLike = async (itemId: number) => {
    requireAuth(async () => {
      const targetItem = items.find(i => i.itemId === itemId) || (selectedItem?.itemId === itemId ? selectedItem : null);
      if (userProfile && targetItem && targetItem.sellerId === userProfile.userId) {
        showToast('본인이 등록한 매물은 관심 매물(찜)로 등록할 수 없습니다.', 'error');
        return;
      }

      try {
        const res = await api.toggleItemLike(itemId);
        setLikedItemIds(prev => res.liked ? [...prev, itemId] : prev.filter(id => id !== itemId));
        setItems(prev => prev.map(i => i.itemId === itemId ? { ...i, likeCount: res.likeCount } : i));
        if (selectedItem && selectedItem.itemId === itemId) {
          setSelectedItem(prev => prev ? { ...prev, likeCount: res.likeCount } : null);
        }
        showToast(res.liked ? '관심 매물(찜)에 등록되었습니다.' : '관심 매물(찜)이 해제되었습니다.', 'info');
      } catch (err: any) {
        showToast(err.message || '관심 매물 설정에 실패했습니다.', 'error');
      }
    }, '관심 매물(찜) 등록을 위해 로그인이 필요합니다.');
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
          requireAuth(() => {
            if (!userProfile?.isPhoneVerified) {
              setIsPhoneModalOpen(true);
              showToast('매물 등록을 위해 먼저 휴대폰 본인인증을 진행해주세요.', 'info');
            } else {
              setIsCreateModalOpen(true);
            }
          }, '매물 등록을 위해 로그인이 필요합니다.');
        }}
        onOpenPhoneVerify={() => {
          requireAuth(() => setIsPhoneModalOpen(true), '본인인증을 위해 로그인이 필요합니다.');
        }}
        onOpenMyProfile={() => {
          requireAuth(() => setIsMyProfileOpen(true), '내 정보 조회를 위해 로그인이 필요합니다.');
        }}
        onOpenMyListings={() => {
          requireAuth(() => setIsMyListingsOpen(true), '내 매물 관리를 위해 로그인이 필요합니다.');
        }}
        onOpenChatList={() => {
          requireAuth(() => setIsChatListOpen(true), '채팅 목록 조회를 위해 로그인이 필요합니다.');
        }}
        unreadChatCount={chatThreads.reduce((acc, t) => acc + t.unreadCount, 0)}
        wishlistOnly={wishlistOnly}
        onToggleWishlistOnly={() => {
          requireAuth(() => setWishlistOnly(prev => !prev), '관심 매물 조회를 위해 로그인이 필요합니다.');
        }}
        likedCount={likedItemIds.length}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || 'LOGIN');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
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
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>일일 등록 제한</div>
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

        {/* Wishlist Active Filter Banner */}
        {wishlistOnly && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#991b1b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
              <Heart size={16} fill="#ef4444" color="#ef4444" />
              <span>내가 찜한 관심 매물 ({(wishlistOnly ? items.filter(i => likedItemIds.includes(i.itemId)) : items).length}개)을 모아보고 있습니다.</span>
            </div>
            <button
              type="button"
              onClick={() => setWishlistOnly(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                color: '#dc2626',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              전체 매물 보기
            </button>
          </div>
        )}

        {/* 5. Watch Items Grid List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            매물 목록을 불러오는 중입니다...
          </div>
        ) : (wishlistOnly ? items.filter(i => likedItemIds.includes(i.itemId)) : items).length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
            <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              {wishlistOnly ? '찜한 관심 매물이 없습니다.' : '조건에 일치하는 매물이 없습니다.'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {wishlistOnly ? '마음에 드는 시계의 하트(찜) 아이콘을 눌러 관심 매물로 등록해보세요.' : '검색어나 브랜드 필터를 변경하거나 새로운 매물을 등록해보세요.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {(wishlistOnly ? items.filter(i => likedItemIds.includes(i.itemId)) : items).map(item => (
              <ItemCard
                key={item.itemId}
                item={item}
                onClick={() => {
                  setDetailBackAction(null);
                  handleOpenDetail(item);
                }}
                isLiked={likedItemIds.includes(item.itemId)}
                onToggleLike={() => handleToggleLike(item.itemId)}
                isOwner={userProfile?.userId === item.sellerId}
                currentUserId={userProfile?.userId}
              />
            ))}
          </div>
        )}

      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setDetailBackAction(null);
          }}
          onBack={detailBackAction ? detailBackAction.action : undefined}
          backLabel={detailBackAction?.label}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteItem}
          onOpenSellerProfile={(sellerId) => {
            setSelectedItem(null);
            setSelectedSellerId(sellerId);
          }}
          onOpenChat={(item) => {
            requireAuth(() => setChatTarget({ item }), '판매자와 1:1 직거래 대화를 시작하려면 로그인이 필요합니다.');
          }}
          onOpenReview={(sellerId, nickname, itemSummary) => {
            requireAuth(() => setReviewTarget({ sellerId, nickname, itemSummary }), '거래 후기를 작성하려면 로그인이 필요합니다.');
          }}
          onOpenReport={(item) => {
            requireAuth(() => setReportTarget({
              targetItemId: item.itemId,
              targetSellerId: item.sellerId,
              itemSummary: `${item.brand} ${item.modelName}`,
              sellerNickname: item.seller?.nickname
            }), '신고 기능을 이용하려면 로그인이 필요합니다.');
          }}
          isLiked={likedItemIds.includes(selectedItem.itemId)}
          onToggleLike={() => handleToggleLike(selectedItem.itemId)}
          onEditItem={(item) => setEditingItem(item)}
          currentUserId={userProfile?.userId || 0}
        />
      )}

      {/* Seller Profile Modal */}
      {selectedSellerId !== null && (
        <SellerProfileModal
          sellerId={selectedSellerId}
          onClose={() => setSelectedSellerId(null)}
          onSelectItem={(item) => {
            const sid = selectedSellerId;
            setSelectedSellerId(null);
            setDetailBackAction({
              label: '판매자 프로필',
              action: () => {
                setSelectedItem(null);
                setSelectedSellerId(sid);
                setDetailBackAction(null);
              }
            });
            handleOpenDetail(item);
          }}
          onOpenReview={(sellerId, nickname) => {
            requireAuth(() => setReviewTarget({ sellerId, nickname }), '거래 후기를 작성하려면 로그인이 필요합니다.');
          }}
          currentUserId={userProfile?.userId || 0}
        />
      )}

      {/* 1:1 Direct Chat Modal */}
      {chatTarget && (
        <ChatModal
          item={chatTarget.item}
          initialThreadId={chatTarget.threadId}
          initialOtherUser={chatTarget.otherUser}
          currentUserId={currentUserId}
          onClose={() => setChatTarget(null)}
          onBackToList={() => {
            setChatTarget(null);
            setIsChatListOpen(true);
          }}
          onOpenReview={(sellerId, nickname, itemSummary) => {
            requireAuth(() => setReviewTarget({ sellerId, nickname, itemSummary }), '거래 후기를 작성하려면 로그인이 필요합니다.');
          }}
          onItemStatusChanged={() => {
            loadItems();
            loadChatThreads();
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
            setChatTarget({
              threadId: thread.threadId,
              item: thread.item,
              otherUser: thread.otherUser
            });
          }}
          onDeleteThread={async (threadId) => {
            try {
              await api.deleteChatThread(threadId);
              loadChatThreads();
              showToast('대화방을 나갔습니다.', 'info');
            } catch (err: any) {
              showToast(err.message || '대화방 삭제에 실패했습니다.', 'error');
            }
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
          onWithdrawSuccess={() => {
            setUserProfile(null);
            setCurrentUserId(0);
            loadItems();
            loadChatThreads();
            showToast('회원 탈퇴가 완료되었습니다. 세션이 종료되었습니다.', 'info');
          }}
        />
      )}

      {/* My Listings Modal */}
      {isMyListingsOpen && (
        <MyListingsModal
          onClose={() => setIsMyListingsOpen(false)}
          onSelectItem={(item) => {
            setIsMyListingsOpen(false);
            setDetailBackAction({
              label: '내 매물 관리',
              action: () => {
                setSelectedItem(null);
                setIsMyListingsOpen(true);
                setDetailBackAction(null);
              }
            });
            handleOpenDetail(item);
          }}
          onEditItem={(item) => {
            setEditingItem(item);
          }}
          onItemUpdated={() => {
            loadItems();
            loadProfile();
          }}
        />
      )}

      {/* Item Edit Modal */}
      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={(updated) => {
            setItems(prev => prev.map(i => i.itemId === updated.itemId ? updated : i));
            if (selectedItem && selectedItem.itemId === updated.itemId) {
              setSelectedItem(updated);
            }
            loadItems();
            loadProfile();
            showToast('매물 정보가 성공적으로 수정되었습니다.', 'success');
          }}
        />
      )}

      {/* Fraud / Abuse Report Modal */}
      {reportTarget && (
        <ReportModal
          targetItemId={reportTarget.targetItemId}
          targetSellerId={reportTarget.targetSellerId}
          itemSummary={reportTarget.itemSummary}
          sellerNickname={reportTarget.sellerNickname}
          onClose={() => setReportTarget(null)}
          onSuccess={() => {
            loadItems();
            if (selectedItem) setSelectedItem(null);
            showToast('신고가 정상 접수되었습니다. 매물이 검토됩니다.', 'success');
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

      {/* Review / Manner Rating Modal */}
      {reviewTarget && (
        <ReviewModal
          sellerId={reviewTarget.sellerId}
          sellerNickname={reviewTarget.nickname}
          itemSummary={reviewTarget.itemSummary}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={(newScore) => {
            loadItems();
            loadProfile();
            showToast(`거래 후기 및 매너 평가가 등록되었습니다.${newScore ? ` (매너온도: ${newScore}℃)` : ''}`, 'success');
          }}
        />
      )}

      {/* Phone Verification Modal */}
      {isPhoneModalOpen && (
        <PhoneVerificationModal
          onClose={() => setIsPhoneModalOpen(false)}
          initialPhoneNumber={userProfile?.phoneNumber || ''}
          onSuccess={(updatedUser) => {
            setUserProfile(updatedUser);
            loadProfile();
            showToast('휴대폰 실명 인증이 완료되었습니다! 매물 등록 권한이 활성화되었습니다.', 'success');
          }}
        />
      )}

      {/* Auth Modal (Login / Signup / Forgot Password) */}
      {isAuthModalOpen && (
        <AuthModal
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onOpenTerms={(tab) => {
            setTermsModalTab(tab);
            setIsTermsModalOpen(true);
          }}
        />
      )}

      {/* Terms & Policies Full Modal */}
      {isTermsModalOpen && (
        <TermsModal
          initialTab={termsModalTab}
          onClose={() => setIsTermsModalOpen(false)}
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
            <div style={{ display: 'flex', gap: '16px', color: '#475569', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setTermsModalTab('TERMS');
                  setIsTermsModalOpen(true);
                }}
                style={{ background: 'none', border: 'none', padding: 0, color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                이용약관
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermsModalTab('PRIVACY');
                  setIsTermsModalOpen(true);
                }}
                style={{ background: 'none', border: 'none', padding: 0, color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                개인정보처리방침
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermsModalTab('SAFETY_GUIDE');
                  setIsTermsModalOpen(true);
                }}
                style={{ background: 'none', border: 'none', padding: 0, color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                안전직거래가이드
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermsModalTab('ARCHIVE_POLICY');
                  setIsTermsModalOpen(true);
                }}
                style={{ background: 'none', border: 'none', padding: 0, color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                시세아카이브정책
              </button>
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
