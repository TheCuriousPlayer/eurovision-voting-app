/**
 * Eurovision uygulaması için merkezi yapılandırma dosyası
 * Bu dosya tüm tarih ve yapılandırma değerlerini tek bir yerden yönetmek için kullanılır
 */

// Oylama tarihleri - "HH:MM DD.MM.YYYY" formatında
export const VOTE_DATES = {
  // Yıllara göre oylama başlangıç tarihleri
  '2022': '', 
  '2023': '',
  '2024': '',
  '2025': '',
  '2026': ''
};

// Oylama yapılandırması
export const VOTE_CONFIG = {
  '2022': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2022'], 
    Mode: 'visible', // 'visible' | 'hide' | 'gm-only'
    GMs: 'ozgunciziltepe@gmail.com, bugrasisman@googlemail.com' 
  },
  '2023': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2023'], 
    Mode: 'visible', // 'visible' | 'hide' | 'gm-only'
    GMs: '' 
  },
  '2024': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2024'], 
    Mode: 'visible', // 'visible' | 'hide' | 'gm-only'
    GMs: '' 
  },
  '2025': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2025'], 
    Mode: 'visible', // 'visible' | 'hide' | 'gm-only'
    GMs: '' 
  },
  '2026': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2026'], 
    Mode: 'hide', // 'visible' | 'hide' | 'gm-only'
    GMs: '' 
  }
};

// Eurovision yılları için bakım modu ayarları
export const UNDER_CONSTRUCTION = {
  '2022': false,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false,    // true: bakım modunda, false: aktif
  '2025': false,    // true: bakım modunda, false: aktif
  '2026': true    // true: bakım modunda, false: aktif
};
