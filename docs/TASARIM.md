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
- POI ton aileleri: **Keşfet = lila tonları** (tarihi `#6F5799` → sağlık
  `#C9BAE8`), **İhtiyaç = kiremit tonları** (hastane `#B34F39` → kütüphane
  `#F4CDB4`); grup tek renk ailesi olarak okunur, basılı çipler aynı tonu alır
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
  barındırılır (CDN yok). Prototipte woff2 gömülüdür; "of" kelimesi `--lilac`.

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
