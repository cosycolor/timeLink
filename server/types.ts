export type UserRole = 'MEMBER' | 'ADMIN';
export type CategoryTier = 'ENTRY' | 'MID' | 'HIGH_END' | 'ENTRY_MID';
export type MovementType = 'AUTOMATIC' | 'MANUAL' | 'QUARTZ';
export type OriginType = 'DOMESTIC_STORE' | 'OVERSEAS' | 'PARALLEL' | 'UNKNOWN';
export type TradeType = 'DIRECT_ONLY' | 'DELIVERY_AVAILABLE';
export type ItemStatus = 'FOR_SALE' | 'RESERVED' | 'SOLD' | 'REPORTED_LOCKED';

export interface User {
  userId: number;
  email: string;
  passwordHash: string;
  nickname: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  userRole: UserRole;
  mannerScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemImage {
  imageId: number;
  itemId: number;
  imageUrl: string;
  isRepresentative: boolean;
  isVerificationPhoto: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface WatchItem {
  itemId: number;
  sellerId: number;
  categoryTier: CategoryTier;
  brand: string;
  modelName: string;
  refNumber?: string;
  movementType: MovementType;
  caseSizeMm?: number;
  dialColor?: string;
  stampingDate?: string; // YYYY-MM
  originType: OriginType;
  hasBox: boolean;
  hasGuaranteeCard: boolean;
  hasManual: boolean;
  extraLinksCount: number;
  price: number;
  tradeType: TradeType;
  preferredLocation?: string;
  description: string;
  itemStatus: ItemStatus;
  viewCount: number;
  likeCount?: number;
  isLiked?: boolean;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
  images: ItemImage[];
  seller?: {
    userId: number;
    nickname: string;
    mannerScore: number;
    isPhoneVerified: boolean;
    completedSalesCount: number;
  };
}

export interface CreateItemDTO {
  categoryTier: CategoryTier;
  brand: string;
  modelName: string;
  refNumber?: string;
  movementType: MovementType;
  caseSizeMm?: number;
  dialColor?: string;
  stampingDate?: string;
  originType: OriginType;
  hasBox: boolean;
  hasGuaranteeCard: boolean;
  hasManual: boolean;
  extraLinksCount: number;
  price: number;
  tradeType: TradeType;
  preferredLocation?: string;
  description: string;
  images: {
    imageUrl: string;
    isRepresentative: boolean;
    isVerificationPhoto: boolean;
    sortOrder: number;
  }[];
}

export interface UserReview {
  reviewId: number;
  sellerId: number;
  reviewerId: number;
  reviewerNickname: string;
  rating: 'GREAT' | 'GOOD' | 'BAD';
  tempDelta: number;
  tags: string[];
  comment: string;
  itemSummary?: string;
  createdAt: string;
}

export interface ChatMessage {
  messageId: string;
  threadId: string;
  senderId: number;
  senderNickname?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatThread {
  threadId: string;
  itemId: number;
  buyerId: number;
  sellerId: number;
  lastMessage: string;
  lastMessageTime: string;
  updatedAt: string;
}

export interface ItemLike {
  userId: number;
  itemId: number;
  createdAt: string;
}

export interface UserReport {
  reportId: number;
  reporterId: number;
  targetItemId?: number;
  targetSellerId?: number;
  reason: 'FAKE_SUSPECTED' | 'STOLEN_PHOTO' | 'NO_SHOW' | 'FRAUD_SUSPECTED' | 'OTHER';
  details?: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}
