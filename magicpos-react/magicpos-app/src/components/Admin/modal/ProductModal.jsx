import React, { useEffect, useState } from 'react';
import styles from '../../css/ProductModal.module.css';

const ProductModal = ({ mode, onClose, onSave, onDelete, categoryMap, product, clearSelectedProductNos }) => {
  const [modalProduct, setModalProduct] = useState({
    cno: '',
    pname: '',
    description: '',
    pprice: '',
    sellStatus: false,
    imageFile: null,
  });

  const [animationClass, setAnimationClass] = useState('');     // 모달 애니메이션 상태 추가 

  useEffect(() => {
    if (open) {
      setAnimationClass(styles.fadeIn); // 모달 열릴 때
    } else if (animationClass === styles.fadeIn) {
      setAnimationClass(styles.fadeOut); // 모달 닫힐 때
      setTimeout(() => onClose(), 500); // 애니메이션 종료 후 모달 닫기
    }
  }, [open]);

  const handleAnimationEnd = () => {    
    if (animationClass === styles.fadeOut) {
      clearSelectedProductNos();
      onClose(); // 애니메이션이 끝나면 모달 닫기
    }
  };

  if (!open && animationClass !== styles.fadeOut) return null;


  // ★ product가 바뀔 때 상태 세팅
  useEffect(() => {
    if (mode === 'edit' && product) {
      setModalProduct({
        ...product,
        imageFile: null, // 기존 이미지는 경로로, 새 업로드는 파일로
      });
    } else if (mode === 'register') {
      setModalProduct({
        cno: '',
        pname: '',
        description: '',
        pprice: '',
        sellStatus: false,
        imageFile: null,
      });
    }
  }, [mode, product]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setModalProduct((prev) => ({
      ...prev,
      imageFile: e.target.files[0],
    }));
  };

  const handleSave = () => {
    console.log('Saving product:', modalProduct); // product 상태 확인
    if (!modalProduct.cno) {
        alert('상품분류를 선택해주세요.');
        return;
    }
    onSave(modalProduct);
    setAnimationClass(styles.fadeOut); // 저장 후 닫기 애니메이션 실행
  };

  const getImageSrc = (imgPath, imageFile) => {
  // 1) 새로 선택한 파일 미리보기
  if (imageFile) return URL.createObjectURL(imageFile);

  // 2) DB 경로 없음
  if (!imgPath) return null;

  // 3) 업로드 이미지(백엔드가 가진 파일) → 썸네일 엔드포인트 사용
  if (imgPath.startsWith('/upload/images/products/')) {
    return `/upload/images/img?filePath=${encodeURIComponent(imgPath)}`;
  }

  // 4) 그 외(예: /images/레스비.png 같은 리액트 public 정적 자산) → 그대로 사용
  return imgPath;
  };  

  // 사용
  const src = getImageSrc(modalProduct.imgPath, modalProduct.imageFile);

  return (
    <div className={`${styles.modalOverlay} ${animationClass}`} 
              onAnimationEnd={handleAnimationEnd}>
      <div className={`${styles.modalContent} ${animationClass}`}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {mode === 'edit' ? '상품수정' : '상품등록'}
          </span>
          <span className={styles.productCloseBtn} onClick={() => setAnimationClass(styles.fadeOut)} >×</span>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.productImageBox}>
          <div className={styles.imagePlaceholder}>
            
            {modalProduct.imageFile ? (
              <img
                src={URL.createObjectURL(modalProduct.imageFile)}
                alt="이미지 미리보기"
              />
            ) : modalProduct.imgPath ? (
              <img
                src={src || '/images/검색.png'}
                alt="이미지"
                onError={(e) => (e.currentTarget.src = '/images/검색.png')}
              />
            ) : (
              '이미지 미리보기'
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            name="imageFile"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={styles.imageBtn}
            onClick={() => document.querySelector('input[name="imageFile"]').click()}
          >
            제품 이미지 등록
          </button>
          </div>

          <div className={styles.productContainer}>
            <div className={styles.productLeft}>
              <div className={styles.formRow}>
                <label>상품분류</label>
                <select
                  id="product-category"
                  name="cno"
                  className={styles.formSelect}
                  value={modalProduct.cno}
                  onChange={handleInputChange}
                >
                  <option value="">-- 선택하세요 --</option>
                  
                  {Object.entries(categoryMap).map(([no, cname]) => (
                      <option key={no} value={no}>
                        {cname}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <label>상품명</label>
                <input
                  type="text"
                  id="product-name"
                  name="pname"
                  value={modalProduct.pname}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formRow}>
                <label>상품설명</label>
                <textarea
                  id="product-desc"
                  name="description"
                  value={modalProduct.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            <div className={styles.productRight}>
              <div className={styles.formRow}>
                <label>상품가격</label>
                <input
                  type="text"
                  id="product-price"
                  name="pprice"
                  value={modalProduct.pprice}
                  onChange={handleInputChange}
                />
                <span>원</span>
              </div>

              <div className={styles.formRow}>
                <label>노출설정</label>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      id="pc-sale"
                      name="sellStatus"
                      checked={modalProduct.sellStatus}
                      onChange={handleInputChange}
                    />
                    손님PC 판매
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.productModalFooter}>
          <button className={styles.btnCancel} onClick={() => setAnimationClass(styles.fadeOut)}>
            취소
          </button>
          {mode === 'edit' ? (
            <>
              <button className={styles.btnSave} onClick={handleSave}>
                수정
              </button>
              <button className={styles.btnDelete} onClick={() => {
                                                                    if (window.confirm('정말 삭제하시겠습니까?')) {
                                                                      onDelete(modalProduct.no); // onDelete 호출
                                                                      setAnimationClass(styles.fadeOut); // 닫기 애니메이션 실행
                                                                    }
                                                                  }}>
                삭제
              </button>
            </>
          ) : (
            <button className={styles.btnSave} onClick={handleSave}>
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
