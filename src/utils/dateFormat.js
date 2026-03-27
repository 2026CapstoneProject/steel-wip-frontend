// 날짜 포맷 유틸

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD HH:mm' 형태로 변환
 * @param {string} isoString
 * @returns {string}
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD' 형태로 변환
 * @param {string} isoString
 * @returns {string}
 */
export const formatDate = (isoString) => {
  if (!isoString) return '-';
  return isoString.slice(0, 10);
};
