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

## E2 — Şehir ekranı, harita altlığı ve şehir çubuğu ⬜

**Amaç:** Roma seçilince MapLibre haritasının soluk altlıkla açılması; harita
üzerinde şehir çubuğu (künyenin kısa hali).

Yapılacaklar:
- MapLibre GL JS entegrasyonu (yerel kopya, CDN'e bağımlı kalma)
- Soluk/gri altlık stili (açık ve koyu varyant), `docs/TASARIM.md` kurallarına göre
- `data/roma/city.json` manifesti: merkez, zoom sınırları, `timezone`, `currency`,
  `language`, katman listesi
- **Şehir çubuğu** (haritanın sol üstünde yüzen çip): şehir adı · tarih ·
  **yerel saat (canlı, timezone'dan)** · hava simgesi. Harita ekranın en az
  %70'ini kaplar; panel dardır
- Katman paneli iskeleti: 4 grup başlığı (Varış/Omurga/Keşfet/Yaşam), boş anahtarlar
- **"Konumum" butonu:** Geolocation API ile kullanıcının yerini haritada gösterir
  (`docs/VERI.md` → Konum bölümü; konum cihazda kalır, gönderilmez)

Bitti sayılır:
- [ ] Roma haritası iki temada da soluk altlıkla açılıyor
- [ ] Şehir çubuğunda Roma yerel saati canlı işliyor (tarih iki dilde doğru)
- [ ] Panel mobilde alt çekmece, masaüstünde yan panel; harita alanı baskın
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
- **Hat harf rozetleri:** A/B/C harfleri hattın kendi renginde dolu daire rozet
  olarak hat üzerinde görünür (`docs/TASARIM.md` → Hat rozetleri)
- Katman aç/kapa mantığı; açılış varsayılanı: Varış+Omurga açık
- Hat renkleri: `docs/TASARIM.md` "metro renkleri" (soluklaştırılmış A/B/C)

Bitti sayılır:
- [ ] Varsayılan açılışta kapılar+omurga+rozetler görünüyor, panelden aç/kapa çalışıyor
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

## E5 — Yaşam katmanları + araç kiralama ⬜

**Amaç:** Otel, konut, alt merkez, öğrenci bölgeleri + araç kiralama noktaları.

Yapılacaklar:
- `yasam-otel.geojson`, `yasam-konut.geojson`, `yasam-altmerkez.geojson`,
  `yasam-ogrenci.geojson`
- `yasam-kiralama.geojson`: araç kiralama yoğunluğu (havaalanları, Termini
  çevresi, şehir ofisleri) — "araç nereden kiralarım?" sorusunun cevabı
- Alt merkez ↔ merkez ana aks çizgileri
- Alan katmanları için ortak stil (soluk dolgu + kısa etiket)

Bitti sayılır:
- [ ] Beş katman da panelden yönetiliyor ve okunaklı
- [ ] Bölgeleme kullanıcı onayından geçti

Durum notu: —

---

## E6 — Şehir künyesi ve canlı veriler ⬜

**Amaç:** Şehir çubuğuna tıklayınca açılan künye kartı: pratik bilgiler.

Yapılacaklar:
- **Hava durumu:** Open-Meteo API (ücretsiz, anahtarsız) — anlık + 5 günlük tahmin;
  hata/çevrimdışı durumunda künye hava bölümü sessizce gizlenir
- **Döviz:** Frankfurter API (ücretsiz, anahtarsız) — şehir para birimi ↔ USD/EUR;
  hata durumunda son bilinen kur `localStorage`'dan gösterilir ("~" işaretiyle)
- **Künye kartı içeriği:** konuşulan dil · para birimi + dolar karşılığı ·
  temel fiyat tablosu (`city.json`'dan: 1L su, 1L benzin, 1L süt, 1kg et,
  1kg peynir, kutu bira, Big Mac) + fiyatların güncelleme tarihi
- Şehir çubuğundaki hava simgesi canlı veriye bağlanır

Bitti sayılır:
- [ ] Künye kartı iki dilde ve iki temada düzgün; API kesintisi uygulamayı bozmuyor
- [ ] Fiyat tablosu tarihiyle birlikte görünüyor

Durum notu: —

---

## E7 — Bütçe seçici ⬜

**Amaç:** 1-2-3 yıldızlı isteğe bağlı bütçe filtresi (soru/sihirbaz DEĞİL).

Yapılacaklar:
- Panelde Yaşam grubunun başında yıldız seçici (★ ★★ ★★★); varsayılan: hepsi
- `budget` özelliği taşıyan POI/alanlar seçime göre süzülür:
  nerede kalırım, nerede/ne yerim, araç nereden kiralarım
- "Ne yerim?" içeriği: gastronomi POI'lerine bütçeye göre kısa yemek ipuçları
  (`tip` alanı; örn. ★ sokak lezzeti, ★★★ fine dining)
- Seçim `localStorage`'da tutulur

Bitti sayılır:
- [ ] Yıldız seçimi kal/ye/kirala katmanlarını görünür biçimde süzüyor
- [ ] Seçici hiçbir akışı bloklamıyor; varsayılanda her şey görünür

Durum notu: —

---

## E8 — Rehberli mod ⬜

**Amaç:** İsteğe bağlı "şehri tanıt" akışı.

Yapılacaklar:
- Panelde ayrı bir "şehri tanıt ▸" girişi (varsayılan kapalı, dayatma yok)
- Adım verisi `data/roma/content/{dil}.json`'dan: her adım = kamera hedefi +
  açılacak katmanlar + 1-2 cümle metin
- **Son adımlar künyeye bağlanır:** konuşulan dil, para birimi ve fiyat
  düzeyine kısa değinme + künye kartını açma bağlantısı
- İleri/geri/çık kontrolleri; çıkınca serbest moda dönüş

Bitti sayılır:
- [ ] 6-7 adımlık Roma tanıtımı iki dilde çalışıyor, her an çıkılabiliyor

Durum notu: —

---

## E9 — Cila ⬜

**Amaç:** Yayın öncesi kalite.

Yapılacaklar:
- i18n tamlık kontrolü (en+tr %100; diğer 4 dil dosyası iskelet olarak hazır)
- Mobil ince ayar, dokunma hedefleri, klavye erişilebilirliği, kontrast kontrolü
- Yazı azaltma turu: etikete gerek olmayan her yerde çizgisel simgeye geçiş
- Performans: GeoJSON boyutları, gecikmeli yükleme, Lighthouse hızlı geçişi

Bitti sayılır:
- [ ] Lighthouse: Performance ve Accessibility ≥ 90 (mobil)

Durum notu: —

---

## E10 — Yayın ⬜

**Amaç:** Canlıya çıkış.

Yapılacaklar:
- GitHub Pages ayarı + `CNAME` (layersofcity.com — alan adı alındı ✔)
- DNS yönergesi kullanıcıya kısa madde listesi olarak verilecek
- Çerezsiz analitik (Plausible veya Umami) script'i
- `README.md` (İngilizce, kısa tanıtım)

Bitti sayılır:
- [ ] Site layersofcity.com'da açılıyor, analitik veri düşüyor

Durum notu: —
