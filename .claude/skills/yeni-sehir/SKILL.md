---
name: yeni-sehir
description: Uygulamaya yeni bir şehir ekle — veri klasörünü, katmanları ve içerikleri kurallara uygun oluşturur. Kullanıcı "X şehrini ekleyelim" dediğinde kullan.
---

# Yeni şehir ekle

İlke (CLAUDE.md): **yeni şehir = yeni veri klasörü; kod değişmez.**
Kod değişikliği gerektiren bir eksik bulursan önce kullanıcıya bildir.

## Adımlar

1. `docs/VERI.md`'yi oku; `data/roma/` örnek uygulamadır.
2. `data/cities.json`'a şehri `status: "soon"` olarak ekle (dünya ekranında
   soluk görünür). Push'la — kullanıcı vitrini erken görsün.
3. Şehri araştır ve **onay taslağı** çıkar (kod yazmadan önce):
   - Giriş kapıları (havaalanları, ana garlar) + merkeze bağlantılar
   - Merkez(ler) — çok merkezli şehirlerde ayrımı açıkla (Roma'daki
     Termini / tarihi merkez ayrımı gibi)
   - Ulaşım omurgası (metro/ana hatlar; otobüs karmaşası ekleme)
   - Yorumsal bölgeler: yoğunluk, otel, konut, alt merkezler, öğrenci bölgeleri
   Bu taslağı kullanıcıya sun; **onaysız yorumsal katman işleme**.
4. Onaydan sonra `data/<sehir>/` klasörünü kur: `city.json` manifesti,
   `layers/*.geojson` (özellik sözleşmesine uy), `content/tr.json` + `en.json`.
   Hat geometrileri OpenStreetMap'ten alınır (atıf zaten altbilgide).
5. Rehberli mod adımlarını (`intro`) Roma'daki ton ve uzunlukta yaz: 5-6 adım,
   adım başına 1-2 cümle, "sen" dili.
6. `cities.json`'da şehri `"ready"` yap, iki temada/iki dilde tarayıcıda doğrula,
   commit'le, push'la.

## Kalite çıtası

- Katman menüsü Roma ile aynı 4 grupta kalır (Varış/Omurga/Keşfet/Yaşam).
- GeoJSON'ları şişirme: omurga hattı için ~10m hassasiyet yeterli;
  dosya başına hedef < 200KB.
- Yer adları çevrilmez; ipuçları i18n anahtarıdır.


## OSM boru hattı (2026-07-10'dan itibaren zorunlu adım)

Yeni şehrin omurga/kesfet/ihtiyac/bolge katmanları elle çizilmez; `docs/VERI.md`
→ "OSM üretim boru hattı" bölümündeki Overpass sorguları şehrin bbox'ıyla
çalıştırılır (kalite vekili + ızgara seyreltme + DP sadeleştirme). Kapılara
`mode` (plane/train/bus/ship), bölgelere `btype` alanı verilir.
