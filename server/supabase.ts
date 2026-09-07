import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { User, WatchItem, ItemImage, UserReview, ChatThread, ChatMessage, ItemLike, UserReport } from './types.ts';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[SUPABASE] Connected to cloud PostgreSQL:', supabaseUrl);
  } catch (err) {
    console.error('[SUPABASE ERROR] Failed to initialize Supabase client:', err);
  }
} else {
  console.warn('[SUPABASE WARN] SUPABASE_URL / KEY not configured. Operating in local JSON fallback mode.');
}

export const supabase = supabaseInstance;

// Helper to check if Supabase is active
export const isSupabaseActive = () => !!supabase;

// ==========================================
// DB Model Mappers
// ==========================================
export const mapUserFromDb = (row: any): User => ({
  userId: Number(row.user_id),
  email: row.email,
  passwordHash: row.password_hash,
  nickname: row.nickname,
  phoneNumber: row.phone_number || undefined,
  isPhoneVerified: Boolean(row.is_phone_verified),
  userRole: row.user_role || 'MEMBER',
  mannerScore: Number(row.manner_score ?? 36.5),
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
});

export const mapUserToDb = (u: User) => ({
  user_id: u.userId,
  email: u.email,
  password_hash: u.passwordHash,
  nickname: u.nickname,
  phone_number: u.phoneNumber || null,
  is_phone_verified: u.isPhoneVerified,
  user_role: u.userRole,
  manner_score: u.mannerScore,
  created_at: u.createdAt,
  updated_at: u.updatedAt
});

export const mapItemFromDb = (row: any, images: ItemImage[] = []): WatchItem => ({
  itemId: Number(row.item_id),
  sellerId: Number(row.seller_id),
  categoryTier: row.category_tier,
  brand: row.brand,
  modelName: row.model_name,
  refNumber: row.ref_number || undefined,
  movementType: row.movement_type,
  caseSizeMm: row.case_size_mm ? Number(row.case_size_mm) : undefined,
  dialColor: row.dial_color || undefined,
  stampingDate: row.stamping_date || undefined,
  originType: row.origin_type,
  hasBox: Boolean(row.has_box),
  hasGuaranteeCard: Boolean(row.has_guarantee_card),
  hasManual: Boolean(row.has_manual),
  extraLinksCount: Number(row.extra_links_count || 0),
  price: Number(row.price),
  tradeType: row.trade_type,
  preferredLocation: row.preferred_location || undefined,
  description: row.description || '',
  itemStatus: row.item_status || 'FOR_SALE',
  viewCount: Number(row.view_count || 0),
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
  images
});

export const mapItemToDb = (item: WatchItem) => ({
  item_id: item.itemId,
  seller_id: item.sellerId,
  category_tier: item.categoryTier,
  brand: item.brand,
  model_name: item.modelName,
  ref_number: item.refNumber || null,
  movement_type: item.movementType,
  case_size_mm: item.caseSizeMm || null,
  dial_color: item.dialColor || null,
  stamping_date: item.stampingDate || null,
  origin_type: item.originType,
  has_box: item.hasBox,
  has_guarantee_card: item.hasGuaranteeCard,
  has_manual: item.hasManual,
  extra_links_count: item.extraLinksCount,
  price: item.price,
  trade_type: item.tradeType,
  preferred_location: item.preferredLocation || null,
  description: item.description,
  item_status: item.itemStatus,
  view_count: item.viewCount,
  created_at: item.createdAt,
  updated_at: item.updatedAt
});

export const mapImageFromDb = (row: any): ItemImage => ({
  imageId: Number(row.image_id),
  itemId: Number(row.item_id),
  imageUrl: row.image_url,
  isRepresentative: Boolean(row.is_representative),
  isVerificationPhoto: Boolean(row.is_verification_photo),
  sortOrder: Number(row.sort_order || 1),
  createdAt: row.created_at || new Date().toISOString()
});

export const mapImageToDb = (img: ItemImage) => ({
  image_id: img.imageId,
  item_id: img.itemId,
  image_url: img.imageUrl,
  is_representative: img.isRepresentative,
  is_verification_photo: img.isVerificationPhoto,
  sort_order: img.sortOrder,
  created_at: img.createdAt
});

export const mapReviewFromDb = (row: any): UserReview => ({
  reviewId: Number(row.review_id),
  sellerId: Number(row.seller_id),
  reviewerId: Number(row.reviewer_id),
  reviewerNickname: row.reviewer_nickname,
  rating: row.rating,
  tempDelta: Number(row.temp_delta ?? 0.5),
  tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
  comment: row.comment || '',
  itemSummary: row.item_summary || undefined,
  createdAt: row.created_at || new Date().toISOString()
});

export const mapReviewToDb = (r: UserReview) => ({
  review_id: r.reviewId,
  seller_id: r.sellerId,
  reviewer_id: r.reviewerId,
  reviewer_nickname: r.reviewerNickname,
  rating: r.rating,
  temp_delta: r.tempDelta,
  tags: r.tags,
  comment: r.comment,
  item_summary: r.itemSummary || null,
  created_at: r.createdAt
});

export const mapThreadFromDb = (row: any): ChatThread => ({
  threadId: row.thread_id,
  itemId: Number(row.item_id),
  buyerId: Number(row.buyer_id),
  sellerId: Number(row.seller_id),
  lastMessage: row.last_message || '',
  lastMessageTime: row.last_message_time || '',
  updatedAt: row.updated_at || new Date().toISOString(),
  leftUserIds: Array.isArray(row.left_user_ids) ? row.left_user_ids : (typeof row.left_user_ids === 'string' ? JSON.parse(row.left_user_ids) : [])
});

export const mapThreadToDb = (t: ChatThread) => ({
  thread_id: t.threadId,
  item_id: t.itemId,
  buyer_id: t.buyerId,
  seller_id: t.sellerId,
  last_message: t.lastMessage,
  last_message_time: t.lastMessageTime,
  updated_at: t.updatedAt,
  left_user_ids: t.leftUserIds || []
});

export const mapMessageFromDb = (row: any): ChatMessage => ({
  messageId: row.message_id,
  threadId: row.thread_id,
  senderId: Number(row.sender_id),
  senderNickname: row.sender_nickname || undefined,
  text: row.text,
  imageUrl: row.image_url || undefined,
  isRead: Boolean(row.is_read),
  isSystem: Boolean(row.is_system),
  createdAt: row.created_at || new Date().toISOString()
});

export const mapMessageToDb = (m: ChatMessage) => ({
  message_id: m.messageId,
  thread_id: m.threadId,
  sender_id: m.senderId,
  sender_nickname: m.senderNickname || null,
  text: m.text,
  image_url: m.imageUrl || null,
  is_read: m.isRead,
  is_system: m.isSystem || false,
  created_at: m.createdAt
});

export const mapLikeFromDb = (row: any): ItemLike => ({
  userId: Number(row.user_id),
  itemId: Number(row.item_id),
  createdAt: row.created_at || new Date().toISOString()
});

export const mapReportFromDb = (row: any): UserReport => ({
  reportId: Number(row.report_id),
  reporterId: Number(row.reporter_id),
  targetItemId: row.target_item_id ? Number(row.target_item_id) : undefined,
  targetSellerId: row.target_seller_id ? Number(row.target_seller_id) : undefined,
  reason: row.reason,
  details: row.details || undefined,
  status: row.status || 'PENDING',
  createdAt: row.created_at || new Date().toISOString()
});
