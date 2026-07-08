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

- Metro A: `#E08A5B` (soluk turuncu) · Metro B: `#6E93C4` (soluk mavi)
- Metro C: `#7FA98A` (soluk yeşil) · Tramvay: `#A8A0B5` · Banliyö/FL: `#B5ADA0`
- Koyu temada aynı hex'ler kullanılır (koyu zeminde zaten yumuşak dururlar).

## Tipografi

- Sistem yazı yığını: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
  (web font yok → hız). Başlıklarda `letter-spacing: 0.01em`.
- Boyut ölçeği: 12 / 13 / 15 / 18 / 24 / 32 px. Uzun paragraf kullanılmaz;
  ipuçları tek cümle, en fazla ~90 karakter.
- Logo yazımı: `layers of city` — küçük harf, kelime araları geniş (`0.18em`).

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

## Bileşen kuralları

- **Harita baskındır:** şehir ekranında harita, görünür alanın en az %70'ini
  kaplar. Yazı en aza iner; etiket yerine çizgisel simge yeterliyse simge.
- **Üst bar:** solda logo (ana ekrana döner), sağda dil ve tema anahtarları.
  Yükseklik 56px, zemin `--surface`, alt çizgi `--line`.
- **Şehir çubuğu:** haritanın sol üstünde yüzen çip: şehir adı · kısa tarih ·
  yerel saat (canlı) · hava simgesi + derece. Tıklayınca **künye kartı** açılır:
  konuşulan dil, para birimi + USD karşılığı, temel fiyat tablosu (1L su,
  1L benzin, 1L süt, 1kg et, 1kg peynir, kutu bira, Big Mac — güncelleme
  tarihiyle), 5 günlük hava tahmini. Kart tek ekran, kaydırmasız hedeflenir.
- **Hat rozetleri:** metro hattı harfi (A/B/C), hattın kendi renginde dolu
  dairede beyaz harf (18px daire, 11px kalın harf); hat başına 1-2 rozet,
  hattın orta ve uç noktasına yakın konumlanır.
- **Bütçe seçici:** Yaşam grubunun başında üç yıldız (★★★). Dolu yıldız sayısı
  seçimi gösterir; varsayılan: seçim yok = hepsi. Soru ekranı değildir,
  akış bloklamaz.
- **Katman paneli:** masaüstünde sol yan panel (270px), mobilde alttan çekmece.
  4 grup: Varış, Omurga, Keşfet, Yaşam. Grup başlığı + anahtar (toggle) listesi.
  Keşfet grubunda tema filtresi çipleri (çoklu seçim).
- **Anahtarlar (toggle):** aktif `--lilac`, pasif `--line`. Animasyon 150ms.
- **Rehberli mod girişi:** panelin altında sade bir satır: "şehri tanıt ▸".
- **Konumum butonu:** harita üzerinde sağ altta yüzen yuvarlak buton (44px,
  çizgisel hedef ikonu). Kullanıcı konumu: `--lilac` dolgulu nokta + yumuşak halo.
- **Sponsor alanı:** panel en altında rezerve, v1'de boş ve görünmez.
- Köşe yarıçapı: kartlar 12px, çipler 999px. Gölge: tek, çok yumuşak
  (`0 2px 12px rgba(0,0,0,.06)`); koyu temada gölge yerine kontur.

## Ton ve dil

- Kullanıcıya "sen" diye hitap edilir; kısa, sakin, yardımsever. Ünlem yok.
- Boş durumlar dahi tek cümle: "Bu şehir yakında hazır."
