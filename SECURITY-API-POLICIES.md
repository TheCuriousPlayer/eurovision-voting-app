API Access Policies

Kısa özet:
- DB/oy/veri içeren tüm API rotaları server-side oturum kontrolü (`getServerSession`) yapmalıdır.
- Yönetim/DB değişikliği yapan rota(lar) `isAdmin` veya benzeri admin kontrolü ile korunur.
- GM (gözetmen) yetkisi gerektiren rota(lar) `VOTE_CONFIG` içindeki `GMs` listesiyle kontrol edilir.
- Public rotalar sadece özet/gösterim verisi sunmalı; hassas/detaylı veriler server tarafında gizlenmelidir.

Kategoriler (özet):

- **Admin-only** (sadece admin kullanıcılar)
  - src/app/api/init-db/route.ts
  - src/app/api/setup-fresh/route.ts
  - src/app/api/create-competitions/route.ts
  - src/app/api/cleanup-votes/route.ts
  - src/app/api/repair-raw/route.ts
  - src/app/api/repair/route.ts
  - src/app/api/recalculate/route.ts
  - src/app/api/add-2026-preview/route.ts
  - src/app/api/debug/route.ts
  - src/app/api/test-db/route.ts
  - src/app/api/test-endpoints/route.ts
  - src/app/api/check-url/route.ts

- **GM-only** (sadece GM e-postaları)
  - src/app/api/global-votes-map/route.ts
  - src/app/api/vote-counts/route.ts

- **Authenticated (oturumlu kullanıcılar)**
  - Oy gönderme / kullanıcıya özel veriler:
    - src/app/api/votes/*/route.ts (POST: oylama)
    - src/app/api/votes/*/route.ts (GET: kullanıcı bazlı / gizleme mantığı)
  - src/app/api/survey/next-year/route.ts
  - src/app/api/user-votes-map/route.ts

- **Public (kimlik gerektirmez)**
  - src/app/api/votes/*/public/route.ts (genel gösterim)
  - src/app/api/hardcoded-data/route.ts
  - src/app/api/test-data/route.ts

Uygulanan kurallar (bu repo için):
- Her rota, eğer `prisma`/DB ya da oy sonuçlarına erişiyorsa `getServerSession` ile oturum kontrolü yapmalıdır.
- Yönetim etkili yollar `isAdmin(session.user.email)` ile doğrulanmalıdır.
- GM erişimi gereken yerlerde `VOTE_CONFIG` içindeki `GMs` listesi kullanılarak küçük bir isGM kontrolü yapılmalıdır.

Enforcement / CI önerisi:
- Mevcut `scripts/audit-api-routes.js` bu kontrolleri tarayıp bulguları JSON olarak raporlar.
- `package.json` içine `check-api-auth` ve `prebuild` scriptleri eklendi; `npm run build` çalıştırılmadan önce denetim çalışır.
- Ek öneri: CI içinde `npm run check-api-auth` başarısızsa build'i durdurun.

Durum (manuel gözden geçirme):
- Tüm `src/app/api` rotaları manuel tarandı. DB erişen/uygulama-yöneten rotalar `getServerSession`/admin/GM kontrollerini içeriyor.
- Public olması amaçlanan rotalar (`.../public/...`) sadece özet/gösterim verisi sağlıyor.

İleride yapılacaklar:
- Erişim denetimlerini otomatik testlerle (unit/integration) destekleyin.
- Erişim-denetimi (audit) scriptini CI pipeline'a zorunlu kılın.
