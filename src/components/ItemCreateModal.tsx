import React, { useState } from 'react';
import {
  X,
  Upload,
  Crown,
  Watch,
  Layers,
  AlertTriangle,
  Trash2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { CategoryTier, CreateItemPayload, MovementType, OriginType, TradeType, UserProfile } from '../types.ts';
import { api } from '../api.ts';

interface ItemCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userProfile: UserProfile | null;
  onOpenPhoneVerify: () => void;
}

const RequiredBadge = () => (
  <span style={{
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '4px',
    marginLeft: '6px'
  }}>
    필수
  </span>
);

const OptionalBadge = () => (
  <span style={{
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: '4px',
    marginLeft: '6px'
  }}>
    선택
  </span>
);

export const ItemCreateModal: React.FC<ItemCreateModalProps> = ({
  onClose,
  onSuccess,
  userProfile,
  onOpenPhoneVerify
}) => {
  // Load draft if available
  const savedDraft = (() => {
    try {
      const item = localStorage.getItem('watch_p2p_create_draft');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  })();

  const [categoryTier, setCategoryTier] = useState<CategoryTier>(savedDraft?.categoryTier || 'HIGH_END');
  const [brand, setBrand] = useState(savedDraft?.brand || 'ROLEX');
  const [modelName, setModelName] = useState(savedDraft?.modelName || '');
  const [refNumber, setRefNumber] = useState(savedDraft?.refNumber || '');
  const [movementType, setMovementType] = useState<MovementType>(savedDraft?.movementType || 'AUTOMATIC');
  const [caseSizeMm, setCaseSizeMm] = useState<string>(savedDraft?.caseSizeMm || '');
  const [dialColor, setDialColor] = useState(savedDraft?.dialColor || '');
  const [stampingDate, setStampingDate] = useState(savedDraft?.stampingDate || '');
  const [originType, setOriginType] = useState<OriginType>(savedDraft?.originType || 'DOMESTIC_STORE');
  const [hasBox, setHasBox] = useState(savedDraft?.hasBox ?? true);
  const [hasGuaranteeCard, setHasGuaranteeCard] = useState(savedDraft?.hasGuaranteeCard ?? true);
  const [hasManual, setHasManual] = useState(savedDraft?.hasManual ?? false);
  const [extraLinksCount, setExtraLinksCount] = useState<number>(savedDraft?.extraLinksCount ?? 0);
  const [priceStr, setPriceStr] = useState(savedDraft?.priceStr || '');
  const [tradeType, setTradeType] = useState<TradeType>(savedDraft?.tradeType || 'DIRECT_ONLY');
  const [preferredLocation, setPreferredLocation] = useState(savedDraft?.preferredLocation || '');
  const [description, setDescription] = useState(savedDraft?.description || '');

  // Images state (Simple photo upload, verification photo requirement removed)
  const [images, setImages] = useState<
    { imageUrl: string; isRepresentative: boolean; isVerificationPhoto: boolean; sortOrder: number }[]
  >(savedDraft?.images || []);

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-save draft on changes
  React.useEffect(() => {
    try {
      localStorage.setItem('watch_p2p_create_draft', JSON.stringify({
        categoryTier,
        brand,
        modelName,
        refNumber,
        movementType,
        caseSizeMm,
        dialColor,
        stampingDate,
        originType,
        hasBox,
        hasGuaranteeCard,
        hasManual,
        extraLinksCount,
        priceStr,
        tradeType,
        preferredLocation,
        description,
        images
      }));
    } catch {}
  }, [categoryTier, brand, modelName, refNumber, movementType, caseSizeMm, dialColor, stampingDate, originType, hasBox, hasGuaranteeCard, hasManual, extraLinksCount, priceStr, tradeType, preferredLocation, description, images]);

  // Safe close handler
  const handleSafeClose = () => {
    if (modelName.trim() || description.trim() || refNumber.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 작성 중인 내용은 임시 저장되지만 모달을 닫으시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Auto-switch tier guide based on price
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPriceStr(raw);
    const num = Number(raw);
    if (num >= 10000000) {
      setCategoryTier('HIGH_END');
    } else if (num >= 3000000) {
      setCategoryTier('MID');
    } else if (num > 0) {
      setCategoryTier('ENTRY');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadedUrls = await api.uploadImages(Array.from(files));
      const newImgs = uploadedUrls.map((url, idx) => ({
        imageUrl: url,
        isRepresentative: images.length === 0 && idx === 0,
        isVerificationPhoto: false,
        sortOrder: images.length + idx + 1
      }));
      setImages(prev => [...prev, ...newImgs]);
    } catch (err: any) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newImg = {
      imageUrl: imageUrlInput.trim(),
      isRepresentative: images.length === 0,
      isVerificationPhoto: false,
      sortOrder: images.length + 1
    };
    setImages(prev => [...prev, newImg]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some(img => img.isRepresentative)) {
        next[0].isRepresentative = true;
      }
      return next;
    });
  };

  const handleSetRepresentative = (index: number) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        isRepresentative: i === index
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Phone verification check
    if (!userProfile?.isPhoneVerified) {
      setError('판매 매물 등록을 위해 휴대폰 본인인증이 필요합니다.');
      return;
    }

    // 2. 24h Quota check
    if ((userProfile.remainingDailyQuota ?? 3) <= 0) {
      setError('24시간 내 최대 3건 등록 가능 횟수를 모두 소진하였습니다 (도배 방지 정책).');
      return;
    }

    // 3. Validation
    if (!brand || !modelName.trim()) {
      setError('브랜드와 모델명을 입력해주세요.');
      return;
    }

    const price = Number(priceStr);
    if (!price || price <= 0) {
      setError('유효한 판매 가격을 입력해주세요.');
      return;
    }

    if (images.length === 0) {
      setError('최소 1장 이상의 사진을 등록해주세요.');
      return;
    }

    const payload: CreateItemPayload = {
      categoryTier,
      brand,
      modelName,
      refNumber: refNumber.trim() || undefined,
      movementType,
      caseSizeMm: caseSizeMm ? parseFloat(caseSizeMm) : undefined,
      dialColor: dialColor.trim() || undefined,
      stampingDate: stampingDate.trim() || undefined,
      originType,
      hasBox,
      hasGuaranteeCard,
      hasManual,
      extraLinksCount: extraLinksCount || 0,
      price,
      tradeType,
      preferredLocation: preferredLocation.trim() || undefined,
      description: description.trim() || `${brand} ${modelName} 정품 풀세트 매물입니다. 상태 양호합니다.`,
      images
    };

    setIsSubmitting(true);
    try {
      await api.createItem(payload);
      try {
        localStorage.removeItem('watch_p2p_create_draft');
      } catch {}
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '매물 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', padding: '0', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Watch size={20} color="#0f172a" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              신규 시계 매물 등록
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: '#059669',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              자동 임시 저장 활성화
            </span>
          </div>
          <button
            type="button"
            onClick={handleSafeClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          
          {/* Unverified phone warning */}
          {userProfile && !userProfile.isPhoneVerified && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#92400e',
              fontSize: '0.82rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#d97706" />
                <span>매물 등록을 위해 휴대폰 본인인증이 필요합니다.</span>
              </div>
              <button
                type="button"
                onClick={onOpenPhoneVerify}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
              >
                인증하기
              </button>
            </div>
          )}

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 16px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Top Guidance Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '11px 15px',
            fontSize: '0.8rem',
            color: '#334155',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            lineHeight: '1.4'
          }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              flexShrink: 0
            }}>
              안내
            </span>
            <span>
              <strong style={{ color: '#dc2626' }}>[필수]</strong> 항목(브랜드, 모델명, 판매가격, 사진)만 입력하셔도 바로 등록되며, 상세 제원을 모르실 경우 <strong style={{ color: '#64748b' }}>[선택]</strong> 항목은 비워두셔도 됩니다.
            </span>
          </div>

          {/* 1. Category 3-Tier Selection */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              가격대 카테고리 <RequiredBadge />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              
              <div
                onClick={() => setCategoryTier('ENTRY')}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: categoryTier === 'ENTRY' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: categoryTier === 'ENTRY' ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Watch size={15} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e40af' }}>300만원 미만</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                  론진, 세이코, 해밀턴, 티쏘 등
                </p>
              </div>

              <div
                onClick={() => setCategoryTier('MID')}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: categoryTier === 'MID' ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                  background: categoryTier === 'MID' ? '#f5f3ff' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Sparkles size={15} color="#7c3aed" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#5b21b6' }}>300만 ~ 1,000만원</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                  오메가, 튜더, 까르띠에, 태그호이어 등
                </p>
              </div>

              <div
                onClick={() => setCategoryTier('HIGH_END')}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: categoryTier === 'HIGH_END' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  background: categoryTier === 'HIGH_END' ? '#fffbeb' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Crown size={15} color="#d97706" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>1,000만원 이상</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                  롤렉스, 오데마피게, 바쉐론 등
                </p>
              </div>

            </div>
          </div>

          {/* 2. Price & Trade Type */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              가격 및 거래 방식
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  판매 희망가 (원) <RequiredBadge />
                </label>
                <input
                  type="text"
                  placeholder="숫자만 입력 (예: 15000000)"
                  value={priceStr}
                  onChange={handlePriceChange}
                  className="form-input"
                  style={{ fontSize: '1.05rem', fontWeight: 700 }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  {priceStr ? `${Number(priceStr).toLocaleString()} 원` : ''}
                </span>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  거래 방식 <OptionalBadge />
                </label>
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="DIRECT_ONLY">대면 직거래 (권장)</option>
                  <option value="DELIVERY_AVAILABLE">직거래 / 택배 병행</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  선호 거래 장소 <OptionalBadge />
                </label>
                <input
                  type="text"
                  placeholder="(선택) 예: 서울 강남역 인근 은행, 분당 판교역 등"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 3. Structured Metadata Form */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              시계 상세 제원
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  브랜드 <RequiredBadge />
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="form-select"
                >
                  <option value="ROLEX">ROLEX (롤렉스)</option>
                  <option value="AUDEMARS PIGUET">AUDEMARS PIGUET (오데마 피게)</option>
                  <option value="PATEK PHILIPPE">PATEK PHILIPPE (파텍 필립)</option>
                  <option value="CARTIER">CARTIER (까르띠에)</option>
                  <option value="OMEGA">OMEGA (오메가)</option>
                  <option value="TUDOR">TUDOR (튜더)</option>
                  <option value="IWC">IWC</option>
                  <option value="LONGINES">LONGINES (론진)</option>
                  <option value="TAG HEUER">TAG HEUER (태그호이어)</option>
                  <option value="BREITLING">BREITLING (브라이틀링)</option>
                  <option value="SEIKO">SEIKO (세이코)</option>
                  <option value="HAMILTON">HAMILTON (해밀턴)</option>
                  <option value="OTHER">기타 브랜드</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  모델명 <RequiredBadge />
                </label>
                <input
                  type="text"
                  placeholder="예: 서브마리너 데이트, 문워치 등"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  레퍼런스 번호 (Ref.) <OptionalBadge />
                </label>
                <input
                  type="text"
                  placeholder="(선택) 모를 경우 비워두셔도 됩니다 (예: 126610LN)"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  무브먼트 방식 <OptionalBadge />
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="AUTOMATIC">오토매틱 (기계식 자동)</option>
                  <option value="MANUAL">수동 와인딩 (기계식 수동)</option>
                  <option value="QUARTZ">쿼츠 (배터리)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  케이스 직경 (mm) <OptionalBadge />
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="(선택) 예: 41.0"
                  value={caseSizeMm}
                  onChange={(e) => setCaseSizeMm(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  다이얼 색상 <OptionalBadge />
                </label>
                <input
                  type="text"
                  placeholder="(선택) 예: 블랙, 실버, 블루"
                  value={dialColor}
                  onChange={(e) => setDialColor(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  스탬핑 일자 (YYYY-MM) <OptionalBadge />
                </label>
                <input
                  type="text"
                  placeholder="(선택) 예: 2023-08"
                  value={stampingDate}
                  onChange={(e) => setStampingDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  출처 (구매처) <OptionalBadge />
                </label>
                <select
                  value={originType}
                  onChange={(e) => setOriginType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="DOMESTIC_STORE">국내 백화점 / 공식 부틱</option>
                  <option value="OVERSEAS">해외 공식 매장</option>
                  <option value="PARALLEL">병행 수입</option>
                  <option value="UNKNOWN">기타 / 미상</option>
                </select>
              </div>
            </div>

            {/* Accessories Checklist */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                부속품 보유 여부 <OptionalBadge />
              </label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasBox}
                    onChange={(e) => setHasBox(e.target.checked)}
                  />
                  <span>정품 박스 케이스</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasGuaranteeCard}
                    onChange={(e) => setHasGuaranteeCard(e.target.checked)}
                  />
                  <span>보증서 (게런티 카드)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasManual}
                    onChange={(e) => setHasManual(e.target.checked)}
                  />
                  <span>설명서 및 책자</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#1e293b' }}>
                  <span>여분 코:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={extraLinksCount}
                    onChange={(e) => setExtraLinksCount(Number(e.target.value))}
                    className="form-input"
                    style={{ width: '60px', padding: '4px 8px', height: '30px' }}
                  />
                  <span>마디</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Images Upload */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={16} color="#2563eb" />
              <span>사진 등록</span>
              <RequiredBadge />
            </h4>

            {/* Image upload controls */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
                <Upload size={14} />
                <span>{isUploading ? '업로드 중...' : '사진 파일 추가'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>

              <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '220px' }}>
                <input
                  type="url"
                  placeholder="또는 이미지 URL 직접 입력"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem', height: '36px' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', height: '36px', whiteSpace: 'nowrap' }}
                >
                  추가
                </button>
              </div>
            </div>

            {/* Image list */}
            {images.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      background: '#ffffff',
                      border: img.isRepresentative ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'relative', paddingTop: '75%', background: '#f1f5f9' }}>
                      <img
                        src={img.imageUrl}
                        alt="Watch preview"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(255,255,255,0.85)',
                          border: 'none',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', cursor: 'pointer', fontWeight: img.isRepresentative ? 700 : 400 }}>
                        <input
                          type="radio"
                          name="representativeGroup"
                          checked={img.isRepresentative}
                          onChange={() => handleSetRepresentative(idx)}
                        />
                        <span>{img.isRepresentative ? '대표 썸네일' : '대표 지정'}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem'
              }}>
                등록된 사진이 없습니다. 최소 1장의 실물 사진을 등록해주세요.
              </div>
            )}
          </div>

          {/* 5. Description */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              상세 설명 <OptionalBadge />
            </label>
            <textarea
              rows={4}
              placeholder="(선택) 시계 컨디션(폴리싱 여부, 스크래치 상태) 및 직거래 가능 시간대를 편하게 적어주세요. 미입력 시 기본 안내 문구가 적용됩니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSafeClose}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '9px 22px', fontSize: '0.92rem' }}
            >
              {isSubmitting ? '등록 중...' : '매물 등록 완료'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
