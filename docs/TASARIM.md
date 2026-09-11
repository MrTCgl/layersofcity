# Tasarım Sistemi

İlke: **karmaşa ekleme, karmaşayı al.** Sade, sakin, profesyonel; az yazı.
Prototip (`prototip/index.html`) bu belgenin görsel referansıdır.

## Renk paletleri

Renkler CSS değişkeni olarak tanımlanır (`--renk-adı`); bileşenlere hex yazılmaz.

### Açık tema — "Pastel" (varsayılan)

| Değişken | Hex | Kullanım |
|---|---|---|
| `--bg` | `#FBF8F6` | Sayfa zemini (kırık beyaz, hafif sıcak) |
| `--surface` | `#FFFFFF` | Panel/kart zemini |
| `--ink` | `#3E3A45` | Ana metin (saf siyah değil) |
| `--ink-soft` | `#8B8494` | İkincil metin, pasif ikonlar |
| `--line` | `#EAE4EE` | Ayraç ve çizgiler |
| `--lilac` | `#B9A6DC` | Birincil vurgu (lila) — aktif durumlar, şehir noktaları |
| `--peach` | `#F2BBA8` | İkincil vurgu (yavruağzı) — hover, seçili çipler |
| `--powder` | `#EFD9DE` | Üçüncül (pudra) — yumuşak dolgular |
| `--land` | `#EDE8E3` | Dünya/altlık kara rengi |
| `--water` | `#F7F4F1` | Su rengi (zeminden hissedilir ama bağırmaz) |

### Koyu tema

| Değişken | Hex | Kullanım |
|---|---|---|
| `--bg` | `#232028` | Sayfa zemini |
| `--surface` | `#2C2833` | Panel/kart |
| `--ink` | `#EDE9F2` | Ana metin |
| `--ink-soft` | `#9A93A6` | İkincil metin |
| `--line` | `#3A3542` | Ayraçlar |
| `--lilac` | `#C4B2E4` | Birincil vurgu |
| `--peach` | `#E8B39E` | İkincil vurgu |
| `--powder` | `#8A7480` | Üçüncül |
| `--land` | `#2E2A36` | Kara |
| `--water` | `#262230` | Su |

### Metro/hat renkleri (Roma)

Resmi renklerin soluklaştırılmış halleri — tanınırlık korunur, bağırmaz:

- Metro A: `#C9682F` (koyu turuncu) · Metro B: `#3D69A8` (koyu mavi)
- Metro C: `#4F8A5F` (koyu yeşil) · Tramvay: `#6F6390` (koyu mor-gri) ·
  Banliyö: `#8D8272`
- Otobüs (kilit hatlar): `#A67C42` (koyu hardal); metro/tramvaydan ince çizilir
- Bölgesel tren (FL hatları): `#5F7A94` (koyu slate); metronun **altında**, ince
- Not (2026-07-10): hat renkleri kullanıcı isteğiyle koyulaştırıldı — soluk
  altlık üstünde hatlar netlik kazandı; altlık pastel kalmaya devam ediyor
- POI ton aileleri: **Keşfet = lila tonları** (kamu `#4A3970` en koyu →
  alışveriş `#C6B8E6` en açık; yurt `#8A5FA0` ayrık mor), **İhtiyaç = kiremit
  tonları** (hastane `#B34F39` → kütüphane `#F4CDB4`); basılı çipler aynı tonu
  alır; Keşfet/İhtiyaç bottombar etiketi açık katman varken grup rengini alır
- Bölge türü renkleri: Turistik `#B85C6E` · Ticari `#5B8FBF` · Eğitim
  `#B8863F` · Doğal `#5E9A6B` (dolgu .18, kenar 1.4px .65)
- **Sade altlık tek hue'ya çekildi (2026-09-11):** altlıkta artık tek bir renk
  (kum/bej, hue ~32°) ve onun tonları var; yeşil park ve mor su ayrımı kaldırıldı.
  Açık temada su karadan **açıktır** (`#F5F1EA`) — kullanıcı kararı 2026-09-11;
  körfez/kıyı ferah okunuyor. Koyu temada tersi: su en koyu ton.
  Açık tema: zemin `#EDE6DB` · konut `#E8E0D3` · sanayi `#E4DBCD` · park/yeşil
  `#E6DFD0` · bina `#E2D9C9` · su `#F5F1EA` · ana yol `#FFFFFF` · ara yol
  `#FBF8F3` · patika `#F2EDE4` · demiryolu `#DCD2C2`.
  Koyu tema aynı hue'nun koyu ucu: zemin `#262220` · su `#1C1917` · ana yol
  `#4E443B`. Yer adı iskeleti (`SK_COLORS`) de aynı aileye çekildi — su/yeşil/yol
  etiketleri yalnız açıklıkla ayrışır. Gerekçe: katman çizgileri (metro/tramvay,
  bölge dolguları, POI) tek renkli zeminde belirginleşiyor; altlık okunurluğu
  bozmadan geri plana düşüyor.
- Altlık modları (2026-07-14 güncel): **Sade** = pastel vektör; katmanlardan
  bağımsız, her zaman görünen soluk bir **yer adı iskeleti** var. Yazı detayı
  zoom'la kademeli artar (simge yok, yalnız yazı): uzakta şehir + **ilçe**
  (z10+, büyük harf) → yaklaşınca **mahalle/semt** (z12.5+) → **ana yol
  adları** (z13+) ve **tüm sokak adları** (z15+) → en yakında **bina/mekân
  adları** (z16.5+, `sk-poi-fine`). Tek font "Noto Sans Regular", altlık
  paletiyle uyumlu soluk tonlar (`sk-*` katmanları, OpenFreeMap omt vektör
  kaynağından). Katman açılınca üstüne biner. · **OSM Detaylı** = resmi
  **OpenStreetMap Shortbread** vektör karoları (`vector.openstreetmap.org`,
  anahtarsız); stil yerel kopyadır (`assets/basemap-shortbread.json`, glifler
  OpenFreeMap'ten). Yakınlaştıkça detay ve yazılar OSM.org kalitesinde ·
  **Uydu** = Esri World Imagery raster (anahtarsız). Gölge kaldırma
  (2026-08-04): `raster-brightness-min .24`, `raster-contrast .16`,
  `raster-saturation .12`. Yalnız `brightness-min` artırmak görüntüyü sütlü
  yapıyor; siyah noktayı kaldırırken kontrastı da artırmak dar sokak
  gölgelerini okunur kılıyor, yanma 8 şehirde ≤%2. ·
  **Uydu HD** (2026-08-04) = **Esri World Imagery Clarity**
  (`clarity.maptiles.arcgis.com`, anahtarsız, aynı atıf): aynı yerlerin farklı
  ve daha net çekimi. Uydu'nun yerine geçmez, yanına eklenir — Barselona/
  İstanbul/Tokyo'da belirgin daha net ve aydınlık, New York/Roma/Singapur/
  İzmir'de daha karanlık. Kendi ayarı `raster-brightness-min .28`,
  `raster-contrast .06`, `raster-saturation .10` (görüntü zaten kontrastlı
  olduğundan daha az kontrast ister; Tokyo'da yanma %11 → %2.5).
  Kaynak `maxzoom: 18` — Clarity z19'da yer yer 404 veriyor (Roma), bu sayede
  hiç z19 istenmez, son gerçek seviye büyütülür.
  **Karma altlığının uydu katmanı da Clarity'dir** (kullanıcı kararı,
  2026-08-04): yarı saydam OSM çizgilerinin altında görüntüyü taşıyan şey
  netliktir, o yüzden orada da Uydu HD kullanılır (aynı `CLARITY_PAINT`).
  Tüm altlıklarda maksimum zoom **19**'dur (city.json `zoom.max`) — bina
  düzeyine kadar yaklaşılabilir.
- **GPS izleri şeffaflığı** (2026-07-14): altlık menüsünde GPS izleri açıkken
  altında bir opaklık kaydırıcısı belirir (%10-100, `localStorage["loc-gps-op"]`).
- **Karma altlık (2026-07-14):** dördüncü bağımsız altlık seçeneği "Karma" =
  OSM Detaylı + Uydu karması. Uydu altta, Shortbread katmanları üstte;
  dolgu/çizgiler menüdeki kaydırıcıyla soluklaştırılır (`base.osmOpacity`,
  `localStorage["loc-osm-op"]`, varsayılan 0.55), etiketler tam opak kalır.
  Dört mod da (Sade / OSM Detaylı / Uydu / Karma) birbirini dışlar; kaydırıcı
  yalnız Karma'da görünür.
- **Özellik popup'ı mobil:** satırlar hiç sarmaz; yazı boyutu
  `min(13.5px, 2.1vw)` ile ekrana göre küçülür (en uzun satır ~37em).
  + OSM notları / GPS izleri / **Yaya & araç** overlay (altlık menüsünde,
  GPS'in altında). Yaya & araç (2026-07-11): OSM'den türetilmiş sokak
  karakteri — yeşil = yaya öncelikli (`highway=pedestrian/living_street` +
  yaya meydanları), turuncu = ana arter (`primary/trunk/motorway`).
  `data/<sehir>/walkability.geojson`, katman gruplarından bağımsız, istenince
  yüklenir. Canlı trafik hacmi DEĞİL, sokağın karakteridir.
- Kapı simgeleri: uçak/tren/otobüs/gemi — canvas'a çizilen 24x24 çizgisel
  glyph, daire zemin (makeGateIcons); Girişler bağlantı rotası `linkStrong`
  (`#7C5FB0`/`#9B85CC`), 3px kesikli
- Koyu temada aynı hex'ler kullanılır (koyu zeminde zaten yumuşak dururlar).

## Tipografi

- Sistem yazı yığını: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
  (web font yok → hız). Başlıklarda `letter-spacing: 0.01em`.
- Boyut ölçeği: 12 / 13 / 15 / 18 / 24 / 32 px. Uzun paragraf kullanılmaz;
  ipuçları tek cümle, en fazla ~90 karakter.
- **Etiketler kısa:** katman adları tek kelime hedefler — Kapılar, Hatlar,
  Oteller, Konutlar, Öğrenciler, Eczaneler. "…bölgeleri / …kapıları" eki yazılmaz.

## Logotip

- Üst barda sade: `layers of city` — küçük harf, kelime araları geniş (`0.18em`),
  sistem fontu.
- **Açılış ekranında** büyük logotip **el yazısı** karakterdedir: turistik,
  uçarı his; hafif eğim (yaklaşık -2°). Font: **Ballet** (Omnibus-Type,
  OFL lisanslı — kullanıcı seçimi), `assets/fonts/` altında **yerel**
  barındırılır (CDN yok). Renkler (2026-07-14): "layers" ve "city" `--peach`
  (yavruağzı), "of" `--lilac`.
- **Açılış ekranı ek öğeleri (2026-07-14):** en altta ortada iletişim adresi
  `layersofcity@gmail.com` — küçük (11px), ince (300), geniş harf aralıklı
  (`letter-spacing:.32em`), `--ink-soft`. Sağ üstte dil düğmesinin solunda
  yuvarlak **ⓘ** butonu; tıklayınca ekran ortasında şeffaf (blur'lu) bir popup
  açılır ve uygulamanın özellikleri alt alta tek cümlelerle listelenir
  (`appinfo.l1..l6` i18n anahtarları). ⓘ yalnız açılış ekranında görünür.

## İkonlar

- Çizgisel (stroke) SVG, dolgu yok; kalınlık `1.5px`, uçlar `round`.
- 24×24 ızgara. Emoji kullanılmaz. Renk her zaman `currentColor`.

## Harita stili

- Altlık her zaman **soluk/gri**: kara `--land`, su `--water`, yollar zeminden
  bir tık koyu, etiketler `--ink-soft`. Renk yalnızca katmanlara aittir.
- Alan katmanları (konut, yoğunluk...): %25-35 opak dolgu, kontur yok veya çok
  soluk; keskin sınır hissi verilmez (bunlar yorum, kadastro değil).
- Çizgi katmanları: 3px, `round` uçlar. Nokta katmanları: 8-10px daire,
  2px `--surface` kontur.
- Etiketler kısa: "Termini", "tarihi merkez". Cümle yazılmaz.

## Ekran düzeni (kullanıcı eskizi — nihai)

Şehir ekranında **panel yoktur; harita tam ekrandır.** Tüm kontroller haritanın
üzerinde yüzer; mobil ve masaüstü aynı düzeni kullanır:

- **Sol üst — şehir çubuğu:** "Roma · 8 Tem · 14:32 · ☀24°" çipi; tıklayınca
  künye kartı açılır/kapanır.
- **Üst orta — Kapılar ve Hatlar çipleri:** şeffaf üst barın ortasında;
  tıkla-aç / tıkla-kapa (varsayılan ikisi de açık). Yalnızca şehir ekranında
  görünür. Mobilde şehir çubuğunun/bütçenin altına, harita üstüne ortalanır.
- **Şehir çubuğunun altında — bütçe yıldızları:** ★★★, **tam şeffaf zeminde**
  (arka plan/çerçeve yok), etiket yok. Pasif yıldız soluk, seçili `--peach`.
- **Sağ kenar — Yaşam çekmecesi:** kenar sekmesine dokununca kayarak açılır;
  içinde Oteller, Konutlar, Alt merkezler, Öğrenciler çipleri (tıkla-aç/kapa).
- **Alt orta — alt bar:** `Keşfet · İhtiyaç`. İkisi de dokununca
  **yukarı açılan menüler** gösterir; menülerin **fonu/kartı yoktur** — yalnızca
  yüzen yuvarlak **ikon çipleri** (yazı yok; ad, erişilebilirlik etiketi ve
  title olarak durur). Keşfet ikonları: tarihi (sütunlu yapı), modern (siluet),
  doğa (yaprak), gastronomi (çatal-bıçak), alışveriş (çanta), sağlık (artı),
  yoğunluk (iç içe halkalar). İhtiyaç ikonları: kiralık araç (otomobil),
  market (sepet), müze (çerçeve), kütüphane (kitap), hastane (bina+artı),
  eczane (kapsül), yakıt (pompa).
- **Sağ alt — zoom kontrolleri + Konumum + Tur** (dikey dizi):
  - **Zoom grubu** (dikey pill): `+` yakınlaştırır, `−` uzaklaştırır,
    ⌂ (home) tüm şehri getirir.
  - **Pan pedi** (zoom grubunun altında, yuvarlak): 4 yön oku; haritayı
    kaydırır (adım, zoom düzeyinden bağımsız sabit ekran mesafesi).
  - **Konumum butonu** (44px, çizgisel hedef ikonu); kullanıcı konumu
    `--lilac` dolgulu nokta + yumuşak halo.
  - **Tur düğmesi** (44px, çizgisel ▶) — dokununca rehberli mod başlar.
- **Harita etkileşimi:** bir noktaya **çift tıklama** o noktaya doğru yaklaştırır.
  Zoom aralığı sınırlıdır; harita alan dışına kaymaz (home her an tümünü getirir).
- **Sponsor alanı:** v1'de yok; ileride künye kartının altına eklenebilir.

## Bileşen kuralları

- **Üst bar:** **şeffaf** (zemin ve alt çizgi yok); harita/dünya üstüne yüzer.
  Solda logo (ana ekrana döner), ortada Kapılar/Hatlar (şehir ekranında),
  sağda dil ve tema anahtarları. Yükseklik 56px.
- **Künye kartı:** konuşulan dil · para birimi + dolar karşılığı
  (**"1€ ≈ 1.09$"** biçiminde: 1 yerel birim = X USD) · temel fiyat tablosu
  (1L su, 1L benzin, 1L süt, 1kg et, 1kg peynir, kutu bira, Big Mac —
  güncelleme tarihiyle) · 5 günlük hava tahmini. Tek ekran, kaydırmasız hedeflenir.
- **Hat rozetleri:** metro hattı harfi (A/B/C), hattın kendi renginde dolu
  dairede beyaz harf (18px daire, 11px kalın harf); hat başına 1-2 rozet.
- **Bütçe seçici:** geneldir — Keşfet+Yaşam+İhtiyaçlar'ı birden süzer
  (★ ekonomik, ★★ orta, ★★★ yüksek); varsayılan: seçim yok = hepsi.
  Soru ekranı değildir, akış bloklamaz.
- **Yer kartı + yol tarifi:** haritada bir nokta seçilince alt ortada küçük
  kart: yer adı + **"Yol tarifi"** düğmesi. Düğme **Google Maps'i dış
  bağlantıyla** açar (anahtarsız URL şeması:
  `google.com/maps/search/?api=1&query=...` veya koordinat varsa
  `dir/?api=1&destination=lat,lng`). Navigasyonu biz çözmeyiz, Google'a devrederiz.
- Köşe yarıçapı: kartlar 12px, çipler 999px. Gölge: tek, çok yumuşak
  (`0 2px 12px rgba(0,0,0,.06)`); koyu temada gölge yerine kontur.

## Ton ve dil

- Kullanıcıya "sen" diye hitap edilir; kısa, sakin, yardımsever. Ünlem yok.
- Boş durumlar dahi tek cümle: "Bu şehir yakında hazır."
