import React from 'react';
import styles from '../css/Pagination.module.css';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, start, end, last } = pagination;

  // 페이지 번호 배열 생성
  const pageNumbers = [];
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.pagination}>
      <ul>
        {page > 1 && (
          <li>
            <button className={styles.prevButton} onClick={() => onPageChange(page - 1)}>« 이전</button>
          </li>
        )}
        {pageNumbers.map((i) => (
          <li key={i} className={i === page ? styles.active : ''}>
            <button className={styles.pageButton} onClick={() => onPageChange(i)}>{i}</button>
          </li>
        ))}
        {page < last && (
          <li>
            <button className={styles.nextButton} onClick={() => onPageChange(page + 1)}>다음 »</button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;