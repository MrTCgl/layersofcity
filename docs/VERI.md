# Veri Modeli

İlke: **yeni şehir = yeni klasör.** Kod hiçbir şehri tanımaz; her şeyi veriden okur.

## Klasör yapısı

```
data/
  cities.json              # dünya ekranındaki şehir listesi
  roma/
    city.json              # şehir manifesti
    layers/
      varis.geojson        # giriş kapıları + merkez bağlantıları
      omurga.geojson       # metro/tram omurgası + merkez işaretleri
      kesfet-poi.geojson   # ilgi noktaları (tema etiketli, şehir geneli)
      bolge-turistik.geojson # bölge türleri (kind:"district", btype alanlı)
      bolge-ticari.geojson
      bolge-egitim.geojson
      bolge-dogal.geojson
      ihtiyac.geojson        # kategori etiketli ihtiyaç noktaları
    content/
      tr.json              # editoryal metinler + rehberli mod adımları
      en.json
i18n/
  tr.json  en.json  de.json  fr.json  it.json  es.json   # arayüz metinleri
```

## `data/cities.json`

```json
{
  "cities": [
    { "id": "roma", "name": "Roma", "lat": 41.893, "lon": 12.483, "status": "ready" },
    { "id": "istanbul", "name": "İstanbul", "lat": 41.01, "lon": 28.96, "status": "soon" }
  ]
}
```
`status: "soon"` olan şehir dünya haritasında soluk görünür, tıklanamaz.

**`anchor` opsiyoneldir (2026-07-12).** Verilmezse şehir etiketi dünya
haritasında **otomatik yerleştirilir** (noktaların ve önceden yerleşmiş
etiketlerin üstüne binmeyecek ilk konum: sağ/sol/üst/alt denenir). Yalnızca
otomatik yerleşim kötü sonuç verirse `"anchor": [dx, dy]` ile elle sabitle
(piksel ofseti; manuel değer her zaman kazanır). Yeni şehirlerde anchor
koymana gerek yok.

## `data/<sehir>/city.json` (manifest)

```json
{
  "id": "roma",
  "center": [12.483, 41.893],
  "zoom": { "start": 11, "min": 9, "max": 19 },
  "timezone": "Europe/Rome",
  "language": "it",
  "currency": "EUR",
  "prices": {
    "updated": "2026-07-08",
    "water1l": 0.5, "petrol1l": 1.85, "milk1l": 1.6,
    "meat1kg": 13.5, "cheese1kg": 15.0, "beer05": 1.3, "bigmac": 6.15
  },
  "groups": [
    { "id": "varis",  "layers": ["varis"], "defaultOn": true },
    { "id": "omurga", "layers": ["omurga"], "defaultOn": true },
    { "id": "kesfet", "layers": ["kesfet-poi", "kesfet-yogunluk"], "defaultOn": false,
      "filters": ["tarihi", "modern", "doga", "gastronomi", "alisveris", "saglik"] },
    { "id": "yasam",  "layers": ["yasam-otel", "yasam-konut", "yasam-altmerkez",
      "yasam-ogrenci"], "defaultOn": false },
    { "id": "ihtiyaclar", "layers": ["ihtiyac"], "defaultOn": false,
      "filters": ["kiralik-arac", "market", "muze", "kutuphane",
                  "hastane", "eczane", "yakit"] }
  ]
}
```
Grup/katman görünen adları i18n dosyalarından gelir (`group.varis` gibi anahtarlarla).

- `timezone` → şehir çubuğundaki canlı saat/tarih (Intl API).
- `language`, `currency`, `prices` → künye kartı. Fiyatlar **editoryaldir**,
  yerel para birimindedir ve `updated` tarihi olmadan gösterilmez; USD karşılığı
  çalışma anında Frankfurter kurundan hesaplanır.
- Hava durumu için ayrı alan gerekmez; Open-Meteo `center` koordinatıyla çağrılır.

## GeoJSON özellik (properties) sözleşmesi

Her feature'da:

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `id` | ✔ | Benzersiz, küçük harf, tire ile: `fiumicino`, `metro-a` |
| `kind` | ✔ | `gate` ✈🚂 · `link` (kapı→merkez) · `line` (hat) · `node` (merkez/istasyon) · `poi` · `area` |
| `name` | ✔ | Haritada görünen kısa etiket (yer adları çevrilmez, olduğu gibi) |
| `theme` | poi'de | Keşfet: `tarihi` / `modern` / `doga` / `gastronomi` / `alisveris` / `saglik` · İhtiyaç: `kiralik-arac` / `market` / `muze` / `kutuphane` / `hastane` / `eczane` / `yakit` |
| `lineRef` | line'da | Renk ve **harf rozeti** eşlemesi için: `metro-a`, `metro-b`, `metro-c`, `tram`, `rail` |
| `budget` | isteğe bağlı | 1-3 (★=ekonomik, ★★=orta, ★★★=yüksek). Genel bütçe seçicisi Keşfet+Yaşam+İhtiyaçlar'ı bu alana göre süzer: seçilen düzeye uyanlar + alansız feature'lar görünür |
| `tip` | isteğe bağlı | Tek cümlelik ipucu **i18n anahtarı** (metnin kendisi değil) |

Stil (renk/kalınlık) veriye yazılmaz; `kind` + `lineRef` üzerinden
`docs/TASARIM.md` kurallarıyla kodda eşlenir.

## `data/<sehir>/content/<dil>.json` — şehre özel i18n (2026-07-12)

Şehre özel metinler (kapı/hub/merkez alt etiketleri, `subKey`/`nameKey`
karşılıkları) bu dosyada, **düz anahtar-değer** olarak durur. Şehir açılınca
uygulama bunu global sözlüğün **üstüne bindirir** (`t()` önce şehir içeriğine,
sonra global i18n'e bakar); şehirden çıkınca temizlenir. Böylece herkesin her
açılışta indirdiği `i18n/<dil>.json` şehir sayısıyla şişmez.

```json
{
  "pa.center": "tarihi merkez",
  "pa.cdg.sub": "→ Gare du Nord · RER B · ~30 dk",
  "pa.hub.chatelet": "RER A·B·D · M1·4·7·11·14"
}
```

- Anahtarları **şehir önekiyle** ad'la (Roma `e3.`, İstanbul `arr.`/`hub.`,
  Paris `pa.`) → şehirler arası çakışma olmaz.
- Yükleme: `enterCity` içinde geçerli dil + `en` (fallback) çekilir; dil
  değişince yeniden yüklenir. Dosya yoksa sessizce boş kabul edilir.
- en+tr her zaman tam olmalı; eksik anahtar önce şehir `en`'ine, sonra global
  `en`'e düşer.
- (İleride: `intro` rehberli mod adımları da bu dosyaya eklenebilir — E6.)

## i18n arayüz dosyaları (`i18n/<dil>.json`)

Düz anahtar-değer; iç içe grup için nokta kullanılır:
`"group.varis": "Varış"`, `"action.locate": "Konumum"`.
**Yalnızca paylaşılan arayüz metinleri** burada durur (grup/tema/fiyat
etiketleri, dil adları `lang.*`, kontroller). Şehre özel kapı/hub/merkez
metinleri artık `data/<sehir>/content/` altındadır (yukarı bak).
en+tr her zaman tam olmalı; diğer diller eksik anahtarda İngilizce'ye düşer.

## Kayıtlı noktalar (bookmarks)

- Kullanıcının kaydettiği noktalar **yalnızca cihazda** tutulur; şehir başına
  ayrı anahtar: `localStorage["loc-bm-<sehir>"]`. Sunucu, üyelik, senkron yok.
- Kayıt biçimi: `[{ id, lng, lat, name, note, createdAt }]`.
- Hiçbir yere gönderilmez (konum verisi gibi). Merkezî/admin toplama **yok**
  (kullanıcı kararı: "saf yerel"); gerekirse ileride dışa aktarım + rıza ile.

## Konum (geolocation)

- Şehir ekranında "Konumum" butonu tarayıcı Geolocation API'sini kullanır
  (HTTPS gerektirir; GitHub Pages bunu sağlar). Konum **hiçbir yere gönderilmez**,
  yalnızca haritada gösterilir.
- Kullanıcı konumu şehir sınırları dışındaysa kısa bir ipucu gösterilir,
  harita zorla kaydırılmaz.

## Veri kaynakları ve onay süreci

- Hat/istasyon geometrileri: OpenStreetMap (© OpenStreetMap contributors —
  atıf zorunlu, sayfa altbilgisinde).
- Yorumsal katmanlar (konut, yoğunluk, otel, öğrenci bölgeleri): elle çizilir.
  Süreç: Claude taslak çıkarır → kullanıcı onaylar → GeoJSON'a işlenir.
  Onaysız yorumsal katman yayınlanmaz.
- Referans belgeler (ATAC resmi PDF haritaları) depoya eklenmez; boyut şişirir.


## OSM üretim boru hattı (yeni şehir eklerken aynen uygulanır — 2026-07-10)

Tüm nokta/çizgi/alan katmanları OpenStreetMap Overpass API'sinden **build
anında** üretilir (çalışma zamanı bağımlılığı yok; atıf altbilgide):

1. **Sorgular** (bbox = şehir `home` sınırları):
   - omurga: `route=subway/tram/train/bus` relation'ları + istasyon düğümleri
   - kesfet-poi temaları: `historic|place_of_worship[wikipedia]|attraction`
     (tarihi), `gallery|arts_centre` (modern), `park|garden|viewpoint` (doğa),
     `restaurant|cafe|ice_cream[wikidata] + marketplace` (gastronomi),
     `mall|department_store` (alışveriş), `tourism=hotel` (otel),
     `dormitory` (yurt), `office=government|townhall|courthouse` (kamu)
   - ihtiyac: `pharmacy, supermarket, fuel, car_rental, library, museum, hospital`
   - bolge-*: turistik = merkez rioni + landmark sınırları; ticari =
     `landuse=commercial|retail` (>0.04 km²); egitim = `amenity=university`
     poligonları; dogal = adlı `park|nature_reserve` (>0.15 km²)
2. **Kalite vekili** (Google puanı anahtarlı olduğundan): wikipedia/wikidata
   kaydı > marka/zincir > adlı; adsızlar elenir; otelde `stars>=4` bonusu.
3. **Izgara seyreltme:** ~1 km hücrede en iyi aday + kategori tavanı →
   şehir geneli yayılım, yığılmasız.
4. **Geometri:** relation way'leri uç-uca dikilir (stitch), Douglas-Peucker
   (~15-40 m) ile sadeleştirilir, 5 hane yuvarlanır.
   **Gerçekçilik denetimi (2026-07-14, zorunlu):** hiçbir metro/tram/tren
   hattında ve varış link'inde **2 km'den uzun düz segment** kalmamalı
   (köşe sayısı / uzunluk yoğunluğu genelde > 2 köşe/km olmalı). Uzun düz
   segment = stilize elle çizim demektir; o hat Overpass'tan yeniden çekilir.
   Varış link'leri (kapı→merkez kesikli çizgi) düz çizilmez: kapıyı merkeze
   bağlayan **gerçek raylı hattın güzergâhını** izler (ör. CDG→Nord = RER B,
   IST→Gayrettepe = M11, SAW→Kadıköy = M4, Halkalı = Marmaray). Yöntem:
   ilgili hattın way'leri birleştirilir, iki uç nokta hatta izdüşürülür,
   aradaki parça alınır (shapely `substring`), uçlara kapı/merkez koordinatı
   eklenir.
   **Kapı koordinatı denetimi:** tren kapıları gerçek istasyon konumuna
   oturmalı (Halkalı kapısı 2.5 km kayıktı → istasyona taşındı, 2026-07-14).
   **Bölge sınırı denetimi:** `bolge-*` poligonları 3-5 köşeli kutu/üçgen
   OLAMAZ; OSM idari sınırı (mahalle/quartier/rione, `admin_level=9/10`) veya
   gerçek alan poligonu kullanılır; bitişik mahalleler birleştirilip (~30 m)
   sadeleştirilebilir. Kıyı şehirlerinde bölge poligonu denize taşmamalı.
5. **İkonik landmark güvencesi — allowlist (2026-07-12):** Izgara seyreltme
   (adım 3) ve kalite vekili, dünyaca ünlü zorunlu simgeleri eleyebilir
   (İstanbul'da Topkapı Sarayı bu yüzden atlanmıştı). Bu yüzden her şehir için
   elle bir **"olmazsa olmaz" tarihi/simge listesi** tutulur ve bu noktalar
   seyreltme tavanına **bakılmaksızın** `kesfet-poi.geojson`'a girer.
   Kural: bir turistin şehirle özdeşleştirdiği ilk 30-50 yeri (saraylar,
   ana camiler/katedraller, sarnıçlar/forumlar, kuleler, tarihi çarşılar,
   kaleler, ünlü meydanlar, tarihi garlar) listeye yaz; boru hattı çıktısıyla
   ada göre çakıştır, eksik olanı `theme:"tarihi"` (uygunsa `modern`) olarak
   elle ekle. **Şehir bazlı hazır listeler: `docs/IKONIK_LANDMARKLAR.md`**
   (London/Paris/Berlin/Madrid/New York/Tokyo dâhil). Bir simgeyi "çok bilinen, gelir zaten" diye atlamak yasak —
   tam da bu varsayım Topkapı'yı düşürmüştü. (İstanbul allowlist'i 2026-07-12'de
   uygulandı: Topkapı/Ayasofya/Sultanahmet vb. 49 nokta; Roma allowlist'i
   2026-07-12'de: Palatino/Fori Imperiali/Campidoglio/Vittoriano/Bocca della
   Verità/Santa Maria Maggiore vb. 42 nokta.)

## Ek alanlar (2026-07-10)

| Alan | Nerede | Açıklama |
|---|---|---|
| `mode` | varis gate'leri | `plane/train/bus/ship` → kapı simgesi |
| `btype` | bolge-* | `turistik/ticari/egitim/dogal` → tür rengi |
| `kind:"stop"` | omurga | tramvay/otobüs/tren durağı (z12.5+) |
| `kind:"district(-label)"` | bolge-* | bölge poligonu / etiket noktası |
