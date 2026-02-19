/**
 * Eurovision uygulaması için merkezi yapılandırma dosyası
 * Bu dosya tüm tarih ve yapılandırma değerlerini tek bir yerden yönetmek için kullanılır
 */

// Oylama tarihleri - "HH:MM DD.MM.YYYY" formatında
export const VOTE_DATES = {
  // Yıllara göre oylama başlangıç tarihleri
  '2020': '',
  '2021': '',
  '2022': '', 
  '2023': '',
  '2024': '',
  '2025': '',
  '2026': ''
};

// Oylama yapılandırması
export const VOTE_CONFIG = {
  '202001': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
  },
  '202002': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
  },
  '202003': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
  },
  '2020': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2020'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
  },
  '2021': { 
    Status: false,
    ShowCountDown: VOTE_DATES['2021'],
    Mode: 'hide', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
  },
  '2022': { 
    Status: false, 
    ShowCountDown: VOTE_DATES['2022'], 
    Mode: 'visible', // 'visible' | 'hide'
    GMs: process.env.GM_EMAILS_DEFAULT ?? '' 
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

// Jüri üyeleri - Sayfa erişimi için yetkilendirme
// Juri2020final is server-side only — use /api/auth/is-jury for client-side checks

// Eurovision yılları için bakım modu ayarları
// Dinamik Örnek:
//   '202001': (() => {
//     const targetDate = new Date('2025-11-01T19:00:00+03:00').getTime();
//     const now = new Date().getTime();
//     return now < targetDate ? false : true;
//   })(),  // Dynamic: false before 01.11.2025 19:00, true after
export const UNDER_CONSTRUCTION = {
  '2020': false,  // true: bakım modunda, false: aktif
  '202001': false,  // true: bakım modunda, false: aktif
  '202002': false,  // true: bakım modunda, false: aktif
  '202003': false,   // true: bakım modunda, false: aktif
  '2021': false,    // true: bakım modunda, false: aktif
  '2022': false,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false,    // true: bakım modunda, false: aktif
  '2025': false,    // true: bakım modunda, false: aktif
  '2026': true    // true: bakım modunda, false: aktif
};
