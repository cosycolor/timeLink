import { WatchItem, CreateItemPayload, UserProfile, ItemStatus, CategoryTier } from './types.ts';

const API_BASE = '/api/v1';

// Active User ID stored for session simulation
let currentAuthUserId = 1;

export const setAuthUserId = (userId: number) => {
  currentAuthUserId = userId;
};

export const getAuthUserId = () => currentAuthUserId;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${currentAuthUserId}`
});

export const api = {
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
  }
};
