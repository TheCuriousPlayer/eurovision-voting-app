/**
 * Eurovision uygulaması için merkezi yapılandırma dosyası
 * Bu dosya tüm tarih ve yapılandırma değerlerini tek bir yerden yönetmek için kullanılır
 */

// Oylama tarihleri - "HH:MM DD.MM.YYYY" formatında
export const VOTE_DATES = {
  // Yıllara göre oylama başlangıç tarihleri
  '2020': '',
  '2022': '', 
  '2023': '',
  '2024': '',
  '2025': '',
  '2026': ''
};

// Oylama yapılandırması
export const VOTE_CONFIG = {
  '202000': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'hide', // 'visible' | 'hide'
    GMs: 'ozgunciziltepe@gmail.com, bugrasisman@googlemail.com' 
  },
  '202001': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'hide', // 'visible' | 'hide'
    GMs: 'ozgunciziltepe@gmail.com, bugrasisman@googlemail.com' 
  },
  '202002': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'hide', // 'visible' | 'hide'
    GMs: 'ozgunciziltepe@gmail.com, bugrasisman@googlemail.com' 
  },
  '2022': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2022'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: 'ozgunciziltepe@gmail.com, bugrasisman@googlemail.com' 
  },
  '2023': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2023'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: '' 
  },
  '2024': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2024'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: '' 
  },
  '2025': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2025'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: '' 
  },
  '2026': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2026'], 
    Mode: 'hide', // 'visible' | 'hide'
    GMs: '' 
  }
};

// Eurovision yılları için bakım modu ayarları
export const UNDER_CONSTRUCTION = {
  '202000': true,  // true: bakım modunda, false: aktif
  '202001': (() => {
    const targetDate = new Date('2025-11-01T19:00:00+03:00').getTime();
    const now = new Date().getTime();
    return now < targetDate ? false : true;
  })(),  // Dynamic: false before 01.11.2025 19:00, true after
  '202002': (() => {
    const targetDate = new Date('2025-10-31T19:00:00+03:00').getTime();
    const now = new Date().getTime();
    return now < targetDate ? true : false;
  })(),  // Dynamic: true before 31.10.2025 19:00, false after
  '2022': false,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false,    // true: bakım modunda, false: aktif
  '2025': false,    // true: bakım modunda, false: aktif
  '2026': true    // true: bakım modunda, false: aktif
};
