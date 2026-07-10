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

## `data/<sehir>/city.json` (manifest)

```json
{
  "id": "roma",
  "center": [12.483, 41.893],
  "zoom": { "start": 11, "min": 9, "max": 16 },
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

## `data/<sehir>/content/<dil>.json`

```json
{
  "tips": { "termini.tip": "Termini ulaşımın kalbi; tarihi merkez 15 dk batıda." },
  "intro": [
    { "camera": { "center": [12.25, 41.8], "zoom": 9.5 },
      "layersOn": ["varis"], "text": "Roma'ya iki havaalanından inersin..." }
  ]
}
```
`intro` = rehberli mod adımları (E6). Metinler kısa: 1-2 cümle.

## i18n arayüz dosyaları (`i18n/<dil>.json`)

Düz anahtar-değer; iç içe grup için nokta kullanılır:
`"group.varis": "Varış"`, `"action.locate": "Konumum"`.
en+tr her zaman tam olmalı; diğer diller eksik anahtarda İngilizce'ye düşer (fallback).

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
   (~40 m) ile sadeleştirilir, 5 hane yuvarlanır.

## Ek alanlar (2026-07-10)

| Alan | Nerede | Açıklama |
|---|---|---|
| `mode` | varis gate'leri | `plane/train/bus/ship` → kapı simgesi |
| `btype` | bolge-* | `turistik/ticari/egitim/dogal` → tür rengi |
| `kind:"stop"` | omurga | tramvay/otobüs/tren durağı (z12.5+) |
| `kind:"district(-label)"` | bolge-* | bölge poligonu / etiket noktası |
