# TODO — Geliştirme Turu (2026-07-10) · ✅ ONAYLANDI (uygulama sürüyor)

> Kullanıcının 2026-07-10 tarihli toplu isteği. **Onaydan sonra** T1→T10 sırasıyla
> uygulanır; her T maddesi tek commit + tek PR olarak canlıya alınır (varlık
> sürümü `?v=` her yayında artırılır). Her maddeyi bitirince buradaki kutuyu
> işaretle ve "Durum" satırına tarih düş.
>
> **Bu dosya, oturuma yeni giren bir Claude modelinin tek başına çalışabileceği
> kadar ayrıntılıdır.** Mevcut kod desenleri: katman ekleme `js/app.js →
> addCityLayers() içindeki add(suffix, spec)`; görünürlük fonksiyonları
> `applyKesfetVisibility / applyIhtiyacVisibility / applyYasamVisibility /
> applyTransitFilter`; OSM veri çekimi scratchpad'deki `op.sh` deseniyle
> (Overpass, User-Agent başlıklı, 504'te bekle-tekrarla); geometri sadeleştirme
> Douglas-Peucker; nokta seyreltme ~1km ızgara + kalite önceliği
> (wikipedia/wikidata > marka > ad). Doğrulama: Playwright + stub altlık
> (karo/glyph ağı sandbox'ta kapalı).

## Açık kararlar (onayda netleşecek)

- **K1 — KARAR (2026-07-10):** Kullanıcı OSM görünümünü istiyor ama rasterdeki
  küçük POI ikonları OLMASIN dedi → raster yerine **vektör "OSM Detaylı" stili**
  yazılır (`assets/basemap-detail.json`, OpenFreeMap kaynağı): OSM Standart renk
  dili (sarı ana yollar, beyaz sokaklar, yeşil parklar, mavi su), yol/semt adları
  VAR, POI ikonları YOK. Notlar (`api.openstreetmap.org/api/0.6/notes?bbox`) ve
  GPS izleri (`gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png`) aç/kapa.
- **K2 — KARAR (2026-07-10): Esri World Imagery onaylandı.**
  (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  anahtarsız, atıfla serbest). Görsel olarak Google uydusuna eşdeğer.
- **K3 — Roma'da liman yok** (Civitavecchia v1 dışı kararı): gemi simgesi
  altyapısı yine hazırlanır (başka şehirler için), Roma'da kullanılmaz.
- **K4 — KARAR (2026-07-10): tamamen silinecek** — `kesfet-yogunluk.geojson`
  + sağlık noktaları + ilgili kod/i18n.

---

## T1 — Sağ kontrol yığını: +/−/pan, Home altına saklansın

**İstek:** +/−, pan (el) düğmeleri Home altında gizli dursun; fare Home üzerine
gelince yukarı kayarak açılsın, ayrılınca geri saklansın.

**Kod:**
- `index.html`: `#zoomctl` yeniden düzenlenir → görünür tek düğme `#zoom-home`;
  üstünde gizli `#zoomstack` sarmalayıcısı: `#zoom-in`, `#zoom-out`, `#panbtn`
  (pan düğmesi buraya taşınır, ayrı mutlak konumu kalkar).
- `css/style.css`: `#zoomstack{max-height:0; opacity:0; overflow:hidden;
  transition:max-height .3s, opacity .25s}`; `#zoomctl:hover #zoomstack,
  #zoomctl:focus-within #zoomstack{max-height:180px; opacity:1}`.
  Mobil (hover yok): Home'a **dokunmak** yığını `open` sınıfıyla açar/kapar;
  Home'un fitHome işlevi mobilde yığın açıkken ikinci dokunuşta çalışır
  (JS: ilk `pointerdown` `matchMedia('(hover: none)')` ise `classList.toggle`).
- `js/app.js`: pan düğmesi davranışı (pointer capture sürükleme) aynen kalır;
  yalnız seçiciler güncellenir.
- **Kabul:** PC'de hover ile açılıp kapanıyor; mobilde dokunuşla; pan/zoom işlevleri değişmedi.

Durum: ⬜ onay bekliyor

## T2 — Altlık değiştirici (3 katman) + sade altlık tamamen yazısız

**İstek:** Home'un üstünde katman ikonu; tıklayınca 3 altlık seçeneği:
 1. **Sade** (mevcut) — üzerinde **hiç yazı ve POI noktası olmasın**; yazılar
    yalnız kullanıcının açtığı katmanlardan gelsin.
 2. **OSM Detaylı** (K1 ikamesi) — OSM Standart raster; "Harita Notları" ve
    "GPS izleri" aç/kapa alt anahtarları.
 3. **Uydu** (K2 ikamesi) — Esri World Imagery raster.

**Kod:**
- `assets/basemap-light.json` / `-dark.json`: tüm `symbol` katmanları
  (place-*, road-name, poi-landmark, poi-minor) **silinir** → sade altlık yazısız.
  (Kıyı/yol/bina/park dokusu kalır.)
- Yeni dosya YOK; raster altlıklar `js/app.js` içinde stil objesi olarak üretilir:
  `function rasterStyle(tiles, attribution)` → `{version:8, sources:{r:{type:'raster',
  tiles:[...], tileSize:256, attribution}}, layers:[{id:'r', type:'raster', source:'r'}]}`.
  Uydu koyu temada da aynı (uydu görüntüsü tema bilmez).
- `js/app.js`: `let basemapMode = localStorage['loc-basemap'] || 'sade'`.
  `basemapUrl()` yerine `applyBasemap()` → sade: mevcut json; osm: rasterStyle(OSM);
  uydu: rasterStyle(Esri). `setStyle` sonrası mevcut `style.load → addCityLayers`
  akışı katmanları geri koyar (değişmez).
  GPS izleri: osm modunda `map.addSource('gps',{type:'raster',tiles:[gps-tile...]})`
  + toggle. Notlar: bbox JSON çek → küçük turuncu circle katmanı + tıklayınca not metni yer kartında.
- `index.html` + `css`: `#zoomctl` üstüne `#basemapbtn` (katman ikonu — mevcut
  logo benzeri 3 katman çizgisel SVG). Tıklayınca sola/yukarı açılan küçük menü
  (`#basemapmenu`): 3 seçenek + osm modundayken 2 alt anahtar (Notlar, GPS).
  Dışarı tıklayınca kapanır (mevcut belge-tık deseni: closeSheets ailesine eklenir).
- i18n: `base.sade`, `base.osm`, `base.uydu`, `base.notlar`, `base.gps`.
- **Kabul:** 3 mod arasında geçiş sorunsuz (overlay katmanları hepsinde çalışır);
  sade modda hiçbir altlık yazısı yok; tercih localStorage'da; tema değişimi
  yalnız sade modu etkiler.

Durum: ⬜ onay bekliyor

## T3 — Koordinat kutusu

**İstek:** Katman ikonunun üstüne koordinat ikonu; dokununca sola kayan metin
kutusu; `41.91667, 12.51686` gibi koordinat yapıştırılınca harita oraya gitsin;
haritaya dokununca kutu kapansın.

**Kod:**
- `index.html`: `#coordbtn` (artı-hedef ikonlu) + `#coordbox` (input, sağdan sola
  `transform:translateX` ile kayar).
- `js/app.js`: input `paste`/`Enter` → `/(-?\d+\.?\d*)[,;\s]+(-?\d+\.?\d*)/`
  ile ayrıştır; ilk sayı enlem, ikinci boylam (Roma bbox'ıyla doğrula; ters
  yazılmışsa otomatik çevir). `map.flyTo({center:[lon,lat], zoom:15})` +
  uzun-basma yer kartı o noktada açılır (Google Haritalar'a da aktarılabilsin).
  Harita `click` → kutu kapanır (mevcut belge-tık dinleyicisine eklenir).
- **Kabul:** örnek koordinat yapıştırınca harita uçuyor + kart açılıyor; boş/bozuk
  girişte sessizce hiçbir şey olmuyor; mobilde kutu ekranı taşırmıyor.

Durum: ⬜ onay bekliyor

## T4 — Girişler bağlantı çizgileri koyulaştırılsın

**İstek:** Kapı→merkez rota çizgileri (kesikli lila) çok soluk.

**Kod:** `js/app.js → add("-link", ...)`: `line-color` pal.lilac →
`#7C5FB0` (açık tema) / `#9B85CC` (koyu — PALETTE'e `linkStrong` alanı ekle),
`line-width` 2.4→3, `line-opacity` .85→.95.
- **Kabul:** Girişler açıkken FCO/CIA rotaları ilk bakışta seçiliyor.

Durum: ⬜ onay bekliyor

## T5 — Kapı simgeleri: uçak / tren / otobüs / gemi

**İstek:** Havaalanı, gar, otobüs terminali, liman uygun simgelerle görünsün.

**Kod:**
- `data/roma/layers/varis.geojson`: gate özelliklerine `mode` alanı:
  fco/cia → `plane`, termini/tiburtina → `train`; (Tiburtina aynı zamanda
  otobüs terminali → ikinci nokta `gate-tiburtina-bus`, `mode:"bus"`, hafif
  güneydoğu ofsetli). Liman: Roma'da yok (K3) — şema `ship` destekler.
- `js/app.js`: `map.addImage` ile 4 çizgisel ikon üretilir — offscreen
  `<canvas>` üzerinde 2D path çizimi (mevcut SVG ikonlarının path'leri;
  48×48, stroke `pal.ink`, dolgu `pal.surface` daire zemin). Tema değişince
  yeniden üretilir (`style.load` içinde). `-gate` circle katmanı yerine
  `symbol` katmanı: `icon-image: ["concat","gate-",["get","mode"]]`,
  `icon-size` zoom'la 0.5→0.8; `-label`/`-sub` etiketleri aynen kalır.
- **Kabul:** 4 kapı doğru simgeyle görünür (uçak×2, tren×2, otobüs×1);
  tıklanınca yer kartı çalışmaya devam eder; iki temada okunaklı.

Durum: ⬜ onay bekliyor

## T6 — Keşfet menüsü: sağlık+yoğunluk çıkar; oteller/yurtlar/kamu girer

**İstek:** Keşfet'ten sağlık ve yoğunluk ikonları kalksın; yerine **oteller**,
**yurtlar** (öğrenci), **kamu** (devlet binaları) gelsin — şehir geneli, tam
konumlarıyla. Ayrıca Keşfet/İhtiyaç yazısı, altındaki menüden bir şey açıkken
o grubun rengiyle renklensin.

**Veri (Overpass, şehir bbox 41.74,12.30,42.02,12.72):**
- oteller: `nwr["tourism"="hotel"]["name"]` → ~binlerce; kalite: yıldız etiketi
  `stars` varsa öncelik, wikipedia > marka > ad; ızgara 0.008, tavan 90.
- yurtlar: `nwr["building"="dormitory"]`, `nwr["amenity"="dormitory"]`,
  `nwr["residential"="university"]`, `nwr["operator"~"DiSCo|Adisu",i]` → az
  sayıda; tavan 40, seyreltme gevşek.
- kamu: `nwr["office"="government"]["name"]`, `nwr["amenity"~"^(townhall|courthouse)$"]["name"]`,
  büyükelçilikler HARİÇ (kalabalık yapar) → ızgara 0.010, tavan 60.
- Çıktı `kesfet-poi.geojson`'a `theme: otel|yurt|kamu` olarak eklenir; mevcut
  `saglik` temalı 4 nokta silinir; `kesfet-yogunluk.geojson` silinir (K4),
  manifest `available` ve `groups.kesfet.layers/filters` güncellenir.

**Kod:**
- `index.html`: `#sheet-kesfet` çipleri: sağlık ve `#chip-yog` kaldırılır;
  `data-th="otel"` (yatak ikonu), `data-th="yurt"` (ranza/bina ikonu),
  `data-th="kamu"` (sütunlu bina ikonu) eklenir.
- `js/app.js`: `THEME_COLORS`'a lila ailesinden 3 ton eklenir (`otel #7E66A6`,
  `yurt #8F77B7`, `kamu #654E8E` gibi — tarihi ile çakışmayan sıralı tonlar);
  `saglik` ve crowd (`crowdOn`, `-fill`, `-area-label`) kodu temizlenir.
  Bottombar renklenmesi: `applyKesfetVisibility/applyIhtiyacVisibility` sonunda
  `#bb-kesfet.classList.toggle('active', themeState.size>0)` (CSS: lila arka
  plan), `#bb-ihtiyac` için kiremit arka plan (`ihState.size>0`).
- i18n: `th.saglik` silinir; `th.otel`, `th.yurt`, `th.kamu` eklenir (TR/EN);
  `layer.yogunluk` silinir.
- **Kabul:** 3 yeni tema şehir geneli görünür ve tıklanabilir; sağlık/yoğunluk
  izleri UI+veri+i18n'den tamamen gitti; Keşfet/İhtiyaç etiketi seçim varken renkli.

Durum: ⬜ onay bekliyor

## T7 — Sol çekmece: Yaşam → Bölgeler (Turistik/Ticari/Eğitim/Doğal)

**İstek:** Mevcut oteller/konutlar/alt merkezler/öğrenciler bölgeleri yararlı
değil; yerine şehir geneli 4 bölge türü: **Turistik, Ticari, Eğitim, Doğal**.

**Veri:**
- Turistik: Centro Storico rioni birleşimi + Vatikan (Città del Vaticano
  relation) + Appia Antica parkı + Trastevere + Monti → mevcut gerçek sınır
  geometrileri yeniden kullanılır (`build_districts.py` deseni).
- Ticari: `way/relation["landuse"~"^(commercial|retail)$"]` (büyük poligonlar,
  alan>~0.15km² filtre) + EUR iş bölgesi relation'ı.
- Eğitim: `nwr["amenity"="university"]` poligonları (Sapienza, Roma Tre, Tor
  Vergata, LUISS kampüsleri; alan filtresiyle küçük binalar elenir).
- Doğal: `leisure=park|nature_reserve` + `boundary=protected_area` büyük
  poligonlar (Villa Borghese, Pamphilj, Ada, Appia Antica, Insugherata...).
- Çıktı: 4 dosya `data/roma/layers/bolge-turistik/ticari/egitim/dogal.geojson`
  (kind:"district", name, lab). Eski 4 `yasam-*.geojson` silinir.

**Kod:**
- `data/roma/city.json`: `yasam` grubu → `bolgeler` grubu, layers güncellenir.
- `index.html`: çekmece çipleri 4 yeni katman; `data-layer="bolge-*"`.
- `js/app.js`: `applyYasamVisibility` → `applyBolgeVisibility` (aynı mantık,
  yeni id listesi); `DISTRICT_COLORS` yerine 4 sabit renk: Turistik `#B85C6E`,
  Ticari `#5B8FBF`, Eğitim `#B8863F`, Doğal `#7FA05B` (tür bazlı, bölge bazlı değil).
- i18n: `layer.otel/konut/altmerkez/ogrenci` silinir; `bolge.turistik/ticari/
  egitim/dogal` eklenir; çekmece başlık anahtarı `group.yasam` → etiketi "Bölgeler".
- **Kabul:** 4 tür bağımsız açılıyor; şehir genelinde anlamlı kapsama; renkler ayırt edilebilir.

Durum: ⬜ onay bekliyor

## T8 — Bütçe yıldızları kaldırılsın (E8 iptal)

**Kod:** `index.html` `#budgetchip` silinir; `css` `.stars/#budgetchip` silinir;
`js/app.js` yıldız tık kodu (`b.dataset.b` dalı) silinir; verilerdeki `budget`
alanları zararsız, kalabilir. `docs/ETAPLAR.md` E8 "❌ iptal (2026-07-10,
kullanıcı kararı)" işaretlenir; `CLAUDE.md` değişmez kararlardaki bütçe cümlesi
kaldırılır, `PROJE_PLANI.md` H bölümüne iptal notu düşülür.
- **Kabul:** UI'da yıldız kalmadı; dokümanlar tutarlı.

Durum: ⬜ onay bekliyor

## T9 — Dil seçici: tek kısaltma + kayar menü (6 dile hazır)

**Kod:** `index.html` `.seg` (TR/EN ikili) → `#langbtn` (aktif dilin kısaltması,
örn "TR") + `#langmenu` (aşağı kayan liste: TR·EN·DE·FR·IT·ES — şimdilik TR/EN
aktif, diğerleri `disabled` soluk, E10'da açılır). `js/app.js` `SUPPORTED_LANGS`
mekanizması aynı; menü aç/kapa mevcut belge-tık desenine eklenir.
- **Kabul:** Tek kısaltma görünüyor; menüden dil değişiyor; kapalı diller soluk.

Durum: ⬜ onay bekliyor

## T10 — MD dosyalarının güncellenmesi (çok şehirli geleceğe hazırlık)

Bu turdaki tüm değişikliklerden sonra:
- `CLAUDE.md`: bütçe seçici kararı çıkar; ekran düzeni açıklaması güncellenir
  (sol çekmece=Bölgeler, sağ altta Home altı yığın + altlık değiştirici +
  koordinat kutusu; 3 altlık modu; katman grupları: Varış, Omurga, Keşfet
  [otel/yurt/kamu dahil], Bölgeler, İhtiyaçlar).
- `PROJE_PLANI.md` B tablosu ve I bölümü yeni düzene göre yazılır.
- `docs/TASARIM.md`: yeni renkler (bölge türü renkleri, tema tonları, koyu hat
  renkleri), altlık modları, ikonlu kapılar.
- `docs/VERI.md`: katman dosya adları (`bolge-*`, `ihtiyac`, genişletilmiş
  `kesfet-poi`), `mode` alanı, `theme` değer listesi, OSM üretim boru hattı
  (Overpass sorguları + kalite vekili + ızgara seyreltme) belgelenir —
  **yeni şehir eklerken aynı boru hattı çalıştırılır**.
- `docs/ETAPLAR.md`: E8 iptal, E10 dil seçici notu, bu turun özeti.
- `.claude/skills/yeni-sehir/SKILL.md`: veri boru hattı adımlarına referans.
- **Kabul:** dokümanlar mevcut uygulamayla birebir uyumlu; "yeni şehir" tarifi
  bu boru hattını içeriyor.

Durum: ⬜ onay bekliyor

---

## Uygulama sırası ve paketleme

| Paket | Maddeler | Not |
|---|---|---|
| P1 | T1 + T4 | küçük UI/stil, hızlı |
| P2 | T2 + T3 | altlık değiştirici + koordinat (aynı köşe UI'sı) |
| P3 | T5 | kapı ikonları |
| P4 | T6 | Keşfet revizyonu (veri çekimi dahil) |
| P5 | T7 | Bölgeler (veri çekimi dahil) |
| P6 | T8 + T9 | temizlik + dil seçici |
| P7 | T10 | dokümantasyon |

Her paket: kod → Playwright doğrulama → ekran görüntüsü → commit → PR → merge
(kullanıcı canlıda kontrol eder; sorun bildirirse sonraki pakete geçmeden düzeltilir).
