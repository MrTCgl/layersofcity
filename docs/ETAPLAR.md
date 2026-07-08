# Kodlama Etapları

Her etap, limitli tek bir oturumda bitirilebilecek boyutta tasarlandı.
Kurallar `CLAUDE.md` → "Çalışma disiplini" bölümünde.

Durum işaretleri: ⬜ başlanmadı · 🔵 devam ediyor · ✅ tamam

---

## E1 — İskelet ve açılış ekranı ⬜

**Amaç:** Uygulamanın temeli + dünya haritası açılış ekranı.

Yapılacaklar:
- `index.html`, `css/`, `js/` iskeleti; MapLibre henüz YOK (açılış ekranı SVG)
- Tema sistemi: CSS değişkenleri, açık(pastel)/koyu geçişi, `localStorage` kaydı
- i18n altyapısı: `i18n/tr.json`, `i18n/en.json`; dil seçici; `localStorage` kaydı
- Dünya haritası açılış ekranı: sade SVG dünya, `data/cities.json`'dan şehir
  noktaları + isimleri; şehre tıklayınca `#/{sehirId}` rotasına geçiş
- Üst bar: logo (ana ekrana döndürür), dil ve tema anahtarları
- Prototipteki görünüm birebir referanstır: `prototip/index.html`

Bitti sayılır:
- [ ] İki temada ve iki dilde açılış ekranı sorunsuz
- [ ] Mobil genişlikte (375px) düzgün görünüm
- [ ] Şehre tıklayınca boş bir şehir ekranına rota değişiyor, logo geri döndürüyor

Durum notu: —

---

## E2 — Şehir ekranı ve harita altlığı ⬜

**Amaç:** Roma seçilince MapLibre haritasının soluk altlıkla açılması.

Yapılacaklar:
- MapLibre GL JS entegrasyonu (yerel kopya, CDN'e bağımlı kalma)
- Soluk/gri altlık stili (açık ve koyu varyant), `docs/TASARIM.md` kurallarına göre
- `data/roma/city.json` manifesti: merkez, zoom sınırları, katman listesi
- Katman paneli iskeleti: 4 grup başlığı (Varış/Omurga/Keşfet/Yaşam), boş anahtarlar
- **"Konumum" butonu:** Geolocation API ile kullanıcının yerini haritada gösterir
  (`docs/VERI.md` → Konum bölümü; konum cihazda kalır, gönderilmez)

Bitti sayılır:
- [ ] Roma haritası iki temada da soluk altlıkla açılıyor
- [ ] Panel mobilde alt çekmece, masaüstünde yan panel
- [ ] Manifest'ten okunan katman listesi panelde listeleniyor (henüz veri çizilmeden)
- [ ] Konumum butonu mobilde çalışıyor (izin reddi de sessizce ele alınıyor)

Durum notu: —

---

## E3 — Varış + Omurga katmanları ⬜

**Amaç:** İlk gerçek içerik: giriş kapıları ve ulaşım omurgası.

Yapılacaklar:
- `data/roma/layers/varis.geojson`: Fiumicino, Ciampino, Termini, Tiburtina +
  merkeze bağlantı çizgileri (Leonardo Express vb.)
- `data/roma/layers/omurga.geojson`: Metro A/B/C hatları, kilit tramvaylar,
  merkez işaretleri (Termini=ulaşım merkezi, Centro Storico=tarihi merkez ayrımı)
- Katman aç/kapa mantığı; açılış varsayılanı: Varış+Omurga açık
- Hat renkleri: `docs/TASARIM.md` "metro renkleri" (soluklaştırılmış A/B/C)

Bitti sayılır:
- [ ] Varsayılan açılışta kapılar+omurga görünüyor, panelden aç/kapa çalışıyor
- [ ] İçerik `PROJE_PLANI.md` B bölümüyle uyumlu, kullanıcı onayından geçti

Durum notu: —

---

## E4 — Keşfet katmanları ⬜

**Amaç:** İlgi noktaları (tema filtreli) + gün içi yoğun bölgeler.

Yapılacaklar:
- `kesfet-poi.geojson`: tarihi/modern/doğa/gastronomi/alışveriş/sağlık etiketli POI'ler
- Panelde tema filtresi (çip düzeni, çoklu seçim)
- `kesfet-yogunluk.geojson`: yoğun bölge alanları (yumuşak dolgu, keskin sınır yok)

Bitti sayılır:
- [ ] Filtreler çalışıyor; yoğunluk alanları iki temada okunaklı
- [ ] POI seti kullanıcı onayından geçti

Durum notu: —

---

## E5 — Yaşam katmanları ⬜

**Amaç:** Otel bölgeleri, konut bölgeleri, alt merkezler, öğrenci bölgeleri.

Yapılacaklar:
- `yasam-otel.geojson`, `yasam-konut.geojson`, `yasam-altmerkez.geojson`,
  `yasam-ogrenci.geojson`
- Alt merkez ↔ merkez ana aks çizgileri
- Alan katmanları için ortak stil (soluk dolgu + kısa etiket)

Bitti sayılır:
- [ ] Dört katman da panelden yönetiliyor ve okunaklı
- [ ] Bölgeleme kullanıcı onayından geçti

Durum notu: —

---

## E6 — Rehberli mod ⬜

**Amaç:** İsteğe bağlı "şehri tanıt" akışı.

Yapılacaklar:
- Panelde ayrı bir "şehri tanıt ▸" girişi (varsayılan kapalı, dayatma yok)
- Adım verisi `data/roma/content/{dil}.json`'dan: her adım = kamera hedefi +
  açılacak katmanlar + 1-2 cümle metin
- İleri/geri/çık kontrolleri; çıkınca serbest moda dönüş

Bitti sayılır:
- [ ] 5-6 adımlık Roma tanıtımı iki dilde çalışıyor, her an çıkılabiliyor

Durum notu: —

---

## E7 — Cila ⬜

**Amaç:** Yayın öncesi kalite.

Yapılacaklar:
- i18n tamlık kontrolü (en+tr %100; diğer 4 dil dosyası iskelet olarak hazır)
- Mobil ince ayar, dokunma hedefleri, klavye erişilebilirliği, kontrast kontrolü
- Performans: GeoJSON boyutları, gecikmeli yükleme, Lighthouse hızlı geçişi

Bitti sayılır:
- [ ] Lighthouse: Performance ve Accessibility ≥ 90 (mobil)

Durum notu: —

---

## E8 — Yayın ⬜

**Amaç:** Canlıya çıkış.

Yapılacaklar:
- GitHub Pages ayarı + `CNAME` (alan adı kullanıcıda: layersofcity.com adayı)
- DNS yönergesi kullanıcıya kısa madde listesi olarak verilecek
- Çerezsiz analitik (Plausible veya Umami) script'i
- `README.md` (İngilizce, kısa tanıtım)

Bitti sayılır:
- [ ] Site alan adında açılıyor, analitik veri düşüyor

Durum notu: —
