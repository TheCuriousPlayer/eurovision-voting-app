# Eurovision Türkiye Oylama Sistemi

Bu proje, Eurovision şarkı yarışması için özel tasarlanmış bir çevrimiçi oylama platformudur. Kullanıcılar, Google hesaplarıyla giriş yapabilir, oylarını verebilir ve sonuçları görüntüleyebilir.

## Sistem Özellikleri

### 1. Merkezi Yapılandırma Sistemi

Tüm Eurovision yılları için tek bir yerden yönetilen özellikler:

```typescript
// middleware.ts içinde tanımlanmıştır

// Bakım modu ayarları
const UNDER_CONSTRUCTION = {
  '2022': true,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false    // true: bakım modunda, false: aktif
};

// Oylama sayfaları için ayarlar
const VotePages_variables = {
  '2022': { 
    Status: true,                    // true: özellik aktif
    ShowCountDown: '00:00 27.09.2025', // Oylama başlangıç zamanı (HH:MM DD.MM.YYYY)
    Mode: 'hide',                    // 'visible', 'hide', 'gm-only'
    GMs: 'ozgunciziltepe@gmail.com'  // GM'lerin e-posta adresleri (virgülle ayrılmış)
  },
  '2023': { 
    Status: false, 
    ShowCountDown: '', 
    Mode: 'visible', 
    GMs: '' 
  },
  '2024': { 
    Status: false, 
    ShowCountDown: '', 
    Mode: 'visible', 
    GMs: '' 
  },
};
```

### 2. Geri Sayım Sistemi

- Her Eurovision yılı için özelleştirilebilir geri sayım
- Oylama başlangıç tarihi belirtilen zamana kadar erişimi kısıtlar
- Tarih-saat geçtiğinde otomatik olarak oylama sayfasına yönlendirir

### 3. Erişim Kontrolü

Oylama sonuçlarının görünürlüğü için üç farklı mod:

- `visible`: Herkes sonuçları görebilir
- `hide`: Sonuçlar gizlidir, ama "Sonuçları Göster" butonu herkes için görünür
- `gm-only`: Sadece belirtilen GM'ler sonuçları görebilir/gizleyebilir

### 4. Kullanıcı Oturumu ve Kimlik Doğrulama

- Google hesabı ile oturum açma (NextAuth.js)
- GM rolü kontrolü e-posta adresi üzerinden
- Oylama için zorunlu giriş

## Teknik Detaylar

### Bileşenler

1. **Middleware (middleware.ts)**
   - Merkezi yapılandırma
   - Rota bazlı koruma ve yönlendirme
   - API güvenliği

2. **Countdown (Countdown.tsx)**
   - Geri sayım gösterimi
   - Hedef tarih hesaplama ve biçimlendirme
   - Otomatik yönlendirme

3. **VoteController (VoteController.tsx)**
   - Oylama erişim kontrolü
   - Sonuçları göster/gizle düğmeleri
   - GM rolü bazlı UI düzenlemesi

4. **Vote Config API (api/config/vote-config/route.ts)**
   - Yapılandırma bilgilerini client tarafına güvenli şekilde aktarma
   - Kullanıcıya özel bilgi sağlama (GM rolü vb.)

### Sayfalar

1. **Bakım Sayfaları (under-construction)**
   - Her Eurovision yılı için özelleştirilmiş
   - Bakım modunda otomatik yönlendirme

2. **Geri Sayım Sayfaları (countdown)**
   - Her Eurovision yılı için özelleştirilmiş
   - Merkezi yapılandırmadan dinamik bilgi alma
   - Geri sayım bittiğinde sayfayı yenileme

3. **Oylama Sayfaları (vote/voting)**
   - Kullanıcı girişi gerektiren oylamalar
   - Sonuçları görüntüleme kontrolü

## Yapılandırma Rehberi

### Yeni Bir Eurovision Yılı Eklemek İçin:

1. `middleware.ts` içinde `UNDER_CONSTRUCTION` ve `VotePages_variables` yapılandırmalarına yeni yılı ekle
2. Yeni yıl için `eurovisionXXXX/under-construction` ve `eurovisionXXXX/countdown` sayfalarını oluş
3. `config` değişkenindeki matcher listesine yeni yıl için gerekli rotaları ekle

### Oylama Sayfası Davranışını Değiştirmek İçin:

1. `VotePages_variables` içinde ilgili yılın yapılandırmasını güncelle:
   - `Status`: Özelliği etkinleştirmek/devre dışı bırakmak için
   - `ShowCountDown`: Geri sayım için hedef tarih-saat
   - `Mode`: Sonuçların görünürlük modunu ayarla (`visible`, `hide`, `gm-only`)
   - `GMs`: GM rolüne sahip e-posta adreslerini virgülle ayırarak ekle

### Başlarken

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
# veya
yarn dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı görebilirsiniz.
