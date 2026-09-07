import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db.ts';
import { CategoryTier, CreateItemDTO, ItemStatus } from './types.ts';

const app = express();
const PORT = process.env.PORT || 4000;

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

// Helper for Mock Auth header (Format: Bearer <userId>)
function getAuthenticatedUserId(req: Request): number {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const parsed = parseInt(token, 10);
    if (!isNaN(parsed) && db.findUserById(parsed)) {
      return parsed;
    }
  }
  // Default to User 1 (강남타임마스터) for demo convenience if no header or guest
  return 1;
}

// -------------------------------------------------------------
// 3.1 REST API ENDPOINTS (Prefix: /api/v1)
// -------------------------------------------------------------

// POST /auth/signup
app.post('/api/v1/auth/signup', (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname) {
    return res.status(400).json({ success: false, message: '이메일, 비밀번호, 닉네임은 필수입니다.' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
  }

  const user = db.createUser(email, nickname, `hash_${password}`);
  return res.status(201).json({
    success: true,
    data: {
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        isPhoneVerified: user.isPhoneVerified,
        mannerScore: user.mannerScore
      },
      token: `${user.userId}`
    }
  });
});

// POST /auth/login
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });
  }

  return res.json({
    success: true,
    data: {
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        isPhoneVerified: user.isPhoneVerified,
        mannerScore: user.mannerScore,
        phoneNumber: user.phoneNumber
      },
      token: `${user.userId}`
    }
  });
});

// POST /auth/verify-phone
app.post('/api/v1/auth/verify-phone', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const { phoneNumber } = req.body;

  if (!phoneNumber || phoneNumber.length < 10) {
    return res.status(400).json({ success: false, message: '유효한 휴대폰 번호를 입력해주세요.' });
  }

  const updatedUser = db.verifyUserPhone(userId, phoneNumber);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  return res.json({
    success: true,
    message: '휴대폰 본인인증이 완료되었습니다. 매물 등록 권한이 활성화되었습니다.',
    data: {
      userId: updatedUser.userId,
      isPhoneVerified: updatedUser.isPhoneVerified,
      phoneNumber: updatedUser.phoneNumber
    }
  });
});

// GET /users/me
app.get('/api/v1/users/me', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
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
      items: sellerItems
    }
  });
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
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// PATCH /items/:itemId/status (거래 상태 변경)
app.patch('/api/v1/items/:itemId/status', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
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
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// DELETE /items/:itemId (매물 삭제)
app.delete('/api/v1/items/:itemId', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
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

app.listen(PORT, () => {
  console.log(`[TIMELINK REST API Server] Running on http://localhost:${PORT}/api/v1`);
});
