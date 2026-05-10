# Subagent Kullanım Kuralı

Kural: Subagent (runSubagent) çağrısı yapılması gerektiğinde model olarak **GPT-5 mini (high)** kullanılacaktır.

Uygulama:
- Kod içinde `runSubagent` çağrıları yapılırken `model` parametresi açıkça belirtilmeli ve tam string olarak `GPT-5 mini (high)` kullanılmalıdır.
- Eğer `model` parametresi yoksa veya farklı bir model verilmişse, çağrı reddedilmeli veya çağrıdan önce düzeltme yapılmalıdır.

Enforcement (otomatize):
- Repository kökünde `scripts/enforce-subagent-model.js` betiği bulunmaktadır. Bu script, kod tabanını tarar ve `runSubagent({...})` çağrılarında `model` parametresinin doğru olup olmadığını kontrol eder.
- CI veya yerel kontroller için `npm run check-subagent-model` komutunu çalıştırın. Hatalı bulunursa exit kodu 1 döner.

Nasıl düzeltilir:
- `runSubagent({ prompt: '...', description: '...', model: 'GPT-5 mini (high)' })` şeklinde çağrı yapın.
- Eğer runSubagent çağrısı bir değişken veya dolaylı olarak yapılıyorsa, çağrıyı açık model parametresiyle sarmalayın.

Not: Bu kural, Copilot/Chat servisinin kendi iç yönetimini değiştirmez — sadece repo içinde yapılan subagent çağrılarının hangi model parametresiyle yapılacağını zorlar.
