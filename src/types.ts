export type CategoryTier = 'ENTRY' | 'MID' | 'HIGH_END' | 'ENTRY_MID';
export type MovementType = 'AUTOMATIC' | 'MANUAL' | 'QUARTZ';
export type OriginType = 'DOMESTIC_STORE' | 'OVERSEAS' | 'PARALLEL' | 'UNKNOWN';
export type TradeType = 'DIRECT_ONLY' | 'DELIVERY_AVAILABLE';
export type ItemStatus = 'FOR_SALE' | 'RESERVED' | 'SOLD';

export interface UserProfile {
  userId: number;
  email?: string;
  nickname: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  mannerScore: number;
  remainingDailyQuota?: number;
  recent24hPostsCount?: number;
  completedSalesCount: number;
  joinedAt?: string;
  items?: WatchItem[];
}

export interface SellerProfileDetail extends UserProfile {
  items?: WatchItem[];
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
  itemStatus: ItemStatus;
  viewCount: number;
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

export interface CreateItemPayload {
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
