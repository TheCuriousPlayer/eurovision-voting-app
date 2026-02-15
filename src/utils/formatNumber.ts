/**
 * Format number with dot as thousand separator (Turkish format)
 * @param num - Number to format
 * @returns Formatted string with dots as thousand separators
 * @example formatNumber(1234567) => "1.234.567"
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
