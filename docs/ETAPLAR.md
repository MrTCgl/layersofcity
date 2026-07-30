# Kodlama Etapları

Her etap, limitli tek bir oturumda bitirilebilecek boyutta tasarlandı.
Kurallar `CLAUDE.md` → "Çalışma disiplini" bölümünde.

Durum işaretleri: ⬜ başlanmadı · 🔵 devam ediyor · ✅ tamam

---

## E1 — İskelet ve açılış ekranı ✅ tamam (2026-07-08)

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
- [x] İki temada ve iki dilde açılış ekranı sorunsuz
- [x] Mobil genişlikte (375px) düzgün görünüm
- [x] Şehre tıklayınca boş bir şehir ekranına rota değişiyor, logo geri döndürüyor

Durum notu: E1 tamam; tarayıcı testleri (2 tema × 2 dil × masaüstü/mobil,
rota + localStorage kalıcılığı) hatasız geçti. Sıradaki: E2.

---

## E2 — Şehir ekranı, harita altlığı ve şehir çubuğu ✅ tamam (2026-07-08)

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
  harita tam ekran): Kapılar/Hatlar çipleri (üst orta), şeffaf bütçe
  yıldızları (şehir çubuğu altı), Yaşam çekmecesi (sağ kenar),
  `Keşfet · İhtiyaç` alt barı ve yukarı açılan fonsuz ikon menüleri;
  sağ altta zoom kontrolleri (+/−/⌂) + Konumum + Tur düğmeleri.
  Mobil ve masaüstü aynı düzen
- **Harita zoom/pan:** çift tıklama o noktaya yaklaştırır; +/− kademeli
  zoom; ⌂ (home) tüm şehri getirir; **pan pedi** (4 yön oku) haritayı kaydırır.
  Zoom ve pan sınırlanır (clamp)
- **"Konumum" butonu:** Geolocation API ile kullanıcının yerini haritada gösterir
  (`docs/VERI.md` → Konum bölümü; konum cihazda kalır, gönderilmez)

Bitti sayılır:
- [x] Roma haritası iki temada da soluk altlıkla açılıyor
- [x] Şehir çubuğunda Roma yerel saati canlı işliyor (tarih iki dilde doğru)
- [x] Çekmece, alt bar ve çipler mobilde ve masaüstünde çalışıyor; harita tam ekran
- [x] Zoom + pan kontrolleri ve çift-tıkla-yaklaş çalışıyor; home tümünü getiriyor
- [x] Konumum butonu çalışıyor (sahte GPS ile şehir içi/dışı test edildi;
      izin reddi sessiz)

Durum notu: E2 tamam. Karo servisi: OpenFreeMap (anahtarsız; CLAUDE.md kapalı
listesine eklendi). Tur düğmesi bilinçli olarak E9'a bırakıldı (ölü UI
koymamak için). Kapılar/Hatlar/keşfet/ihtiyaç çipleri durum tutuyor; harita
katmanlarına bağlanmaları E3-E6'da.

---

## E3 — Varış + Omurga katmanları ✅ tamam (2026-07-09)

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
- [x] Varsayılan açılışta kapılar+hatlar+rozetler görünüyor, çiplerden aç/kapa çalışıyor
- [x] İçerik `PROJE_PLANI.md` B bölümüyle uyumlu, kullanıcı onayından geçti
      (docs/ICERIK_ROMA.md onaylı)

Durum notu: E3 tamam. Gerçek koordinatlı GeoJSON (varis + omurga) MapLibre
üstünde çiziliyor; Metro A/B/B1/C + tram 8/3, A/B/C harf rozetleri, Termini
merkezi + tarihi merkez halkası, FCO/CIA/Termini/Tiburtina kapıları +
havaalanı bağlantı çizgileri. Kapılar/Hatlar çipleri grup görünürlüğünü
yönetiyor. Tema değişiminde katmanlar yeniden ekleniyor (setStyle sonrası
'idle'). Manifest'e `available` alanı eklendi (hazır olmayan katmanlar
çekilmiyor → temiz konsol). İki tema × iki dil × mobil test edildi.

Ek (2026-07-09, kullanıcı isteği): omurga OSM Overpass'tan gerçek geometrilerle
yeniden üretildi — Metro A/B/B1/C + Metromare, 6 tramvay hattı (2/3/5/8/14/19),
4 kilit otobüs hattı (64/40/714/23); 77 istasyon + 171 tram/otobüs durağı
(z12.5+'ta görünür), 4 aktarma merkezi (Termini, San Giovanni, Colosseo,
Piramide). Tüm istasyon/durak/kapılar tıklanabilir → yer kartı → Google Maps.
Altlığa poi-landmark/poi-minor etiket katmanları eklendi (z14+/z16+).

---

## E4 — Keşfet katmanları ✅ tamam (2026-07-09)

**Amaç:** İlgi noktaları (tema filtreli) + gün içi yoğun bölgeler.

Yapılacaklar:
- `kesfet-poi.geojson`: tarihi/modern/doğa/gastronomi/alışveriş/sağlık etiketli POI'ler
- Alt bardaki Keşfet menüsüne tema **ikon çipleri** (fonsuz, çoklu seçim) + yoğunluk ikonu
- `kesfet-yogunluk.geojson`: yoğun bölge alanları (yumuşak dolgu, keskin sınır yok)
- **Yer kartı + yol tarifi:** POI'ye dokununca alt ortada yer kartı; "Yol tarifi"
  düğmesi Google Maps dış bağlantısını açar (anahtarsız URL; koordinat varsa
  `dir/?api=1&destination=lat,lng`)

Bitti sayılır:
- [x] Filtreler çalışıyor; yoğunluk alanları iki temada okunaklı
- [x] Yer kartı açılıyor, Yol tarifi Google Maps'te doğru yeri açıyor (mobilde test)
- [x] POI seti kullanıcı onayından geçti (docs/ICERIK_ROMA.md §3, 2026-07-08 onaylı)

Durum notu: E4 tamam. 37 POI (6 tema) + 5 yoğun bölge yıkaması `kesfet-poi` /
`kesfet-yogunluk` GeoJSON'a işlendi. Keşfet alt-bar ikonları POI'leri temaya göre
süzüyor (çoklu seçim; hiçbiri seçili değilken POI yok), yoğunluk ikonu bölge
yıkamasını açıyor. POI'ye tıkla → alt orta yer kartı → "Yol tarifi" anahtarsız
Google Maps URL'iyle dış bağlantı. Katman derinliği sabitlendi (yıkama en altta,
POI en üstte; katmanlar fetch sırasına göre eklendiğinden moveLayer ile pinlendi).
Kesfet grubu grup aç/kapa mekanizmasından ayrı yönetiliyor (applyKesfetVisibility).
İki tema × mobil (375px) doğrulandı; POI render + gerçek tık → yer kartı Playwright
ile teyit edildi (sandbox'ta karo/glyph ağı kapalı olduğundan altlık stub'landı).

Ek (2026-07-10, kullanıcı isteği): Keşfet şehir geneline genişletildi — OSM
Overpass + kalite vekili (wikipedia/wikidata kayıtlı yerler; ünlü restoran/
kafe/dondurmacılarda wiki zorunlu, pazarlar/AVM'ler adlı) + ızgara seyreltme.
37 editoryal nokta korunarak 266 nokta: tarihi 107 (Wikipedia kayıtlı kilise/
anıt/ören), modern 29, doğa 45 (adlı park/bahçe + manzara), gastronomi 51
(ünlü mekân + gıda pazarları), alışveriş 30, sağlık 4 (editoryal).

---

## E5 — Yaşam katmanları ✅ tamam (2026-07-09)

**Amaç:** Bölge katmanları: oteller, konutlar, alt merkezler, öğrenciler.

Yapılacaklar:
- `yasam-otel.geojson`, `yasam-konut.geojson`, `yasam-altmerkez.geojson`,
  `yasam-ogrenci.geojson` — Yaşam grubu yalnızca **bölge** gösterir
- Alt merkez ↔ merkez ana aks çizgileri
- Alan katmanları için ortak stil (soluk dolgu + kısa etiket)
- Sağ kenar çekmecesindeki etiketler kısa: Oteller, Konutlar, Alt merkezler, Öğrenciler

Bitti sayılır:
- [x] Dört katman da çekmeceden yönetiliyor ve okunaklı
- [x] Bölgeleme kullanıcı onayından geçti (bölge seti ICERIK_ROMA.md §4,
      2026-07-08 onaylı; poligonlar gerçek mahalle koordinatlarıyla çizildi,
      canlıda kullanıcı konum doğrulaması bekliyor)

Durum notu (GÜNCELLENDİ 2026-07-10): Yaşam bölümü kullanıcı kararıyla
**Bölgeler**e dönüştü (bolge-turistik/ticari/egitim/dogal, OSM poligonları,
tür başına renk; yasam-* dosyaları silindi). Ayrıntı: docs/TODO.md T7.
Eski not: E5 tamam. yasam-otel (6 bölge, bütçe etiketli), yasam-konut (10),
yasam-altmerkez (6 + Termini'ye kesikli aks çizgileri), yasam-ogrenci (5, Tor
Vergata dahil) GeoJSON'a işlendi (kind:"district" poligon + "district-label"
nokta; altmerkez'de kind:"axis"). Soluk lila dolgu + ince kenar + ad etiketi;
dolgular en alta pinlendi (metro/POI üstte). Sağ çekmece çipleri her katmanı
BAĞIMSIZ açıp kapatıyor (yasamState + applyYasamVisibility; applyGroupVisibility
yasam grubunu atlıyor). Bütçe alanı otel/parioli'de saklı (E8 filtresi için).
Varlık sürümü v=20260709-4. İki tema × mobil doğrulaması sonraki oturumda.

Ek (2026-07-10, kullanıcı isteği): bölgeler gerçek OSM rione/quartiere
sınırlarına taşındı (place=quarter/suburb relation'ları; 27 bölgeden 24'ü
gerçek sınır, Garbatella/San Lorenzo/Tor Vergata OSM'de sınırsız -> el çizimi
kaldı). Centro Storico = 8 tarihî rione birleşimi (MultiPolygon). Her bölge
kendine özgü soluk renkte (DISTRICT_COLORS, katmanlar arası tutarlı:
Trastevere her katmanda aynı yeşil).

---

## E6 — İhtiyaçlar katmanı ✅ tamam (2026-07-09)

**Amaç:** Pratik ihtiyaç noktaları — "araç nereden kiralarım, en yakın eczane?"

Yapılacaklar:
- `ihtiyac.geojson`: kategori (`theme`) etiketli noktalar — kiralık araç,
  market, müze, kütüphane, hastane, eczane, yakıt istasyonu
- Alt bardaki İhtiyaç menüsü: yukarı açılan **ikon çipleri** (fonsuz, Keşfet
  düzeniyle aynı); varsayılan hepsi kapalı, ikon açılınca o kategori görünür
- Kategoriler bütçe alanı taşıyabilir (örn. kiralık araç ofisleri)

Bitti sayılır:
- [x] Kategori çipleri tek tek açılıp kapanıyor; simgeler çizgisel ve ayırt edilebilir
- [x] Nokta seti kullanıcı onayından geçti (kullanıcı isteği: şehir geneli +
      kalite filtresi; Google puanı anahtarlı/ücretli olduğundan kalite vekili
      OSM adlı/markalı/Wikipedia-kayıtlı yerler + ızgara seyreltme)

Durum notu: E6 tamam. ihtiyac.geojson OSM Overpass'tan şehir geneli üretildi:
2423 ham nokta -> adlı/markalı önceliği (wikipedia/wikidata > brand > name) +
~1km ızgara seyreltme + kategori tavanı = 354 nokta (eczane 70, market 70,
yakıt 45, hastane 45, müze 60, kütüphane 35, kiralık araç 29). Renk tonu
sistemi: Keşfet = lila tonları, İhtiyaç = kiremit tonları (THEME_COLORS,
poiColorExpr; basılı çipler de kendi tonunu alır). İhtiyaç çipleri bağımsız
aç/kapa (ihState + applyIhtiyacVisibility), noktalar tıklanabilir -> yer kartı
-> Google Haritalar. Bütçe alanı bu sette yok (puan verisi yok); E8 bütçe
filtresi Keşfet/Yaşam üzerinden çalışacak.

---

## E7 — Şehir künyesi ve canlı veriler ✅ tamam (2026-07-09)

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
- [x] Künye kartı iki dilde ve iki temada düzgün; API kesintisi uygulamayı bozmuyor
- [x] Fiyat tablosu tarihiyle birlikte görünüyor

Durum notu: E7 tamam. Şehir çubuğuna tıklayınca künye kartı: dil, para birimi +
canlı €→USD (Frankfurter, api.frankfurter.dev), editoryal fiyat tablosu +
güncelleme tarihi, ve Open-Meteo ile anlık + 5 günlük hava (soluk çizgi-simge,
WMO kod eşlemesi). Şehir çubuğunda anlık hava simgesi+derece. Veri gelmezse
ilgili bölüm sessizce gizleniyor (fetch best-effort, loadLiveData enterCity'de).
Küçük kalan iyileştirme: döviz kesintisinde son kuru localStorage'dan "~" ile
gösterme (şimdilik sessizce gizleniyor). Not: sandbox'ta dış API'lere Playwright
chromium çıkamadığından render mock veriyle doğrulandı; API'ler curl/proxy ile
erişilebilir, canlı tarayıcıda çalışır.

---

## E8 — Bütçe seçici (genel) ❌ iptal (2026-07-10, kullanıcı kararı)

> Yıldız UI ve filtre fikri kaldırıldı; verilerdeki `budget` alanları zararsız
> şekilde duruyor. Gerekirse ileride yeniden değerlendirilir.

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

## Kayıtlı noktalar (kullanıcı isteği) ✅ tamam (2026-07-12)

**Amaç:** Kullanıcı haritada beğendiği noktaları kısa bir notla kaydedebilsin;
sonra hem harita üzerinde hem de liste olarak görsün. Tamamen **cihazda**
(localStorage), sunucu/üyelik yok — "tercihler cihazda kalır, gönderilmez"
ilkesiyle uyumlu.

Yapıldı:
- **Yer kartına kalem ikonu:** POI/durak/uzun-basma ile açılan yer kartında
  Google Haritalar düğmesinin yanında "not ekle" kalemi. Kayıtlı bir noktada
  kalem dolu (peach) görünür.
- **Not editörü:** kalem → küçük ortalanmış diyalog (metin alanı + Kaydet +
  Vazgeç; kayıtlıysa Sil). Kaydedince nokta + not `loc-bm-<sehir>` altına
  yazılır, kart kapanır, kayıt yıldız işaretiyle haritada belirir.
- **İki ayrı komut** (sağ alt altlık menüsünde, Yaya & araç altında):
  **Kayıtlılar** = yıldız katmanını göster/gizle; **Kayıtlılar listesi** =
  o şehrin tüm kayıtlarını alt-sayfa olarak açar (satıra tıkla → uç + not
  popup'ı; satırda sil). Liste her seferinde açılmaz, yalnız komutla.
- **Not popup'ı:** haritadaki yıldıza tıklayınca not küçük popup'ta görünür.
- **Admin görünürlüğü:** kullanıcı kararıyla **A (saf yerel)** — kayıtlar
  cihazda kalır, merkezî toplama yok. İleride istenirse dışa aktarım/rıza ile
  ayrı değerlendirilir.

Bitti sayılır:
- [x] Kaydet/düzenle/sil, katman aç-kapa, liste, not popup'ı iki temada ve
      375–390px mobilde çalışıyor (Playwright ile 26 kontrol, light+dark,
      0 hata).
- [x] Şehir başına ayrı anahtar (`loc-bm-roma`, `loc-bm-istanbul`); şehir
      değişince durum sıfırlanıyor.

Durum notu: Tamam. Yıldız işareti icon-only symbol (canvas görsel, glyph
bağımsız) olduğundan sandbox'ta karo/glyph ağı kapalıyken de render edildi.

Uzun-basma düzeltmesi (2026-07-12, inceleme sonucu): Var olan bir hata bulundu —
uzun-basma oturum başına **yalnız bir kez** çalışıyordu. Sebep: uzun-basmada
bırakılan koordinat iğnesi (`.coord-pin` maplibregl.Marker) tam parmağın altına
düşüyor; parmak kalkınca `pointerup` iğneye gidiyor (canvas'a değil), böylece
çoklu-dokunuş sayacı (`lpPointers`) 1'de takılıp sonraki tüm uzun-basmaları
iptal ediyordu; ayrıca iğne bir sonraki `pointerdown`'ı da yiyordu. Çözüm:
(1) `.coord-pin`'e `pointer-events:none` (dekoratif iğne girdi yakalamamalı),
(2) `pointerup`/`pointercancel` sıfırlaması canvas yerine `window`'da
dinleniyor (parmak nereye kalkarsa kalksın sayaç çözülür). Playwright ile
tekrarlı uzun-basma (aynı nokta, pan sonrası, z15) light+dark 12 kontrol geçti;
kayıtlı-nokta akışı 26 kontrolle regresyonsuz.

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

## E10 — Cila 🔵 devam ediyor

**Amaç:** Yayın öncesi kalite.

Yapılacaklar:
- i18n tamlık kontrolü (arayüz 6 dilde %100: en, tr, de, fr, it, es — 95 anahtar;
  şehir içerikleri hâlâ en+tr, diğerleri en/tr'ye fallback)
- Mobil ince ayar, dokunma hedefleri, klavye erişilebilirliği, kontrast kontrolü
- Yazı azaltma turu: etikete gerek olmayan her yerde çizgisel simgeye geçiş
- Performans: GeoJSON boyutları, gecikmeli yükleme, Lighthouse hızlı geçişi

Bitti sayılır:
- [ ] Lighthouse: Performance ve Accessibility ≥ 90 (mobil)

Durum notu (2026-07-19): Arayüz i18n zaten 6 dilde %100 (101 anahtar, 0 eksik/
boş — doğrulandı). **Şehir içerikleri artık 6 dilde tam:** 9 şehrin en.json'ı
temel alınıp de/fr/it/es üretildi (varış/hub alt-başlıkları; özel isimler —
hat/servis/istasyon adları, "Metro-North", "City West", "Staten Island Ferry"
— korundu). Sözlük tabanlı üretici + kalan-İngilizce taraması kullanıldı;
anahtar paritesi 6 dilde eşit. Kalan (tarayıcı gerektiriyor, bu ortamda harita
karoları engelli olduğundan çalıştırılamadı): mobil ince ayar/dokunma hedefleri,
kontrast ve Lighthouse ≥90 ölçümü — kullanıcının tarayıcısında yapılacak.

---

## E11 — Yayın 🔵 devam ediyor

**Amaç:** Canlıya çıkış.

Yapılacaklar:
- GitHub Pages ayarı + `CNAME` (layersofcity.com — alan adı alındı ✔)
- DNS yönergesi kullanıcıya kısa madde listesi olarak verilecek
- Çerezsiz analitik (Plausible veya Umami) script'i
- `README.md` (İngilizce, kısa tanıtım)

Bitti sayılır:
- [ ] Site layersofcity.com'da açılıyor, analitik veri düşüyor

Durum notu (2026-07-19): Site zaten layersofcity.com'da canlı (GitHub Pages +
CNAME) ✔. **`README.md` yazıldı** (İngilizce, kısa tanıtım). **Çerezsiz analitik
opt-in olarak eklendi:** index.html sonunda küçük yükleyici — `umamiId` (Umami
ücretsiz) ya da `plausibleDomain` doldurulunca script yüklenir; ikisi de boşken
hiçbir harici istek gitmez, çerez yok. Kalan tek adım kullanıcıda: ücretsiz
Umami hesabı açıp website id'yi (ya da Plausible alan adını) yapıştırmak — o
zaman "analitik veri düşüyor" kriteri tamamlanır.

---

## Geliştirme Turu (2026-07-10) ✅ tamam

docs/TODO.md'deki onaylı 10 madde uygulandı: zoom yığını Home altında,
3 altlık modu (+OSM notları/GPS izleri), koordinat kutusu, koyu rota çizgileri,
kapı simgeleri (uçak/tren/otobüs), Keşfet revizyonu (sağlık/yoğunluk çıktı;
oteller/yurtlar/kamu şehir geneli girdi; bottombar renklenmesi), Bölgeler
çekmecesi, bütçe iptali, dil seçici menüsü, doküman güncellemeleri.
E10 için dil menüsü altyapısı hazır (DE/FR/IT/ES disabled bekliyor).

---

## İkinci şehir — İstanbul ✅ tamam (2026-07-11)

**Amaç:** Roma modelini ikinci bir şehirle doğrulamak; `yeni-sehir` akışıyla,
kod değişmeden (tek genel dokunuş dışında) şehir geneline yayılı çok noktalı
İstanbul. Kullanıcı isteği: "Roma gibi, çok sayıda nokta, şehir geneli."

Yapıldı (hepsi OSM Overpass boru hattı — `docs/VERI.md`):
- **Omurga (120KB):** 21 hat gerçek renkleriyle — M1A/M1B/M2/M3/M4/M5/M6/M7/M8/
  M9/M11, Marmaray, T1/T3/T4/T5, F1-F4 füniküler, Metrobüs; 210 metro/Marmaray
  istasyonu (kind:node), 136 tramvay durağı (kind:stop), 21 hat rozeti, 7
  aktarma merkezi (Yenikapı, Üsküdar, Ayrılık Çeşmesi, Mecidiyeköy, Gayrettepe,
  Sirkeci, Taksim). DP ~40m sadeleştirme.
- **Keşfet (450 nokta, 82KB):** tarihi 130 / modern 30 / doğa 60 / gastronomi
  70 / alışveriş 40 / otel 55 / yurt 25 / kamu 40. Kalite vekili
  (wikipedia/wikidata > marka > adlı) + ~1km ızgara seyreltme.
- **İhtiyaç (355 nokta, 63KB):** eczane 70 / market 70 / yakıt 45 / kiralık
  araç 30 / kütüphane 35 / müze 60 / hastane 45. Aynı vekil + seyreltme.
- **Bölgeler:** ticari 45 (landuse=commercial/retail >0.04km²), eğitim 30
  (amenity=university), doğal 40 (adlı park/orman >0.15km²) — mekanik; turistik
  10 (Sultanahmet, Beyoğlu, Galata, Beşiktaş-Ortaköy, Balat-Fener, Eyüpsultan,
  Bebek-Boğaz, Üsküdar, Kadıköy-Moda, Eminönü-Kapalıçarşı) — kaba oryantasyon
  zonları, el çizimi.
- **Varış (14):** IST + SAW (uçak), Halkalı + Söğütlüçeşme (Marmaray/YHT),
  Esenler Otogarı (otobüs), 5 Boğaz vapur iskelesi (mode:ship); 4 bağlantı
  çizgisi merkeze.
- **Manifest:** center [28.98,41.03], home/maxBounds iki kıtayı + IST/SAW +
  Marmaray Halkalı↔Gebze'yi kapsar; timezone Europe/Istanbul, currency TRY,
  editoryal fiyat tablosu (2026-07, yaklaşık). cities.json → `ready`.
- **i18n:** `arr.*` (kapı ipuçları) + `hub.*` (aktarma altyazıları) tr+en.

**Tek kod dokunuşu (kullanıcı onaylı, genel):** hat/istasyon rengi artık
veriden okunuyor — feature'da `color` alanı varsa (OSM `colour` etiketinden)
o kullanılır, yoksa Roma'nın lineRef paletine düşer (`lineColorExpr`). Çok
hatlı şehirler her hattı kendi resmi renginde gösterir; gelecek şehirler için
de geçerli, çok-şehir güvenli.

Bitti sayılır:
- [x] İstanbul dünya ekranından açılıyor, harita iki kıtayı getiriyor
- [x] Tüm katmanlar (395 omurga + 450 keşfet + 355 ihtiyaç + 4 bölge + varış)
      hatasız kuruluyor; headless doğrulamada 176 lyr-* katman, 0 stil/ifade
      hatası; `lyr-omurga-line` renk ifadesi veriden-renk `case` olarak bağlı
- [x] Dosya başına < 200KB (en büyük omurga 120KB)

Düzeltme (2026-07-11, canlı mobil geri bildirimi): (A) `applyGroupVisibility`
omurga'yı da yönetiyordu (groupState.omurga hep true) → "Girişler"e dokununca
kapatılan omurga geri geliyordu; artık omurga bu fonksiyondan muaf (görünürlüğü
yalnız `applyTransitFilter` yönetir). Roma'da da olan gizli hata. (B) metro
hatlarının generic `lineRef:"metro"` değeri `TRANSIT_REFS.metro`'da yoktu →
metro çizgileri süzülüp gizleniyordu; listeye "metro" eklendi (çok-şehir
güvenli). (C) istasyon/durak/rozetlere en yakın hattın rengi + `lineRef` sınıfı
atandı (Roma gibi renkli istasyonlar + alt-tür süzmesi çalışır).

Durum notu: İkinci şehir tamam. walkability.geojson İstanbul için üretilmedi
(Roma'ya özel; yaya altlık düğmesi veri gelmeyince sessizce boş kalıyor —
graceful). Sandbox'ta karo/glyph ağı kapalı olduğundan render mock/stub ile
doğrulandı (E7'deki gibi); canlı tarayıcıda karolar yüklenir.

---

## Bakım oturumu — gerçekçilik + altlık + açılış ekranı (2026-07-14) ✅ tamam

Kullanıcı istekleri toplu işlendi:

- **Hat gerçekçiliği:** İstanbul'un tüm metro (M1A-M11), tramvay (T1-T5),
  füniküler (F1-F4) ve Marmaray geometrileri Overpass'tan gerçek OSM
  güzergâhlarıyla yenilendi; Paris metro (1-14, 3bis/7bis) + RER A-E aynı
  şekilde. Roma tram 3/19'daki 2.7 km'lik stilize düz segment düzeltildi.
- **Varış link'leri:** düz çizgi kalmadı — her link gerçek raylı hattı izler
  (IST→M11, SAW→M4, Halkalı/Söğütlüçeşme→Marmaray, CDG→RER B). `gate-halkali`
  gerçek istasyon konumuna taşındı (2.5 km kayıktı).
- **Bölge sınırları:** İstanbul turistik bölgeleri (10 kutu) ve Paris Le Marais
  (üçgen) OSM mahalle/quartier idari sınırlarından yeniden üretildi; Paris'in
  nokta kalmış 7 turistik bölgesi poligona çevrildi.
- **Altlık:** "OSM Detaylı" artık resmi OSM **Shortbread** vektör karoları
  (`vector.openstreetmap.org`, anahtarsız; yerel stil
  `assets/basemap-shortbread.json`, glifler OpenFreeMap). Uydu aydınlatıldı
  (`brightness-min .14, contrast .05`). **zoom.max 19** (üç şehir).
- **Sade altlık yazı kademeleri:** ilçe (z10) → mahalle (z12.5) → ana yol
  (z13) / tüm sokaklar (z15) → bina/mekân adları (z16.5); simge yok.
- **GPS izleri:** altlık menüsünde şeffaflık kaydırıcısı (%10-100, localStorage).
- **Açılış ekranı:** wordmark'ta "layers"+"city" yavruağzı; altta ortada ince,
  harf aralıklı `layersofcity@gmail.com`; sağ üstte ⓘ → şeffaf özellik popup'ı
  (`appinfo.l1..l6`, tr+en).
- **Doküman:** TASARIM/VERI/CLAUDE güncellendi; `yeni-sehir` skill'i Opus için
  eksiksiz adım adım üretim rehberine dönüştürüldü (gerçekçilik denetimi dahil).

Durum notu: Overpass anlık 504/429 verebiliyor; ayna uçlar eklendi
(kumi.systems, private.coffee). Yeni şehirde aynı boru hattı kullanılacak.

---

## Yeni şehir — Berlin ✅ tamam (2026-07-18)

`yeni-sehir` skill'iyle, OSM Overpass boru hattı kullanılarak eklendi.

- **Manifest:** merkez `[13.405, 52.52]`, `Europe/Berlin`, dil `de`, para `EUR`,
  zoom min 8.5 / max 19, maxBounds BER havalimanını kapsıyor. Fiyat tablosu
  editoryal (2026-07).
- **Varış:** 6 kapı — BER havalimanı (S9 ile Hbf'a link), Hauptbahnhof,
  Ostbahnhof, Südkreuz, Gesundbrunnen, ZOB. Linkler gerçek raylı hat
  geometrisinden `substring` ile (BER→S9, Süd→S2, ZOB→U2 …); düz çizgi yok,
  hepsi <1.5 km segment.
- **Omurga:** OSM'deki **tüm mevcut hatlar (46)** — U-Bahn U1–U9 (9), S-Bahn
  Stadtbahn+Ring (15; S45 OSM'de yok, BER sonrası kaldırılmış), tram M1–M17 +
  numaralı hatlar (22). Hepsi gerçek OSM geometrisi; hatların resmî rengi
  `color` alanında. Çift-yön izleri harita ölçeğinde üst üste biner.
  340 istasyon düğümü + ~500 tram durağı + 10 aktarma hub'ı.
- **Keşfet:** 1196 nokta (tarihi/modern/doğa/gastronomi/alışveriş/otel/yurt/
  kamu), ızgara seyreltmeli max yoğunluk; ikonik allowlist zorunlu eklendi.
- **İhtiyaçlar:** 645 nokta (eczane/market/yakıt/kiralık-araç/kütüphane/müze/
  hastane).
- **Bölgeler:** turistik 10 (Ortsteil idari sınırları: Mitte, Tiergarten,
  Charlottenburg, Kreuzberg, Friedrichshain, Prenzlauer Berg …), ticari 45,
  eğitim 10, doğal 69 (Tiergarten, Tempelhofer Feld, Grunewald, Görlitzer,
  Mauerpark ikonik allowlist'le elle eklendi).

Durum notu: Berlin S-Bahn OSM'de `route=light_rail` (subway/train değil) — pipeline
buna göre ayarlandı. Overpass o gün ağır 504/429 verdi; sorgular ayna rotasyonu
ve boş-cevap-cache'lememe düzeltmesiyle çekildi. `cities.json` → `ready`,
`BM_VER` = 20260718-17.

**Yayın/önbellek olayı ve düzeltme:** Berlin canlıya çıktı ama açılış ekranında
görünmedi. Neden: `BM_VER` artırıldı ama `index.html`'deki `app.js?v=` eski
kaldığından tarayıcı eski app.js'i (ve eski şehir listesini) önbellekten
servis etti; ayrıca `cities.json` cache-buster'sız çekiliyordu. Düzeltme:
`index.html` → `app.js?v=20260718-17`; `fetch("data/cities.json")` →
`?v=${BM_VER}`. Ders `yeni-sehir` skill'ine + `docs/VERI.md`'ye işlendi:
yeni şehir yayınında **BM_VER + index.html app.js sürümü birlikte** artırılır.
Yayın yolu: GitHub Pages, varsayılan daldan (`claude/rome-transit-map-app-*`)
`layersofcity.com`'a; şehir dalı varsayılana fast-forward push'lanır.

---

## Yeni şehir — Madrid ✅ tamam (2026-07-18)

`yeni-sehir` skill'iyle, Berlin boru hattı uyarlanarak eklendi (İspanyolca `es`
içeriği ilk kez bir şehirle temsil edildi → 6 dilin hepsi kapsandı).

- **Manifest:** merkez `[-3.703, 40.416]` (Puerta del Sol), `Europe/Madrid`,
  dil `es`, para `EUR`, zoom min 9 / max 19, maxBounds Barajas'ı kapsıyor.
- **Varış:** 4 kapı — MAD Barajas havalimanı (Metro L8 ile Nuevos Ministerios'a
  link), Atocha, Chamartín, Estación Sur (otobüs). Linkler gerçek hat
  geometrisinden `substring` ile; hepsi <1.6 km segment.
- **Omurga:** OSM'deki tüm hatlar (24) — Metro L1–L12 + R (subway), Metro
  Ligero ML1–ML3 (light_rail → tram), Cercanías C-1…C-10 (train; AVE/uzun
  mesafe hariç). Gerçek OSM geometrisi, resmî renkler. 236 metro + 31 Cercanías
  istasyonu + 34 ML durağı + 8 aktarma hub'ı.
- **Keşfet:** 1548 nokta (max yoğunluk; kullanıcı isteğiyle popüler yerler bol
  — wikidata/marka öncelikli). İkonik allowlist (Prado/Reina Sofía/Palacio
  Real/Bernabéu vb.).
- **İhtiyaçlar:** 775 nokta (7 kategori; kütüphane/müze dâhil).
- **Bölgeler:** turistik 10 (barrio idari sınırları: Sol, Palacio, Cortes,
  Malasaña/Universidad, Chueca/Justicia, Embajadores, Salamanca …), ticari 23,
  eğitim 6, doğal 48 (Retiro, Casa de Campo, Real Jardín Botánico, Madrid Río
  ikonik allowlist'le; Retiro OSM adı "Parque del Retiro").

Durum notu: Madrid metro ref'leri OSM'de `L1…L12` (subway), S-Bahn benzeri
Cercanías `route=train`, Metro Ligero `route=light_rail`; istasyon düğümleri
metro=`station=subway`, ML=`station=light_rail`, Cercanías=`network~Cercan`.
`cities.json` → `ready`; önbellek sürümleri **birlikte** artırıldı
(`BM_VER` + `index.html` app.js?v= = 20260718-18).

---

## Yeni şehir — London ✅ tamam (2026-07-18)

`yeni-sehir` skill'iyle, Madrid boru hattı uyarlanarak eklendi.

- **Manifest:** merkez `[-0.1276, 51.5074]`, `Europe/London`, dil `en`,
  para **GBP** (£; CURRENCY_SYM'de zaten var), zoom min 8.5 / max 19,
  maxBounds Heathrow'u kapsıyor.
- **Varış:** 6 kapı — Heathrow (Piccadilly ile merkeze link), St Pancras
  (Eurostar), Paddington, Waterloo, Liverpool Street, Victoria Coach Station.
  Linkler gerçek hat geometrisinden; kapıya en yakın parça seçilip merkeze
  doğru izlenir (parçalı Tube geometrisinde snap-jump'ı önlemek için).
- **Omurga:** OSM'deki 22 hat — Tube 11 (ref=hat adı: Bakerloo/Central/…/
  Waterloo & City), DLR (tüm light_rail birleşik), Elizabeth line (ref=ES),
  Overground 6 (Liberty/Lioness/Mildmay/Suffragette/Weaver/Windrush),
  Tramlink 3 (2/3/4). Gerçek OSM geometrisi, resmî renkler; badge'ler kısa
  kod (Bak/Cen/DLR/Eliz…). 265 Tube + 155 DLR/rail istasyonu + 39 tram
  durağı + 10 aktarma hub'ı.
- **Keşfet:** 1648 nokta (max yoğunluk; ikonik allowlist: Big Ben/Tower
  Bridge/British Museum/Tate Modern/London Eye/Shard vb.).
  **İhtiyaçlar:** 910 nokta (7 kategori). Toplam 2558 — en yüksek.
- **Bölgeler:** turistik 5 (idari birim: City of London, Westminster, Camden,
  Southwark, Kensington & Chelsea — London mahalleleri OSM'de
  `boundary=administrative` değil, sadece borough/City var), ticari 7,
  eğitim 3, doğal 17 (Hyde Park, Regent's Park, Greenwich, Richmond,
  Hampstead Heath, Kensington Gardens ikonik allowlist'le).

**Kalite artırımı (2026-07-19):** İnce bölge katmanları güçlendirildi.
turistik 5→11 (11 borough'luk toplu admin regex sorgusu; `_short()` "London
Borough of" önekini kırpar, "City of London" tam bırakılır ki "London" diye
görünmesin). eğitim 3→9: karışık/kampüs-sonekli otomatik alan taraması yerine
küratörlü **isimli üniversite** allowlist'i (kısa etiket: UCL/Imperial/LSE/
Queen Mary/SOAS/UAL/LBS/Greenwich Uni/Westminster Uni). Not: KCL/City/Birkbeck
o gün Overpass 504 verdiği için önbelleğe girmedi. **ticari isimli finans/ticaret
bölgeleri (Canary Wharf, Covent Garden, Broadgate…) Overpass tümüyle 504
olduğundan bu oturumda çekilemedi; ticari otomatik alan taramasında (7) kaldı —
Overpass düzelince tekrarlanacak.**

Durum notu: Tube hatları ref=hat adı (numara değil); DLR tek "DLR" hattı olarak
tüm light_rail birleştirildi; Elizabeth ref=ES. Overground yeni adlı hatlar
(Liberty/Suffragette…) ref ile çekildi. Overpass o gün çok ağır 504 verdi;
alan sorguları için merkez bbox küçültüldü, turistik için tek toplu admin
sorgusu (borough adları "London Borough of X"). `cities.json` → `ready`;
önbellek sürümleri birlikte artırıldı (BM_VER + index.html app.js?v= = 20260718-19).

---

## Yeni şehir — Barcelona ✅ tamam (2026-07-22)

`yeni-sehir` skill'iyle, Madrid/London boru hattı uyarlanarak eklendi
(kullanıcı "Barselona yapalım" kararıyla; es içeriği yeniden kullanıldı,
şehir dili `ca` = Katalanca).

- **Manifest:** merkez `[2.17, 41.39]`, `Europe/Madrid`, dil **`ca`**
  (yeni `lang.ca` i18n anahtarı 6 dile eklendi — künyede "Katalanca"),
  para EUR, zoom min 9 / max 19, maxBounds El Prat havalimanını kapsıyor.
  Fiyat tablosu editoryal (2026-07).
- **Varış (5 kapı):** BCN El Prat havalimanı (R2 Nord ile Sants'a link;
  graf en-kısa-yol, en uzun düz segment 314m), Barcelona-Sants (ana gar,
  AVE), Estació de França (bölgesel tren), Barcelona Nord (otobüs),
  Estació Marítima (vapur, `mode:ship`). Kapılar gerçek istasyon konumuna
  oturtuldu.
- **Omurga (25 hat, 136KB):** Metro L1–L12 (route=subway; L6/L7/L8/L12 FGC
  işletmesinde ama Metro de Barcelona ağı), Tram T1–T6 (Trambaix + Trambesòs),
  Rodalies R1/R2/R2N/R2S/R4/R7/R8 (Renfe banliyö = Madrid'deki Cercanías
  karşılığı; FGC S-hatları atlandı çünkü şehir-içi gövdeleri zaten metro
  L6/L7/L8/L12). Gerçek OSM geometrisi + resmî renkler; L9/L10 N-S dalları
  tek hat olarak birleşti. 189 metro/tren istasyonu + 56 tram durağı + 25 hat
  rozeti + 8 aktarma hub'ı (Catalunya, Sants, Passeig de Gràcia, Espanya,
  Diagonal, La Sagrera, Sagrada Família, Verdaguer). Gerçekçilik denetimi
  geçti (en uzun düz segment 1670m < 2km, yoğunluk >3.8 köşe/km).
- **Keşfet (499 nokta, 92KB):** tarihi 112 / modern 42 / doğa 91 /
  gastronomi 47 / alışveriş 53 / otel 43 / yurt 45 / kamu 66. Kalite vekili
  (wikidata > marka > adlı) + ~1km ızgara seyreltme. **İkonik allowlist
  zorunlu:** seyreltme Sagrada Família dışındaki 20 dünyaca ünlü simgeyi
  elemişti — Park Güell/Casa Batlló/Casa Milà/Casa Vicens/Catedral/Santa
  Maria del Mar-Pi/Palau de la Música/Arc de Triomf/Plaça Reial/Font Màgica/
  Poble Espanyol/Tibidabo/Bunkers del Carmel/Torre Glòries/MACBA/Museu
  Picasso/CosmoCaixa/Estadi Olímpic/Pavelló Mies OSM'den gerçek koordinatla
  elle eklendi (`docs/IKONIK_LANDMARKLAR.md` → Barcelona).
- **İhtiyaçlar (368 nokta, 68KB):** eczane 89 / market 84 / yakıt 60 /
  kütüphane 57 / müze 37 / hastane 27 / kiralık-araç 14.
- **Bölgeler:** turistik 10 (barrio idari sınırları admin_level=10: el Gòtic,
  el Raval, Sant Pere-Santa Caterina-la Ribera, la Barceloneta, el Poble-sec,
  la Dreta de l'Eixample, la Vila de Gràcia, el Poblenou, Sant Antoni, la
  Sagrada Família), ticari 8 (Zona Franca/Mercabarna/Fira/La Maquinista vb.),
  eğitim 12 (UB/UPC Nord-Sud/UPF Ciutadella/ESADE/La Salle vb.), doğal 48
  (Ciutadella, Montjuïc, Parc Güell, Laberint d'Horta, Joan Miró, Espanya
  Industrial, Barceloneta vb. — geniş park taraması + ikonik allowlist).

Durum notu: Barselona metro ref'leri OSM'de `L1…L12` (route=subway, network
"Metro de Barcelona"); FGC işletmeli L6/L7/L8/L12 de subway olarak etiketli.
Rodalies `route=train` network "Rodalies de Catalunya". **Rota ilişkileri
istasyon düğümü tutmadığından** (`node(r)` boş dönüyor) istasyonlar ayrı
çekilip en yakın hatta atandı (İstanbul düzeltmesindeki yöntem); isme göre
tekilleştirildi (412→189). R2 Nord Y-dallı olduğundan havalimanı link'i
graf en-kısa-yol + boşluk köprüleme (≤70m) ile üretildi. Overpass o gün ağır
504/timeout verdi (modern/doğa/kamu/kütüphane temaları + turistik el Gòtic/
Barceloneta + dogal ikinci turda çekildi); ayna failover 70s'ye düşürüldü.
`cities.json` → `ready`; önbellek sürümleri **birlikte** artırıldı
(`BM_VER` + `index.html` app.js?v= = 20260722-1).

---

## Yeni şehir — Amsterdam ✅ tamam (2026-07-22)

`yeni-sehir` skill'iyle, Barselona boru hattı (parametrik build_omurga/stations/
poi/bolgeler) uyarlanarak eklendi. Şehir dili **`nl`** (yeni `lang.nl` i18n
anahtarı 6 dile eklendi — künyede "Felemenkçe").

- **Manifest:** merkez `[4.90, 52.37]`, `Europe/Amsterdam`, para EUR, zoom
  min 8.5 / max 19, **geniş home** (tüm metropol ağı: Schiphol yönü ↔ Noord,
  Sloterdijk ↔ Zuidoost) — Barselona'daki "geniş görünüm" tercihi baştan
  uygulandı. maxBounds Schiphol'ü kapsıyor. Fiyat tablosu editoryal (2026-07).
- **Varış (4 kapı):** Schiphol Airport (Centraal'a gerçek NS güzergâhı; railway=
  rail graf en-kısa-yol + boşluk köprüleme, 16.2km, en uzun segment 351m),
  Amsterdam Centraal, Amsterdam Zuid, Sloterdijk (otobüs). Kapılar gerçek
  istasyona 3-4m'de oturdu.
- **Omurga (21 hat, 104KB):** Metro 50/51/52/53/54 (route=subway, GVB, resmî
  renkler) + tram 1/2/4/5/6/7/12/13/14/17/19/24/25/26/27/29 (GVB; tek muted
  GVB-mavi, rozet numara taşıyor). Tram 3 OSM'de yok (renumaralanmış → atlandı);
  müze hatları (20/EMA) hariç. Gerçek OSM geometrisi; 49 metro/tren istasyonu +
  188 tram durağı + 8 aktarma hub'ı (Centraal, Zuid, Sloterdijk, Amstel, Bijlmer
  ArenA, Weesperplein, Lelylaan, De Pijp). Gerçekçilik denetimi geçti (en uzun
  düz segment 1635m). **NS trenleri çizilmedi** — hepsi tren-numarası ref'li
  (8100/4600…), temiz "hat" değil; Amsterdam'ın hızlı ulaşımı metro+tram
  (Barselona'da FGC S-hatlarını atlama kararıyla aynı mantık). Schiphol
  bağlantısı varışta gerçek NS geometrisiyle veriliyor.
- **Keşfet (365 nokta, 63KB):** tarihi 87 / modern 50 / doğa 92 / gastronomi
  19 / alışveriş 35 / otel 36 / yurt 17 / kamu 29. **İkonik allowlist:**
  Rijksmuseum/Van Gogh/Stedelijk/Anne Frank Huis/Dam-Koninklijk Paleis/
  Westerkerk/Rembrandthuis/Magere Brug/NEMO/A'DAM Toren/Eye/Concertgebouw/
  Heineken/ARTIS/Hortus dahil 27 simge elle eklendi (`docs/IKONIK_LANDMARKLAR.md`
  → Amsterdam).
- **İhtiyaçlar (268 nokta, 46KB):** eczane 62 / market 79 / yakıt 38 /
  kütüphane 35 / müze 28 / kiralık-araç 21 / hastane 5 (merkez bbox'ta az).
- **Bölgeler:** turistik 10 (`place=quarter` mahalle poligonları: Burgwallen-
  Oude Zijde/De Wallen, Grachtengordel, Jordaan, Nieuwmarkt/Lastage,
  Museumkwartier, De Pijp, Oud-West, Plantage, Oostelijke Eilanden, Oud-Zuid),
  ticari 17 (Amstel III/RAI/Teleport vb.), eğitim 4 (Science Park/VU/
  Roeterseiland UvA/Amstelcampus), doğal 46 (Vondelpark, Westerpark, Oosterpark,
  Amsterdamse Bos, Sarphatipark, Amstelpark, Flevopark vb.).

Durum notu: Amsterdam mahalleleri OSM'de `admin_level` DEĞİL `place=quarter/
neighbourhood` (poligon) — turistik bunu kullandı; adlar tam eşleşmeli
(Grachtengordel tek parça, "Grachtengordel-West/Zuid" diye bölünmemiş; De Pijp
quarter). Rota ilişkileri istasyon düğümü tutmadığından istasyonlar ayrı çekilip
en yakın hatta atandı + isme göre tekilleştirildi (531→237). area_km2 ölçeği
Amsterdam enlemine (cos52≈0.61) düzeltildi. Overpass o gün ağır 504/timeout
verdi (tram 3/24 + modern/alisveris + bazı turistik ikinci turda/tek tek
çekildi); ayna failover 70s. `cities.json` → `ready`; önbellek sürümleri
**birlikte** artırıldı (`BM_VER` + `index.html` app.js?v= = 20260722-3).

---

## Yeni şehir — Lisboa ✅ tamam (2026-07-22)

`yeni-sehir` parametrik boru hattıyla eklendi (kullanıcı "sırayla 4 şehir"
kararının 1.'si). Dil **`pt`** (yeni `lang.pt` i18n anahtarı 6 dile eklendi).

- **Manifest:** merkez `[-9.145, 38.72]`, `Europe/Lisbon`, para EUR, zoom
  min 9 / max 19, geniş home. El Prat benzeri: maxBounds havalimanı + Belém +
  karşı yaka (Cristo Rei). Fiyat tablosu editoryal (bica 0.85€!).
- **Varış (5 kapı):** Aeroporto (Metro Vermelha ile Alameda'ya gerçek güzergâh,
  9.1km), Santa Apolónia, Gare do Oriente, Sete Rios (otobüs), Cais do Sodré
  (Tejo vapuru, `mode:ship`).
- **Omurga (13 hat, 55KB):** Metro Azul/Amarela/Verde/Vermelha (resmî renkler)
  + Carris tram 12E/15E/18E/24E/25E/28E + funiküler Glória/Lavra/Bica (55E Graça
  OSM'de çok kısa/kırıntı → atlandı). 57 istasyon + 112 durak + 8 hub (Alameda,
  Baixa-Chiado, Marquês, São Sebastião, Campo Grande, Saldanha, Cais do Sodré,
  Oriente). Gerçekçilik geçti (en uzun düz segment 1697m).
- **Keşfet (373 nokta):** tarihi 86 / doğa 90 / **modern 40** / gastronomi 32 /
  alışveriş 27 / otel 23 / yurt 24 / kamu 51. (modern ilk turda Overpass
  timeout'u yüzünden 7'de kalmıştı; 2026-07-25'te selektörler tek tek çekilerek
  40'a tamamlandı.)
  Torre de Belém/Jerónimos/Castelo/Praça do Comércio/Santa Justa/Padrão/MAAT/
  Gulbenkian/Oceanário dahil 26 ikonik elle eklendi.
- **İhtiyaçlar (318 nokta):** eczane 75 / market 69 / yakıt 55 / kütüphane 39 /
  müze 36 / hastane 27 / kiralık-araç 17.
- **Bölgeler:** turistik 6 (Alfama/Baixa/Bairro Alto/Madragoa `place=suburb` +
  Belém/Estrela `admin_level=8` freguesia; Chiado/Graça/Mouraria/Príncipe Real
  OSM'de poligon değil, atlandı), ticari 11, eğitim 12, doğal 48 (Eduardo VII,
  Estrela, Monsanto, Torel vb.).

Durum notu: Lizbon bairro'ları karışık etiketli — turistik bairrolar
`place=suburb/neighbourhood` (poligon), bazıları yalnız nokta, Belém/Estrela
`admin_level=8` freguesia. Metro hatları `ref` = renk adı (Azul/Verde…),
`route=subway`. Rota ilişkileri istasyon tutmadığından istasyonlar ayrı çekilip
en yakın hatta atandı + isme göre tekilleştirildi. area_km2 Lizbon enlemine
(cos38.7≈0.78) düzeltildi. **Overpass o gün olağanüstü ağırdı** (Vermelha +
modern/kamu/eczane/kiralik-arac + bölge park sorgusu + çoğu turistik ikinci/
üçüncü turda ya da tek tek çekildi; modern nihayetinde ikonik ağırlıklı kaldı).
`cities.json` → `ready`; önbellek sürümleri birlikte 20260722-4.

---

## Yeni şehir — Wien (Viyana) ✅ tamam (2026-07-22)

`yeni-sehir` parametrik boru hattıyla eklendi ("sırayla 4 şehir"in 2.'si).
Dil `de` (`lang.de` zaten vardı — Berlin).

- **Manifest:** merkez `[16.37, 48.21]`, `Europe/Vienna`, para EUR, geniş home,
  maxBounds Flughafen Wien'i kapsıyor. Fiyat tablosu editoryal (Melange 3.50€).
- **Varış (4 kapı):** Flughafen Wien (Wien Mitte'ye gerçek S7 raylı güzergâhı,
  19.4km), Wien Hauptbahnhof, Wien Westbahnhof, VIB (Erdberg otobüs).
- **Omurga (34 hat, 204KB):** U-Bahn U1/U2/U3/U4/U6 (resmî renkler) + **29 Wiener
  Linien tramı** (1/2/5/6/9/10/11/12/18/25/26/27/30/31/37/38/40/41/42/43/44/46/
  49/52/60/62/71/D/O — Viyana'nın karakteri; OSM'de renksiz olduğundan tek muted
  renk, rozet numara taşır). 112 istasyon + **419 tram durağı** + 8 hub. Gerçek
  OSM geometrisi; gerçekçilik geçti (en uzun düz segment 1644m).
- **Keşfet (502 nokta):** tarihi 145 / doğa 93 / modern 56 / gastronomi 42 /
  **alışveriş 32** / otel 39 / yurt 39 / kamu 56. (alışveriş ilk turda Overpass
  timeout'u yüzünden 0'dı; 2026-07-25'te AVM + pazar selektörleriyle
  tamamlandı.) Stephansdom/Schönbrunn/
  Hofburg/Belvedere/Staatsoper/Riesenrad/Hundertwasserhaus/KHM/Albertina/
  MuseumsQuartier dahil 27 ikonik elle eklendi.
- **İhtiyaçlar (376 nokta):** eczane 90 / market 90 / yakıt 60 / kütüphane 54 /
  müze 55 / hastane 14 / kiralık-araç 13.
- **Bölgeler:** turistik 9 (`admin_level=9` Bezirke: Innere Stadt, Leopoldstadt,
  Landstraße, Wieden, Margareten, Mariahilf, Josefstadt, Alsergrund, Favoriten;
  Neubau timeout'ta düştü), ticari 12, eğitim 12, doğal 46 (Stadtpark,
  Volksgarten, Schönbrunn, Setagayapark vb.; Wiener Prater timeout — POI'de var).

Durum notu: Viyana Bezirke `admin_level=9` (numaralı ilçeler). U-Bahn `ref`=U1…U6
`route=subway`. **Overpass o gün olağanüstü ağırdı** — U4/tram 60 + alisveris +
bazı turistik/dogal-ikonik timeout'ladı; kritikler (U4) ikinci turda çekildi,
alisveris ve Prater/Neubau nihayetinde eksik kaldı (kabul; POI/ticari kapsıyor).
Rota ilişkileri istasyon tutmadığından istasyonlar ayrı çekilip en yakın hatta
atandı + isme göre tekilleştirildi (1202→531). `cities.json` → `ready`; önbellek
sürümleri birlikte 20260722-5.

---

## Yeni şehir — Praha (Prag) ✅ tamam (2026-07-22)

`yeni-sehir` parametrik boru hattıyla eklendi ("sırayla 4 şehir"in 3.'sü).
Dil `cs` (yeni `lang.cs` i18n anahtarı 6 dile eklendi), para **CZK**
(CURRENCY_SYM'e `CZK="Kč"` eklendi — tek genel dokunuş, çok-şehir güvenli).

- **Manifest:** merkez `[14.42, 50.08]`, `Europe/Prague`, para CZK, geniş home.
  Fiyat tablosu editoryal CZK (0.5L bira 35 Kč!).
- **Varış (4 kapı):** Letiště Václava Havla (havalimanı — Prag'ın raylı bağlantısı
  yok; bus 119 → Nádraží Veleslavín, **gerçek karayolu güzergâhı 2026-07-25'te
  tamamlandı**: Aviatická → K Letišti → Evropská, 7.3 km, 94 nokta, en uzun düz
  segment 410 m, 12.9 köşe/km), Praha hlavní nádraží, Praha-Holešovice,
  ÚAN Florenc (otobüs).
- **Omurga (29 hat, 172KB):** Metro A/B/C (resmî renkler) + 26 gündüz tramı
  (1-26 + 34; gece 91-99, tarihi 41/42 hariç; tek muted renk, rozet numara).
  67 istasyon + 293 tram durağı + 8 hub. Gerçekçilik geçti (en uzun 1683m).
- **Keşfet (346 nokta):** tarihi 92 / doğa 69 / **modern 34** / gastronomi 22 /
  alışveriş 16 / otel 39 / yurt 31 / kamu 43. (modern ilk turda 3'te kalmıştı;
  2026-07-25'te galeri + sanat merkezi selektörleriyle 34'e tamamlandı —
  `tourism=attraction[building][wikidata]` selektörü Prag'da hâlâ timeout
  veriyor, o kalem eksik.) Pražský hrad/Karlův most/Orloj/sv. Víta/
  Vyšehrad/Petřín dahil 26 ikonik elle eklendi.
- **İhtiyaçlar (223 nokta):** eczane 56 / market 53 / yakıt 37 / müze 29 /
  kütüphane 27 / hastane 11 / kiralık-araç 10.
- **Bölgeler:** turistik 10 (`boundary=cadastral` / `place=cadastral_community`
  katastrální území: Staré Město, Nové Město, Malá Strana, Hradčany, Josefov,
  Vinohrady, Žižkov, Smíchov, Karlín, Holešovice), ticari 7, eğitim 5, doğal 42.

Durum notu: **Prag mahalleleri OSM'de `admin_level`/`place=suburb` DEĞİL
`boundary=cadastral` + `place=cadastral_community`** (katastrální území) — ilk
turistik sorgusu bu yüzden 0 döndü, keşifle bulunup düzeltildi. Metro `ref`=A/B/C
`route=subway`. **Overpass o gün olağanüstü ağırdı** — tram 16 + modern/muze +
bus 119 + park sorgusu + turistik ilk tur timeout'ladı; kritikler ikinci turda,
turistik cadastral ile üçüncü turda çekildi; modern eksik kaldı (kabul; ikonik
kapsıyor). İstasyonlar ayrı çekilip en yakın hatta atandı + tekilleştirildi
(835→360). area_km2 Prag enlemine düzeltildi.
`cities.json` → `ready`; önbellek sürümleri birlikte 20260722-6.

**Havalimanı link'i tamamlandı (2026-07-25):** `relation[route=bus][ref=119]`
Overpass'ta ısrarla timeout verdiği için (ref-only relation taraması ağır) link
**karayolu grafından** üretildi — koridordaki tüm sürülebilir yollar çekilip
(2238 way) graf kuruldu, boşluklar köprülendi, Terminál 1 ↔ Nádraží Veleslavín
en kısa yolu alındı. Çıkan güzergâh gerçek 119 koridorunu izliyor (sokak
denetimi: Evropská 51 düğüm, K Letišti 47, Aviatická 6). **Kapı koordinatı
düzeltmesi:** `gate-prg` gerçek terminalden ~530 m batıdaydı (Halkalı dersinin
aynısı) → OSM `aeroway=terminal` centroid'ine taşındı, snap 575 m → 116 m.
Ders: raylı bağlantısı olmayan şehirlerde varış link'i karayolu grafıyla da
üretilebilir; sonuç sokak-adı denetimiyle doğrulanır. Önbellek 20260722-8.

---

## Yeni şehir — Singapore ✅ tamam (2026-07-22)

`yeni-sehir` parametrik boru hattıyla eklendi ("sırayla 4 şehir"in 4.'sü —
seri tamam). **Roster'ı ilk kez Avrupa dışına, Güneydoğu Asya'ya taşıdı.**
Dil `en` (yeni `lang.en` anahtarı 6 dile eklendi → tüm İngilizce şehirlerin
künyesi düzeldi), para **SGD** (CURRENCY_SYM'e `SGD="S$"`).

- **Manifest:** merkez `[103.83, 1.31]`, `Asia/Singapore`, para SGD, geniş home;
  maxBounds tüm adayı + Changi (doğu) + Jurong (batı) kapsıyor. Fiyat editoryal
  SGD (MRT bileti 1.30 S$).
- **Varış (3 kapı):** Changi Airport (Raffles Place'e gerçek EWL güzergâhı,
  19.8km; Changi kolu EWL'ye dahil), Woodlands (Malezya Causeway'i, `mode:bus`),
  Marina Bay Cruise Centre (`mode:ship`).
- **Omurga (7 hat, 72KB):** MRT NSL/EWL/NEL/CCL/DTL/TEL (resmî renkler) + LRT
  SKLRT (Sengkang; muted renk). CG (Changi kolu) EWL'nin parçası; BPLRT/PGLRT
  OSM'de bu ref'lerle yok → atlandı. 154 istasyon + 8 hub. Gerçekçilik geçti
  (en uzun düz segment 1694m).
- **Keşfet (371 nokta, 66KB):** tarihi 68 / modern 31 / doğa 95 / gastronomi
  35 / alışveriş 58 / otel 17 / yurt 24 / kamu 43. Merlion/Marina Bay Sands/
  Gardens by the Bay/ArtScience/Singapore Flyer/Raffles Hotel/Sultan Mosque/
  Chinatown/Little India/Jewel Changi/Sentosa dahil 26 ikonik elle eklendi.
- **İhtiyaçlar (261 nokta):** eczane 42 / market 78 / yakıt 58 / müze 28 /
  hastane 24 / kütüphane 22 / kiralık-araç 9.
- **Bölgeler:** turistik 8 (`place=suburb/quarter`: Chinatown, Little India,
  Kampong Glam, Orchard, Marina Centre, Bugis, Tanjong Pagar, Boat Quay;
  Marina Bay/Clarke Quay MISS), ticari 40, eğitim 12, doğal 46 (Botanic
  Gardens, Fort Canning, East Coast Park, Sentosa park vb.).

Durum notu: Singapur MRT `ref`=NSL/EWL/NEL/CCL/DTL/TEL `route=subway`, Changi
kolu ayrı ref değil EWL içinde; LRT yalnız SKLRT `route=light_rail` (BP/PG farklı
etiketli/eksik). area_km2 ekvatora yakın olduğundan lon≈lat ölçeğiyle. **Overpass
o gün ağırdı** (TEL/CG/otel/istasyon ilk turda timeout; ikinci turda çekildi).
İstasyonlar ayrı çekilip tekilleştirildi (361→154). `cities.json` → `ready`;
önbellek sürümleri birlikte 20260722-7.

---

## 4 şehirlik seri (2026-07-22) ✅ tamam

Kullanıcı "sırayla bu dört şehri de yapalım" kararıyla **Lisboa → Wien → Praha →
Singapore** tek oturumda eklendi (Barselona + Amsterdam'ın ardından). Toplam
**15 şehir**. Parametrik boru hattı (build_omurga/stations/poi/bolgeler + şehir
wrapper'ları) sayesinde her şehir aynı adımlarla üretildi. Yeni dil anahtarları:
`lang.pt/de/cs/en`; yeni para sembolleri: `CZK="Kč"`, `SGD="S$"`. Overpass gün
boyu olağanüstü ağırdı; ayna failover 70s + tema/hat başına yeniden çekim ile
tüm katmanlar tamamlandı. **2026-07-25 toparlama turu:** Prag havalimanı link'i
karayolu grafıyla eklendi; Lizbon/Prag modern ve Viyana alışveriş temaları
selektör-selektör çekilerek dolduruldu; 15 şehirde 322 üst-üste-binen tekrar
pin temizlendi (kural `docs/VERI.md` adım 6). Kalan tek boşluk: Prag'da
`tourism=attraction[building][wikidata]` selektörü hâlâ Overpass timeout'u
veriyor.

---

## Varış linkleri denetimi (2026-07-25) ✅ tamam

Kullanıcı "Prag'da havaalanından gelen hat yarım mı kalıyor?" diye sorunca tüm
şehirlerin varış linkleri topluca denetlendi. Prag'ın verisi sağlamdı (link ucu
Metro A'ya 105 m, Veleslavín istasyonuna 49 m) ama **link'i hub yerine isimsiz
bir istasyon noktasında biten tek şehirdi** — diğer 5 şehirde link Sants/
Centraal/Wien Mitte/Alameda/Raffles gibi adı ve altyazısı olan bir aktarma
merkezinde bitiyor. Bu yüzden görsel olarak "yarım" duruyordu.

Düzeltilenler:

- **Prag:** `Nádraží Veleslavín` hub olarak eklendi (+ 7 dilde `hub.veleslavin`
  = "Metro A · havalimanı otobüsü 119"). Link artık adlandırılmış bir aktarma
  noktasında bitiyor.
- **London (asıl kusur):** `link-lhr` yalnız **2.1 km / 8 nokta**tı — Heathrow'un
  hemen yanında kesiliyor, merkeze 18 km kala bitiyordu. Sebep: Piccadilly
  geometrisi 39 ayrı parça, eski "en yakın parçayı izle" yöntemi ilk parçadan
  sonra duruyordu. Graf + parça-ucu köprüleme + en kısa yol ile yeniden kuruldu:
  **29.0 km, 116 nokta, en uzun segment 1135 m**, King's Cross St Pancras'ta
  bitiyor.
- **İstanbul:** `gate-ist` gerçek havalimanı istasyonundan **2291 m** uzaktaydı
  (Halkalı/Prag dersinin üçüncü tekrarı) → istasyona taşındı, link M11'den
  yeniden çizildi: en uzun segment 2116 → **1477 m** (kural altına indi).
- **Roma:** `link-fco` **MultiLineString / 70 parça** (22'si 50 m'den kısa
  kırıntı) idi → tek `LineString`, 108 nokta.
- **İzmir:** `link-adb` İZBAN'dan yeniden çizildi (3210 → 2765 m).

**Araç:** `relink` — omurgadaki bir hattın tüm parçalarından graf kurar,
parça uçlarındaki boşlukları köprüler, kapı → hub en kısa yolunu alır. Parçalı
hat geometrisi olan her şehirde kullanılabilir.

### Kalan (kalıtsal, ayrı iş) → ✅ kapandı 2026-07-30 (aşağıdaki onarım turu)

4 link hâlâ 2 km kuralını aşıyor: `izmir/ADB` 2765 m, `newyork/EWR` 3372 m,
`roma/FCO` 5168 m, `tokyo/Narita` 4072 m. **Sebep link'te değil, omurga
hatlarının kendisinde:** eski şehirlerde (2026-07-14 densify kuralından önce
üretilenler) hatlarda uzun düz segmentler var — Tokyo `JC` 23 km (!), New York
8.6 km, İzmir `Vapur` 6.2 km, Roma `FL` 5.2 km, Paris `RER D` 4.6 km, İstanbul
`Marmaray` 2.9 km. Link o hattı izlediği için sıçramayı miras alıyor.
Kalıcı çözüm bu hatları Overpass'tan **densify'lı** boru hattıyla yeniden
çekmek; sonradan densify işe yaramaz (noktalar düz çizginin üstüne düşer,
gerçek güzergâhı geri getirmez).

---

## Omurga geometri onarımı — 6 eski şehir ✅ tamam (2026-07-30)

**Amaç:** Yukarıdaki "kalıtsal, ayrı iş" maddesini kapatmak: 2026-07-14 densify
kuralından önce üretilen şehirlerdeki (tokyo, newyork, izmir, roma, paris,
istanbul) uzun düz segmentleri gerçek OSM geometrisiyle değiştirmek ve 4 varış
link'ini yeniden kurmak.

Yapılacaklar:
- İhlal envanteri (>2 km düz segment) → hat hat Overpass'tan yeniden çekim
  (yumuşak sadeleştirme ~6-15 m, boşluklar düz çizgiyle köprülenmez, kalan
  gerçek düzlükler densify edilir)
- 4 varış link'i (izmir/ADB, newyork/EWR, roma/FCO, tokyo/Narita) tazelenmiş
  hattan graf en-kısa-yolla yeniden kurulur
- Ferry hatları için kural istisnası netleştirilir (su üstü geçiş gerçekten düz)
- Önbellek sürümleri birlikte artırılır; doküman + skill dersi güncellenir

**Yöntem — kord kord onarım (hattı komple yeniden çekmek yerine):** ilk denemede
hatlar Overpass'tan baştan çekildi, ama bu hattın küratörlü kapsamını bozuyordu
(Roma FL seti 353 → **601 km**, Metromare 28 → 60 km; çift yön izleri ve ekstra
kollar giriyor). Bunun yerine geometri korunur, yalnız **>1.7 km her segment**
için o iki uç arasındaki gerçek OSM güzergâhı (hattın way'lerinden kurulan
grafta en kısa yol, uç boşlukları ≤70 m köprülenir) bulunup yerine dikilir.
Sonuç: toplam uzunluk ve kapsam neredeyse aynı, nokta sayısı hafif artıyor.

**Asıl bulgu — 2 km ölçütü yanlış alarm veriyordu.** Onarılan 400+ kordun
neredeyse tamamında gerçek güzergâh = kord (kıvrım **1.00x**): yani eski
geometri stilize/yanlış değil, **aşırı sadeleştirilmişti** (DP toleransı gerçek
düzlükleri tek segmente indiriyordu). Tokyo `JC`'nin 23 km'lik segmenti buna en
uç örnek — JR Chūō hattı orada gerçekten dümdüz; onarımdan sonra uzunluk aynı
(94.5 km), sadece gerçek ara köşeler geldi (82 → 140 nokta). Gerçek kestirme
yalnız 4 yerde çıktı: Paris `RER C` (2.27x), Tokyo `JS` (1.10x) / `TS` (1.05x) /
`KS` (1.04x), NY `LIRR` (1.13x) — bunlar artık gerçek güzergâhı izliyor.

**Sonuçlar (en uzun düz segment, önce → sonra):**

| Şehir | Onarılan | Örnekler |
|---|---|---|
| tokyo | 30 hat + link | `JC` 23189→1632 m, `JB` 11520→1694 m, `TJ` 8689→1670 m, `link-narita` 4076→1626 m |
| newyork | 13 hat + link | `NJ` 8610→1699 m, `Metro-North` 6581→1644 m, `LIRR` 6423→1662 m, metro renk grupları 5968→1699 m |
| paris | 7 hat | `RER D` 4624→1485 m, `RER C` 4274→1604 m, metro 7 3173→1290 m |
| roma | 4 hat + link | `FL` 5164→1623 m, tram 3/19 2695→1223/1654 m, `link-fco` 5164→1209 m |
| izmir | 1 hat + link | `İZBAN` 4574→1666 m, `link-adb` 2751→1569 m |
| istanbul | 3 hat | `Marmaray` 2921→1595 m, `M5` 2365→1360 m, `M4` 2167→1654 m |

**New York EWR — tek gerçek kusur:** `link-ewr`'in ilk bacağı havalimanından
NEC istasyonuna **2.3 km düz kesim**di (gerçek yol 6.6 km, korddan 2.9 km sapma).
Sebep kapı koordinatıydı: `gate-ewr` AirTrain'e 700 m uzaktaydı, snap edecek ray
yoktu (Halkalı/Prag dersinin dördüncü tekrarı). Kapı OSM `aeroway=terminal`
Terminal B'ye taşındı (1069 m) ve link **AirTrain monoray + NEC** birleşik
grafından baştan kuruldu: 23.5 km, Terminal C'ye 28 m, havalimanı istasyonuna
48 m, Penn'de bitiyor. Ders: bir link birden çok hattı izleyebilir
(`tools/spec_varis.json`'da seçici listesi + `tools/relink.py`).

**Ferry istisnası:** `izmir/line-ferry` 6254 m ve `newyork/line-ferry` 4866 m
kural dışı bırakıldı — vapur su üstünde gerçekten düz gider; denetim aracı
`lineRef:"ferry"`'yi ayrı raporluyor.

**Araçlar artık depoda:** `tools/` (audit_omurga · repair · relink · warm · ovp ·
geo · graph · spec\*.json). Her oturumda boru hattını yeniden türetmek yerine
bunlar çalıştırılır; ayrıntı `tools/README.md`.

Bitti sayılır:
- [x] 15 şehirde denetim temiz (`tools/audit_omurga.py` → "TEMİZ", yalnız 2
      ferry hattı muaf olarak raporlanıyor)
- [x] Değişiklik yalnızca geometride: 61 feature'da geometri değişti, **0
      feature'da properties değişti** (HEAD öncesine karşı karşılaştırıldı)
- [x] Tüm GeoJSON'lar geçerli, dosya boyutları sınırda (en büyük tokyo 200 KB,
      newyork 312 KB), `node --check js/app.js` tamam
- [x] Önbellek sürümleri birlikte artırıldı (`BM_VER` + `index.html`
      `app.js?v=` = 20260730-1)

**Dikiş temizliği:** splice, birleşme noktalarında 1 m'lik iğnecikler
(A→B→A) bırakabiliyor; `geo.clean_parts()` bunları ve tekrar noktaları siler,
`repair.py`/`relink.py` çıktısına bağlı. Denetimde görüldü ki
**amsterdam/vienna/prague/barcelona** omurgalarında da aynı türden eski
iğnecikler var (haritada görünmez, ~1 m); bu tur 6 eski şehirle sınırlı
tutuldu, onlara dokunulmadı — istenirse tek komutla temizlenir.

Durum notu: Tamam. Sandbox'ta harita karoları engelli olduğundan görsel
doğrulama yapılamadı; değişiklik veri içi geometriyle sınırlı ve properties
dokunulmadı, ama canlıda göz kontrolü kullanıcıya kalıyor — özellikle
**New York EWR kapısının yeni yeri** ve **Paris RER C / Tokyo JS** düzeltilen
kıvrımlar. Overpass bugün sağlıklıydı (3 ayna, 45 sorgu, paralel ısıtıcı).
