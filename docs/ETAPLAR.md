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
`repair.py`/`relink.py` çıktısına bağlı.

**Çıkmaz parça temizliği (2026-07-30, kullanıcı isteği):** aynı denetim
**amsterdam/vienna/prague/barcelona** omurgalarında 484 A→B→A deseni buldu.
Bunlar splice artığı 1 m'lik iğnecik DEĞİL — **60-390 m (medyan 83 m) gerçek
yan-ray parçaları**: linemerge'in dallanmada içine girip geri döndüğü kısa
çıkmazlar (siding / kavşak kuyruğu / istasyon kolu). Hepsi **kendi başına
3 noktalı parça** ([A,B,A]) olarak duruyordu, uzun hatların içine gömülü
değildi; yani ana güzergâhlara dokunmadan silinebiliyorlar. Haritada rota
bilgisi taşımayan kısa fiskeler olarak görünüyorlardı, silindi:
amsterdam 42, vienna 262, prague 31, barcelona 149. Doğrulama: kalan her
parça eskisinde **birebir** var, properties değişmedi, denetim TEMİZ.
Önbellek 20260730-2.

Durum notu: Tamam. Sandbox'ta harita karoları engelli olduğundan görsel
doğrulama yapılamadı; değişiklik veri içi geometriyle sınırlı ve properties
dokunulmadı, ama canlıda göz kontrolü kullanıcıya kalıyor — özellikle
**New York EWR kapısının yeni yeri** ve **Paris RER C / Tokyo JS** düzeltilen
kıvrımlar. Overpass bugün sağlıklıydı (3 ayna, 45 sorgu, paralel ısıtıcı).

---

## Veri kalitesi taraması — 15 şehir ✅ tamam (2026-08-03)

**Amaç:** Omurga dışındaki katmanlarda sessiz kusurları aramak (kullanıcı isteği).
Yeni araç `tools/audit_data.py` 7 kontrol yapıyor: `id` (katman içi tekrar eden
feature id), `dup` (aynı noktada iki pin), `orphan` (hattan uzak istasyon),
`bounds` (maxBounds dışı), `label` (adsız etiket / bilinmeyen theme), `box`
(kutu çizilmiş bölge poligonu), `size` (dosya boyutu).

**Düzeltilenler:**

- **berlin `bolge-dogal` id çakışması (36):** dosya iki ayrı numaralanmış
  partiden birleştirilmiş, iki farklı park aynı `dogal-0` id'sini taşıyordu →
  69 feature yeniden numaralandı, etiketler ada göre eşleştirildi.
- **Adsız etiket (68):** `lab:1` ama adı/ref'i olmayan feature'lardan `lab`
  kaldırıldı (roma/istanbul `bolge-ticari` ağırlıkta).
- **maxBounds dışı (8):** silindi. Aralarında london `bolge-egitim`'deki
  **"Greenwich Uni"** — meğer Kent'teki Medway kampüsü, Londra'nın 30 km
  doğusunda, haritada erişilemez. Poligonlar artık temsili noktasıyla denetleniyor.
- **Üst üste binen pin (3):** madrid'de aynı anıtın iki kaydı, berlin'de tek
  adreste 3 Stolperstein.
- **Bölge sliver'ları (37):** sınır ilişkisinin way'leri **tek halkaya
  dikilmek yerine ayrı ayrı kapatılmış** — mahalle yerine ince üçgenler
  çiziliyordu. Ölçüt: çevre²/alan (gerçek bölge ~15-60, sliver yüzlerce/binlerce).
  Onarım: `polygonize(unary_union(way'ler))`, yani baştan yapılması gereken adım.
  turistik 32 (vienna 9 — Innere Stadt 0.26→**2.85 km²**, Favoriten 1.62→31.61;
  barcelona 9 — el Raval 0.08→1.35, Sagrada Família oranı 87672→21; singapore 6,
  prague 4, amsterdam 3, lisbon 2), egitim 3 (london UCL oranı 734→43, UAL,
  vienna MedUni), dogal 3 (**Parc de Montjuïc 0.04→4.06 km²**, Riegrovy sady,
  My Waterway@Punggol). Etiket noktaları yeni poligonun temsili noktasına taşındı.

**Yanlış alarm — kaydedilmesi gereken ders:** çevre²/alan ölçütü *bölgeler* için
iyi bir vekil ama **parklar için değil**. İlk taramada `bolge-dogal`'da 18 sliver
göründü; OSM'den kontrol edilince 16'sının mevcut geometrisi zaten doğru çıktı
(Großer Tiergarten 1.78 km² — OSM 1.79; Clapham Common 0.72 — 0.74; Madrid Río
0.68 — 0.68; East Coast Park 2.09 — 2.11). Uzun/çok parçalı bir park doğası
gereği yüksek oran verir. Araca iki koruma eklendi: (a) OSM nesnesinin **tüm**
halkaları korunur (önce "en büyüğün %20'sinden küçükler" atılıyordu; bu Tiergarten'ı
1.78→1.53'e düşürüyordu), (b) yeni alan eskinin 1.5 katından küçükse ve eski oran
<500 ise dokunulmaz. **Ölçüt kusuru işaret eder, kanıtlamaz — OSM'e sorulmadan
geometri değiştirilmez.**

**Bilerek düzeltilmeyenler (ayrı karar gerekiyor):**

- **Orphan istasyonlar (208).** Körlemesine silmek yanlış olur: NY'deki ferry
  iskeleleri meşru (hat kaba çizili), Tokyo'dakilerin bir kısmı DisneySea içi
  duraklar (çöp), ama london Seven Kings/Gidea Park **bizim Elizabeth line
  geometrimizin kırpık** olduğunu gösteriyor — orada silinecek nokta değil,
  tamamlanacak hat var. Tek tek bakılmalı.
- **Müze çift kaydı (196).** Aynı müze hem Keşfet/tarihi hem İhtiyaç/müze
  altında. İki grup ayrı açılıp kapandığı için tasarım gereği olabilir; ikisi
  birden açıkken aynı noktada iki pin çıkıyor. Kullanıcı kararı.
- **Dosya boyutu (3).** berlin/london/madrid `kesfet-poi` 211-280 KB (hedef 200);
  "popüler yerler bol olsun" kararının doğal sonucu, kırpılmadı.
- **`box` bulguları (220).** ticari/egitim/dogal poligonlarının bir kısmı OSM'de
  gerçekten 4-5 köşeli dikdörtgen alanlar; kural (docs/VERI.md) el çizimi
  *turistik* bölgeler için konmuştu, oralarda ihlal kalmadı.

Bitti sayılır:
- [x] 7 kontrol 15 şehirde koşuyor, düzeltilen kategorilerde bulgu sıfır
- [x] Değişiklikler yalnız geometri/id/etiket; poligon-etiket eşleşmesi korundu
- [x] Önbellek sürümleri birlikte artırıldı (`BM_VER` + `index.html` = 20260803-1)

Durum notu: Tamam. Araçlar: `tools/audit_data.py` (denetim), `tools/fix_data.py`
(mekanik düzeltmeler), `tools/rebuild_districts.py` (sliver onarımı; relation+way
dizini, kısaltma eşlemesi, id tabanlı sorgu). Görsel doğrulama kullanıcıda —
özellikle **Viyana ve Barselona'nın Bölgeler çekmecesi**, artık ince üçgenler
yerine gerçek mahalle alanları görünecek.

---

## Yeni şehir — Padova ✅ tamam (2026-08-26)

**Amaç:** İtalya'nın ikinci şehri; metrosuz, tramvay + bölgesel tren + otobüs
omurgalı **küçük** bir şehirde `yeni-sehir` akışının çalıştığını göstermek.
Kod değişmedi; yalnız `tools/ovp.py`'ye yeni bir Overpass aynası eklendi.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Omurga (96 KB, 291 feature):** SIR1 tramvayı (19.8 km, resmi rengin soluk
  tonu #B0708A, 21 durak + 4 hub), 3 bölgesel tren koridoru — R12
  (Mestrino↔Venezia Mestre, 38 km), RV55 (Terme Euganee, 12.9 km), R230
  (Camposampiero, 17.1 km); koridorlar rota ilişkisi yerine **rail ağından
  graf en-kısa-yolla** çıkarıldı (relation sorguları aynada 504 veriyordu),
  16 şehir içi otobüs hattı, 214 otobüs durağı (adla tekilleştirilip ~450 m
  ızgarayla seyreltildi), 11 tren istasyonu, 5 hub (Padova FS, Ponti Romani,
  Prato della Valle, Pontevigodarzere, Guizza).
  **SIR2 (Rubano–Vigonza) ve SIR3 (Stazione–Voltabarozzo) çizilmedi:** OSM'de
  `railway=construction`, hâlâ şantiye. Durakları haritada zaten `tram_stop`
  olduğu için tram durakları SIR1 geometrisine 60 m yakınlıkla süzüldü.
  Merkeze ya da gara hiç uğramayan 4/19/88 numaralı besleyici hatlar
  haritayı kalabalıklaştırdığı için alınmadı.
- **Varış (4):** Venezia Marco Polo (VCE) + Padova FS + Autostazione; VCE
  link'i A4 üzerinden **gerçek yol güzergâhı** (40.9 km, graf en-kısa-yol,
  en uzun düz segment 1435 m).
- **Keşfet (331 nokta, 60 KB):** tarihi 140 / doğa 61 / otel 31 / gastronomi 30
  / kamu 27 / modern 22 / alışveriş 13 / yurt 7. İkonik allowlist uygulandı
  (`docs/IKONIK_LANDMARKLAR.md` → Padova): Scrovegni, Basilica di
  sant'Antonio, Prato della Valle, Palazzo della Ragione, Orto Botanico,
  Caffè Pedrocchi, Palazzo del Bo, Duomo, Battistero, La Specola, Loggia e
  Odeo Cornaro, Torre dell'Orologio, Teatro Giuseppe Verdi, Sinagoga…
- **İhtiyaç (186 nokta, 33 KB):** eczane 45 / market 45 / yakıt 30 / müze 24 /
  kütüphane 24 / hastane 12 / kiralık araç 6.
- **Bölgeler:** turistik 1 — **Centro storico**, 16. yy Venedik surlarının
  çizdiği halka (surlar `linemerge` ile birleştirildi, aradaki boşluklar hendek
  kanalı ağında graf en-kısa-yolla kapatıldı; 4.5 km², Scrovegni'den Prato
  della Valle'ye kadar her simgeyi içeriyor, gar dışarıda kalıyor). Padova'da
  `admin_level=9/10` mahalle sınırı YOK — bu yüzden idari sınır yerine surlar
  kullanıldı. Ticari 6, eğitim 10 (üniversite kampüsleri), doğal 17 park.
- **Manifest:** maxBounds VCE'yi içerecek şekilde 54×29 km; home 9×7 km;
  fiyatlar editoryal (2026-08), para birimi EUR, dil `it`.
- **İçerik:** 6 dilde `content/*.json` (kapı + hub alt etiketleri).

Denetim:
- `tools/audit_omurga.py padova` → **TEMİZ** (2 km'den uzun düz segment yok).
  Gerçekten düz olan otoyol/ray parçalarına gerçek çizgi üzerinde ara nokta
  eklendi (`densify`), sahte kısa devre yok.
- `tools/audit_data.py` → padova'da yalnız bilinen iki kategori: müze çift
  kaydı (Keşfet/tarihi + İhtiyaç/müze — 15 şehirde açık duran kullanıcı
  kararı) ve OSM'de gerçekten dikdörtgen olan `box` poligonları.
- Tarayıcı dumanı: açık/koyu tema × masaüstü/mobil, 8 katman da yükleniyor,
  JS hatası yok.

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte 20260826-1
- [x] Katman dosyaları hedefin altında (en büyüğü omurga 96 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. **Sandbox'ta harita karoları (OpenFreeMap) tarayıcıya
kapalı** olduğundan görsel doğrulama, altlığı boşaltılmış yerel bir kopyada
yapıldı — geometri/renk/rozet yerleşimi doğru görünüyor, ama **etiketler
(glyph sunucusu kapalı olduğu için) canlıda ilk kez görülecek**. Kullanıcıdan
göz kontrolü beklenen yer: Padova'nın Bölgeler çekmecesindeki *Centro storico*
halkası ve otobüs ağının yoğunluğu (16 hat).


---

## Yeni şehir — Vancouver ✅ tamam (2026-09-10)

**Amaç:** Kanada'nın ilk şehri ve New York'tan sonra ikinci Kuzey Amerika
şehri; **çok merkezli, feribotlu, dağ eteğine yaslanmış** bir metropolde
`yeni-sehir` akışını çalıştırmak. Kod değişmedi.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Omurga (69 KB, 181 feature):** SkyTrain'in üç hattı — Expo (73.4 km),
  Millennium (50.9 km), Canada Line (35.4 km, YVR kolu dâhil) —, West Coast
  Express banliyö treni (91.2 km, Waterfront↔Mission City), SeaBus (3.2 km,
  Waterfront↔Lonsdale Quay) ve **99 B-Line + R1-R6 RapidBus** hatları.
  49 raylı istasyon, 96 otobüs durağı, 12 hub (Waterfront, Commercial–Broadway,
  Broadway–City Hall, Bridgeport, Metrotown, Lougheed Town Centre, Production
  Way–University, King George, Lonsdale Quay, Coquitlam Central,
  New Westminster, UBC Exchange). Hat renkleri OSM `colour` etiketinden
  (Expo #0060a9, Canada #009ac8); Millennium'un resmi sarısı (#ffd520) soluk
  altına (#c9a227) çekildi — beyaz altlıkta okunmuyordu.
  Not: **Broadway Subway (Millennium'un Arbutus uzantısı) çizilmedi** — OSM'de
  hâlâ `construction`. SkyTrain hatları OSM'de `route=subway`, S-Bahn benzeri
  bir sürpriz yok; WCE `route=train`, SeaBus `route=ferry`.
  Otobüs durak adları harita için kısaltıldı ("East 41st Ave (EB) at Knight St"
  → "E 41st Ave & Knight St"); **raylı istasyonlar resmi adıyla bırakıldı**
  (ilk denemede kısaltma "22nd Street"i "22nd St" yapmıştı).
- **Varış (5 kapı, 3 link):** YVR (Canada Line ile Waterfront, 15.1 km),
  Pacific Central (gar + otogar: VIA Rail, Amtrak Cascades), Canada Place
  (kruvaziyer), Tsawwassen feribot terminali (620 ile Bridgeport, 25.4 km),
  Horseshoe Bay feribot terminali (257 ile Burrard, 20.3 km). Üç link de
  graf en-kısa-yolla **gerçek OSM güzergâhı**; en uzun düz segment 1547 m.
  257'nin uçları rotadan ~160 m uzakta olduğu için o link'te köprüleme 400 m.
- **Keşfet (320 nokta, 58 KB):** doğa 81 / tarihi 61 / otel 50 / gastronomi 35
  / alışveriş 30 / kamu 30 / modern 26 / yurt 7. **Kalite eşiği şart oldu:**
  ham `historic` sorgusu "Buried Bulldozer", "Snowmobiles", "Rock Pile" gibi
  yüzlerce plaket getiriyordu; tarihi/modern için wikipedia-wikidata-marka
  eşiği (score≥1), doğa için score≥3 uygulandı. Alışverişten `department_store`
  zincirleri çıkarıldı (Winners ×7, Canadian Tire ×5 aynı listede duruyordu).
  İkonik allowlist uygulandı (`docs/IKONIK_LANDMARKLAR.md` → Vancouver):
  Gastown Steam Clock, Marine Building, Sun Tower, Christ Church Cathedral,
  Chinatown Millennium Gate, Doctor Sun Yat-Sen Classical Chinese Garden,
  Science World, BC Place, Digital Orca, Museum of Anthropology, Stanley Park,
  Queen Elizabeth Park, Capilano/Lynn Canyon asma köprüleri, Grouse Mountain,
  Granville Island Public Market…
- **İhtiyaç (227 nokta, 41 KB):** eczane 55 / market 55 / kütüphane 30 /
  müze 30 / yakıt 25 / kiralık araç 18 / hastane 14.
- **Bölgeler:** turistik 3 — **Downtown** (Downtown + West End + Chinatown
  mahalleleri `admin_level=9/10` sınırlarından birleştirildi), **Granville
  Island**, **Kitsilano**. Ticari 20, eğitim 12 (UBC, SFU, BCIT, Capilano,
  KPU…), doğal 113 park/koruma alanı.
- **Manifest:** maxBounds Horseshoe Bay–Tsawwassen–Mission'ı kapsayacak
  şekilde ~87×52 km (kullanıcı kararı: geniş kapsam), home Vancouver
  yarımadası, `America/Vancouver`, dil `en`, para CAD, fiyatlar editoryal
  (2026-09).
- **İçerik:** 6 dilde `content/*.json` (5 kapı + 12 hub alt etiketi).

Boru hattında öğrenilenler (araç değişikliği değil, yöntem):
- Bölge geometrisini **isim isim** çekmek Metro Vancouver'da binlerce Overpass
  turu demekti (20 dakikada bitmedi). Doğrusu: kapalı way'ler için tek
  `out geom tags;`, relation'lar için 50'lik gruplarla `relation(id:…);
  out geom;` — üye geometrisi ilişki ilişki geri geliyor. `out tags geom;`
  yazarsan üyeler boş döner, `out geom;` doğru form.
- **Poligonu maxBounds'a kırpma:** çerçeveden taşan her park (Golden Ears,
  Cypress) dikdörtgene dönüşüyordu — yani tam da kuralın yasakladığı kutu.
  Kırpma kaldırıldı; onun yerine **ağırlık merkezi çerçeve dışında kalan**
  alanlar atılıyor. Ayrıca `polygonize` artığı kırıntı halkalar (en büyük
  parçanın %2'sinden küçük) siliniyor — `audit_data`'nın "kutu" bulgularının
  çoğu bunlardı.
- Nokta katmanlarına **maxBounds süzgeci** eklendi: `historic` etiketli bir
  tren rotası ilişkisinin merkezi Cariboo'ya (500 km kuzeye) düşüyordu.

Denetim:
- `tools/audit_omurga.py vancouver` → **TEMİZ** (2 km'den uzun düz segment yok;
  `repair.py` 25 kordu gerçek OSM güzergâhıyla dikti, kıvrım oranı hepsinde
  1.00x — yani düzlükler gerçekti, geometri köşe kesmemişti).
- `tools/audit_data.py` → 35 bulgu, hepsi bilinen iki kategori: müze çift
  kaydı (Keşfet/tarihi + İhtiyaç/müze — 16 şehirde açık duran kullanıcı
  kararı, 3 adet) ve OSM'de gerçekten dikdörtgen çizilmiş alanlar (iş
  parkları, kampüsler, Brentwood AVM gibi 32 adet).
- Tarayıcı dumanı (Playwright, yerel sunucu): 8 katman + manifest + içerik
  200 dönüyor, `data/vancouver/*` isteklerinden hiçbiri düşmüyor, şehir
  çubuğu "Vancouver · 9 Sept 23:42" (yerel saat doğru), hat çipleri 5
  (metro/tramvay/otobüs/tren/vapur — SeaBus vapur çipiyle süzülüyor).

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte 20260910-1
      (`BM_VER` + `index.html` → `app.js?v=`)
- [x] Katman dosyaları hedefin altında (en büyüğü bolge-dogal 184 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Padova'daki gibi **harita karoları, glyph sunucusu ve
canlı veri (Open-Meteo/Frankfurter) sandbox'ta kapalı** olduğundan etiket
yerleşimi ve altlık hizası canlıda ilk kez görülecek. Kullanıcıdan göz
kontrolü beklenen yer: Bölgeler çekmecesindeki **doğal 113 alanın** yoğunluğu
(dağlardaki koruma alanları haritanın kuzeyini kaplıyor olabilir) ve
Millennium hattının soluk sarısının koyu temada okunurluğu.

---

## Yeni şehir — Seul ✅ tamam (2026-09-13)

`yeni-sehir` parametrik boru hattıyla eklendi (kullanıcı "küresel denge"
kümesinin 1.'si: Seul · Sidney · Toronto · Mexico City). Dil **`ko`**
(yeni `lang.ko` anahtarı 6 dile eklendi), para **KRW** (`CURRENCY_SYM`'e
`KRW="₩"` — tek genel dokunuş, çok-şehir güvenli).

Kullanıcı kararları (onay taslağı, 2026-09-13): Han Nehri vapuru (Hangang
Bus) **atlandı** (OSM verisi yeni/zayıf), çerçeve **geniş** bırakıldı
(ICN batıda, Suseo/GTX güneydoğuda), **GTX-A dahil** edildi.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[126.9784, 37.5665]`, `Asia/Seoul`, zoom min 8.8 /
  max 19, maxBounds `[[126.35,37.28],[127.30,37.78]]` (~84×55 km). Fiyat
  tablosu editoryal (`updated: 2026-09`; metro bileti 1.550 ₩, AREX duraklı
  4.750 ₩).
- **Omurga (213 KB, 538 feature, 19 hat):** metro 1-9 + Sinbundang + Ui-Sinseol
  + Sillim + Gimpo Goldline; tren AREX, Gyeongui–Jungang, Gyeongchun,
  Suin–Bundang, **GTX-A**, Seohae. 488 istasyon, 12 hub (Seoul Station,
  Wangsimni, Gangnam, Jamsil, Sindorim, Gongdeok, Express Bus Terminal,
  Cheongnyangni, Hongik Univ., Digital Media City, Sadang, Yeouido).
  Renkler OSM `colour` etiketinden. **Tramvay yok** (Seul'de 1968'de
  kaldırıldı), **otobüs katmanı yok** (metrobüs benzeri tek kilit hat yok) —
  Hatlar menüsünde metro + tren çipi görünür.
- **Varış (7 kapı, 3 link):** ICN Terminal 1 (AREX ile Seoul Station, 58.1 km),
  Gimpo (Hat 9 ile Express Bus Terminal, 21.5 km), Seoul Station (KTX),
  Yongsan (KTX Honam/Jeolla), Suseo (SRT; Hat 3 ile Express Bus Terminal,
  11.8 km), Express Bus Terminal, Dong-Seoul (Gangbyeon). Üç link de graf
  en-kısa-yolla gerçek OSM güzergâhı; kapı koordinatları OSM istasyon
  düğümlerinden alındı (Halkalı dersi).
- **Keşfet (414 nokta, 74 KB):** tarihi 103 / doğa 88 / kamu 50 / modern 49 /
  alışveriş 35 / gastronomi 34 / otel 30 / yurt 25. İkonik allowlist
  uygulandı (`docs/IKONIK_LANDMARKLAR.md` → Seul): 5 saray, Jongmyo,
  Bukchon/Namsangol hanok köyleri, Insa-dong, Ikseon-dong, Sungnyemun, DDP,
  63 Square, Sejong Center, Seoullo 7017, Banpo Köprüsü, Cheonggyecheon,
  Seoul Forest, Olimpiyat Parkı, Bukhansan, Gwangjang/Namdaemun/Noryangjin
  pazarları — 25 nokta elle geri eklendi.
- **İhtiyaç (255 nokta, 46 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 20.
- **Bölgeler:** turistik 4 — **Jongno · Bukchon** (종로1·2·3·4가동 + 삼청동 +
  가회동 + 사직동), **Myeongdong** (명동 + 소공동), **Hongdae** (서교동 +
  연남동), **Itaewon** (이태원1·2동) — hepsi `admin_level=8` dong sınırlarından
  birleştirildi. Ticari 32, eğitim 64, doğal 69.
- **İçerik:** 6 dilde `content/*.json` (7 kapı + 12 hub alt etiketi, `se.` öneki).

Boru hattında öğrenilenler:
- **`network` etiketi tuzağı:** Seul hatlarında `network` Korece (수도권 전철),
  İngilizcesi `network:en`'de. Seçiciye `["network"="Seoul Metropolitan
  Subway"]` yazınca Overpass **200 + boş `elements`** döndürdü; ovp.py boş
  cevabı cache'lemediği için hata "yavaşlık" gibi göründü. Doğrusu: ref
  benzersizse (1-9, 신분당, GTX-A…) network filtresi hiç kullanılma.
- **İsim dedupe zincirleri eziyor:** market 2504 adaydan 19'a düşmüştü —
  Emart/GS25 gibi zincirlerin her şubesi aynı ada sahip. Izgara seyreltmesi
  zaten hücre başına bir aday bıraktığı için **ad bazlı tekilleştirme yalnız
  kültür temalarında** (tarihi/modern/doğa/gastronomi/kamu/müze/kütüphane/
  hastane) uygulanıyor; market/eczane/yakıt/otel/alışverişte kapalı.
- **Geniş çerçeve + bölge sorgusu = başka şehirler:** Songdo/Paju/Bucheon iş
  parkları ve kampüsleri listeye giriyordu. Harita çerçevesi geniş kaldı
  (kullanıcı kararı) ama **bölge katmanları Seul çekirdeğine** süzüldü
  (`126.72–127.22 / 37.40–37.72`): ticari 58→32, eğitim 107→64, doğal 112→69.
- Hat uzunlukları çift yön + paralel izler yüzünden şişkin görünür (Hat 1
  çerçeve içinde 353 km): harita ölçeğinde üst üste biner, kabul.

Denetim:
- `tools/audit_omurga.py seoul` → ilk turda **15 ihlal** (en kötüsü GTX-A
  7661 m); `tools/repair.py seoul --apply` kord kord diktikten sonra
  **TEMİZ**. Kıvrım oranı 19 hatta da 1.00x — yani düzlükler gerçekti
  (yeraltı/viyadük düz koşuları), geometri köşe kesmemişti; onarım gerçek ara
  düğümleri geri getirdi. Seçiciler `tools/spec.json` → `seoul`.
- `tools/audit_data.py --city seoul` → 27 bulgu, ikisi de bilinen kategori:
  OSM'de gerçekten dikdörtgen çizilmiş alanlar (22) ve müze çift kaydı
  (Keşfet/tarihi + İhtiyaç/müze — 16 şehirde açık duran kullanıcı kararı, 5).
  İlk turdaki 1 orphan (Uijeongbu LRT istasyonu, çizilmeyen ağa ait) ve
  katman içi 3 çift kayıt silindi.
- Tarayıcı dumanı (Playwright, yerel sunucu): 8 katman + manifest + içerik
  200 dönüyor, `data/seoul/*` isteklerinden hiçbiri düşmüyor, konsol hatası
  yok, şehir çubuğu "Seoul · 14 Sept · 03:49" (KST = UTC+9 doğru), mobil
  genişlikte (390px) arayüz yerinde.

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260913-1**
      (`BM_VER` + `index.html` → `app.js?v=`)
- [x] Katman dosyaları hedefin altında (omurga 213 KB < 400 KB, diğerleri < 200 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Padova/Vancouver'daki gibi **harita karoları, glyph sunucusu
ve canlı veri (Open-Meteo/Frankfurter) sandbox'ta kapalı** olduğundan etiket
yerleşimi ve altlık hizası canlıda ilk kez görülecek. Kullanıcıdan göz kontrolü
beklenen yer: 488 istasyon etiketinin yoğunluğu (Tokyo 494 ile aynı ölçek,
ama Seul'de hatlar daha iç içe) ve Hat 9'un soluk bej renginin (#A49D87) açık
temada okunurluğu.

---

## Yeni şehir — Sidney ✅ tamam (2026-09-13)

`yeni-sehir` parametrik boru hattıyla eklendi ("küresel denge" kümesinin
2.'si). Dil `en`, para **AUD** (`CURRENCY_SYM`'e `AUD="A$"` — tek genel
dokunuş). Kullanıcı kararı: **10 vapur hattının hepsi**, NSW TrainLink
şehirlerarası hatları ve **B1 B-Line otobüsü** dahil.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[151.2093, -33.8688]`, `Australia/Sydney`, zoom
  min 8.6 / max 19, maxBounds `[[150.60,-34.15],[151.42,-33.55]]` (~76×67 km:
  batıda Penrith yaklaşımı, kuzeyde Ku-ring-gai, güneyde Royal NP). Fiyatlar
  editoryal (`updated: 2026-09`; Opal tek bilet 4.20 A$, havalimanı treni
  22 A$ — istasyon erişim ücreti dahil).
- **Omurga (197 KB, 360 feature, 29 hat):** Metro **M1**; Sydney Trains
  **T1-T9**; NSW TrainLink şehirlerarası **BMT** (Blue Mountains), **CCN**
  (Central Coast & Newcastle), **SCO** (South Coast), **SHL** (Southern
  Highlands); hafif raylı **L1-L4**; vapur **F1-F10**; otobüs **B1 B-Line**.
  223 istasyon + 66 durak (tramvay durakları ve vapur iskeleleri) + 13 hub
  (Central, Town Hall, Wynyard, Circular Quay, Martin Place, Redfern,
  Strathfield, Parramatta, Chatswood, Sydenham, Bondi Junction, Epping,
  Hurstville). Renkler OSM `colour` etiketinden.
- **Varış (6 kapı, 2 link):** Sydney Airport T1 (T8 ile Central, 8.3 km) ve
  T2/T3 (6.7 km) — ikisi de graf en-kısa-yolla gerçek güzergâh; Central
  Station, Sydney Coach Terminal (Eddy Ave), Circular Quay (vapur + OPT
  kruvaziyer), White Bay Cruise Terminal.
- **Keşfet (374 nokta, 67 KB):** tarihi 100 / doğa 91 / modern 54 /
  alışveriş 37 / kamu 33 / otel 30 / gastronomi 21 / yurt 8. İkonik allowlist
  uygulandı (`docs/IKONIK_LANDMARKLAR.md` → Sidney): Opera Evi, Harbour
  Bridge, Sydney Tower, QVB, Strand Arcade, Hyde Park Barracks, Australian
  Museum, St Mary's, Fort Denison, Luna Park, Powerhouse, SEA LIFE,
  Barangaroo, Darling Harbour, SCG, Carriageworks, Royal Botanic Garden,
  Taronga, Bondi/Bronte/Coogee, Sydney Fish Market, Chinatown — 28 nokta
  elle geri eklendi.
- **İhtiyaç (255 nokta, 45 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 20.
- **Bölgeler:** turistik 5 — **CBD · The Rocks**, **Pyrmont · Darling
  Harbour**, **Bondi Beach**, **Manly**, **Surry Hills · Darlinghurst** —
  `admin_level=9` suburb sınırlarından birleştirildi. Ticari 51, eğitim 19
  (USyd, UNSW, UTS, Macquarie, WSU kampüsleri, ACU), doğal 146 (Royal NP,
  Blue Mountains NP, Ku-ring-gai dahil — geniş çerçeve kullanıcı kararı).
- **İçerik:** 6 dilde `content/*.json` (6 kapı + 13 hub alt etiketi, `sy.` öneki).

Boru hattında öğrenilenler:
- **Boru hattı parametrikleşti:** `CITY=<şehir>` ortam değişkeniyle
  `<şehir>_spec.py` okunuyor (BOUNDS/BBOX/LINES + HUBS/GATES/LINKS/TURISTIK/
  PREFIX/ADMIN_LEVEL/STOP_SELECTORS). Seul'de elle yazılan aşamalar artık
  şehir değiştirince kopyalanmıyor.
- **Vapur iskelesi ≠ raylı istasyon:** `railway=station` sorgusu Sidney'in
  vapur ağını hiç getirmiyordu; `amenity=ferry_terminal` + `railway=tram_stop`
  ayrı seçicilerle `kind:"stop"` olarak eklendi (236 → 306 nokta).
- **Rota çizgisinden uzak iskeleler:** Darling Harbour'ın üç rıhtımı ve Shark
  Island rotanın kanal ortasından geçen çizgisine 256-328 m uzaktaydı
  (`audit_data` orphan); dördü de atıldı.
- **Gastronomi seçicisi ülkeye göre zayıf kalabilir:** Sidney'de
  `amenity=marketplace` neredeyse yok — 12 noktada kalmıştı. `food_court`,
  wikidata'lı `pub` ve `shop=seafood` eklenince 19'a çıktı; gerisini ikonik
  allowlist (Fish Market, Paddy's, Chinatown, The Grounds) tamamladı.
- **Avustralya'da mahalle = `admin_level=9`** (Seul'de dong = 8). Suburb
  adları `name`'de Latin alfabesiyle duruyor, `name:en` gerekmiyor.

Denetim:
- `tools/audit_omurga.py sydney` → ilk turda **10 ihlal** (en kötüsü BMT
  8399 m); `tools/repair.py sydney --apply` sonrası **TEMİZ**. Kıvrım oranı
  hepsinde 1.00x — düzlükler gerçekti (Blue Mountains/Central Coast
  koridorları), geometri köşe kesmemişti. Vapur hatları zaten muaf.
- `tools/audit_data.py --city sydney` → 21 bulgu, ikisi de bilinen kategori:
  gerçekten dikdörtgen çizilmiş OSM alanları (19) ve müze çift kaydı (2 —
  Hyde Park Barracks, Elizabeth Bay House).
- Tarayıcı dumanı (Playwright, yerel sunucu): 8 katman + manifest + içerik
  200, konsol hatası yok, şehir çubuğu "Sydney · 14 Sept · 07:05" (AEST
  = UTC+10 doğru), mobil genişlikte arayüz yerinde.

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260913-2**
- [x] Katman dosyaları hedefin altında (omurga 197 KB, doğal 170 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Karolar sandbox'ta kapalı olduğundan hiza canlıda ilk kez
görülecek. Göz kontrolü beklenen yer: **doğal 146 alanın** batı yakasını
(Blue Mountains/Royal NP) kaplayıp kaplamadığı ve 10 vapur hattının Sydney
Harbour'da üst üste binen yeşil tonlarının ayırt edilebilirliği.

---

## Yeni şehir — Toronto ✅ tamam (2026-09-14)

`yeni-sehir` parametrik boru hattıyla eklendi ("küresel denge" kümesinin
3.'sü). Dil `en`, para CAD (Vancouver'dan zaten vardı). Kullanıcı kararı:
**VIA Rail şehirlerarası hatları ve gece streetcar'ları (301/306) atlandı** —
VIA, GO koridorlarıyla aynı rayda gidip üst üste biniyor.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[-79.3832, 43.6532]`, `America/Toronto`, zoom
  min 8.8 / max 19, maxBounds `[[-79.80,43.45],[-79.10,43.92]]` (~56×52 km:
  batıda Pearson + Mississauga kenarı, doğuda Rouge, kuzeyde Vaughan/Richmond
  Hill, güneyde göl + Adalar). Fiyatlar editoryal (`updated: 2026-09`;
  TTC bileti 3.35 CAD, UP Express 12.85 CAD).
- **Omurga (135 KB, 518 feature, 23 hat):** TTC metro **Line 1/2/4** +
  **Line 5 Eglinton** ve **Line 6 Finch West** (OSM'de `light_rail`, TTC
  bunları hat numarasıyla işletiyor → metro çipinde); streetcar **501, 503,
  504, 505, 506, 507, 509, 510, 511, 512**; **UP Express** + GO Transit
  **LW/LE/KI/BR/MI/RH/ST**. 133 istasyon + 326 streetcar durağı + 13 hub
  (Union, Bloor-Yonge, St. George, Spadina, Sheppard-Yonge, Kennedy, Kipling,
  Dundas West, Eglinton, Finch, Vaughan Metropolitan Centre, Mount Dennis,
  Don Mills). Toplam 893 km.
- **Varış (4 kapı, 1 link):** Pearson (YYZ) T1 — UP Express ile Union
  **24.6 km** gerçek güzergâh —, Billy Bishop (YTZ, ada havalimanı),
  Union Station, Union Station Bus Terminal.
- **Keşfet (371 nokta, 67 KB):** tarihi 100 / doğa 91 / modern 56 /
  alışveriş 35 / otel 30 / gastronomi 25 / kamu 20 / yurt 14. İkonik allowlist
  uygulandı: CN Tower, Rogers Centre, ROM, Ontario Science Centre, Aga Khan,
  Hockey Hall of Fame, Nathan Phillips Square, Scotiabank Arena, BMO Field,
  Roy Thomson Hall, Ontario Place, Casa Loma, Old City Hall, Osgoode Hall,
  Gooderham, Spadina Museum, St. Lawrence Market, Evergreen Brick Works,
  Toronto Islands, Tommy Thompson, Woodbine Beach, Chinatown — 24 nokta
  elle geri eklendi.
- **İhtiyaç (255 nokta, 46 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 20.
- **Bölgeler:** turistik 6 — **Downtown · Financial District**,
  **Kensington · Chinatown**, **Distillery District**, **Harbourfront ·
  CityPlace**, **Liberty Village · Fort York**, **The Annex · Casa Loma**.
  Ticari 53, eğitim 10 (U of T'nin üç kampüsü, York'un ikisi, TMU, Victoria/
  Trinity/St. Michael's), doğal 129.
- **İçerik:** 6 dilde `content/*.json` (4 kapı + 13 hub alt etiketi, `to.` öneki).

Boru hattında öğrenilenler:
- **UP Express grafı iki parçaydı:** havalimanı kolu ile Weston koridoru
  arasında **931 m'lik boşluk** vardı (ilişkinin way üyeliği eksik), bu yüzden
  `relink.py` "yol bulunamadı" dedi. Boşluğu düz çizgiyle köprülemek yerine
  grafa `way:["railway"="rail"]["usage"="main"]` eklendi; gerçek koridordan
  24.6 km'lik güzergâh çıktı (gerçek UP Express ~25 km).
- **Mahalle geometrisi Toronto'da karışık:** `admin_level=9` = seçim bölgesi
  (çok büyük), `admin_level=10` = mahalle, ama Kensington Market/Distillery/
  Liberty Village gibi turistik olanlar `place=neighbourhood` relation ya da
  way. Bölge toplayıcısına `DISTRICT_SELECTORS` eklendi (Amsterdam'daki
  `place=quarter` dersinin tekrarı).
- **"Kutu" bulgusu her zaman kusur değil:** Kensington·Chinatown (5 köşe) ve
  Distillery (6 köşe) OSM'de **gerçekten** dört-beş düz sokakla sınırlı.
  Sadeleştirme toleransı 0.0003 → 0.00012'ye çekilip gerçek kırıklar
  korundu; şekiller yine dikdörtgen kaldı çünkü sokak dokusu öyle.
- **Aynı durak üç isimle:** "Union", "Union Station", "Toronto Union Station"
  ayrı kayıtlardı. İstasyon tekilleştirmesi artık ad-normalize + **600 m**
  mesafe ikilisiyle çalışıyor (salt ada göre tekilleştirme zincir durakları
  eziyordu).
- **Toronto her strip plaza'yı `landuse=commercial` çiziyor:** eşik 0.04 →
  **0.09 km²** yapıldı, ticari 143 → 53'e indi; `audit_data`'nın kutu bulgusu
  60 → 13.

Denetim:
- `tools/audit_omurga.py toronto` → ilk turda **18 ihlal** (en kötüsü LW
  8075 m); `tools/repair.py toronto --apply` sonrası **TEMİZ**, kıvrım oranı
  hepsinde 1.00x.
- `tools/audit_data.py --city toronto` → 16 bulgu: 13 kutu (gerçekten
  dikdörtgen OSM alanları) + 3 müze çift kaydı (ROM, Spadina Museum,
  Aga Khan — bilinen açık karar).
- Tarayıcı dumanı: 8 katman + manifest + içerik 200, konsol hatası yok,
  şehir çubuğu "Toronto · 14 Sept · 04:24" (EDT = UTC-4 doğru).

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260914-1**
- [x] Katman dosyaları hedefin altında (omurga 135 KB, doğal 116 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Göz kontrolü beklenen yer: **326 streetcar durağı** z15+'ta
etiketleniyor ve Toronto bunları kavşak adıyla ("Spadina Avenue") tekrar tekrar
adlandırıyor — yoğunluk rahatsız ederse durak etiketleri seyreltilebilir.
Ayrıca renksiz bırakılan streetcar hatları (OSM'de `colour` yok) palet
renginde çiziliyor; TTC'nin kırmızısı istenirse `spec`'e elle yazılır.

---

## Yeni şehir — Ciudad de México ✅ tamam (2026-09-14)

`yeni-sehir` parametrik boru hattıyla eklendi ("küresel denge" kümesinin
4.'sü ve sonuncusu). Dil `es`, para **MXN** (`CURRENCY_SYM`'e `MXN="MX$"`).
Kullanıcı kararları: **AIFA çerçeve dışı bırakıldı** (AICM şehrin asıl
kapısı), **trolebüs alınmadı** (Metrobús BRT omurgayı veriyor), **Cablebús
düzgün etiketliyse alınsın** → üç hattı da girdi, **Xochimilco dahil**.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[-99.1332, 19.4326]`, `America/Mexico_City`, zoom
  min 9 / max 19, maxBounds `[[-99.36,19.24],[-98.93,19.60]]` (~45×40 km —
  Toronto/Sidney'den bilinçli olarak dar: CDMX metropolü 60 km'yi aşıyor,
  geniş kare merkezi küçültüyordu). Fiyatlar editoryal (`updated: 2026-09`;
  Metro bileti 5 MXN, havalimanı Metrobús'ü 30 MXN).
- **Omurga (96 KB, 369 feature, 24 hat, 554 km):** STC Metro **1-9, 12, A, B**
  (resmî renkleriyle), **Tren Ligero** (Tasqueña–Xochimilco), **Cablebús 1/2/3**,
  **Tren Suburbano**, **Metrobús L1-L7** (L5 2026-09-14'te tamamlandı, aşağı
  bak). 191 istasyon + 117 durak (Metrobús/teleferik) + 13 hub (Pantitlán, Tacubaya, Hidalgo, Bellas Artes,
  Balderas, Chabacano, Centro Médico, La Raza, Indios Verdes, Universidad,
  Mixcoac, Buenavista, San Lázaro).
  **Cablebús `lineRef:"metro"` çipinde** (kullanıcı kararı, 2026-09-14): ilk
  denemede tramvay çipine konmuştu (sabit güzergâh, metro değil, otobüs değil),
  ama teleferik CDMX'te Metro ağının bileti ve markasıyla işletiliyor; kullanıcı
  da öyle düşünüyor. App'in çip anahtarları (metro/tram/bus/train/ferry) sabit
  olduğundan ayrı bir "teleferik" anahtarı kod değişikliği demekti; taşıma
  yalnız veride yapıldı (3 hat + 3 rozet + 10 durak).
- **Varış (7 kapı, 1 link):** AICM T1 (Metrobús L4 ile Buenavista, 9.1 km
  gerçek güzergâh) ve T2, Buenavista (Tren Suburbano), Terminal del Norte,
  TAPO, Taxqueña, Observatorio.
- **Keşfet (395 nokta, 70 KB):** tarihi 97 / doğa 85 / kamu 50 / modern 49 /
  gastronomi 45 / alışveriş 36 / otel 30 / yurt 3. İkonik allowlist uygulandı:
  Zócalo, Catedral, Templo Mayor, Palacio Nacional, Bellas Artes, Castillo de
  Chapultepec, Casa Azul, Antropología, Torre Latinoamericana, Soumaya,
  Tamayo, Papalote, Estadio Azteca, La Merced/San Juan/Coyoacán/Medellín
  pazarları — 24 nokta elle geri eklendi.
- **İhtiyaç (252 nokta, 45 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 17.
- **Bölgeler:** turistik 4 — **Centro Histórico**, **Roma · Condesa**,
  **Polanco**, **San Ángel** (`admin_level=10` colonia birleşimi). Ticari 33,
  eğitim 64, doğal 62.
- **İçerik:** 6 dilde `content/*.json` (7 kapı + 13 hub alt etiketi, `mx.` öneki).

Boru hattında öğrenilenler:
- **`tools/geo.py`'de gerçek bir hata düzeltildi:** way'leri tek bir şeride
  birleşen hat (Metrobús L4, Cablebús) `unary_union`'dan `LineString` olarak
  dönüyor ve `linemerge()` bunda **istisna fırlatıyordu** — `docs/VERI.md`
  "tek LineString dönerse linemerge atlanır" diyordu ama kod atlamıyordu.
  Artık geometri tipine bakılıyor. (Bu hata Seul/Sidney/Toronto'da patlamadı
  çünkü oralarda her hat çok parçalıydı.)
- **Metrobús L5'in OSM'de `ref` etiketi yok** (9 ilişkisi de yalnız
  `name="Línea 5 (…)"`) **ve rota ilişkilerinde hiç yol üyesi yok** — üyelerin
  tamamı peron (48 düğüm + 2 peron way'i). Yani Overpass'ın "boş elements"
  cevabı ayna arızası değil, dürüst cevaptı; ilk teşhisim ("Overpass kesintisi")
  yalnız bbox sorguları için doğruydu. Çözüm (2026-09-14): duraklar OSM
  API'sinden (`/api/0.6/relation/<id>/full.json`) alındı, koridorun **gerçek
  yol way'leri** Overpass'tan çekildi ve iki durak arası güzergâh **graf
  en-kısa-yolla** dikildi — varış link'lerinde kullanılan yöntemin aynısı.
  Sonuç: 27.9 km, 2 parça, en uzun düz segment 1265 m, 33 yeni durak.
  49 bacaktan 1'i dolambaç eşiğini aştığı için boşluk bırakıldı (düz çizgiyle
  köprülenmedi).
- **Coyoacán ve Xochimilco'nun colonia poligonları OSM'de yok** (489
  colonia'nın hiçbiri o adlarla değil) → turistik bölge 4'te kaldı. İkisi de
  Keşfet noktalarıyla temsil ediliyor (Jardín Centenario, Casa Azul, Mercado
  de Coyoacán; Xochimilco embarcaderos + Ejidos/Parque Ecológico doğal
  alanları).
- **Bosque de Chapultepec OSM'de tek poligon değil:** `leisure=park`,
  `nature_reserve`, `landuse=forest` ve `boundary=protected_area` sorgularının
  hiçbiri bütün parkı getirmiyor (yalnız içindeki küçük bahçeler). Doğal
  bölgede yok; Keşfet'te Castillo/Tamayo/Papalote/Auditorio ile temsil
  ediliyor.
- **Ad bazlı tekilleştirme gastronomide de kapatıldı:** CDMX'te 594 aday
  13'e düşmüştü (aynı adlı mercado'lar ve zincir kafeler). Izgara zaten hücre
  başına bir aday bıraktığı için kural artık yalnız kültür temalarında.

Denetim:
- `tools/audit_omurga.py mexicocity` → ilk turda **16 ihlal**; `repair.py`
  sonrası **TEMİZ**. Cablebús hatları da onarıldı: teleferik açıklığı gerçekten
  düz olduğu için kord = gerçek güzergâh (1.00x), onarım yalnız gerçek ara
  düğümleri geri getirdi.
- `tools/audit_data.py --city mexicocity` → **45 bulgu**, hepsi bilinen iki
  kategori: OSM'de gerçekten dikdörtgen çizilmiş alanlar (42 — eğitim 21,
  ticari 16, doğal 5) ve müze çift kaydı (3: Biblioteca Vasconcelos, Museo
  Indígena, Frida Kahlo). İlk turdaki 1 orphan (hattan 306 m uzaktaki Metrobús
  durağı) ve katman içi 2 çift kayıt silindi.
  (**Düzeltme:** ilk yayında bu satır "2 bulgu, kutu yok" diyordu; o ölçüm
  bölge katmanları `data/mexicocity/layers/`'a kopyalanmadan önce alınmıştı.)
- Tarayıcı dumanı: 8 katman + manifest + içerik 200, konsol hatası yok,
  şehir çubuğu "Ciudad de México · 14 Sept · 05:43" (CST = UTC-6 doğru).

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260914-4**
      (L5 tamamlanınca -3, Cablebús metro çipine alınınca -4)
- [x] Katman dosyaları hedefin altında (en büyüğü omurga 99 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam; **Metrobús L5 de 2026-09-14'te tamamlandı** (yukarı bak),
eksik hat kalmadı. Göz kontrolü beklenen yer: Centro Histórico'daki nokta
yoğunluğu (tarihi 97 nokta merkezde toplanıyor).

---

## Yeni şehir — Москва (Moskova) ✅ tamam (2026-09-14)

`yeni-sehir` parametrik boru hattıyla eklendi. Dil **`ru`** (yeni `lang.ru`
anahtarı 6 dile eklendi), para **RUB** (`CURRENCY_SYM`'e `RUB="₽"`).
Kullanıcı kararları: **üç havalimanı da çerçeve içinde**, **tramvayda
merkeze değen seçilmiş set**, **monoray + nehir hattı atlandı**.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[37.6173, 55.7558]`, `Europe/Moscow`, zoom min 8.6 /
  max 19, maxBounds `[[37.20,55.38],[37.95,56.00]]` (~47×69 km; Şeremetyevo
  kuzeyde, Domodedovo güneyde, Vnukovo batıda). Fiyatlar editoryal
  (`updated: 2026-09`; metro bileti 65 ₽, Aeroexpress 550 ₽).
- **Omurga (281 KB, 723 feature, 32 hat, 2036 km):** metro **1-12, 15, 16, 17**
  + **4А/8А** kolları, **МЦК (14)** halkası, **МЦД D1-D4**, ve merkeze değen
  **10 tramvay** (А, 7, 13, 26, 38, 39, 47, 50, т1, т2 — 38 hattın tamamı
  haritayı boğuyordu, Kremlin'e uzaklığa göre seçildi). 369 istasyon +
  277 durak + 13 hub (Komsomolskaya, Kurskaya, Kitay-gorod, Park Kultury,
  Taganskaya, Kiyevskaya, Belorusskaya, Paveletskaya, Oktyabrskaya,
  Savyolovskaya, Nizhegorodskaya, Prospekt Mira, Chistye Prudy).
- **Varış (9 kapı, 2 link):** SVO (Aeroexpress ile Belorussky, **33.7 km**),
  DME (Aeroexpress ile Paveletsky, **46.3 km**), VKO, üç gar meydanı
  (Leningradsky+Yaroslavsky+Kazansky), Belorussky, Kievsky, Paveletsky,
  Şçolkovski ve Salaryevo otogarları.
- **Keşfet (421 nokta, 83 KB):** tarihi 101 / doğa 86 / modern 51 / kamu 50 /
  gastronomi 43 / alışveriş 35 / otel 30 / yurt 25. İkonik allowlist
  uygulandı — 28 nokta elle geri eklendi.
- **İhtiyaç (255 nokta, 49 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 20.
- **Bölgeler:** turistik 7 rayon birleşimi (Tverskoy·Kitay-gorod, Arbat·
  Khamovniki, Zamoskvorechye·Yakimanka, Presnensky·Moscow City,
  Ostankino·VDNH, Krasnoselsky, Tagansky). Ticari 67, eğitim 61, doğal 149.
- **İçerik:** 6 dilde `content/*.json` (9 kapı + 13 hub alt etiketi, `mo.` öneki).

Boru hattında öğrenilenler:
- **`tools/audit_data.py`'de ölçüm hatası düzeltildi:** orphan kontrolü
  dereceyi `× 111000` ile metreye çeviriyordu, boylam kısalmasını (cos φ)
  hesaba katmadan. 55.8°N'de bu **~1.8x şişirme** demek: Moskova'da 20 sahte
  orphan çıktı. Ölçüm artık enleme göre ölçekleniyor; düzeltmeden sonra
  gerçek ihlal 8'e indi (hepsi çizilmeyen komşu hatların durakları, atıldı).
  Düzeltme yalnız mesafeyi küçülttüğü için diğer 21 şehirde yeni bulgu
  üretmiyor.
- **Vnukovo'nun Aeroexpress'i yok artık:** 2023'te metro **8А** uzatıldı.
  `relink` "yol bulunamadı" dedi çünkü 8А ile hat 3/4 ayrı tüneller; kapı
  link'siz bırakıldı (içerik metninde metro 8А yazıyor) — düz çizgi
  çizilmedi.
- **Kapı koordinatı yine kritikti:** SVO ve DME kapıları havalimanı
  merkezine konunca Aeroexpress rayına 957/909 m uzaktaydı; ikisi de OSM'deki
  gerçek Aeroexpress istasyonuna taşındı (snap 5 m / 13 m).
- **Rayon = `admin_level=8`** (ilk denemede 9 yazılmıştı, turistik 0 alan
  döndü). Rayon adları `name:en`'de Latin harfli.
- **Kiril/Latin karışık adlar:** istasyonların 342/667'si yalnız Kiril adlı
  (name:en yok). Tokyo/Seul'deki gibi olduğu gibi bırakıldı — yer adları
  çevrilmez.
- **Künye kartında dolar karşılığı RUB'da boş kalıyor:** Frankfurter (ECB
  kaynaklı, 30 para birimi) rubleyi taşımıyor. Uygulama bozulmuyor, satır
  kursuz görünüyor; fiyat tablosu ₽ olarak editoryal. Anahtarlı kur servisi
  eklemek proje kararına aykırı olduğu için böyle bırakıldı.

Denetim:
- `tools/audit_omurga.py moscow` → ilk turda **16 ihlal**; `repair.py` sonrası
  **TEMİZ**. МЦД D1 (1.70x) ve D3 (1.46x) kıvrım oranları hattın köşe kestiğini
  gösterdi; gerçek güzergâh dikildi.
- `tools/audit_data.py --city moscow` → **19 bulgu**, hepsi bilinen kategori:
  OSM'de gerçekten dikdörtgen çizilmiş alanlar. Dup ve orphan sıfır.
- Tarayıcı dumanı: 8 katman + manifest + içerik 200, `data/moscow/*`
  isteklerinden hiçbiri düşmüyor, şehir çubuğu "Москва · 14 Sept · 22:01"
  (MSK = UTC+3 doğru).

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260914-5**
- [x] Katman dosyaları hedefin altında (omurga 281 KB < 400 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Üç ikonik nokta (**ГУМ**, **Афимолл Сити**, **Кремль в
Измайлово**) 2026-09-15'te tamamlandı — ayrıntı aşağıdaki ek kayıtta.
Göz kontrolü beklenen yer: 10 tramvay
hattının metro ağıyla üst üste bindiği merkez, ve 149 doğal alanın kuzeydeki
Losiny Ostrov ile haritayı ne kadar kapladığı.

**Ayrıca (bu şehirden bağımsız, önceden var olan bulgu):** `audit_data` üç
şehirde `kesfet-poi` dosyasını hedefin üstünde buluyor — London 284 KB,
Madrid 264 KB, Berlin 212 KB (hedef 200 KB). Bu oturumda dokunulmadı.

### Ek — Moskova'nın üç ikonik noktası (2026-09-15)

Overpass'ın ad sorguları yine düştü, ama sebep bu kez netleşti: ajan
vekilinin tüneli **6 saniyede** kapanıyor (`ws_closed_mid_exchange`,
39 bayt alınmış), yani yavaş yanıt veren her sorgu kesiliyor — aynanın
yükü değil, aradaki tünel. Dar bbox denemesi de kurtarmadı.

Çözüm: **Nominatim** (openstreetmap.org, anahtarsız, build anında) ile ada
göre arama; koordinatlar oradan alınıp elle eklendi:
- **ГУМ** `[37.62144, 55.75470]` (alışveriş) — en yakın kayda 131 m
- **Афимолл Сити** `[37.53977, 55.74915]` (alışveriş) — 730 m
- **Кремль в Измайлово** `[37.75052, 55.79432]` (tarihi) — 120 m'lik
  tekilleştirme eşiği bunu önce eledi; 27 m ötedeki kayıt **kompleksin
  içindeki kilise** (Храм свт. Николая Мирликийского), aranan simge değil.
  Eşik mekanik: yakın komşu her zaman aynı yer demiyor.

Keşfet 421 → **424 nokta**. `audit_data --city moscow` yine 19 bulgu
(hepsi gerçekten dikdörtgen OSM alanı), `audit_omurga` TEMİZ. Önbellek
sürümleri birlikte **20260915-1**.

---

## Yeni şehir — Buenos Aires ✅ tamam (2026-09-15)

`yeni-sehir` parametrik boru hattıyla eklendi (kullanıcının "sırayla 4 şehir"
kararının 1.'si: Buenos Aires → Hong Kong → Milano → Kahire). Dil `es`,
para **ARS** (`CURRENCY_SYM`'e `ARS="AR$"`). Kullanıcı kararı: **Ezeiza
çerçeve içinde**.

Yapıldı (hepsi OSM Overpass boru hattı):
- **Manifest:** merkez `[-58.3816, -34.6037]`, `America/Argentina/Buenos_Aires`,
  maxBounds `[[-58.75,-34.87],[-58.28,-34.45]]` (~43×47 km). Fiyatlar
  editoryal (`updated: 2026-09`); **`airportTrain` satırı hiç yazılmadı** —
  şehirde havalimanı treni yok, sıfır göstermek yanlış olurdu.
- **Omurga (90 KB, 290 feature, 15 hat, 758 km):** Subte **A/B/C/D/E/H**
  (resmî renkleriyle), **Premetro P**, **Tren de la Costa**, ve yedi banliyö
  hattı: Mitre, Sarmiento, Roca, San Martín, Belgrano Norte, Belgrano Sur,
  Urquiza. 236 istasyon + 16 durak + 8 hub (Retiro, Constitución, Once,
  Carlos Pellegrini, Diagonal Norte, Catedral, Federico Lacroze, Plaza Italia).
- **Varış (7 kapı, 0 link):** Ezeiza, Aeroparque, Retiro, Terminal de Ómnibus,
  Constitución, Once, Buquebus. **Hiçbir havalimanının raylı bağlantısı yok**
  (kullanıcı onayıyla): kapılar link'siz duruyor, düz çizgi çizilmedi, otobüs
  bilgisi içerik metninde.
- **Keşfet (386 nokta, 70 KB):** tarihi 92 / doğa 87 / modern 52 / kamu 49 /
  gastronomi 41 / alışveriş 35 / otel 30. **Yurt teması boş** — OSM'de
  Buenos Aires'te `building=dormitory` etiketi yok (sorgu boş döndü).
  İkonik allowlist uygulandı: 16 nokta elle geri eklendi.
- **İhtiyaç (248 nokta, 44 KB):** eczane 55 / market 55 / kütüphane 35 /
  müze 35 / yakıt 30 / hastane 25 / kiralık araç 13.
- **Bölgeler:** turistik 6 barrio birleşimi (Centro·Monserrat, San Telmo,
  La Boca, Puerto Madero, Recoleta, Palermo — `admin_level=9`, altısı da
  eksiksiz bulundu). Ticari 24, eğitim 18, doğal 28.
- **İçerik:** 6 dilde `content/*.json` (7 kapı + 8 hub alt etiketi, `ba.` öneki).

Boru hattında öğrenilenler:
- **Boş liste ≠ tanımsız:** `assemble.py`'de `getattr(_spec,'LINKS',None) or
  [varsayılan]` yazıyordu; Buenos Aires'in **bilinçli boş** `LINKS = []`
  listesi falsy olduğu için Seul'ün link'lerine düşüyordu (`KeyError:
  gate-icn`). Artık `is None` kontrolü var.
- **İkonik arama için Nominatim yolu açıldı** (`iconic_nom.py`): Overpass'ın
  ad sorguları bu ortamda vekil tünelinde ölüyor (6 sn), Nominatim aynı OSM
  verisini saniyenin altında döndürüyor. Overpass'ta düşen 3 noktadan
  CCK bununla eklendi; diğer ikisi zaten sette çıktı (0-1 m).
- **Yardımcının id sayacı çakıştı:** `ke-ikonik-0` iki kez üretildi
  (`audit_data` yakaladı). Artık `ke-nom-*` ve kullanılmış id kontrolü var.
- **Banliyö hatlarının rengi OSM'de aynı** (#37BBED, Trenes Argentinos mavisi)
  — beş hat aynı renkte çiziliyor, ayrım rozetlerden (LM/LS/LR/LSM/LBS).

Denetim:
- `tools/audit_omurga.py buenosaires` → ilk turda **10 ihlal** (en kötüsü
  Belgrano Sur'da 15.136 m); `repair.py` sonrası **TEMİZ**, kıvrım oranları
  1.00-1.03x.
- `tools/audit_data.py --city buenosaires` → **18 bulgu**: 17 kutu (gerçekten
  dikdörtgen OSM alanı) + 1 müze çift kaydı (Bellas Artes). İlk turdaki
  katman içi çift kayıt (Jardín Botánico) ve id çakışması düzeltildi.
- Tarayıcı dumanı: 8 katman + manifest + içerik 200, konsol hatası yok,
  şehir çubuğu "Buenos Aires · 15 Sept · 12:11" (ART = UTC-3 doğru).

Bitti sayılır:
- [x] `data/cities.json`'da `ready`, önbellek sürümleri birlikte **20260915-2**
- [x] Katman dosyaları hedefin altında (en büyüğü omurga 90 KB)
- [x] Denetim araçları temiz

Durum notu: Tamam. Künye kartında **dolar karşılığı ARS'de boş kalıyor**
(Frankfurter'ın 30 para biriminde peso yok, ruble gibi) ve Arjantin
enflasyonunda editoryal fiyat tablosu hızlı eskir — `updated: 2026-09`
etiketiyle bilerek yayınlandı. Göz kontrolü beklenen yer: beş banliyö
hattının aynı mavi tonu ve doğal bölgenin yalnız 28 alanla kalması.
