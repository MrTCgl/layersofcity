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
