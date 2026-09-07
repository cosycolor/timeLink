import { User, WatchItem, ItemImage, CreateItemDTO, ItemStatus, CategoryTier } from './types.ts';

// In-Memory Database with realistic seed data
class Database {
  private users: User[] = [
    {
      userId: 1,
      email: 'collector_han@watchp2p.com',
      passwordHash: 'hash_secret_123',
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
      passwordHash: 'hash_secret_456',
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
      passwordHash: 'hash_secret_789',
      nickname: '시계입문자',
      phoneNumber: undefined,
      isPhoneVerified: false,
      userRole: 'MEMBER',
      mannerScore: 36,
      createdAt: '2024-05-01T09:00:00.000Z',
      updatedAt: '2024-05-01T09:00:00.000Z'
    }
  ];

  private items: WatchItem[] = [
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
      price: 17200000,
      tradeType: 'DIRECT_ONLY',
      preferredLocation: '서울 강남구 압구정동 인근 은행',
      description: '2023년 8월 국내 백화점 성골 풀세트입니다. 미세 실기스 외 상태 최상이며, 타임그래퍼 일오차 +1초 수준입니다. 안전을 위해 평일 낮 은행 객장 내 대면 직거래만 진행합니다.',
      itemStatus: 'FOR_SALE',
      viewCount: 184,
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
      sellerId: 1,
      categoryTier: 'HIGH_END',
      brand: 'AUDEMARS PIGUET',
      modelName: '로열 오크 셀프와인딩 (Royal Oak 41mm)',
      refNumber: '15500ST.OO.1220ST.01',
      movementType: 'AUTOMATIC',
      caseSizeMm: 41.0,
      dialColor: '블루 (그랑 타피스리)',
      stampingDate: '2022-11',
      originType: 'DOMESTIC_STORE',
      hasBox: true,
      hasGuaranteeCard: true,
      hasManual: true,
      extraLinksCount: 3,
      price: 45000000,
      tradeType: 'DIRECT_ONLY',
      preferredLocation: '서울 한남동 / 청담동 프라이빗 직거래',
      description: 'AP 하우스 청담 정식 출고 제품입니다. 착용 횟수 10회 미만이며 보관용 와인더에 보관해왔습니다. 보증서, 그린박스, 풀링크 완벽 보존 중입니다.',
      itemStatus: 'FOR_SALE',
      viewCount: 312,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
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
      sellerId: 2,
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
      extraLinksCount: 1,
      price: 8400000,
      tradeType: 'DELIVERY_AVAILABLE',
      preferredLocation: '경기 성남시 판교역 or 우체국 안심택배',
      description: '사파이어 샌드위치 신형 3861 코액시얼 마스터 크로노미터 모델입니다. 수동 크로노그래프 감성이 최고입니다. 여분코 풀셋이고 안전하게 우체국 안심보험 택배 또는 판교 인근 직거래 모두 가능합니다.',
      itemStatus: 'FOR_SALE',
      viewCount: 220,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      images: [
        {
          imageId: 6,
          itemId: 103,
          imageUrl: '/images/watches/omega_moonwatch.jpg',
          isRepresentative: true,
          isVerificationPhoto: false,
          sortOrder: 1,
          createdAt: new Date().toISOString()
        },
        {
          imageId: 7,
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
      sellerId: 2,
      categoryTier: 'MID',
      brand: 'TUDOR',
      modelName: '블랙베이 58 (Black Bay 58)',
      refNumber: 'M79030N-0001',
      movementType: 'AUTOMATIC',
      caseSizeMm: 39.0,
      dialColor: '블랙/길트',
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
          imageId: 8,
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
          imageId: 9,
          itemId: 105,
          imageUrl: '/images/watches/cartier_santos.jpg',
          isRepresentative: true,
          isVerificationPhoto: false,
          sortOrder: 1,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      itemId: 106,
      sellerId: 2,
      categoryTier: 'ENTRY',
      brand: 'LONGINES',
      modelName: '마스터 컬렉션 문페이즈 (Master Collection)',
      refNumber: 'L2.673.4.78.3',
      movementType: 'AUTOMATIC',
      caseSizeMm: 40.0,
      dialColor: '실버 보리알',
      stampingDate: '2021-09',
      originType: 'OVERSEAS',
      hasBox: true,
      hasGuaranteeCard: true,
      hasManual: false,
      extraLinksCount: 0,
      price: 2600000,
      tradeType: 'DELIVERY_AVAILABLE',
      preferredLocation: '서울 용산역 직거래 / 택배 가능',
      description: '트리플 캘린더 크로노그래프 문페이즈입니다. 블루 핸즈와 보리알 패턴 다이얼이 클래식 드레스워치의 정석입니다.',
      itemStatus: 'FOR_SALE',
      viewCount: 95,
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      images: [
        {
          imageId: 10,
          itemId: 106,
          imageUrl: '/images/watches/longines_master.jpg',
          isRepresentative: true,
          isVerificationPhoto: false,
          sortOrder: 1,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  private nextItemId = 107;
  private nextImageId = 11;
  private nextUserId = 4;

  public findUserById(userId: number): User | undefined {
    return this.users.find(u => u.userId === userId);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(email: string, nickname: string, passwordHash: string): User {
    const newUser: User = {
      userId: this.nextUserId++,
      email,
      passwordHash,
      nickname,
      isPhoneVerified: false,
      userRole: 'MEMBER',
      mannerScore: 36,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
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
    return user;
  }

  public getItemsBySeller(sellerId: number): WatchItem[] {
    return this.items.filter(item => item.sellerId === sellerId).map(item => this.enrichItemWithSeller(item));
  }

  public verifyUserPhone(userId: number, phoneNumber: string): User | undefined {
    const user = this.findUserById(userId);
    if (user) {
      user.phoneNumber = phoneNumber;
      user.isPhoneVerified = true;
      user.updatedAt = new Date().toISOString();
    }
    return user;
  }

  public getRecentItemsCountBySeller(sellerId: number, hoursAgo = 24): number {
    const threshold = Date.now() - (hoursAgo * 3600 * 1000);
    return this.items.filter(item => {
      return item.sellerId === sellerId && new Date(item.createdAt).getTime() >= threshold;
    }).length;
  }

  public getCompletedSalesCountBySeller(sellerId: number): number {
    return this.items.filter(item => item.sellerId === sellerId && item.itemStatus === 'SOLD').length;
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

    // Attach seller summary
    return result.map(item => this.enrichItemWithSeller(item));
  }

  public getItemById(itemId: number, incrementView = false): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (incrementView) {
      item.viewCount += 1;
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
    return this.enrichItemWithSeller(newItem);
  }

  public updateItemStatus(itemId: number, sellerId: number, status: ItemStatus): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (item.sellerId !== sellerId) {
      throw new Error('FORBIDDEN');
    }
    item.itemStatus = status;
    item.updatedAt = new Date().toISOString();
    return this.enrichItemWithSeller(item);
  }

  public updateItem(itemId: number, sellerId: number, dto: Partial<CreateItemDTO>): WatchItem | undefined {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return undefined;
    if (item.sellerId !== sellerId) {
      throw new Error('FORBIDDEN');
    }

    Object.assign(item, {
      ...dto,
      brand: dto.brand ? dto.brand.toUpperCase() : item.brand,
      updatedAt: new Date().toISOString()
    });

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
    return true;
  }

  private enrichItemWithSeller(item: WatchItem): WatchItem {
    const seller = this.findUserById(item.sellerId);
    return {
      ...item,
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

export const db = new Database();
