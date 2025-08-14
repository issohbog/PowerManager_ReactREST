import React, { useEffect, useState } from 'react';
import styles from '../../css/ProductCategoryModal.module.css';

const CategoryModal = ({ isOpen, onClose, categoryMap, onAddCategory, onSaveCategories, onDeleteCategory, onEditCategory }) => {
  if (!isOpen) return null;

  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);         // 현재 수정중인 카테고리의 no 저장 
  const [editedCategoryName, setEditedCategoryName] = useState('');     // 수정 중인 카테고리 name 저장    
  
  // **** 모달 애니메이션 추가 ****
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
        onClose(); // 애니메이션이 끝나면 모달 닫기
      }
    };
  
    if (!open && animationClass !== styles.fadeOut) return null;

    // **** 모달 애니매이션 추가 끝 ****




  // 카테고리 등록
  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      alert('분류명을 입력해주세요.');
      return;
    }
    onAddCategory(newCategory); // 입력값 전달
    setNewCategory(''); // 입력 필드 초기화
  };

  // 카테고리 수정 시작
  const startEditCategory = (no, cname) => {
    setEditingCategory(no);
    setEditedCategoryName(cname);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditedCategoryName('');
  };

  const handleSaveEditCategory = (no) => {
    if (editedCategoryName.trim() === '') {
        alert('분류명을 입력해주세요.');
        return;
    }
    onEditCategory(no, editedCategoryName); // 수정된 값 전달
    setEditingCategory(null);
    setEditedCategoryName('');
  }; // 카테고리 수정 끝

  return (
        <div className={`${styles.modalOverlay} ${animationClass}`} 
                  onAnimationEnd={handleAnimationEnd}>
      <div className={`${styles.modalContent} ${animationClass}`}>
        <div className={styles.categoryModalHeader}>
          <h2>상품분류등록</h2>
          <span className={styles.categoryCloseBtn} onClick={() => setAnimationClass(styles.fadeOut)}>×</span>
        </div>
        <div className={styles.categoryModalBody}>
          <table className={styles.categoryTable}>
            <thead>
              <tr>
                <th>순서</th>
                <th>상품분류명</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryMap).map(([no, cname], index) => (
                <tr key={no}>
                  <td>{index + 1}</td>
                  <td>
                    <div className={styles.categoryEditWrapper}>
                        {editingCategory === no ? (
                            <input
                            type="text"
                            value={editedCategoryName}
                            onChange={(e) => setEditedCategoryName(e.target.value)}
                            onBlur={() => handleSaveEditCategory(no)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditCategory(no);
                                if (e.key === 'Escape') cancelEditCategory();
                            }}
                            autoFocus
                            />
                        ) : (
                            <span
                            className={styles.categoryNameText}
                            onClick={() => startEditCategory(no, cname)}
                            data-category-no={no}
                            >
                            {cname}
                            </span>
                        )}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.deleteCategoryBtn}
                      onClick={() => {
                        if (window.confirm('정말로 삭제하시겠습니까?')) {
                          onDeleteCategory(no);
                        }
                      }}
                    >
                      <img
                        src="/images/icons8-delete-30.png"
                        alt="삭제"
                        style={{ width: '16px', height: '16px' }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.categoryInputGroup}>
            <label>분류명</label>
            <div className={styles.categoryInputButton}>
              <input 
                type="text" 
                id="new-category-input" 
                value={newCategory}         // 등록 시 값 가져오기 위해
                onChange={(e) => setNewCategory(e.target.value)}            // 상태 업데이트
                />
              <button type="button" onClick={handleAddCategory}>분류등록</button>
            </div>
          </div>

          {/* <div className={styles.categoryButtonGroup}>
            <button className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button className={styles.saveBtn} onClick={onSaveCategories}>저장</button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;