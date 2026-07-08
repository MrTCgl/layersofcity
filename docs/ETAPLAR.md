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
- **El yazısı logotip:** açılış ekranında büyük "layers of city" — **Ballet**
  fontu (OFL) `assets/fonts/` altına **yerel dosya** olarak eklenir (CDN yok);
  hafif eğik, "of" kelimesi lila (`docs/TASARIM.md` → Logotip)
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
  **yerel saat (canlı, timezone'dan)** · hava simgesi
- **Yüzen arayüz iskeleti** (`docs/TASARIM.md` → Ekran düzeni; panel YOK,
  harita tam ekran): Kapılar/Hatlar çipleri (sağ üst), şeffaf bütçe
  yıldızları (şehir çubuğu altı), Yaşam çekmecesi (sağ kenar),
  `Keşfet · İhtiyaç` alt barı ve yukarı açılan fonsuz ikon menüleri;
  sağ altta Konumum + Tur düğmeleri. Mobil ve masaüstü aynı düzen
- **"Konumum" butonu:** Geolocation API ile kullanıcının yerini haritada gösterir
  (`docs/VERI.md` → Konum bölümü; konum cihazda kalır, gönderilmez)

Bitti sayılır:
- [ ] Roma haritası iki temada da soluk altlıkla açılıyor
- [ ] Şehir çubuğunda Roma yerel saati canlı işliyor (tarih iki dilde doğru)
- [ ] Çekmece, alt bar ve çipler mobilde ve masaüstünde çalışıyor; harita tam ekran
- [ ] Konumum butonu mobilde çalışıyor (izin reddi de sessizce ele alınıyor)

Durum notu: —

---

## E3 — Varış + Omurga katmanları ⬜

**Amaç:** İlk gerçek içerik: girişler ve ulaşım omurgası.

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
- [ ] Varsayılan açılışta kapılar+hatlar+rozetler görünüyor, çiplerden aç/kapa çalışıyor
- [ ] İçerik `PROJE_PLANI.md` B bölümüyle uyumlu, kullanıcı onayından geçti

Durum notu: —

---

## E4 — Keşfet katmanları ⬜

**Amaç:** İlgi noktaları (tema filtreli) + gün içi yoğun bölgeler.

Yapılacaklar:
- `kesfet-poi.geojson`: tarihi/modern/doğa/gastronomi/alışveriş/sağlık etiketli POI'ler
- Alt bardaki Keşfet menüsüne tema **ikon çipleri** (fonsuz, çoklu seçim) + yoğunluk ikonu
- `kesfet-yogunluk.geojson`: yoğun bölge alanları (yumuşak dolgu, keskin sınır yok)
- **Yer kartı + yol tarifi:** POI'ye dokununca alt ortada yer kartı; "Yol tarifi"
  düğmesi Google Maps dış bağlantısını açar (anahtarsız URL; koordinat varsa
  `dir/?api=1&destination=lat,lng`)

Bitti sayılır:
- [ ] Filtreler çalışıyor; yoğunluk alanları iki temada okunaklı
- [ ] Yer kartı açılıyor, Yol tarifi Google Maps'te doğru yeri açıyor (mobilde test)
- [ ] POI seti kullanıcı onayından geçti

Durum notu: —

---

## E5 — Yaşam katmanları ⬜

**Amaç:** Bölge katmanları: oteller, konutlar, alt merkezler, öğrenciler.

Yapılacaklar:
- `yasam-otel.geojson`, `yasam-konut.geojson`, `yasam-altmerkez.geojson`,
  `yasam-ogrenci.geojson` — Yaşam grubu yalnızca **bölge** gösterir
- Alt merkez ↔ merkez ana aks çizgileri
- Alan katmanları için ortak stil (soluk dolgu + kısa etiket)
- Sağ kenar çekmecesindeki etiketler kısa: Oteller, Konutlar, Alt merkezler, Öğrenciler

Bitti sayılır:
- [ ] Dört katman da çekmeceden yönetiliyor ve okunaklı
- [ ] Bölgeleme kullanıcı onayından geçti

Durum notu: —

---

## E6 — İhtiyaçlar katmanı ⬜

**Amaç:** Pratik ihtiyaç noktaları — "araç nereden kiralarım, en yakın eczane?"

Yapılacaklar:
- `ihtiyac.geojson`: kategori (`theme`) etiketli noktalar — kiralık araç,
  market, müze, kütüphane, hastane, eczane, yakıt istasyonu
- Alt bardaki İhtiyaç menüsü: yukarı açılan **ikon çipleri** (fonsuz, Keşfet
  düzeniyle aynı); varsayılan hepsi kapalı, ikon açılınca o kategori görünür
- Kategoriler bütçe alanı taşıyabilir (örn. kiralık araç ofisleri)

Bitti sayılır:
- [ ] Kategori çipleri tek tek açılıp kapanıyor; simgeler çizgisel ve ayırt edilebilir
- [ ] Nokta seti kullanıcı onayından geçti

Durum notu: —

---

## E7 — Şehir künyesi ve canlı veriler ⬜

**Amaç:** Şehir çubuğuna tıklayınca açılan künye kartı: pratik bilgiler.

Yapılacaklar:
- **Hava durumu:** Open-Meteo API (ücretsiz, anahtarsız) — anlık + 5 günlük tahmin;
  hata/çevrimdışı durumunda künye hava bölümü sessizce gizlenir
- **Döviz:** Frankfurter API (ücretsiz, anahtarsız) — gösterim: **1 yerel birim =
  X USD** (örn. "1€ ≈ 1.09$"); hata durumunda son bilinen kur `localStorage`'dan
  gösterilir ("~" işaretiyle)
- **Künye kartı içeriği:** konuşulan dil · para birimi + dolar karşılığı ·
  temel fiyat tablosu (`city.json`'dan: 1L su, 1L benzin, 1L süt, 1kg et,
  1kg peynir, kutu bira, Big Mac) + fiyatların güncelleme tarihi
- Şehir çubuğundaki hava simgesi canlı veriye bağlanır

Bitti sayılır:
- [ ] Künye kartı iki dilde ve iki temada düzgün; API kesintisi uygulamayı bozmuyor
- [ ] Fiyat tablosu tarihiyle birlikte görünüyor

Durum notu: —

---

## E8 — Bütçe seçici (genel) ⬜

**Amaç:** 1-2-3 yıldızlı isteğe bağlı **genel** bütçe filtresi (soru/sihirbaz DEĞİL).

Yapılacaklar:
- Yıldızlar **şehir çubuğunun altında, tam şeffaf zeminde, etiketsiz** durur;
  tek bir seçim üç grubu birden süzer:
  **Keşfet + Yaşam + İhtiyaçlar**
- Mantık: ★=ekonomik, ★★=orta, ★★★=yüksek. Seçim yokken her şey görünür.
  `budget` etiketi taşıyan öğelerden yalnızca seçilen düzeye uyanlar kalır;
  etiketi olmayan öğeler her seçimde görünür
- Cevapladığı sorular: nerede kalırım, nerede/ne yerim, araç nereden kiralarım
- "Ne yerim?" içeriği: gastronomi POI'lerine bütçeye göre kısa yemek ipuçları
  (`tip` alanı; örn. ★ sokak lezzeti, ★★★ fine dining)
- Seçim `localStorage`'da tutulur

Bitti sayılır:
- [ ] Yıldız seçimi üç grubu da görünür biçimde süzüyor
- [ ] Seçici hiçbir akışı bloklamıyor; varsayılanda her şey görünür

Durum notu: —

---

## E9 — Rehberli mod ⬜

**Amaç:** İsteğe bağlı "şehri tanıt" akışı.

Yapılacaklar:
- Sağ alttaki yuvarlak **Tur** düğmesi (Konumum altında) rehberli modu
  başlatır (varsayılan kapalı, dayatma yok)
- Adım verisi `data/roma/content/{dil}.json`'dan: her adım = kamera hedefi +
  açılacak katmanlar + 1-2 cümle metin
- **Son adımlar künyeye bağlanır:** konuşulan dil, para birimi ve fiyat
  düzeyine kısa değinme + künye kartını açma bağlantısı
- İleri/geri/çık kontrolleri; çıkınca serbest moda dönüş

Bitti sayılır:
- [ ] 6-7 adımlık Roma tanıtımı iki dilde çalışıyor, her an çıkılabiliyor

Durum notu: —

---

## E10 — Cila ⬜

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

## E11 — Yayın ⬜

**Amaç:** Canlıya çıkış.

Yapılacaklar:
- GitHub Pages ayarı + `CNAME` (layersofcity.com — alan adı alındı ✔)
- DNS yönergesi kullanıcıya kısa madde listesi olarak verilecek
- Çerezsiz analitik (Plausible veya Umami) script'i
- `README.md` (İngilizce, kısa tanıtım)

Bitti sayılır:
- [ ] Site layersofcity.com'da açılıyor, analitik veri düşüyor

Durum notu: —
