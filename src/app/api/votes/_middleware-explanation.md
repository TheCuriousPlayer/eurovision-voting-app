# API Koruma Açıklaması

Bu klasördeki `/simple` ve `/public` API endpoint'leri için koruma eklenmiştir. Middleware, bu endpoint'lere yapılan istekleri kontrol eder ve sadece aşağıdaki koşulları sağlayan isteklere izin verir:

1. İstek, uygulamanın kendi sayfalarından geliyorsa (`Referer` header kontrolü)
2. İstek aynı kaynaktan geliyorsa (`Origin` header kontrolü)

## Koruma Nasıl Çalışır?

`middleware.ts` dosyası, API endpoint'lerine gelen istekleri aşağıdaki adımlarla korur:

1. `/api/votes/*/simple` ve `/api/votes/*/public` endpoint'lerini tanımlar
2. Header'ları kontrol eder (Referer, Origin)
3. İstek geçerli bir kaynaktan gelmiyorsa, 403 Forbidden hatası döndürür

## Faydaları

- **Site İşlevselliği Korunur**: Sayfa içinden yapılan API çağrıları normal çalışır
- **Harici Erişim Engellenir**: Harici/doğrudan API çağrıları engellenir
- **Kolay Bakım**: Dosyaları silmeye veya değiştirmeye gerek yoktur

## Neden Bu Yöntem?

Bu koruma yöntemi, dosyaları silmeden veya içeriklerini değiştirmeden güvenlik sağlar. Bu sayede:

1. Sitenin işlevselliği bozulmaz
2. Güncellemeler daha kolay yönetilir
3. Harici erişim güvenli şekilde engellenir

## İpuçları

- Ek güvenlik için rate limiting eklenebilir
- Belirli API key'ler ile sınırlı erişim sağlanabilir
- Admin paneli için özel erişim sağlanabilir
