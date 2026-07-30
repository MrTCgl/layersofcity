---
name: yeni-sehir
description: Uygulamaya yeni bir şehir ekle — veri klasörünü, katmanları ve içerikleri kurallara uygun oluşturur. Kullanıcı "X şehrini ekleyelim" dediğinde kullan.
---

# Yeni şehir ekle — eksiksiz üretim rehberi

İlke (CLAUDE.md): **yeni şehir = yeni veri klasörü; kod değişmez.**
Kod değişikliği gerektiren bir eksik bulursan önce kullanıcıya bildir.
Bu rehber, hiçbir önceki oturumu görmemiş bir modelin şehri baştan sona
üretebilmesi için yazıldı. Referans uygulama: `data/istanbul/` (en güncel),
`data/roma/` (ilk örnek). Şema ayrıntıları: `docs/VERI.md`.

## 0. Ön hazırlık

1. `docs/VERI.md`, `docs/TASARIM.md` ve bu dosyayı oku.
2. Şehrin sınır kutusunu belirle: `maxBounds = [[w,s],[e,n]]` (şehir + banliyö
   kapıları sığsın), `home` = şehir merkez alanı (açılış fitBounds),
   `zoom: { start: ~10, min: 8.5-9, max: 19 }` (**max her zaman 19**).
3. `data/cities.json`'a şehri `status:"soon"` olarak ekle ve push'la
   (vitrinde soluk görünür). `anchor` KOYMA — etiket otomatik yerleşir.

## 1. Onay taslağı (kod/veri üretmeden önce)

Şehri araştır ve kullanıcıya tek mesajlık taslak sun:
- **Giriş kapıları** (varis): havaalanları (`mode:"plane"`), ana garlar
  (`train`), otogar (`bus`), iskeleler (`ship`). Her kapı için merkeze
  bağlanan GERÇEK hat (ör. CDG→RER B, IST→M11) ve süre.
- **Merkez(ler)** ve ana aktarma hub'ı (Termini/Châtelet benzeri).
- **Omurga**: metro + tramvay + banliyö treni + (varsa) metrobüs/kilit otobüs.
- **Bölgeler** (4 tür): turistik / ticari / eğitim / doğal.
Onaysız yorumsal katman işleme.

## 2. Veri üretimi — Overpass boru hattı

Tüm geometri OpenStreetMap Overpass API'sinden üretilir (build anında;
çalışma zamanında değil). Sorgular Python + shapely ile işlenir
(`pip install shapely`). Ayna uçlar: overpass-api.de, overpass.kumi.systems,
overpass.private.coffee (504/429'da sırayla dene; User-Agent ver).

### 2a. Omurga hatları (omurga.geojson)

Her hat için:
```
[out:json][timeout:180];
relation["route"="subway"]["ref"="M4"](s,w,n,e);
way(r)[!"building"];out geom;
```
- route değerleri: `subway` (metro), `tram`, `train` (banliyö/Marmaray/RER),
  `funicular`, `bus` (yalnız kilit hat: metrobüs/BRT). ref yoksa `name` regex'i.
- İşleme: way'ler `unary_union` + `linemerge` (tek LineString dönerse linemerge
  ATLANIR — dairesel hat), `maxBounds`'a kırpılır, `simplify(0.00015)`
  (~15 m), 5 hane yuvarlanır, <120 m kırıntılar atılır → MultiLineString.
- Properties: `{ id:"line-m4", kind:"line", lineRef:"metro", ref:"M4",
  color:"#E91E76" }`. `color` = hattın resmi rengi (OSM `colour` etiketi);
  yoksa `lineRef` paleti devreye girer. `lineRef` değerleri: `metro`, `tram`,
  `bus`, `train` (Hatlar menüsündeki 4 anahtar bunlara göre süzer; Roma'daki
  `metro-a/b/c`, `rail` tarihseldir).
- İstasyonlar: `kind:"node"` (metro istasyonu), `kind:"stop"` (tram/otobüs
  durağı, z12.5+), `kind:"hub"` (ana aktarma), `kind:"badge"` + `ref`
  (hat rozeti, hattın orta noktasına), `lab:1` = etiketi görünsün.

### 2b. Gerçekçilik denetimi (ZORUNLU — 2026-07-14 kuralı)

- Hiçbir hat/link'te **2 km'den uzun düz segment** kalmamalı; hat başına
  yoğunluk genelde **>2 köşe/km** olmalı. İhlal = o hat Overpass'tan yeniden.
- **Hazır araçlar (2026-07-30):** `tools/audit_omurga.py` denetler,
  `tools/repair.py <şehir> [--varis] [--apply]` onarır. Onarım **kord kord**
  çalışır: uzun segmentin iki ucu arasındaki gerçek OSM güzergâhı graf
  en-kısa-yolla bulunup yerine dikilir — hattı komple yeniden çekmek kapsamı
  şişirir (Roma FL seti 353→601 km olmuştu). Seçiciler `tools/spec.json`'da.
- **2 km ölçütü vekildir:** gerçek soru "geometri OSM'den sapıyor mu". Kordun
  iki ucu arasındaki gerçek yol ≈ kord ise (1.00x) o düzlük gerçektir (Roma
  FL1'in Fiumicino ovasındaki 5.2 km'si böyleydi); belirgin uzunsa (Paris RER
  C'de 2.27x) hat köşe kesmiş, gerçek güzergâh dikilir.
- **Ferry hatları muaf:** su üstü geçiş gerçekten düz çizgidir.
- **Varis link'leri düz çizilmez.** Kapıyı merkeze bağlayan gerçek raylı
  hattın way'lerini çek, birleştir, iki ucu hatta izdüşür, aradaki parçayı al
  (shapely `substring`), uçlara kapı/merkez koordinatını ekle.
- **Kapı koordinatları** gerçek istasyon/terminale otursun (Overpass'tan
  `railway=station` adıyla doğrula; Halkalı dersi: kapı 2.5 km kayıktı).

### 2c. Keşfet + İhtiyaç noktaları (kesfet-poi / ihtiyac.geojson)

- Temalar ve sorgular: `docs/VERI.md` → "OSM üretim boru hattı" adım 1.
- Kalite vekili: wikipedia/wikidata > marka > adlı; adsız elenir.
- Izgara seyreltme: ~1 km hücrede en iyi aday + kategori tavanı.
- **İkonik landmark allowlist (zorunlu):** `docs/IKONIK_LANDMARKLAR.md`'deki
  şehir listesiyle çakıştır; eksik ünlü simgeleri elle geri ekle
  (Topkapı dersi: seyreltme dünyaca ünlü yerleri eleyebilir).
- Properties: `{ id, kind:"poi", name, theme }`; theme değerleri
  `docs/VERI.md` tablosunda.

### 2d. Bölgeler (bolge-turistik/ticari/egitim/dogal.geojson)

- **turistik**: elle kutu/üçgen ÇİZME. OSM idari sınırları kullan:
  mahalle/quartier/rione (`admin_level=9/10`) poligonlarını çek, turistik
  alanı oluşturan bitişik mahalleleri birleştir (`unary_union`),
  `simplify(~0.0003)` ile yumuşat. Kıyıda denize taşma olmaz (idari sınırlar
  zaten kıyıyı izler). Her bölgeye `kind:"district"`, `btype:"turistik"`,
  `lab:1` + ayrı `kind:"district-label"` noktası (poligon centroid'i).
- **ticari**: `landuse=commercial|retail` (>0.04 km²) · **egitim**:
  `amenity=university` poligonları · **dogal**: adlı `leisure=park` /
  `boundary=national_park|protected_area` (>0.15 km²). Bunlar zaten gerçek
  OSM geometrisidir; olduğu gibi (sadeleştirip) al.

### 2e. Dosya boyutu

- Hedef: katman dosyası < 200 KB (omurga yoğun şehirde < 400 KB kabul).
- `json.dump(..., separators=(",",":"))`, koordinat 5 hane.

## 3. Manifest + içerik

1. `data/<sehir>/city.json`: `id, center, zoom{start,min,max:19}, home,
   maxBounds, timezone, language, currency, prices{updated,...}, available[],
   groups[]` — İstanbul manifestini şablon al. `prices` editoryaldir;
   `updated` (YYYY-AA) olmadan yayınlanmaz.
2. `content/tr.json` + `content/en.json`: kapı/hub alt etiketleri
   (`subKey` karşılıkları), şehir önekiyle (`arr.`, `pa.` gibi). Örn:
   `"arr.ist.sub": "→ Gayrettepe · M11 · ~35 dk"`. Yer adları çevrilmez.
3. `walkability.geojson` (isteğe bağlı ama önerilir): yaya/arter overlay'i —
   `highway=pedestrian|living_street` (yeşil) + `motorway|trunk|primary`
   (arter), `k` (kind) ve `t` (tier) alanlarıyla; Roma örneğine bak.

## 4. Doğrulama ve yayın

1. `python3 -m json.tool` ile tüm JSON'lar geçerli mi; `node --check js/app.js`
   dokunulmadıysa gerekmez.
2. Yerel sunucuda (`python3 -m http.server`) aç: iki tema × iki dil × mobil
   genişlik; üç altlıkta da (Sade/OSM Detaylı/Uydu) hatların hizasını kontrol
   et — metro hattı Shortbread'deki demiryoluyla çakışmalı.
3. Gerçekçilik denetimini (2b) sayısal çalıştır: en uzun segment raporu.
4. `cities.json`'da şehri `"ready"` yap; **önbellek sürümlerini birlikte artır**
   (aşağı bak), commit'le (mesaj Türkçe), push'la.
5. **Canlıya alma:** GitHub Pages varsayılan daldan (`claude/rome-transit-map-app-*`)
   `layersofcity.com`'a yayınlıyor; ayrı deploy workflow'u yok. Şehir dalını
   varsayılan dala **fast-forward** push et. Pages build'i (Actions →
   "pages build and deployment") ~1-2 dk sürer; başarılı olunca canlı.

## ⚠️ Önbellek sürümleri — HEPSİNİ birlikte artır (2026-07-18 dersi)

Berlin eklendiğinde şehir canlıda görünmedi: `BM_VER` artırılmış ama
`index.html`'deki `app.js?v=` eski kalmıştı → tarayıcı eski app.js'i (ve eski
şehir listesini) önbellekten servis etti. Yeni şehir/veri yayınında **üçü de**
aynı sürüme çekilmeli:

- `js/app.js` → `const BM_VER = "<yeni>"` (veri/altlık/içerik fetch'lerini kırar)
- `index.html` → `<script src="js/app.js?v=<yeni>">` (app.js'i kırar — **en kritik**,
  atlanırsa hiçbir değişiklik kullanıcıya ulaşmaz)
- (CSS/world-dots.js yalnızca **değiştiyse** kendi `?v=`'leri artırılır)

`data/cities.json` artık `?v=${BM_VER}` ile çekiliyor (eskiden buster'sızdı,
şehir listesi önbellekte takılıyordu — düzeltildi). Sert yenileme her zaman
yetmez; asıl güvence sürüm sorgusudur.

## ⚠️ Overpass tuzakları (2026-07-18 dersi)

- **Boş cevabı ASLA cache'leme.** Aşırı yüklü ayna HTTP 200 + boş `elements`
  dönebilir; başarı sanıp cache'lersen hat "sessizce" kaybolur. Yalnızca
  `elements` dolu cevabı yaz; boşta aynayı çevir.
- **Cache anahtarı stabil olmalı:** Python `hash()` süreç başına tuzlanır →
  cache tutmaz; `hashlib.md5(query)` kullan.
- **`out geom` (relation) tüm ağ için 504 verir;** hat-hat
  `rel; out tags; way(r)[!building]; out geom;` formu güvenilir. Ayna rotasyonu
  (de/kumi/private.coffee) + paralel 2-3 işçi ile cache ısıt.
- **Hat rota etiketi şehre göre değişir:** Berlin S-Bahn `route=light_rail`
  (subway/train değil!). Yeni şehirde bir ref 0 eleman dönüyorsa önce doğru
  `route`/`ref` etiketini `out tags;` ile teyit et.
- **Sahte uzun düz segment** DP sadeleştirmesinin zigzag'ı kısa devre
  yapmasından gelir: yumuşak tolerans (~0.00006) + >1.7 km segmentleri
  densify et (noktalar gerçek hattın üstünde). Çift-yön izleri uzunluğu ~2x
  yapar ama harita ölçeğinde üst üste biner (kabul).
- **Alan (bölge) sorguları** tüm `maxBounds`'ta ağırdır; merkezî bir alt-bbox
  kullan. **İkonik parklar** (Tiergarten/Tempelhof gibi) relation'dır ve
  ızgara/alan filtresinden kaçar → ada göre elle çek (allowlist).
- **"Eksik" hat OSM'de olmayabilir:** Berlin S45 kaldırılmış (BER sonrası);
  ref 0 dönüyorsa `["ref"~"^S4"];out tags;` ile hattın gerçekten var olup
  olmadığını doğrula, boşuna bekleme.

## Kalite çıtası (özet)

- Katman grupları sabit: Varış / Omurga (Hatlar) / Keşfet / Bölgeler / İhtiyaçlar.
- Yer adları çevrilmez; arayüz metni i18n anahtarıdır; kod içi yorum İngilizce.
- Hat renkleri: resmi renk `color` alanında; palet yedek.
- Hiçbir katmanda stilize düz çizgi/kutu geometri yok — her şey gerçek OSM
  geometrisi veya onun sadeleştirilmiş hali.
