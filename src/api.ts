import { CategoryTier, ItemStatus, WatchItem, CreateItemPayload, UserProfile } from './types';

const API_BASE = '/api/v1';
const TOKEN_KEY = 'timelink_jwt_token';

// JWT Token & Active User ID storage
let currentAuthUserId = 1;
let currentJwtToken: string | null = null;

try {
  currentJwtToken = localStorage.getItem(TOKEN_KEY);
} catch {}

export const setAuthToken = (token: string | null) => {
  currentJwtToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
};

export const getAuthToken = () => currentJwtToken;

export const setAuthUserId = (userId: number) => {
  currentAuthUserId = userId;
};

export const getAuthUserId = () => currentAuthUserId;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (currentJwtToken) {
    headers['Authorization'] = `Bearer ${currentJwtToken}`;
  } else {
    headers['Authorization'] = `Bearer ${currentAuthUserId}`;
  }
  return headers;
};

export const api = {
  // Auth
  async signup(payload: { email: string; password: string; nickname: string; phoneNumber?: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '회원가입에 실패했습니다.');
    if (json.data?.token) {
      setAuthToken(json.data.token);
      setAuthUserId(json.data.user.userId);
    }
    return json.data;
  },

  async login(payload: { email: string; password: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
    if (json.data?.token) {
      setAuthToken(json.data.token);
      setAuthUserId(json.data.user.userId);
    }
    return json.data;
  },

  logout(): void {
    setAuthToken(null);
  },

  async sendForgotPasswordCode(payload: { email: string; phoneNumber: string }): Promise<{ expiresIn: number; devCode?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '인증번호 발송에 실패했습니다.');
    return json;
  },

  async resetForgotPassword(payload: { email: string; phoneNumber: string; code: string; newPassword: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '비밀번호 재설정에 실패했습니다.');
  },

  // Items
  async getItems(params: {
    tier?: CategoryTier;
    brand?: string;
    status?: ItemStatus | 'AVAILABLE_ONLY';
    keyword?: string;
    sort?: 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'VIEWS';
  }): Promise<{ data: WatchItem[]; total: number; counts?: { all: number; entry: number; mid: number; highEnd: number } }> {
    const query = new URLSearchParams();
    if (params.tier) query.append('tier', params.tier);
    if (params.brand) query.append('brand', params.brand);
    if (params.status) query.append('status', params.status);
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/items?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 목록을 불러오지 못했습니다.');
    return json;
  },

  async getItemById(itemId: number): Promise<WatchItem> {
    const res = await fetch(`${API_BASE}/items/${itemId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 정보를 불러오지 못했습니다.');
    return json.data;
  },

  async createItem(payload: CreateItemPayload): Promise<WatchItem> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      const error: any = new Error(json.message || '매물 등록에 실패했습니다.');
      error.code = json.code;
      throw error;
    }
    return json.data;
  },

  async updateItem(itemId: number, payload: Partial<CreateItemPayload>): Promise<WatchItem> {
    const res = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 정보 수정에 실패했습니다.');
    return json.data;
  },

  async updateItemStatus(itemId: number, status: ItemStatus): Promise<WatchItem> {
    const res = await fetch(`${API_BASE}/items/${itemId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '상태 변경에 실패했습니다.');
    return json.data;
  },

  async deleteItem(itemId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) {
      const error: any = new Error(json.message || '매물 삭제에 실패했습니다.');
      error.code = json.code;
      throw error;
    }
  },

  // Users
  async getMyProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '프로필을 불러오지 못했습니다.');
    return json.data;
  },

  async getSellerProfile(userId: number): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '판매자 정보를 불러오지 못했습니다.');
    return json.data;
  },

  async updateMyProfile(data: { nickname: string; phoneNumber?: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '프로필 수정에 실패했습니다.');
    return json.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '비밀번호 변경에 실패했습니다.');
  },

  async withdrawUser(password: string, reason?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '회원 탈퇴에 실패했습니다.');
    setAuthToken(null);
  },

  // Real SMS 6-Digit Verification
  async sendSmsCode(phoneNumber: string): Promise<{ success: boolean; message: string; expiresIn: number; devCode?: string }> {
    const res = await fetch(`${API_BASE}/auth/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '인증번호 발송에 실패했습니다.');
    return json;
  },

  async verifySmsCode(phoneNumber: string, code: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/sms/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber, code })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '인증번호 확인에 실패했습니다.');
    return json.data;
  },

  async verifyPhone(phoneNumber: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/verify-phone`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '휴대폰 인증에 실패했습니다.');
    return json;
  },

  // 1:1 Direct Chat
  async getChatThreads(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/chat/threads`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '채팅 목록을 불러오지 못했습니다.');
    return json.data;
  },

  async getOrCreateItemChatThread(itemId: number): Promise<{ thread: any; item: WatchItem; otherUser: any }> {
    const res = await fetch(`${API_BASE}/chat/threads/by-item/${itemId}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '채팅방을 열 수 없습니다.');
    return json.data;
  },

  async getChatThreadById(threadId: string): Promise<{ thread: any; item: WatchItem; otherUser: any }> {
    const res = await fetch(`${API_BASE}/chat/threads/${threadId}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '대화방 정보를 불러오지 못했습니다.');
    return json.data;
  },

  async getChatMessages(threadId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/chat/threads/${threadId}/messages`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '대화 내역을 불러오지 못했습니다.');
    return json.data;
  },

  async sendChatMessage(threadId: string, text: string, imageUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/chat/threads/${threadId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, imageUrl })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '메시지 전송에 실패했습니다.');
    return json.data;
  },

  async deleteChatThread(threadId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/chat/threads/${threadId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '대화방 나가기에 실패했습니다.');
  },

  // Likes (Wishlist)
  async toggleItemLike(itemId: number): Promise<{ liked: boolean; likeCount: number }> {
    const res = await fetch(`${API_BASE}/items/${itemId}/like`, {
      method: 'POST',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '찜하기 처리에 실패했습니다.');
    return json.data;
  },

  async getMyLikedItemIds(): Promise<number[]> {
    const res = await fetch(`${API_BASE}/users/me/likes`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '찜 목록을 불러오지 못했습니다.');
    return json.data;
  },

  // My Listings
  async getMyItems(status?: string): Promise<WatchItem[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/users/me/items${query}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '내 매물 목록을 불러오지 못했습니다.');
    return json.data;
  },

  // Reports
  async submitReport(data: {
    targetItemId?: number;
    targetSellerId?: number;
    reason: string;
    details?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '신고 접수에 실패했습니다.');
    return json.data;
  },

  // Media Upload
  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '이미지 업로드에 실패했습니다.');
    return json.urls;
  },

  // Reviews & Manner Rating
  async getSellerReviews(userId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/users/${userId}/reviews`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '거래 후기를 불러오지 못했습니다.');
    return json.data;
  },

  async createReview(userId: number, payload: {
    rating: 'GREAT' | 'GOOD' | 'BAD';
    tags: string[];
    comment: string;
    itemSummary?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${userId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '거래 후기 등록에 실패했습니다.');
    return json.data;
  },

  // ==========================================
  // Admin API Methods
  // ==========================================
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '관리자 통계를 불러오지 못했습니다.');
    return json.data;
  },

  async getAdminReports(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '신고 목록을 불러오지 못했습니다.');
    return json.data;
  },

  async updateAdminReport(reportId: number, payload: { status: 'PENDING' | 'RESOLVED'; action?: 'LOCK_ITEM' | 'UNLOCK_ITEM' }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '신고 처리에 실패했습니다.');
    return json.data;
  },

  async getAdminUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '회원 목록을 불러오지 못했습니다.');
    return json.data;
  },

  async updateAdminUser(userId: number, payload: { mannerScore?: number; userRole?: 'MEMBER' | 'ADMIN'; nickname?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '회원 정보 수정에 실패했습니다.');
    return json.data;
  },

  async deleteAdminUser(userId: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '회원 삭제에 실패했습니다.');
    return true;
  },

  async getAdminItems(): Promise<WatchItem[]> {
    const res = await fetch(`${API_BASE}/admin/items`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 목록을 불러오지 못했습니다.');
    return json.data;
  },

  async updateAdminItemStatus(itemId: number, status: ItemStatus): Promise<WatchItem> {
    const res = await fetch(`${API_BASE}/admin/items/${itemId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 상태 변경에 실패했습니다.');
    return json.data;
  },

  async deleteAdminItem(itemId: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || '매물 삭제에 실패했습니다.');
    return true;
  }
};

