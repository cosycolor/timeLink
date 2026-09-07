-- =========================================================
-- TimeLink (Watch P2P) - Supabase PostgreSQL Schema & Seed
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  user_id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  phone_number TEXT,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  user_role TEXT DEFAULT 'MEMBER',
  manner_score NUMERIC(4, 1) DEFAULT 36.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Watch Items Table
CREATE TABLE IF NOT EXISTS public.watch_items (
  item_id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  category_tier TEXT NOT NULL,
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  ref_number TEXT,
  movement_type TEXT NOT NULL,
  case_size_mm NUMERIC(4, 1),
  dial_color TEXT,
  stamping_date TEXT,
  origin_type TEXT NOT NULL,
  has_box BOOLEAN DEFAULT FALSE,
  has_guarantee_card BOOLEAN DEFAULT FALSE,
  has_manual BOOLEAN DEFAULT FALSE,
  extra_links_count INT DEFAULT 0,
  price BIGINT NOT NULL,
  trade_type TEXT NOT NULL,
  preferred_location TEXT,
  description TEXT,
  item_status TEXT DEFAULT 'FOR_SALE',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Item Images Table
CREATE TABLE IF NOT EXISTS public.item_images (
  image_id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES public.watch_items(item_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_representative BOOLEAN DEFAULT FALSE,
  is_verification_photo BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Reviews Table
CREATE TABLE IF NOT EXISTS public.user_reviews (
  review_id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  reviewer_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  reviewer_nickname TEXT NOT NULL,
  rating TEXT NOT NULL,
  temp_delta NUMERIC(3, 1) DEFAULT 0.5,
  tags JSONB DEFAULT '[]'::jsonb,
  comment TEXT,
  item_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Threads Table
CREATE TABLE IF NOT EXISTS public.chat_threads (
  thread_id TEXT PRIMARY KEY,
  item_id BIGINT REFERENCES public.watch_items(item_id) ON DELETE CASCADE,
  buyer_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  seller_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_message_time TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  left_user_ids JSONB DEFAULT '[]'::jsonb
);

-- 6. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  message_id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES public.chat_threads(thread_id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  sender_nickname TEXT,
  text TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Item Likes Table
CREATE TABLE IF NOT EXISTS public.item_likes (
  user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  item_id BIGINT REFERENCES public.watch_items(item_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- 8. User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
  report_id BIGSERIAL PRIMARY KEY,
  reporter_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
  target_item_id BIGINT,
  target_seller_id BIGINT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for backend access or allow service_role
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports DISABLE ROW LEVEL SECURITY;

-- =========================================================
-- Initial Seed Data
-- =========================================================

-- Seed Users (passwords: password123!)
INSERT INTO public.users (user_id, email, password_hash, nickname, phone_number, is_phone_verified, user_role, manner_score)
VALUES 
  (1, 'collector_han@watchp2p.com', '$2b$10$BhH4eaDHliMA1cQA03I9C.MTH3OrPe8.dNtWmaLj/Q7SeRUZ2scsK', '강남타임마스터', '010-8921-3342', true, 'MEMBER', 42.0),
  (2, 'vintage_lover@watchp2p.com', '$2b$10$RpzyxDHTKf12GJXT1OXbWujz3NG52ikjR10PKW5UeSMRQSddERIee', '빈티지워치스', '010-4412-9901', true, 'MEMBER', 38.0),
  (3, 'newbie@watchp2p.com', '$2b$10$ZCvWIMhr1tXkDqcTn/ZUluPRWcEcI9MmxPdR4rUKM2gZJ67Y.LTLe', '시계입문자', NULL, false, 'MEMBER', 36.5)
ON CONFLICT (email) DO NOTHING;

-- Seed Watch Items
INSERT INTO public.watch_items (item_id, seller_id, category_tier, brand, model_name, ref_number, movement_type, case_size_mm, dial_color, stamping_date, origin_type, has_box, has_guarantee_card, has_manual, extra_links_count, price, trade_type, preferred_location, description, item_status, view_count)
VALUES
  (101, 1, 'HIGH_END', 'ROLEX', '서브마리너 데이트 (Submariner Date)', '126610LN', 'AUTOMATIC', 41.0, '블랙', '2023-08', 'DOMESTIC_STORE', true, true, true, 2, 18500000, 'DIRECT_ONLY', '서울 강남구 압구정동 인근 은행', '2023년 8월 국내 백화점 정식 스탬핑 서브마리너 데이트 41mm입니다. 단품이 아닌 보증서, 박스, 풀링크, 설명서 등 모든 구성품 완벽 보관 중입니다. 버클부에 미세 생활기스 외 상태 최상(민트급)입니다. 안전을 위해 은행 객장 대면 직거래만 진행합니다.', 'FOR_SALE', 142),
  (102, 2, 'HIGH_END', 'AUDEMARS PIGUET', '로열 오크 셀프와인딩 (Royal Oak 41mm)', '15500ST.OO.1220ST.01', 'AUTOMATIC', 41.0, '블루', '2022-11', 'DOMESTIC_STORE', true, true, true, 1, 49000000, 'DIRECT_ONLY', '서울 한남동 / 청담동 프라이빗 직거래', '인기 절정의 블루 다이얼 그랑 타피스리 패턴 15500ST 모델입니다. 실착 10회 미만 극상 컨디션입니다. 은행 내부 또는 보안시설 갖춰진 라운지에서만 직거래합니다.', 'FOR_SALE', 320),
  (103, 1, 'MID', 'OMEGA', '스피드마스터 프로페셔널 문워치 (Moonwatch)', '310.30.42.50.01.002', 'MANUAL', 42.0, '블랙', '2023-01', 'DOMESTIC_STORE', true, true, true, 3, 8800000, 'DIRECT_ONLY', '경기 성남시 판교역 or 우체국안심택배', '칼리버 3861 코액시얼 마스터 크로노미터 무브먼트 탑재 사파이어 샌드위치 모델입니다. 글라스 스크래치 전혀 없으며 백화점 구매 영수증 포함 풀셋입니다.', 'FOR_SALE', 88),
  (104, 3, 'MID', 'TUDOR', '블랙베이 58 (Black Bay Fifty-Eight)', 'M79030N-0001', 'AUTOMATIC', 39.0, '블랙/골드', '2022-05', 'PARALLEL', true, true, true, 0, 3800000, 'DELIVERY_AVAILABLE', '서울 마포구 공덕역 직거래 또는 택배', '데일리 워치로 최적인 39mm 사이즈 BB58입니다. 골드 핸즈와 인덱스가 클래식합니다. 버클 체결부 미세 생활 스크래치 있습니다.', 'SOLD', 450),
  (105, 1, 'HIGH_END', 'CARTIER', '산토스 드 까르띠에 라지 (Santos de Cartier L)', 'WSSA0018', 'AUTOMATIC', 39.8, '오팔린 실버', '2023-12', 'DOMESTIC_STORE', true, true, true, 2, 10500000, 'DIRECT_ONLY', '서울 송파구 잠실 롯데 에비뉴엘 인근', '퀵스위치 가죽 스트랩 및 스틸 브레이슬릿 모두 포함된 풀세트입니다. 착용감 매우 우수하며 2031년까지 8년 국제 보증 연장 완료되었습니다.', 'RESERVED', 160)
ON CONFLICT (item_id) DO NOTHING;

-- Seed Item Images
INSERT INTO public.item_images (image_id, item_id, image_url, is_representative, is_verification_photo, sort_order)
VALUES
  (1, 101, '/images/watches/rolex_submariner.jpg', true, false, 1),
  (2, 101, '/images/watches/rolex_submariner_dial.jpg', false, false, 2),
  (3, 101, '/images/watches/rolex_submariner_clasp.jpg', false, false, 3),
  (4, 102, '/images/watches/ap_royal_oak.jpg', true, false, 1),
  (5, 103, '/images/watches/omega_moonwatch.jpg', true, false, 1),
  (6, 103, '/images/watches/omega_moonwatch_caseback.jpg', false, false, 2),
  (7, 104, '/images/watches/tudor_bb58.jpg', true, false, 1),
  (8, 105, '/images/watches/cartier_santos.jpg', true, false, 1)
ON CONFLICT (image_id) DO NOTHING;

-- Seed User Reviews
INSERT INTO public.user_reviews (review_id, seller_id, reviewer_id, reviewer_nickname, rating, temp_delta, tags, comment, item_summary)
VALUES
  (1, 1, 2, '빈티지워치스', 'GREAT', 0.5, '["약속 시간을 잘 지켜요", "시계 상태가 설명과 같아요", "친절하고 매너가 좋아요"]'::jsonb, '은행 객장에서 안전하게 거래 잘 마쳤습니다. 보증서와 상태 모두 설명대로 완벽하네요!', 'ROLEX 서브마리너 데이트 41mm'),
  (2, 1, 3, '시계수집가', 'GREAT', 0.5, '["응답이 빨라요", "보증서 및 구성품이 꼼꼼해요"]'::jsonb, '쿨거래 감사합니다. 질문에도 친절하게 답변해주셔서 안심하고 직거래했습니다.', 'CARTIER 산토스 드 까르띠에 L'),
  (3, 2, 1, '강남타임마스터', 'GREAT', 0.5, '["시계 상태가 설명과 같아요", "약속 시간을 잘 지켜요"]'::jsonb, '튜더 블랙베이 58 상태 최고입니다. 매너 있게 거래해주셔서 감사드립니다!', 'TUDOR 블랙베이 58')
ON CONFLICT (review_id) DO NOTHING;

-- Seed Chat Threads & Messages
INSERT INTO public.chat_threads (thread_id, item_id, buyer_id, seller_id, last_message, last_message_time)
VALUES
  ('thread_101_2', 101, 2, 1, '안녕하세요! 서브마리너 매물 평일 낮 강남역 인근 은행 직거래 가능할까요?', '10분 전')
ON CONFLICT (thread_id) DO NOTHING;

INSERT INTO public.chat_messages (message_id, thread_id, sender_id, sender_nickname, text, is_read, is_system)
VALUES
  ('msg_seed_1', 'thread_101_2', 1, '강남타임마스터', '안녕하세요! ROLEX 서브마리너 데이트 풀세트 매물입니다.', true, false),
  ('msg_seed_2', 'thread_101_2', 2, '빈티지워치스', '안녕하세요! 서브마리너 매물 평일 낮 강남역 인근 은행 직거래 가능할까요?', false, false)
ON CONFLICT (message_id) DO NOTHING;

-- Adjust sequence values to prevent ID collision
SELECT setval('public.users_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM public.users) + 1);
SELECT setval('public.watch_items_item_id_seq', (SELECT COALESCE(MAX(item_id), 100) FROM public.watch_items) + 1);
SELECT setval('public.item_images_image_id_seq', (SELECT COALESCE(MAX(image_id), 1) FROM public.item_images) + 1);
SELECT setval('public.user_reviews_review_id_seq', (SELECT COALESCE(MAX(review_id), 1) FROM public.user_reviews) + 1);
