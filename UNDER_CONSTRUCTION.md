# Eurovision Under Construction Modu

Bu proje, her Eurovision yılı sayfasının bakım modunu ayrı ayrı kontrol edebilmeniz için merkezi bir yapı içerir.

## Bakım Modu Nasıl Çalışır?

Uygulamadaki bakım modu, artık `middleware.ts` dosyasında merkezi olarak kontrol ediliyor. Bu sayede:

1. Herhangi bir sayfaya gitmeden bakım modunu açıp kapatabilirsiniz
2. Her yılı diğerlerinden bağımsız olarak kontrol edebilirsiniz
3. Sayfalardaki kodları değiştirmenize gerek kalmaz

## Bakım Modunu Açma/Kapatma

`src/middleware.ts` dosyasını açın ve şu kısmı bulun:

```typescript
// Eurovision yılları için bakım modu ayarları
// Her yılın bakım modunu buradan açıp kapatabilirsiniz
const UNDER_CONSTRUCTION = {
  '2022': true,    // true: bakım modunda, false: aktif
  '2023': false,   // true: bakım modunda, false: aktif
  '2024': false    // true: bakım modunda, false: aktif
};
```

Herhangi bir yılın bakım durumunu değiştirmek için, o yılın değerini `true` (bakım modu) veya `false` (aktif) olarak ayarlayın.

## Yapı

Bu yeni yaklaşım şunları içerir:

1. **Middleware Kontrolü**: `/eurovision{year}` istekleri middleware tarafından kontrol edilir
2. **Bakım Sayfaları**: Her yıl için `/eurovision{year}/under-construction` sayfaları oluşturulur
3. **Merkezi Yönetim**: Tüm bakım ayarları middleware içinde saklanır

## Avantajlar

- Kod tekrarı yok
- Merkezi yönetim
- Kolay bakım
- Birbirinden bağımsız kontrol
