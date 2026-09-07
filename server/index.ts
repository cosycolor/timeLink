import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { db } from './db.ts';
import { sendRealSmsMessage } from './sms.ts';
import { CategoryTier, CreateItemDTO, ItemStatus } from './types.ts';

const app = express();
const PORT = process.env.PORT || 4000;
// Timelink API Server Instance - Reloaded

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Static images directory
const imagesDir = path.join(process.cwd(), 'public', 'images');
app.use('/images', express.static(imagesDir));

// Multer for image upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `watch-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper to extract authenticated User ID from Bearer JWT token or legacy ID
function getAuthenticatedUserId(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // 1. Try real JWT verification
    const decoded = db.verifyToken(token);
    if (decoded && decoded.userId) {
      return decoded.userId;
    }

    // 2. Fallback for backwards compatibility with numeric test IDs
    const parsed = parseInt(token, 10);
    if (!isNaN(parsed) && db.findUserById(parsed)) {
      return parsed;
    }
  }
  return null;
}

// -------------------------------------------------------------
// 3.1 REST API ENDPOINTS (Prefix: /api/v1)
// -------------------------------------------------------------

// POST /auth/signup (실제 회원가입)
app.post('/api/v1/auth/signup', (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;
  
  if (!email || !password || !nickname) {
    return res.status(400).json({ success: false, message: '이메일, 비밀번호, 닉네임은 필수 입력 항목입니다.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: '유효한 이메일 형식을 입력해주세요.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '비밀번호는 최소 6자리 이상이어야 합니다.' });
  }

  if (db.findUserByEmail(email.trim())) {
    return res.status(409).json({ success: false, message: '이미 가입된 이메일 주소입니다.' });
  }

  try {
    const user = db.createUser(email, nickname, password);
    const token = db.generateToken(user);

    return res.status(201).json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다.',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          nickname: user.nickname,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          mannerScore: user.mannerScore,
          userRole: user.userRole
        },
        token
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// POST /auth/login (실제 로그인 & JWT 발급)
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
  }

  const user = db.findUserByEmail(email.trim());
  if (!user) {
    return res.status(401).json({ success: false, message: '가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.' });
  }

  const isValid = db.validatePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  }

  const token = db.generateToken(user);

  return res.json({
    success: true,
    message: '로그인되었습니다.',
    data: {
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        isPhoneVerified: user.isPhoneVerified,
        mannerScore: user.mannerScore,
        userRole: user.userRole
      },
      token
    }
  });
});

// POST /auth/sms/send (6자리 SMS 인증번호 발송)
app.post('/api/v1/auth/sms/send', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
    return res.status(400).json({ success: false, message: '올바른 휴대폰 번호(10~11자리)를 입력해주세요.' });
  }

  try {
    const result = db.sendSmsCode(phoneNumber);
    // Send via SMS service (CoolSMS/Solapi if env configured, else terminal logging)
    await sendRealSmsMessage(phoneNumber, result.code);

    return res.json({
      success: true,
      message: '6자리 인증번호가 발송되었습니다. (3분 이내 입력)',
      expiresIn: 180,
      devCode: result.devCode
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '인증번호 발송에 실패했습니다.' });
  }
});

// POST /auth/sms/verify (6자리 SMS 인증번호 검증)
app.post('/api/v1/auth/sms/verify', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) {
    return res.status(400).json({ success: false, message: '휴대폰 번호와 6자리 인증번호를 모두 입력해주세요.' });
  }

  try {
    db.verifySmsCode(userId, phoneNumber, code.trim());
    const updatedUser = db.findUserById(userId);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    const recentCount = db.getRecentItemsCountBySeller(userId, 24);
    const completedSales = db.getCompletedSalesCountBySeller(userId);

    return res.json({
      success: true,
      message: '휴대폰 본인인증이 완료되었습니다. 매물 등록 권한이 활성화되었습니다!',
      data: {
        userId: updatedUser.userId,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        phoneNumber: updatedUser.phoneNumber,
        isPhoneVerified: updatedUser.isPhoneVerified,
        userRole: updatedUser.userRole,
        mannerScore: updatedUser.mannerScore ?? 36.5,
        remainingDailyQuota: Math.max(0, 3 - recentCount),
        recent24hPostsCount: recentCount,
        completedSalesCount: completedSales
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '인증번호 확인에 실패했습니다.' });
  }
});

// POST /auth/change-password (비밀번호 변경)
app.post('/api/v1/auth/change-password', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '새 비밀번호는 6자리 이상이어야 합니다.' });
  }

  try {
    db.changePassword(userId, currentPassword, newPassword);
    return res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '비밀번호 변경에 실패했습니다.' });
  }
});

// POST /auth/forgot-password/send-code (비밀번호 재설정용 SMS 인증번호 발송)
app.post('/api/v1/auth/forgot-password/send-code', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  if (!email || !phoneNumber) {
    return res.status(400).json({ success: false, message: '이메일과 휴대폰 번호를 모두 입력해주세요.' });
  }

  const user = db.findUserByEmail(email.trim());
  if (!user) {
    return res.status(404).json({ success: false, message: '가입된 회원 정보를 찾을 수 없습니다.' });
  }

  const cleanInputPhone = phoneNumber.replace(/[^0-9]/g, '');
  const cleanUserPhone = (user.phoneNumber || '').replace(/[^0-9]/g, '');

  if (cleanUserPhone && cleanInputPhone !== cleanUserPhone) {
    return res.status(400).json({ success: false, message: '가입 시 등록된 휴대폰 번호와 일치하지 않습니다.' });
  }

  try {
    const result = db.sendSmsCode(cleanInputPhone);
    await sendRealSmsMessage(cleanInputPhone, result.code);

    return res.json({
      success: true,
      message: '비밀번호 재설정을 위한 6자리 인증번호가 발송되었습니다.',
      expiresIn: 180,
      devCode: result.devCode
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '인증번호 발송에 실패했습니다.' });
  }
});

// POST /auth/forgot-password/reset (인증번호 확인 후 새 비밀번호 재설정)
app.post('/api/v1/auth/forgot-password/reset', (req: Request, res: Response) => {
  const { email, phoneNumber, code, newPassword } = req.body;
  if (!email || !phoneNumber || !code || !newPassword) {
    return res.status(400).json({ success: false, message: '모든 항목을 입력해주세요.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '새 비밀번호는 6자리 이상이어야 합니다.' });
  }

  try {
    db.checkSmsCode(phoneNumber, code);
    db.resetPasswordByEmail(email, newPassword);

    return res.json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새로운 비밀번호로 로그인해주세요.'
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '비밀번호 재설정에 실패했습니다.' });
  }
});

// POST /auth/withdraw (회원 탈퇴 및 세션 종료)
app.post('/api/v1/auth/withdraw', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const { password, reason } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: '탈퇴 확인을 위해 비밀번호를 입력해주세요.' });
  }

  try {
    db.withdrawUser(userId, password, reason);
    return res.json({
      success: true,
      message: '회원 탈퇴가 정상적으로 완료되었습니다. 그동안 타임링크를 이용해주셔서 감사합니다.'
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '회원 탈퇴 처리에 실패했습니다.' });
  }
});

// POST /auth/verify-phone (Legacy fallback)
app.post('/api/v1/auth/verify-phone', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.length < 10) {
    return res.status(400).json({ success: false, message: '유효한 휴대폰 번호를 입력해주세요.' });
  }

  const updatedUser = db.verifyUserPhone(userId, phoneNumber);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  const recentCount = db.getRecentItemsCountBySeller(userId, 24);
  const completedSales = db.getCompletedSalesCountBySeller(userId);

  return res.json({
    success: true,
    message: '휴대폰 본인인증이 완료되었습니다. 매물 등록 권한이 활성화되었습니다.',
    data: {
      userId: updatedUser.userId,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      phoneNumber: updatedUser.phoneNumber,
      isPhoneVerified: updatedUser.isPhoneVerified,
      userRole: updatedUser.userRole,
      mannerScore: updatedUser.mannerScore ?? 36.5,
      remainingDailyQuota: Math.max(0, 3 - recentCount),
      recent24hPostsCount: recentCount,
      completedSalesCount: completedSales
    }
  });
});

// GET /users/me (내 정보 및 로그인 세션 조회)
app.get('/api/v1/users/me', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  const recentCount = db.getRecentItemsCountBySeller(userId, 24);
  const completedSales = db.getCompletedSalesCountBySeller(userId);

  return res.json({
    success: true,
    data: {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      isPhoneVerified: user.isPhoneVerified,
      userRole: user.userRole,
      mannerScore: user.mannerScore,
      remainingDailyQuota: Math.max(0, 3 - recentCount),
      recent24hPostsCount: recentCount,
      completedSalesCount: completedSales
    }
  });
});

// PUT /users/me (내 프로필 정보 수정)
app.put('/api/v1/users/me', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const { nickname, phoneNumber } = req.body;

  const updated = db.updateUser(userId, { nickname, phoneNumber });
  if (!updated) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  return res.json({
    success: true,
    message: '회원 정보가 성공적으로 수정되었습니다.',
    data: {
      userId: updated.userId,
      email: updated.email,
      nickname: updated.nickname,
      phoneNumber: updated.phoneNumber,
      isPhoneVerified: updated.isPhoneVerified,
      mannerScore: updated.mannerScore
    }
  });
});

// GET /users/:userId/profile
app.get('/api/v1/users/:userId/profile', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string, 10);
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  const completedSales = db.getCompletedSalesCountBySeller(userId);
  const sellerItems = db.getItemsBySeller(userId);
  const reviews = db.getReviewsBySeller(userId);

  return res.json({
    success: true,
    data: {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
      mannerScore: user.mannerScore,
      isPhoneVerified: user.isPhoneVerified,
      completedSalesCount: completedSales,
      joinedAt: user.createdAt,
      items: sellerItems,
      reviews
    }
  });
});

// GET /users/:userId/reviews
app.get('/api/v1/users/:userId/reviews', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string, 10);
  const reviews = db.getReviewsBySeller(userId);
  return res.json({
    success: true,
    data: reviews
  });
});

// POST /users/:userId/reviews (판매자 매너온도 평가 및 거래 후기 작성)
app.post('/api/v1/users/:userId/reviews', (req: Request, res: Response) => {
  const reviewerId = getAuthenticatedUserId(req);
  if (!reviewerId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const sellerId = parseInt(req.params.userId as string, 10);
  const { rating, tags, comment, itemSummary } = req.body;

  if (reviewerId === sellerId) {
    return res.status(400).json({ success: false, message: '본인 스스로에게 후기를 남길 수 없습니다.' });
  }

  if (!rating || !['GREAT', 'GOOD', 'BAD'].includes(rating)) {
    return res.status(400).json({ success: false, message: '유효한 평가 만족도를 선택해주세요.' });
  }

  try {
    const review = db.createReview(sellerId, reviewerId, {
      rating,
      tags: tags || [],
      comment: comment || '',
      itemSummary
    });
    const updatedSeller = db.findUserById(sellerId);
    return res.status(201).json({
      success: true,
      message: '거래 후기 및 매너 평가가 성공적으로 등록되었습니다.',
      data: {
        review,
        sellerMannerScore: updatedSeller?.mannerScore
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '후기 작성 중 오류가 발생했습니다.' });
  }
});

// GET /items
app.get('/api/v1/items', (req: Request, res: Response) => {
  const { tier, brand, status, keyword, sort } = req.query;

  // Base items without tier restriction for accurate tab badge counts
  const allFilteredItems = db.getItems({
    brand: brand as string | undefined,
    status: status as ItemStatus | 'AVAILABLE_ONLY' | undefined,
    keyword: keyword as string | undefined,
    sort: sort as any
  });

  const counts = {
    all: allFilteredItems.length,
    entry: allFilteredItems.filter(i => i.categoryTier === 'ENTRY' || i.categoryTier === 'ENTRY_MID').length,
    mid: allFilteredItems.filter(i => i.categoryTier === 'MID').length,
    highEnd: allFilteredItems.filter(i => i.categoryTier === 'HIGH_END').length
  };

  const items = tier ? allFilteredItems.filter(i => i.categoryTier === tier || (tier === 'ENTRY' && i.categoryTier === 'ENTRY_MID')) : allFilteredItems;

  return res.json({
    success: true,
    total: items.length,
    counts,
    data: items
  });
});

// GET /items/:itemId
app.get('/api/v1/items/:itemId', (req: Request, res: Response) => {
  const itemId = parseInt(req.params.itemId as string, 10);
  const item = db.getItemById(itemId, true); // view_count +1

  if (!item) {
    return res.status(404).json({ success: false, message: '존재하지 않는 매물입니다.' });
  }

  return res.json({
    success: true,
    data: item
  });
});

// POST /items (신규 매물 등록)
app.post('/api/v1/items', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
  }

  // 1. 휴대폰 인증 여부 검증 (403 Forbidden)
  if (!user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      code: 'PHONE_NOT_VERIFIED',
      message: '판매 매물 등록을 위해 휴대폰 본인인증이 필수입니다.'
    });
  }

  // 2. 24시간 내 3건 쿼터 검증 (429 Too Many Requests)
  const recentCount = db.getRecentItemsCountBySeller(userId, 24);
  if (recentCount >= 3) {
    return res.status(429).json({
      success: false,
      code: 'QUOTA_EXCEEDED',
      message: '최근 24시간 내 최대 3개의 매물만 등록 가능합니다 (업자 도배 차단 정책).'
    });
  }

  const dto: CreateItemDTO = req.body;

  if (!dto.brand || !dto.modelName || !dto.price || !dto.description) {
    return res.status(400).json({
      success: false,
      message: '브랜드, 모델명, 가격, 상세 설명은 필수 입력 항목입니다.'
    });
  }

  const created = db.createItem(userId, dto);
  return res.status(201).json({
    success: true,
    message: '매물이 성공적으로 등록되었습니다.',
    data: created
  });
});

// PUT /items/:itemId (매물 정보 수정)
app.put('/api/v1/items/:itemId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const itemId = parseInt(req.params.itemId as string, 10);

  try {
    const updated = db.updateItem(itemId, userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: '매물을 찾을 수 없습니다.' });
    }
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
    }
    if (error.message === 'CANNOT_EDIT_SOLD_ITEM') {
      return res.status(400).json({
        success: false,
        code: 'CANNOT_EDIT_SOLD_ITEM',
        message: '거래완료(SOLD)된 매물은 시세 아카이브 보존을 위해 수정할 수 없습니다.'
      });
    }
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// PATCH /items/:itemId/status (거래 상태 변경)
app.patch('/api/v1/items/:itemId/status', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const itemId = parseInt(req.params.itemId as string, 10);
  const { status } = req.body;

  if (!['FOR_SALE', 'RESERVED', 'SOLD'].includes(status)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 거래 상태입니다.' });
  }

  try {
    const updated = db.updateItemStatus(itemId, userId, status as ItemStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: '매물을 찾을 수 없습니다.' });
    }
    return res.json({
      success: true,
      message: `거래 상태가 [${status}] (으)로 변경되었습니다.`,
      data: updated
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '상태 변경 권한이 없습니다.' });
    }
    if (error.message === 'CANNOT_REVERT_SOLD_ITEM') {
      return res.status(400).json({
        success: false,
        code: 'CANNOT_REVERT_SOLD_ITEM',
        message: '거래완료(SOLD) 처리된 매물은 실거래 시세 아카이브 정책에 따라 판매중 또는 예약중으로 되돌릴 수 없습니다.'
      });
    }
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// DELETE /items/:itemId (매물 삭제)
app.delete('/api/v1/items/:itemId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const itemId = parseInt(req.params.itemId as string, 10);

  try {
    const deleted = db.deleteItem(itemId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '매물을 찾을 수 없습니다.' });
    }
    return res.json({ success: true, message: '매물이 정상적으로 삭제되었습니다.' });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
    }
    if (error.message === 'CANNOT_DELETE_SOLD_ITEM') {
      return res.status(400).json({
        success: false,
        code: 'SOLD_ITEM_PERMANENT_ARCHIVE',
        message: '판매 완료(SOLD)된 매물은 시세 아카이브 정책에 따라 삭제할 수 없습니다.'
      });
    }
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// POST /items/:itemId/like (관심 매물 찜하기 토글)
app.post('/api/v1/items/:itemId/like', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const itemId = parseInt(req.params.itemId as string, 10);
  try {
    const result = db.toggleItemLike(userId, itemId);
    return res.json({
      success: true,
      message: result.liked ? '관심 매물(위시리스트)에 추가되었습니다.' : '관심 매물에서 제외되었습니다.',
      data: result
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '관심 매물 처리에 실패했습니다.' });
  }
});

// GET /users/me/likes (내가 찜한 매물 ID 목록 조회)
app.get('/api/v1/users/me/likes', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const likedIds = db.getUserLikedItemIds(userId);
  return res.json({
    success: true,
    data: likedIds
  });
});

// GET /users/me/items (내가 등록한 매물 목록 조회)
app.get('/api/v1/users/me/items', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const status = req.query.status as string | undefined;
  const items = db.getMyItems(userId, status);
  return res.json({
    success: true,
    data: items
  });
});

// POST /reports (허위매물 / 사기 / 비매너 신고 접수)
app.post('/api/v1/reports', (req: Request, res: Response) => {
  const reporterId = getAuthenticatedUserId(req);
  if (!reporterId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const { targetItemId, targetSellerId, reason, details } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, message: '신고 사유를 선택해주세요.' });
  }

  try {
    const report = db.createReport(reporterId, {
      targetItemId: targetItemId ? parseInt(targetItemId, 10) : undefined,
      targetSellerId: targetSellerId ? parseInt(targetSellerId, 10) : undefined,
      reason,
      details
    });

    return res.status(201).json({
      success: true,
      message: '신고가 정상적으로 접수되었습니다. 운영팀 검토 및 페널티가 적용됩니다.',
      data: report
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '신고 접수에 실패했습니다.' });
  }
});

// --- 1:1 Direct Chat API Endpoints ---

// GET /chat/threads (내 직거래 채팅 스레드 목록 조회)
app.get('/api/v1/chat/threads', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const threads = db.getChatThreadsForUser(userId);
  return res.json({
    success: true,
    data: threads
  });
});

// GET /chat/threads/by-item/:itemId (특정 매물에 대한 1:1 채팅방 생성 또는 기존 채팅방 조회)
app.get('/api/v1/chat/threads/by-item/:itemId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const itemId = parseInt(req.params.itemId as string, 10);
  try {
    const threadData = db.getOrCreateChatThread(itemId, userId);
    return res.json({
      success: true,
      data: threadData
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || '채팅방을 열 수 없습니다.' });
  }
});

// GET /chat/threads/:threadId (특정 채팅방 정보 조회)
app.get('/api/v1/chat/threads/:threadId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const threadId = req.params.threadId as string;
  try {
    const threadData = db.getChatThreadById(threadId, userId);
    return res.json({
      success: true,
      data: threadData
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
    }
    return res.status(404).json({ success: false, message: err.message || '대화방을 찾을 수 없습니다.' });
  }
});

// GET /chat/threads/:threadId/messages (채팅 메시지 내역 조회 & 읽음 처리)
app.get('/api/v1/chat/threads/:threadId/messages', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const threadId = req.params.threadId as string;
  try {
    const messages = db.getChatMessages(threadId, userId);
    return res.json({
      success: true,
      data: messages
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '접근 권한이 없는 대화방입니다.' });
    }
    return res.status(404).json({ success: false, message: '대화방을 찾을 수 없습니다.' });
  }
});

// DELETE /chat/threads/:threadId (채팅방 나가기 / 대화방 삭제)
app.delete('/api/v1/chat/threads/:threadId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const threadId = req.params.threadId as string;
  try {
    db.deleteChatThread(threadId, userId);
    return res.json({
      success: true,
      message: '대화방을 나갔습니다.'
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '대화방 삭제 권한이 없습니다.' });
    }
    return res.status(404).json({ success: false, message: err.message || '대화방을 찾을 수 없습니다.' });
  }
});

// POST /chat/threads/:threadId/messages (채팅 메시지 전송 및 사진 첨부)
app.post('/api/v1/chat/threads/:threadId/messages', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
  }

  const threadId = req.params.threadId as string;
  const { text, imageUrl } = req.body;

  if ((!text || !text.trim()) && !imageUrl) {
    return res.status(400).json({ success: false, message: '메시지 내용 또는 이미지를 전송해주세요.' });
  }

  try {
    const createdMsg = db.sendChatMessage(threadId, userId, text, imageUrl);
    return res.status(201).json({
      success: true,
      message: '메시지가 전송되었습니다.',
      data: createdMsg
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '메시지 전송 권한이 없습니다.' });
    }
    return res.status(500).json({ success: false, message: err.message || '메시지 전송에 실패했습니다.' });
  }
});

// POST /media/upload (다중 이미지 파일 업로드)
app.post('/api/v1/media/upload', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: '업로드된 파일이 없습니다.' });
  }

  const urls = files.map(file => `/uploads/${file.filename}`);
  return res.json({
    success: true,
    urls
  });
});

// Serve frontend in production (dist build)
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[TIMELINK REST API Server] Running on http://localhost:${PORT}/api/v1`);
});
