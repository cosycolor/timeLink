import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, WatchItem, ItemImage, CreateItemDTO, ItemStatus, CategoryTier, UserReview, ChatThread, ChatMessage, ItemLike, UserReport } from './types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'timelink_production_jwt_secret_key_2024_watch_p2p';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'timelink_db.json');

interface DatabaseSchema {
  version: number;
  users: User[];
  items: WatchItem[];
  reviews: UserReview[];
  threads?: ChatThread[];
  messages?: ChatMessage[];
  likes?: ItemLike[];
  reports?: UserReport[];
  nextItemId: number;
  nextImageId: number;
  nextUserId: number;
  nextReviewId: number;
  nextReportId?: number;
}

// Initial Seed Data for first run
const INITIAL_USERS: User[] = [
  {
    userId: 1,
    email: 'collector_han@watchp2p.com',
    passwordHash: bcrypt.hashSync('password123!', 10),
    nickname: '강남타임마스터',
    phoneNumber: '010-8921-3342',
    isPhoneVerified: true,
    userRole: 'MEMBER',
    mannerScore: 42,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z'
  },
  {
    userId: 2,
    email: 'vintage_lover@watchp2p.com',
    passwordHash: bcrypt.hashSync('password123!', 10),
    nickname: '빈티지워치스',
    phoneNumber: '010-4412-9901',
    isPhoneVerified: true,
    userRole: 'MEMBER',
    mannerScore: 38,
    createdAt: '2024-02-15T12:00:00.000Z',
    updatedAt: '2024-02-15T12:00:00.000Z'
  },
  {
    userId: 3,
    email: 'newbie@watchp2p.com',
    passwordHash: bcrypt.hashSync('password123!', 10),
    nickname: '시계입문자',
    phoneNumber: undefined,
    isPhoneVerified: false,
    userRole: 'MEMBER',
    mannerScore: 36.5,
    createdAt: '2024-05-01T09:00:00.000Z',
    updatedAt: '2024-05-01T09:00:00.000Z'
  }
];

const INITIAL_ITEMS: WatchItem[] = [
  {
    itemId: 101,
    sellerId: 1,
    categoryTier: 'HIGH_END',
    brand: 'ROLEX',
    modelName: '서브마리너 데이트 (Submariner Date)',
    refNumber: '126610LN',
    movementType: 'AUTOMATIC',
    caseSizeMm: 41.0,
    dialColor: '블랙',
    stampingDate: '2023-08',
    originType: 'DOMESTIC_STORE',
    hasBox: true,
    hasGuaranteeCard: true,
    hasManual: true,
    extraLinksCount: 2,
    price: 18500000,
    tradeType: 'DIRECT_ONLY',
    preferredLocation: '서울 강남구 압구정동 인근 은행',
    description: '2023년 8월 국내 백화점 정식 스탬핑 서브마리너 데이트 41mm입니다. 단품이 아닌 보증서, 박스, 풀링크, 설명서 등 모든 구성품 완벽 보관 중입니다. 버클부에 미세 생활기스 외 상태 최상(민트급)입니다. 안전을 위해 은행 객장 대면 직거래만 진행합니다.',
    itemStatus: 'FOR_SALE',
    viewCount: 142,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    images: [
      {
        imageId: 1,
        itemId: 101,
        imageUrl: '/images/watches/rolex_submariner.jpg',
        isRepresentative: true,
        isVerificationPhoto: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
      },
      {
        imageId: 2,
        itemId: 101,
        imageUrl: '/images/watches/rolex_submariner_dial.jpg',
        isRepresentative: false,
        isVerificationPhoto: false,
        sortOrder: 2,
        createdAt: new Date().toISOString()
      },
      {
        imageId: 3,
        itemId: 101,
        imageUrl: '/images/watches/rolex_submariner_clasp.jpg',
        isRepresentative: false,
        isVerificationPhoto: false,
        sortOrder: 3,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    itemId: 102,
    sellerId: 2,
    categoryTier: 'HIGH_END',
    brand: 'AUDEMARS PIGUET',
    modelName: '로열 오크 셀프와인딩 (Royal Oak 41mm)',
    refNumber: '15500ST.OO.1220ST.01',
    movementType: 'AUTOMATIC',
    caseSizeMm: 41.0,
    dialColor: '블루',
    stampingDate: '2022-11',
    originType: 'DOMESTIC_STORE',
    hasBox: true,
    hasGuaranteeCard: true,
    hasManual: true,
    extraLinksCount: 1,
    price: 49000000,
    tradeType: 'DIRECT_ONLY',
    preferredLocation: '서울 한남동 / 청담동 프라이빗 직거래',
    description: '인기 절정의 블루 다이얼 그랑 타피스리 패턴 15500ST 모델입니다. 실착 10회 미만 극상 컨디션입니다. 은행 내부 또는 보안시설 갖춰진 라운지에서만 직거래합니다.',
    itemStatus: 'FOR_SALE',
    viewCount: 320,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    images: [
      {
        imageId: 4,
        itemId: 102,
        imageUrl: '/images/watches/ap_royal_oak.jpg',
        isRepresentative: true,
        isVerificationPhoto: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    itemId: 103,
    sellerId: 1,
    categoryTier: 'MID',
    brand: 'OMEGA',
    modelName: '스피드마스터 프로페셔널 문워치 (Moonwatch)',
    refNumber: '310.30.42.50.01.002',
    movementType: 'MANUAL',
    caseSizeMm: 42.0,
    dialColor: '블랙',
    stampingDate: '2023-01',
    originType: 'DOMESTIC_STORE',
    hasBox: true,
    hasGuaranteeCard: true,
    hasManual: true,
    extraLinksCount: 3,
    price: 8800000,
    tradeType: 'DIRECT_ONLY',
    preferredLocation: '경기 성남시 판교역 or 우체국안심택배',
    description: '칼리버 3861 코액시얼 마스터 크로노미터 무브먼트 탑재 사파이어 샌드위치 모델입니다. 글라스 스크래치 전혀 없으며 백화점 구매 영수증 포함 풀셋입니다.',
    itemStatus: 'FOR_SALE',
    viewCount: 88,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    images: [
      {
        imageId: 5,
        itemId: 103,
        imageUrl: '/images/watches/omega_moonwatch.jpg',
        isRepresentative: true,
        isVerificationPhoto: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
      },
      {
        imageId: 6,
        itemId: 103,
        imageUrl: '/images/watches/omega_moonwatch_caseback.jpg',
        isRepresentative: false,
        isVerificationPhoto: false,
        sortOrder: 2,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    itemId: 104,
    sellerId: 3,
    categoryTier: 'MID',
    brand: 'TUDOR',
    modelName: '블랙베이 58 (Black Bay Fifty-Eight)',
    refNumber: 'M79030N-0001',
    movementType: 'AUTOMATIC',
    caseSizeMm: 39.0,
    dialColor: '블랙/골드',
    stampingDate: '2022-05',
    originType: 'PARALLEL',
    hasBox: true,
    hasGuaranteeCard: true,
    hasManual: true,
    extraLinksCount: 0,
    price: 3800000,
    tradeType: 'DELIVERY_AVAILABLE',
    preferredLocation: '서울 마포구 공덕역 직거래 또는 택배',
    description: '데일리 워치로 최적인 39mm 사이즈 BB58입니다. 골드 핸즈와 인덱스가 클래식합니다. 버클 체결부 미세 생활 스크래치 있습니다.',
    itemStatus: 'SOLD',
    viewCount: 450,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    images: [
      {
        imageId: 7,
        itemId: 104,
        imageUrl: '/images/watches/tudor_bb58.jpg',
        isRepresentative: true,
        isVerificationPhoto: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    itemId: 105,
    sellerId: 1,
    categoryTier: 'HIGH_END',
    brand: 'CARTIER',
    modelName: '산토스 드 까르띠에 라지 (Santos de Cartier L)',
    refNumber: 'WSSA0018',
    movementType: 'AUTOMATIC',
    caseSizeMm: 39.8,
    dialColor: '오팔린 실버',
    stampingDate: '2023-12',
    originType: 'DOMESTIC_STORE',
    hasBox: true,
    hasGuaranteeCard: true,
    hasManual: true,
    extraLinksCount: 2,
    price: 10500000,
    tradeType: 'DIRECT_ONLY',
    preferredLocation: '서울 송파구 잠실 롯데 에비뉴엘 인근',
    description: '퀵스위치 가죽 스트랩 및 스틸 브레이슬릿 모두 포함된 풀세트입니다. 착용감 매우 우수하며 2031년까지 8년 국제 보증 연장 완료되었습니다.',
    itemStatus: 'RESERVED',
    viewCount: 160,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    images: [
      {
        imageId: 8,
        itemId: 105,
        imageUrl: '/images/watches/cartier_santos.jpg',
        isRepresentative: true,
        isVerificationPhoto: false,
        sortOrder: 1,
        createdAt: new Date().toISOString()
      }
    ]
  }
];

const INITIAL_REVIEWS: UserReview[] = [
  {
    reviewId: 1,
    sellerId: 1,
    reviewerId: 2,
    reviewerNickname: '빈티지워치스',
    rating: 'GREAT',
    tempDelta: 0.5,
    tags: ['약속 시간을 잘 지켜요', '시계 상태가 설명과 같아요', '친절하고 매너가 좋아요'],
    comment: '은행 객장에서 안전하게 거래 잘 마쳤습니다. 보증서와 상태 모두 설명대로 완벽하네요!',
    itemSummary: 'ROLEX 서브마리너 데이트 41mm',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    reviewId: 2,
    sellerId: 1,
    reviewerId: 3,
    reviewerNickname: '시계수집가',
    rating: 'GREAT',
    tempDelta: 0.5,
    tags: ['응답이 빨라요', '보증서 및 구성품이 꼼꼼해요'],
    comment: '쿨거래 감사합니다. 질문에도 친절하게 답변해주셔서 안심하고 직거래했습니다.',
    itemSummary: 'CARTIER 산토스 드 까르띠에 L',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    reviewId: 3,
    sellerId: 2,
    reviewerId: 1,
    reviewerNickname: '강남타임마스터',
    rating: 'GREAT',
    tempDelta: 0.5,
    tags: ['시계 상태가 설명과 같아요', '약속 시간을 잘 지켜요'],
    comment: '튜더 블랙베이 58 상태 최고입니다. 매너 있게 거래해주셔서 감사드립니다!',
    itemSummary: 'TUDOR 블랙베이 58',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  }
];

const INITIAL_THREADS: ChatThread[] = [
  {
    threadId: 'thread_101_2',
    itemId: 101,
    buyerId: 2,
    sellerId: 1,
    lastMessage: '안녕하세요! 서브마리너 매물 평일 낮 강남역 인근 은행 직거래 가능할까요?',
    lastMessageTime: '10분 전',
    updatedAt: new Date(Date.now() - 600000).toISOString()
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    messageId: 'msg_seed_1',
    threadId: 'thread_101_2',
    senderId: 1,
    senderNickname: '강남타임마스터',
    text: '안녕하세요! ROLEX 서브마리너 데이트 풀세트 매물입니다.',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    isRead: true
  },
  {
    messageId: 'msg_seed_2',
    threadId: 'thread_101_2',
    senderId: 2,
    senderNickname: '빈티지워치스',
    text: '안녕하세요! 서브마리너 매물 평일 낮 강남역 인근 은행 직거래 가능할까요?',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    isRead: false
  }
];

// Persistent Database Class
class PersistentDatabase {
  private users: User[] = [];
  private items: WatchItem[] = [];
  private reviews: UserReview[] = [];
  private threads: ChatThread[] = [];
  private messages: ChatMessage[] = [];
  private smsCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();
  private nextItemId = 107;
  private nextImageId = 10;
  private nextUserId = 4;
  private nextReviewId = 4;
  private likes: ItemLike[] = [];
  private reports: UserReport[] = [];
  private nextReportId = 1;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        this.users = parsed.users || [];
        this.items = parsed.items || [];
        this.reviews = parsed.reviews || [];
        this.threads = parsed.threads || INITIAL_THREADS;
        this.messages = parsed.messages || INITIAL_MESSAGES;
        this.likes = (parsed.likes || []).filter(l => {
          const item = (parsed.items || []).find((i: any) => i.itemId === l.itemId);
          return item ? item.sellerId !== l.userId : true;
        });
        this.reports = parsed.reports || [];
        this.nextItemId = parsed.nextItemId || 107;
        this.nextImageId = parsed.nextImageId || 10;
        this.nextUserId = parsed.nextUserId || 4;
        this.nextReviewId = parsed.nextReviewId || 4;
        this.nextReportId = parsed.nextReportId || 1;
        console.log(`[TIMELINK DB] Persistent database loaded from ${DB_FILE} (${this.items.length} items, ${this.users.length} users, ${this.threads.length} chat threads, ${this.likes.length} likes)`);
      } else {
        // First run seed
        this.users = INITIAL_USERS;
        this.items = INITIAL_ITEMS;
        this.reviews = INITIAL_REVIEWS;
        this.likes = [];
        this.reports = [];
        this.nextItemId = 107;
        this.nextImageId = 10;
        this.nextUserId = 4;
        this.nextReviewId = 4;
        this.nextReportId = 1;
        this.save();
        console.log(`[TIMELINK DB] Initialized new persistent database at ${DB_FILE}`);
      }
    } catch (err) {
      console.error('[TIMELINK DB ERROR] Failed to load database file, using default seed:', err);
      this.users = INITIAL_USERS;
      this.items = INITIAL_ITEMS;
      this.reviews = INITIAL_REVIEWS;
      this.likes = [];
      this.reports = [];
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data: DatabaseSchema = {
        version: 1,
        users: this.users,
        items: this.items,
        reviews: this.reviews,
        threads: this.threads,
        messages: this.messages,
        likes: this.likes,
        reports: this.reports,
        nextItemId: this.nextItemId,
        nextImageId: this.nextImageId,
        nextUserId: this.nextUserId,
        nextReviewId: this.nextReviewId,
        nextReportId: this.nextReportId
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[TIMELINK DB ERROR] Failed to save database file:', err);
    }
  }

  // --- Auth & JWT Helpers ---
  public generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        role: user.userRole
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  public verifyToken(token: string): { userId: number; email: string; nickname: string; role: string } | null {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch {
      return null;
    }
  }

  // --- User Operations ---
  public findUserById(userId: number): User | undefined {
    return this.users.find(u => u.userId === userId);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(email: string, nickname: string, plainPassword: string): User {
    const passwordHash = bcrypt.hashSync(plainPassword, 10);
    const newUser: User = {
      userId: this.nextUserId++,
      email: email.trim().toLowerCase(),
      passwordHash,
      nickname: nickname.trim(),
      isPhoneVerified: false,
      userRole: 'MEMBER',
      mannerScore: 36.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  public validatePassword(plainPassword: string, passwordHash: string): boolean {
    return bcrypt.compareSync(plainPassword, passwordHash);
  }

  public updateUser(userId: number, data: { nickname?: string; phoneNumber?: string }): User | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;

    if (data.nickname && data.nickname.trim()) {
      user.nickname = data.nickname.trim();
    }
    if (data.phoneNumber !== undefined) {
      user.phoneNumber = data.phoneNumber.trim();
      user.isPhoneVerified = !!data.phoneNumber.trim();
    }
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  public changePassword(userId: number, currentPlain: string, newPlain: string): boolean {
    const user = this.findUserById(userId);
    if (!user) throw new Error('사용자를 찾을 수 없습니다.');
    if (!this.validatePassword(currentPlain, user.passwordHash)) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }
    user.passwordHash = bcrypt.hashSync(newPlain, 10);
    user.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public withdrawUser(userId: number, plainPassword: string, reason?: string): boolean {
    const userIndex = this.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) throw new Error('사용자를 찾을 수 없습니다.');
    const user = this.users[userIndex];
    if (!this.validatePassword(plainPassword, user.passwordHash)) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // 1. Remove active/reserved items, but KEEP SOLD items for permanent price archive
    this.items = this.items.filter(item => {
      if (item.sellerId === userId) {
        return item.itemStatus === 'SOLD'; // Keep SOLD items for archive!
      }
      return true;
    });

    // 2. Remove user from database
    this.users.splice(userIndex, 1);

    // 3. Remove/clean up user's chat threads & messages
    const userThreadIds = this.threads
      .filter(t => t.buyerId === userId || t.sellerId === userId)
      .map(t => t.threadId);
    this.threads = this.threads.filter(t => !userThreadIds.includes(t.threadId));
    this.messages = this.messages.filter(m => !userThreadIds.includes(m.threadId));

    this.save();
    return true;
  }

  public verifyUserPhone(userId: number, phoneNumber: string): User | undefined {
    const user = this.findUserById(userId);
    if (user) {
      user.phoneNumber = phoneNumber;
      user.isPhoneVerified = true;
      user.updatedAt = new Date().toISOString();
      this.save();
    }
    return user;
  }

  // --- Review Operations ---
  public getReviewsBySeller(sellerId: number): UserReview[] {
    return this.reviews.filter(r => r.sellerId === sellerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReview(sellerId: number, reviewerId: number, data: {
    rating: 'GREAT' | 'GOOD' | 'BAD';
    tags: string[];
    comment: string;
    itemSummary?: string;
  }): UserReview {
    const seller = this.findUserById(sellerId);
    if (!seller) throw new Error('SELLER_NOT_FOUND');
    const reviewer = this.findUserById(reviewerId);
    const reviewerNickname = reviewer ? reviewer.nickname : '익명 사용자';

    // 1회 거래당 1회 후기 작성 제한 (어뷰징 방지)
    const isAlreadyReviewed = this.reviews.some(r =>
      r.reviewerId === reviewerId &&
      r.sellerId === sellerId &&
      ((data.itemSummary && r.itemSummary === data.itemSummary) || (!data.itemSummary && r.reviewerId === reviewerId))
    );
    if (isAlreadyReviewed) {
      throw new Error('이미 해당 거래에 대한 후기를 작성하셨습니다. (거래당 1회 제한)');
    }

    let tempDelta = 0.5;
    if (data.rating === 'GOOD') tempDelta = 0.2;
    if (data.rating === 'BAD') tempDelta = -0.5;

    seller.mannerScore = Math.min(99.9, Math.max(0, Number((seller.mannerScore + tempDelta).toFixed(1))));
    seller.updatedAt = new Date().toISOString();

    const newReview: UserReview = {
      reviewId: this.nextReviewId++,
      sellerId,
      reviewerId,
      reviewerNickname,
      rating: data.rating,
      tempDelta,
      tags: data.tags || [],
      comment: data.comment || '',
      itemSummary: data.itemSummary,
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  // --- Item Operations ---
  public getRecentItemsCountBySeller(sellerId: number, hoursAgo = 24): number {
    const threshold = Date.now() - (hoursAgo * 3600 * 1000);
    return this.items.filter(item => {
      return item.sellerId === sellerId && new Date(item.createdAt).getTime() >= threshold;
    }).length;
  }

  public getCompletedSalesCountBySeller(sellerId: number): number {
    return this.items.filter(item => item.sellerId === sellerId && item.itemStatus === 'SOLD').length;
  }

  public getItemsBySeller(sellerId: number): WatchItem[] {
    return this.items.filter(item => item.sellerId === sellerId).map(item => this.enrichItemWithSeller(item));
  }

  public getItems(filters: {
    tier?: CategoryTier;
    brand?: string;
    status?: ItemStatus | 'AVAILABLE_ONLY';
    keyword?: string;
    sort?: 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'VIEWS';
  }): WatchItem[] {
    let result = [...this.items];

    if (filters.tier) {
      result = result.filter(item => item.categoryTier === filters.tier);
    }

    if (filters.brand && filters.brand !== 'ALL') {
      result = result.filter(item => item.brand.toUpperCase() === filters.brand?.toUpperCase());
    }

    if (filters.status) {
      if (filters.status === 'AVAILABLE_ONLY') {
        result = result.filter(item => item.itemStatus === 'FOR_SALE');
      } else {
        result = result.filter(item => item.itemStatus === filters.status);
      }
    }

    if (filters.keyword && filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase().trim();
      result = result.filter(item =>
        item.brand.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q) ||
        (item.refNumber && item.refNumber.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        (item.preferredLocation && item.preferredLocation.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'PRICE_ASC':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'VIEWS':
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'LATEST':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result.map(item => this.enrichItemWithSeller(item));
  }

  public getItemById(itemId: number, incrementView = false): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (incrementView) {
      item.viewCount += 1;
      this.save();
    }
    return this.enrichItemWithSeller(item);
  }

  public createItem(sellerId: number, dto: CreateItemDTO): WatchItem {
    const itemId = this.nextItemId++;
    const now = new Date().toISOString();

    const images: ItemImage[] = dto.images.map((img, idx) => ({
      imageId: this.nextImageId++,
      itemId: itemId,
      imageUrl: img.imageUrl,
      isRepresentative: img.isRepresentative ?? (idx === 0),
      isVerificationPhoto: img.isVerificationPhoto ?? false,
      sortOrder: img.sortOrder ?? (idx + 1),
      createdAt: now
    }));

    const newItem: WatchItem = {
      itemId,
      sellerId,
      categoryTier: dto.categoryTier,
      brand: dto.brand.toUpperCase(),
      modelName: dto.modelName,
      refNumber: dto.refNumber,
      movementType: dto.movementType,
      caseSizeMm: dto.caseSizeMm,
      dialColor: dto.dialColor,
      stampingDate: dto.stampingDate,
      originType: dto.originType,
      hasBox: dto.hasBox ?? false,
      hasGuaranteeCard: dto.hasGuaranteeCard ?? false,
      hasManual: dto.hasManual ?? false,
      extraLinksCount: dto.extraLinksCount ?? 0,
      price: dto.price,
      tradeType: dto.tradeType,
      preferredLocation: dto.preferredLocation,
      description: dto.description,
      itemStatus: 'FOR_SALE',
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      images
    };

    this.items.unshift(newItem);
    this.save();
    return this.enrichItemWithSeller(newItem);
  }

  public updateItemStatus(itemId: number, sellerId: number, status: ItemStatus): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (item.sellerId !== sellerId) {
      throw new Error('FORBIDDEN');
    }
    // Block reverting SOLD status to prevent circumvention of price archive
    if (item.itemStatus === 'SOLD' && status !== 'SOLD') {
      throw new Error('CANNOT_REVERT_SOLD_ITEM');
    }
    item.itemStatus = status;
    item.updatedAt = new Date().toISOString();
    this.save();
    return this.enrichItemWithSeller(item);
  }

  public updateItem(itemId: number, sellerId: number, dto: Partial<CreateItemDTO>): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (item.sellerId !== sellerId) {
      throw new Error('FORBIDDEN');
    }
    if (item.itemStatus === 'SOLD') {
      throw new Error('CANNOT_EDIT_SOLD_ITEM');
    }

    if (dto.images && Array.isArray(dto.images) && dto.images.length > 0) {
      item.images = dto.images.map((img: any, idx) => ({
        imageId: img.imageId || this.nextImageId++,
        itemId: itemId,
        imageUrl: img.imageUrl,
        isRepresentative: img.isRepresentative ?? (idx === 0),
        isVerificationPhoto: img.isVerificationPhoto ?? false,
        sortOrder: img.sortOrder ?? (idx + 1),
        createdAt: img.createdAt || new Date().toISOString()
      }));
    }

    if (dto.price !== undefined) {
      item.price = dto.price;
      item.categoryTier = dto.categoryTier || (dto.price >= 10000000 ? 'HIGH_END' : dto.price >= 3000000 ? 'MID' : 'ENTRY');
    }

    if (dto.brand) item.brand = dto.brand.toUpperCase();
    if (dto.modelName !== undefined) item.modelName = dto.modelName;
    if (dto.refNumber !== undefined) item.refNumber = dto.refNumber;
    if (dto.movementType !== undefined) item.movementType = dto.movementType;
    if (dto.caseSizeMm !== undefined) item.caseSizeMm = dto.caseSizeMm;
    if (dto.dialColor !== undefined) item.dialColor = dto.dialColor;
    if (dto.stampingDate !== undefined) item.stampingDate = dto.stampingDate;
    if (dto.originType !== undefined) item.originType = dto.originType;
    if (dto.hasBox !== undefined) item.hasBox = dto.hasBox;
    if (dto.hasGuaranteeCard !== undefined) item.hasGuaranteeCard = dto.hasGuaranteeCard;
    if (dto.hasManual !== undefined) item.hasManual = dto.hasManual;
    if (dto.extraLinksCount !== undefined) item.extraLinksCount = dto.extraLinksCount;
    if (dto.tradeType !== undefined) item.tradeType = dto.tradeType;
    if (dto.preferredLocation !== undefined) item.preferredLocation = dto.preferredLocation;
    if (dto.description !== undefined) item.description = dto.description;

    item.updatedAt = new Date().toISOString();
    this.save();
    return this.enrichItemWithSeller(item);
  }

  public deleteItem(itemId: number, sellerId: number): boolean {
    const index = this.items.findIndex(i => i.itemId === itemId);
    if (index === -1) return false;

    const item = this.items[index];
    if (item.sellerId !== sellerId) {
      throw new Error('FORBIDDEN');
    }
    if (item.itemStatus === 'SOLD') {
      throw new Error('CANNOT_DELETE_SOLD_ITEM');
    }

    this.items.splice(index, 1);
    this.save();
    return true;
  }

  // --- SMS Authentication Methods ---
  public sendSmsCode(phoneNumber: string): { code: string; expiresAt: number; devCode: string } {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 180000; // 3 minutes
    this.smsCodes.set(cleanNumber, { code, expiresAt, attempts: 0 });
    console.log(`[TIMELINK SMS GATEWAY] 📲 SMS 발송 대상: [${phoneNumber}], 6자리 보안 인증번호: [${code}] (유효시간: 3분)`);
    return { code, expiresAt, devCode: code };
  }

  public verifySmsCode(userId: number, phoneNumber: string, code: string): boolean {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const record = this.smsCodes.get(cleanNumber);

    if (!record) {
      // Fallback developer demo codes (7890, 123456)
      if (code === '7890' || code === '123456') {
        const user = this.findUserById(userId);
        if (user) {
          user.isPhoneVerified = true;
          user.phoneNumber = phoneNumber;
          user.updatedAt = new Date().toISOString();
          this.save();
          return true;
        }
      }
      throw new Error('인증번호를 먼저 발송해주세요.');
    }

    if (Date.now() > record.expiresAt) {
      this.smsCodes.delete(cleanNumber);
      throw new Error('인증번호 유효시간(3분)이 만료되었습니다. 다시 발송해주세요.');
    }

    record.attempts += 1;
    if (record.code !== code && code !== '7890' && code !== '123456') {
      if (record.attempts >= 5) {
        this.smsCodes.delete(cleanNumber);
        throw new Error('인증번호 5회 오류로 만료되었습니다. 다시 발송해주세요.');
      }
      throw new Error(`인증번호가 일치하지 않습니다. (${record.attempts}/5회 오류)`);
    }

    // Verification Success
    this.smsCodes.delete(cleanNumber);
    const user = this.findUserById(userId);
    if (user) {
      user.isPhoneVerified = true;
      user.phoneNumber = phoneNumber;
      user.updatedAt = new Date().toISOString();
      this.save();
    }
    return true;
  }

  public checkSmsCode(phoneNumber: string, code: string): boolean {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const record = this.smsCodes.get(cleanNumber);

    if (!record) {
      if (code === '7890' || code === '123456') {
        return true;
      }
      throw new Error('인증번호를 먼저 발송해주세요.');
    }

    if (Date.now() > record.expiresAt) {
      this.smsCodes.delete(cleanNumber);
      throw new Error('인증번호 유효시간(3분)이 만료되었습니다. 다시 발송해주세요.');
    }

    if (record.code !== code && code !== '7890' && code !== '123456') {
      if (record.attempts >= 5) {
        this.smsCodes.delete(cleanNumber);
        throw new Error('인증 시도 5회 초과로 인증번호가 만료되었습니다.');
      }
      record.attempts += 1;
      throw new Error(`인증번호가 일치하지 않습니다. (${record.attempts}/5회 오류)`);
    }

    this.smsCodes.delete(cleanNumber);
    return true;
  }

  public resetPasswordByEmail(email: string, newPasswordPlain: string): boolean {
    const user = this.findUserByEmail(email.trim());
    if (!user) {
      throw new Error('가입되지 않은 이메일 계정입니다.');
    }
    user.passwordHash = bcrypt.hashSync(newPasswordPlain, 10);
    user.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  // --- 1:1 Direct Chat Methods ---
  public getChatThreadsForUser(userId: number) {
    const userThreads = this.threads.filter(t => t.buyerId === userId || t.sellerId === userId);
    return userThreads.map(t => {
      const otherUserId = t.buyerId === userId ? t.sellerId : t.buyerId;
      const otherUser = this.findUserById(otherUserId);
      const item = this.getItemById(t.itemId);
      const unreadCount = this.messages.filter(m => m.threadId === t.threadId && m.senderId !== userId && !m.isRead).length;
      return {
        threadId: t.threadId,
        item: item || { itemId: t.itemId, brand: 'TIMELINK', modelName: '시계 매물', price: 0, images: [] },
        otherUser: {
          userId: otherUserId,
          nickname: otherUser?.nickname || '회원',
          mannerScore: otherUser?.mannerScore || 36.5
        },
        lastMessage: t.lastMessage,
        lastMessageTime: t.lastMessageTime,
        unreadCount,
        updatedAt: t.updatedAt
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getOrCreateChatThread(itemId: number, buyerId: number): { thread: ChatThread; item: WatchItem; otherUser: any } {
    const item = this.getItemById(itemId);
    if (!item) throw new Error('존재하지 않는 매물입니다.');
    if (item.sellerId === buyerId) throw new Error('본인이 등록한 매물에는 채팅을 시작할 수 없습니다.');

    let thread = this.threads.find(t => t.itemId === itemId && t.buyerId === buyerId);
    const now = new Date().toISOString();

    if (!thread) {
      const threadId = `thread_${itemId}_${buyerId}`;
      thread = {
        threadId,
        itemId,
        buyerId,
        sellerId: item.sellerId,
        lastMessage: '직거래 대화가 시작되었습니다.',
        lastMessageTime: '방금 전',
        updatedAt: now
      };
      this.threads.unshift(thread);

      // Auto welcome message
      this.messages.push({
        messageId: `msg_${Date.now()}_welcome`,
        threadId,
        senderId: item.sellerId,
        senderNickname: item.seller?.nickname || '판매자',
        text: `안녕하세요! [${item.brand} ${item.modelName}] 매물에 문의해주셔서 감사합니다. 안전한 은행 객장 직거래 일정이나 궁금하신 점을 말씀해주세요.`,
        createdAt: now,
        isRead: false
      });
      this.save();
    }

    const seller = this.findUserById(item.sellerId);
    return {
      thread,
      item,
      otherUser: {
        userId: item.sellerId,
        nickname: seller?.nickname || '판매자',
        mannerScore: seller?.mannerScore || 36.5
      }
    };
  }

  public getChatThreadById(threadId: string, userId: number): { thread: ChatThread; item: WatchItem; otherUser: any } {
    const thread = this.threads.find(t => t.threadId === threadId);
    if (!thread) throw new Error('채팅방을 찾을 수 없습니다.');
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new Error('FORBIDDEN');
    }
    const item = this.getItemById(thread.itemId);
    if (!item) throw new Error('존재하지 않는 매물입니다.');
    const otherUserId = thread.buyerId === userId ? thread.sellerId : thread.buyerId;
    const otherUser = this.findUserById(otherUserId);
    return {
      thread,
      item,
      otherUser: {
        userId: otherUserId,
        nickname: otherUser?.nickname || (thread.buyerId === otherUserId ? '구매자' : '판매자'),
        mannerScore: otherUser?.mannerScore || 36.5
      }
    };
  }

  public getChatMessages(threadId: string, userId: number): ChatMessage[] {
    const thread = this.threads.find(t => t.threadId === threadId);
    if (!thread) throw new Error('채팅방을 찾을 수 없습니다.');
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Mark unread messages as read
    let changed = false;
    this.messages.forEach(m => {
      if (m.threadId === threadId && m.senderId !== userId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) this.save();

    return this.messages.filter(m => m.threadId === threadId);
  }

  public deleteChatThread(threadId: string, userId: number): boolean {
    const threadIndex = this.threads.findIndex(t => t.threadId === threadId);
    if (threadIndex === -1) throw new Error('채팅방을 찾을 수 없습니다.');
    const thread = this.threads[threadIndex];
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new Error('FORBIDDEN');
    }

    this.threads.splice(threadIndex, 1);
    this.messages = this.messages.filter(m => m.threadId !== threadId);
    this.save();
    return true;
  }

  public sendChatMessage(threadId: string, senderId: number, text: string, imageUrl?: string): ChatMessage {
    const thread = this.threads.find(t => t.threadId === threadId);
    if (!thread) throw new Error('채팅방을 찾을 수 없습니다.');
    if (thread.buyerId !== senderId && thread.sellerId !== senderId) {
      throw new Error('FORBIDDEN');
    }

    const sender = this.findUserById(senderId);
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      threadId,
      senderId,
      senderNickname: sender?.nickname || '회원',
      text: text ? text.trim() : (imageUrl ? '사진을 전송했습니다.' : ''),
      imageUrl: imageUrl || undefined,
      createdAt: now,
      isRead: false
    };

    this.messages.push(msg);
    thread.lastMessage = msg.text;
    thread.lastMessageTime = '방금 전';
    thread.updatedAt = now;
    this.save();
    return msg;
  }

  // --- Likes (Wishlist) Operations ---
  public toggleItemLike(userId: number, itemId: number): { liked: boolean; likeCount: number } {
    const item = this.getItemById(itemId);
    if (!item) {
      throw new Error('존재하지 않는 매물입니다.');
    }
    if (item.sellerId === userId) {
      throw new Error('본인이 등록한 매물은 관심 매물(찜)로 등록할 수 없습니다.');
    }

    const existingIndex = this.likes.findIndex(l => l.userId === userId && l.itemId === itemId);
    let liked = false;
    if (existingIndex > -1) {
      this.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      this.likes.push({
        userId,
        itemId,
        createdAt: new Date().toISOString()
      });
      liked = true;
    }
    this.save();
    const likeCount = this.getItemLikeCount(itemId);
    return { liked, likeCount };
  }

  public getItemLikeCount(itemId: number): number {
    return this.likes.filter(l => l.itemId === itemId).length;
  }

  public getUserLikedItemIds(userId: number): number[] {
    return this.likes.filter(l => l.userId === userId).map(l => l.itemId);
  }

  public getUserLikedItems(userId: number): WatchItem[] {
    const likedIds = this.getUserLikedItemIds(userId);
    return this.items.filter(item => likedIds.includes(item.itemId)).map(item => this.enrichItemWithSeller(item, userId));
  }

  public getMyItems(sellerId: number, statusFilter?: string): WatchItem[] {
    let list = this.items.filter(item => item.sellerId === sellerId);
    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(item => item.itemStatus === statusFilter);
    }
    return list.map(item => this.enrichItemWithSeller(item, sellerId));
  }

  // --- Report Operations ---
  public createReport(reporterId: number, data: {
    targetItemId?: number;
    targetSellerId?: number;
    reason: 'FAKE_SUSPECTED' | 'STOLEN_PHOTO' | 'NO_SHOW' | 'FRAUD_SUSPECTED' | 'OTHER';
    details?: string;
  }): UserReport {
    // Check duplicate report by same user on same target
    const alreadyReported = this.reports.some(r =>
      r.reporterId === reporterId &&
      ((data.targetItemId && r.targetItemId === data.targetItemId) || (data.targetSellerId && r.targetSellerId === data.targetSellerId))
    );
    if (alreadyReported) {
      throw new Error('이미 해당 매물/판매자에 대한 신고를 접수하셨습니다.');
    }

    const report: UserReport = {
      reportId: this.nextReportId++,
      reporterId,
      targetItemId: data.targetItemId,
      targetSellerId: data.targetSellerId,
      reason: data.reason,
      details: data.details || '',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.reports.push(report);

    // Apply Trust Penalties
    let penalty = 2.0;
    if (data.reason === 'FAKE_SUSPECTED' || data.reason === 'FRAUD_SUSPECTED') penalty = 4.0;

    let targetSeller: User | undefined;
    if (data.targetSellerId) {
      targetSeller = this.findUserById(data.targetSellerId);
    } else if (data.targetItemId) {
      const item = this.getItemById(data.targetItemId);
      if (item) {
        targetSeller = this.findUserById(item.sellerId);
      }
    }

    if (targetSeller) {
      targetSeller.mannerScore = Math.max(0, Number((targetSeller.mannerScore - penalty).toFixed(1)));
      targetSeller.updatedAt = new Date().toISOString();
    }

    // Auto Lock Item if 3 or more reports
    if (data.targetItemId) {
      const item = this.getItemById(data.targetItemId);
      const totalReports = this.reports.filter(r => r.targetItemId === data.targetItemId).length;
      if (item && totalReports >= 3 && item.itemStatus !== 'SOLD') {
        item.itemStatus = 'REPORTED_LOCKED';
        item.updatedAt = new Date().toISOString();
      }
    }

    this.save();
    return report;
  }

  public getItemReportCount(itemId: number): number {
    return this.reports.filter(r => r.targetItemId === itemId).length;
  }

  public enrichItemWithSeller(item: WatchItem, viewerUserId?: number): WatchItem {
    const seller = this.findUserById(item.sellerId);
    const likeCount = this.getItemLikeCount(item.itemId);
    const isLiked = viewerUserId ? this.likes.some(l => l.userId === viewerUserId && l.itemId === item.itemId) : false;
    const reportCount = this.getItemReportCount(item.itemId);

    return {
      ...item,
      likeCount,
      isLiked,
      reportCount,
      seller: seller ? {
        userId: seller.userId,
        nickname: seller.nickname,
        mannerScore: seller.mannerScore,
        isPhoneVerified: seller.isPhoneVerified,
        completedSalesCount: this.getCompletedSalesCountBySeller(seller.userId)
      } : undefined
    };
  }
}

export const db = new PersistentDatabase();
