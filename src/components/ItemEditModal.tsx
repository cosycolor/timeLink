import React, { useState } from 'react';
import {
  X,
  Upload,
  Watch,
  Trash2,
  Image as ImageIcon,
  Save,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { CategoryTier, CreateItemPayload, MovementType, OriginType, TradeType, WatchItem } from '../types.ts';
import { api } from '../api.ts';

interface ItemEditModalProps {
  item: WatchItem;
  onClose: () => void;
  onSuccess: (updated: WatchItem) => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  item,
  onClose,
  onSuccess
}) => {
  const [brand, setBrand] = useState(item.brand || 'ROLEX');
  const [modelName, setModelName] = useState(item.modelName || '');
  const [refNumber, setRefNumber] = useState(item.refNumber || '');
  const [movementType, setMovementType] = useState<MovementType>(item.movementType || 'AUTOMATIC');
  const [caseSizeMm, setCaseSizeMm] = useState<string>(item.caseSizeMm ? String(item.caseSizeMm) : '');
  const [dialColor, setDialColor] = useState(item.dialColor || '');
  const [stampingDate, setStampingDate] = useState(item.stampingDate || '');
  const [originType, setOriginType] = useState<OriginType>(item.originType || 'DOMESTIC_STORE');
  const [hasBox, setHasBox] = useState(item.hasBox ?? true);
  const [hasGuaranteeCard, setHasGuaranteeCard] = useState(item.hasGuaranteeCard ?? true);
  const [hasManual, setHasManual] = useState(item.hasManual ?? false);
  const [extraLinksCount, setExtraLinksCount] = useState<number>(item.extraLinksCount ?? 0);
  const [priceStr, setPriceStr] = useState(String(item.price || ''));
  const [tradeType, setTradeType] = useState<TradeType>(item.tradeType || 'DIRECT_ONLY');
  const [preferredLocation, setPreferredLocation] = useState(item.preferredLocation || '');
  const [description, setDescription] = useState(item.description || '');

  // Images state
  const [images, setImages] = useState<
    { imageId?: number; imageUrl: string; isRepresentative: boolean; isVerificationPhoto: boolean; sortOrder: number }[]
  >(
    item.images.map((img, idx) => ({
      imageId: img.imageId,
      imageUrl: img.imageUrl,
      isRepresentative: img.isRepresentative ?? (idx === 0),
      isVerificationPhoto: img.isVerificationPhoto ?? false,
      sortOrder: img.sortOrder ?? (idx + 1)
    }))
  );

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Price difference calculation
  const originalPrice = item.price;
  const currentPriceNum = Number(priceStr) || 0;
  const priceDiff = currentPriceNum - originalPrice;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPriceStr(raw);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileList = Array.from(files);
      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          throw new Error('이미지 파일만 업로드 가능합니다 (PNG, JPG, WEBP).');
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('파일 크기는 최대 10MB 이하만 가능합니다.');
        }
      }

      const uploadedUrls = await api.uploadImages(fileList);
      const newImgs = uploadedUrls.map((url, idx) => ({
        imageUrl: url,
        isRepresentative: images.length === 0 && idx === 0,
        isVerificationPhoto: false,
        sortOrder: images.length + idx + 1
      }));

      setImages(prev => [...prev, ...newImgs]);
    } catch (err: any) {
      setError(err.message || '사진 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput);
    } catch {
      setError('올바른 이미지 URL 주소를 입력해주세요.');
      return;
    }

    setImages(prev => [
      ...prev,
      {
        imageUrl: imageUrlInput.trim(),
        isRepresentative: prev.length === 0,
        isVerificationPhoto: false,
        sortOrder: prev.length + 1
      }
    ]);
    setImageUrlInput('');
    setError(null);
  };

  const handleSetRepresentative = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isRepresentative: i === idx
    })));
  };

  const handleDeleteImage = (idx: number) => {
    setImages(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      if (filtered.length > 0 && !filtered.some(img => img.isRepresentative)) {
        filtered[0].isRepresentative = true;
      }
      return filtered.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!modelName.trim()) {
      setError('모델명을 입력해주세요.');
      return;
    }

    const price = Number(priceStr);
    if (!price || price <= 0) {
      setError('올바른 판매 희망 가격을 입력해주세요.');
      return;
    }

    if (images.length === 0) {
      setError('최소 1장 이상의 실물 시계 사진을 등록해주세요.');
      return;
    }

    if (!description.trim()) {
      setError('구매자에게 전달할 상세 설명을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<CreateItemPayload> = {
        brand,
        modelName: modelName.trim(),
        refNumber: refNumber.trim() || undefined,
        movementType,
        caseSizeMm: caseSizeMm ? parseFloat(caseSizeMm) : undefined,
        dialColor: dialColor.trim() || undefined,
        stampingDate: stampingDate.trim() || undefined,
        originType,
        hasBox,
        hasGuaranteeCard,
        hasManual,
        extraLinksCount,
        price,
        tradeType,
        preferredLocation: preferredLocation.trim() || undefined,
        description: description.trim(),
        images: images.map((img, idx) => ({
          imageUrl: img.imageUrl,
          isRepresentative: img.isRepresentative,
          isVerificationPhoto: img.isVerificationPhoto,
          sortOrder: idx + 1
        }))
      };

      const updated = await api.updateItem(item.itemId, payload);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || '매물 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Watch size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              매물 정보 수정하기 <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>(Ref. {item.itemId})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ maxHeight: 'calc(88vh - 130px)', overflowY: 'auto', padding: '24px' }}>
          
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Photos Management */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                시계 사진 수정 ({images.length}장)
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                * 첫 번째 사진 또는 [대표] 표시 사진이 목록 썸네일로 노출됩니다.
              </span>
            </div>

            {/* Photos Preview Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: img.isRepresentative ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9'
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Representative Tag */}
                  {img.isRepresentative ? (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      대표
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetRepresentative(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '2px 5px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      대표 설정
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="사진 삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Box */}
              <label
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '8px',
                  border: '2px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  color: '#64748b',
                  gap: '4px',
                  transition: 'background-color 0.15s'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
                <Upload size={20} color="#2563eb" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {isUploading ? '업로드중...' : '사진 추가'}
                </span>
              </label>
            </div>

            {/* URL Input Fallback */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="또는 사진 이미지 URL 직접 추가 (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '7px 12px' }}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '7px 14px', whiteSpace: 'nowrap' }}
              >
                URL 추가
              </button>
            </div>
          </div>

          {/* Section 2: Price Modification (Highlighted with Diff) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              판매 희망 가격 수정 *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  required
                  placeholder="예: 13500000"
                  value={priceStr}
                  onChange={handlePriceChange}
                  className="form-input"
                  style={{ fontSize: '1.1rem', fontWeight: 700, paddingRight: '36px' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                  원
                </span>
              </div>

              {/* Formatted Display */}
              {currentPriceNum > 0 && (
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb', padding: '6px 12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  {currentPriceNum.toLocaleString()} 원
                </div>
              )}
            </div>

            {/* Price Difference Indicator */}
            {priceDiff !== 0 && currentPriceNum > 0 && (
              <div style={{
                marginTop: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: priceDiff < 0 ? '#059669' : '#d97706'
              }}>
                {priceDiff < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                <span>
                  기존 가격 ({originalPrice.toLocaleString()}원) 대비{' '}
                  <strong>{Math.abs(priceDiff).toLocaleString()}원 {priceDiff < 0 ? '가격 인하 ⬇️' : '가격 인상 ⬆️'}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Watch Specifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                브랜드 *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-input"
                required
              >
                <option value="ROLEX">롤렉스 (ROLEX)</option>
                <option value="OMEGA">오메가 (OMEGA)</option>
                <option value="CARTIER">까르띠에 (CARTIER)</option>
                <option value="TUDOR">튜더 (TUDOR)</option>
                <option value="IWC">IWC</option>
                <option value="BREITLING">브라이틀링 (BREITLING)</option>
                <option value="TAG_HEUER">태그호이어 (TAG HEUER)</option>
                <option value="SEIKO">세이코 (SEIKO / GRAND SEIKO)</option>
                <option value="HAMILTON">해밀턴 (HAMILTON)</option>
                <option value="LONGINES">론진 (LONGINES)</option>
                <option value="ORIS">오리스 (ORIS)</option>
                <option value="AUDEMARS_PIGUET">오데마 피게 (AP)</option>
                <option value="PATEK_PHILIPPE">파텍 필립 (PATEK)</option>
                <option value="VACHERON_CONSTANTIN">바쉐론 콘스탄틴 (VC)</option>
                <option value="BLANCPAIN">블랑팡 (BLANCPAIN)</option>
                <option value="OTHER">기타 브랜드</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                모델명 *
              </label>
              <input
                type="text"
                required
                placeholder="예: 서브마리너 데이트 블랙"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                레퍼런스 번호 (Ref.)
              </label>
              <input
                type="text"
                placeholder="예: 126610LN"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                무브먼트 구동 방식
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="form-input"
              >
                <option value="AUTOMATIC">오토매틱 (기계식 자동)</option>
                <option value="MANUAL">수동 와인딩 (기계식 수동)</option>
                <option value="QUARTZ">쿼츠 (배터리 구동)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                케이스 직경 (mm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="예: 41"
                value={caseSizeMm}
                onChange={(e) => setCaseSizeMm(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                다이얼 (판) 색상
              </label>
              <input
                type="text"
                placeholder="예: 블랙 / 청판 / 썬레이 실버"
                value={dialColor}
                onChange={(e) => setDialColor(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                스탬핑 일자 (구매 시기)
              </label>
              <input
                type="text"
                placeholder="예: 2023년 05월"
                value={stampingDate}
                onChange={(e) => setStampingDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                구매처 / 출처
              </label>
              <select
                value={originType}
                onChange={(e) => setOriginType(e.target.value as OriginType)}
                className="form-input"
              >
                <option value="DOMESTIC_STORE">국내 백화점 / 정식 부틱</option>
                <option value="OVERSEAS">해외 정식 매장</option>
                <option value="PARALLEL">병행 수입</option>
                <option value="UNKNOWN">기타 / 미상</option>
              </select>
            </div>
          </div>

          {/* Section 4: Accessories Checkboxes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              부속품 구성 수정
            </label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasBox}
                  onChange={(e) => setHasBox(e.target.checked)}
                />
                <span>정품 박스 케이스</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasGuaranteeCard}
                  onChange={(e) => setHasGuaranteeCard(e.target.checked)}
                />
                <span>정품 보증서(게런티 카드)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasManual}
                  onChange={(e) => setHasManual(e.target.checked)}
                />
                <span>설명서 / 책자</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <span>여분 코:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={extraLinksCount}
                  onChange={(e) => setExtraLinksCount(parseInt(e.target.value || '0', 10))}
                  style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span>마디</span>
              </div>
            </div>
          </div>

          {/* Section 5: Trade Type & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                거래 방식 *
              </label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as TradeType)}
                className="form-input"
              >
                <option value="DIRECT_ONLY">대면 직거래 원칙</option>
                <option value="DELIVERY_AVAILABLE">직거래 / 안전 택배 가능</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                직거래 희망 지역
              </label>
              <input
                type="text"
                placeholder="예: 서울 강남역 인근 / 경기 분당 판교역"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Section 6: Detailed Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              판매자 상세 설명 *
            </label>
            <textarea
              required
              rows={6}
              placeholder="시계의 상태(스크래치, 찍힘 유무), 오버홀 이력, 직거래 가능 시간대 등을 자세히 작성해주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.92rem' }}
            >
              <Save size={16} />
              <span>{isSubmitting ? '수정 내용 저장 중...' : '수정 완료 저장'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
