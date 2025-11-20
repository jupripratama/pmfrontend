// src/utils/dateUtils.ts - ENHANCED WITH TIME FORMATS
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Convert UTC date string to WIB (Asia/Jakarta) timezone
 */
export const convertUTCtoWIB = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  
  try {
    const utcDate = new Date(dateString);
    if (isNaN(utcDate.getTime())) return null;
    
    // Convert to WIB (Jakarta timezone +8)
    const wibDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
    return wibDate;
  } catch {
    return null;
  }
};

/**
 * Format date to Indonesian locale (WIB timezone)
 * @param dateString - UTC date string from backend
 * @param formatStr - date-fns format string
 * @param includeTime - include time in format
 */
export const formatWIBDate = (
  dateString: string | undefined | null,
  formatStr: string = 'dd MMM yyyy',
  includeTime: boolean = false
): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    const finalFormat = includeTime 
      ? `${formatStr} HH:mm` 
      : formatStr;
    
    return format(wibDate, finalFormat, { locale: id });
  } catch {
    return '-';
  }
};

// ========================================
// DATE ONLY FORMATS (Tanpa Jam)
// ========================================

/**
 * Format for table display (short format)
 * Example: "17/11/2025"
 */
export const formatTableDate = (dateString: string | undefined | null): string => {
  return formatWIBDate(dateString, 'dd/MM/yyyy');
};

/**
 * Format for detailed view (long format)
 * Example: "27 September 2025"
 */
export const formatDetailDate = (dateString: string | undefined | null): string => {
  return formatWIBDate(dateString, 'dd MMMM yyyy');
};

/**
 * Format for compact display with short month
 * Example: "19 Nov 2025"
 */
export const formatCompactDate = (dateString: string | undefined | null): string => {
  return formatWIBDate(dateString, 'dd MMM yyyy');
};

// ========================================
// WITH TIME FORMATS (Dengan Jam)
// ========================================

/**
 * Format with time - Standard (HH:mm 24-hour)
 * Example: "19 Nov 2025 14:23"
 */
export const formatDateTime = (dateString: string | undefined | null): string => {
  return formatWIBDate(dateString, 'dd MMM yyyy', true);
};

/**
 * Format with time and seconds
 * Example: "19 Nov 2025 14:23:45"
 */
export const formatDateTimeWithSeconds = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    return format(wibDate, 'dd MMM yyyy HH:mm:ss', { locale: id });
  } catch {
    return '-';
  }
};

/**
 * Format with 12-hour time (AM/PM)
 * Example: "19 Nov 2025 02:23 PM"
 */
export const formatDateTime12Hour = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    return format(wibDate, 'dd MMM yyyy hh:mm a', { locale: id });
  } catch {
    return '-';
  }
};

/**
 * Format Indonesian style with "pukul"
 * Example: "19 November 2025 pukul 14:23 WIB"
 */
export const formatDateTimeIndonesian = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Belum pernah';

  const date = new Date(dateString);
  
  // Jika dari backend UTC, konversi ke lokal (WITA)
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar', // WITA
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }) ;
};

/**
 * Format for detailed audit trail (full datetime)
 * Example: "19 November 2025, 14:23:45 WIB"
 */
export const formatAuditDateTime = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    const formatted = format(wibDate, 'dd MMMM yyyy, HH:mm:ss', { locale: id });
    return `${formatted} WIB`;
  } catch {
    return '-';
  }
};

/**
 * Format for table display with short time
 * Example: "19/11/25 14:23"
 */
export const formatTableDateTime = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    return format(wibDate, 'dd/MM/yy HH:mm', { locale: id });
  } catch {
    return '-';
  }
};

/**
 * Relative time in Indonesian
 * Example: "2 jam yang lalu", "3 hari yang lalu"
 */
export const formatRelativeTime = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '-';
  
  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
    const diffMs = now.getTime() - wibDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return formatCompactDate(dateString);
  } catch {
    return '-';
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get current WIB date
 */
export const getCurrentWIBDate = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
};

/**
 * Format for form input (yyyy-MM-dd)
 */
export const formatForInput = (dateString: string | undefined | null): string => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return '';
  
  try {
    return format(wibDate, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

/**
 * Check if date is today (WIB timezone)
 */
export const isToday = (dateString: string | undefined | null): boolean => {
  const wibDate = convertUTCtoWIB(dateString);
  if (!wibDate) return false;
  
  const today = getCurrentWIBDate();
  return wibDate.toDateString() === today.toDateString();
};

/**
 * Format with smart fallback - shows relative time if today, otherwise date
 */
export const formatSmartDateTime = (dateString: string | undefined | null): string => {
  if (isToday(dateString)) {
    return formatRelativeTime(dateString);
  }
  return formatDateTime(dateString);
};