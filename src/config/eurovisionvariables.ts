/**
 * Eurovision uygulaması için merkezi yapılandırma dosyası
 * Bu dosya tüm tarih ve yapılandırma değerlerini tek bir yerden yönetmek için kullanılır
 */

// Oylama tarihleri - "HH:MM DD.MM.YYYY" formatında
export const VOTE_DATES = {
  // Yıllara göre oylama başlangıç tarihleri
  '2022': '23:00 28.09.2025', 
  '2023': '',
  '2024': '',
  '2025': ''
};

// Oylama yapılandırması
export const VOTE_CONFIG = {
  '2022': { 
    Status: true, 
    ShowCountDown: VOTE_DATES['2022'], 
    Mode: 'hide', 
    GMs: 'ozgunciziltepe@gmail.com' 
  },
  '2023': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2023'], 
    Mode: 'visible', 
    GMs: '' 
  },
  '2024': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2024'], 
    Mode: 'visible', 
    GMs: '' 
  },
  '2025': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2025'], 
    Mode: 'visible', 
    GMs: '' 
  }
};

// Eurovision yılları için bakım modu ayarları
export const UNDER_CONSTRUCTION = {
  '2022': false,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false,    // true: bakım modunda, false: aktif
  '2025': false    // true: bakım modunda, false: aktif
};
