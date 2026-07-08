---
name: etap
description: Sıradaki kodlama etabını yap — limitli oturumlarda projeyi kaldığı yerden, kararlara uygun şekilde ilerletir. Kullanıcı "devam et", "sıradaki etap", "kodlamaya devam" dediğinde kullan.
---

# Sıradaki etabı yap

Bu proje limitli oturumlarda, muhtemelen farklı modellerle (Fable/Opus) parça
parça kodlanıyor. Görevin: **tek bir etabı** eksiksiz bitirmek.

## Adımlar

1. Sırayla oku: `CLAUDE.md` → `PROJE_PLANI.md` → `docs/TASARIM.md` →
   `docs/VERI.md` → `docs/ETAPLAR.md`.
2. `docs/ETAPLAR.md`'de durumu `🔵 devam ediyor` olan etap varsa onu sürdür
   ("Durum notu" satırı kalınan yeri söyler). Yoksa ilk `⬜` etabı seç ve
   durumunu `🔵` yap.
3. Etabın "Yapılacaklar" listesini uygula. Kararlarda tereddüt edersen
   `CLAUDE.md` → "Değişmez kararlar" bağlayıcıdır; orada olmayan önemli bir
   karar gerekiyorsa kullanıcıya sor, kafana göre karar verme.
4. Görsel işlerde `prototip/index.html` birebir referanstır; ondan sapma.
5. "Bitti sayılır" listesindeki her maddeyi tarayıcıda **doğrula**
   (iki tema, iki dil, 375px mobil genişlik).
6. Etabı `✅ tamam` işaretle, tarihi yaz, kutucukları doldur.
7. Commit'le (Türkçe mesaj, tek etap = tek commit tercih) ve push'la.

## Oturum yarıda kalırsa

- Çalışır durumdaki kısmı commit'le ve push'la (kırık kod push'lama).
- Etabın "Durum notu" satırına kalınan yeri tek cümleyle yaz.
- Kullanıcıya tek cümleyle nerede kalındığını söyle.

## Yapma

- Aynı oturumda ikinci etaba başlama (kullanıcı açıkça istemedikçe).
- Framework, build aracı, yeni bağımlılık ekleme.
- Onaylanmamış yorumsal katman verisi (konut/yoğunluk bölgesi vb.) yayınlama.
