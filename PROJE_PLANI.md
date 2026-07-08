# layers of city — Proje Planı

> Bu belge, proje konseptinin tartışmalar sonucunda geldiği son durumu özetler.
> Son güncelleme: 2026-07-08

## A. Konsept (kararlaştırıldı)

1. **Amaç:** Yeni bir metropole giden kişinin şehri sade bir harita üzerinde,
   katmanları açıp kapatarak hızlıca "okumasını" sağlamak.
   Bu bir navigasyon (yol tarifi) uygulaması değil, **oryantasyon** uygulamasıdır.
2. **Çok şehirli yapı:** Roma pilot şehirdir; mimari baştan çok şehre göre kurulur.
   Kullanıcı şehri listeden seçer.
3. **Kullanıcıya soru sorulmaz.** Ziyaret amaçları (turist / kısa iş ziyareti /
   uzun süreli çalışma / öğrenci) uygulamada soru olarak değil, **katman
   gruplarının kendisi** olarak var olur. Kullanıcının kafasındaki cevapsız
   sorular ("nereye ineceğim, merkez neresi, nerede kalınır, nerede yaşanır")
   haritada karşılığını bulur.
4. **Rakip analizi özeti:** Citymapper/Moovit yol tarifi verir ama şehri
   anlatmaz; statik metro harita uygulamaları resmi şemaların tekrarıdır;
   Hoodmaps mahalle karakteri gösterir ama ulaşımı göstermez.
   "Şehrin iskeletini katman katman anlatan" bir ürün boşluğu vardır.

## B. Katman yapısı (Roma pilotu)

Katman menüsü dört grupta toplanır; açılış ekranında **Varış + Omurga** açık gelir.

| Grup | Katmanlar | Cevapladığı soru |
|---|---|---|
| **1. Varış** | Girişler (Fiumicino ✈, Ciampino ✈, Termini 🚂, Tiburtina 🚂) ve her girişten merkeze net bağlantı çizgisi | Şehre nereden girerim, merkeze nasıl ulaşırım? |
| **2. Omurga** | Merkez(ler) işareti, Metro A/B/C (hat renkli harf rozetleriyle), kilit tramvaylar, alt merkez ↔ merkez aksları | Merkez neresi, ana akslar hangileri? |
| **3. Keşfet** | İlgi noktaları — tema filtreli: tarihi, modern, doğa, gastronomi, alışveriş, sağlık turizmi. Gün içi yoğun bölgeler | Ne göreceğim, nereler kalabalık? |
| **4. Yaşam** | Yalnızca **bölgeler**: Oteller, Konutlar, Alt merkezler, Öğrenciler | Nerede kalırım / yaşarım / okurum? |
| **5. İhtiyaçlar** | Kategori çipli **noktalar**: kiralık araç, market, müze, kütüphane, hastane, eczane, yakıt | Araç nereden kiralarım, en yakın eczane/market nerede? |

Etiketler kısadır: "Kapılar", "Hatlar", "Oteller", "Konutlar" ("...kapıları",
"...bölgeleri" eki yazılmaz).

- Yorumsal katmanlar (konut bölgeleri, alt merkezler, yoğunluk, otel bölgeleri)
  **elle çizilir**: Claude araştırıp taslak çıkarır → kullanıcı onaylar → veriye girer.
- Kaynak: metro/tram geometrileri OpenStreetMap'ten; resmi ATAC PDF haritaları
  referans olarak `docs/kaynak/` altında tutulabilir.

## C. Tasarım ilkeleri (kararlaştırıldı)

- **Profesyonel, sade, sakin.** Kullanıcı zaten bilmediği bir şehre gidiyor;
  uygulama karmaşa eklemek yerine karmaşayı alır.
- Simgeler **çizgisel (line icon)**, renk paleti kısıtlı; canlı/cırtlak renk yok.
- **Az yazı.** Uzun açıklamalar yok; kısa etiketler, gerektiğinde tek cümlelik ipuçları.
- Altlık harita soluk/gri tutulur; renk yalnızca katmanlara aittir.
- **Gece/gündüz modu** + 2-3 tema; harita stili temayla birlikte değişir.
- Mobil öncelikli; web ve mobilde hızlı ve temiz açılış.
- **Rehberli mod:** ayrı, isteğe bağlı bir seçenek olarak var olur ("şehri tanıt"
  düğmesi); kimseye dayatılmaz, varsayılan kapalı.
- **Açılış ekranı = dünya haritası.** Sade, stilize bir dünya haritası; üzerinde
  yalnızca hazır şehirlerin noktaları ve isimleri. Şehre tıklamak uygulamaya giriştir.
  Sol üstteki logo her ekrandan dünya haritasına (şehir seçimine) geri döndürür.
- **Renk paleti:** açık temada soluk pastel tonlar (lila, yavruağzı, pudra) —
  soluk ve az kullanılarak profesyonel görünüm korunur; yanında koyu tema.
  Prototipte iki varyant gösterilip karar verilecek.

## D. Teknik mimari

- **Saf statik site** — sunucu yok, veritabanı yok. GitHub Pages'ten yayın;
  alan adı doğrudan bağlanır.
- Harita motoru: **MapLibre GL JS** (açık kaynak) + OpenStreetMap tabanlı soluk altlık.
- Veri modeli: her şehir bir klasör (`data/roma/`), her katman bir **GeoJSON** dosyası.
  Yeni şehir eklemek = yeni veri klasörü; kod değişmez.
- **6 dil** (EN, DE, FR, IT, ES, TR): arayüz metinleri dil başına JSON dosyası.
  Editoryal içerik önce **EN + TR** yazılır, diğer diller çeviriyle eklenir.
- Kullanıcı tercihleri (dil, tema, katman durumu) **localStorage**'da tutulur.
- **Konum:** şehir ekranında "Konumum" butonu, tarayıcı Geolocation API'siyle
  kullanıcının yerini haritada gösterir (mobilin imkanı; konum cihazda kalır).
- **Üyelik yok (v1).** Giriş duvarı yok, KVKK/GDPR yükü minimum.
- **Anonim analitik:** çerezsiz araç (Plausible veya Umami) — hangi şehir,
  hangi katman, hangi dil kullanılıyor.
- **Gelir (ileride):** banner reklamdan önce bağlantı ortaklığı (affiliate) modeli
  değerlendirilir (otel, tur/bilet, transfer, eSIM). Tasarımda alt bilgi kartının
  altında bir "sponsor alanı" rezerve edilir; v1'de boş kalır.

## E. İsim ve alan adı ✔ kararlaştırıldı

**İsim: layers of city — alan adı layersofcity.com satın alındı (2026-07-08).**
Yayın etabında (E11) GitHub Pages'e bağlanacak.

## F. GitHub repo ismi

- Repo ismi projeye özel olacak, "ROMA" içermeyecek.
- GitHub'da repo yeniden adlandırma tek işlemdir (Settings → General → Rename)
  ve eski adrese gelen istekler otomatik yönlendirilir; kod tarafında hiçbir şey kırılmaz.
- Alan adı alındığına göre repo istenildiği an `layersofcity` olarak yeniden
  adlandırılabilir (kullanıcı yapar). Ayrı bir proje/kod taşıma işlemi gerekmez.

## G. Yol haritası

1. ✅ **Konsept kilitleme** — bu belge
2. ✅ **Görsel prototip** — ilk sürüm hazır (`prototip/index.html`);
   revizyonlar kullanıcı geri bildirimiyle sürer. Kodlamada birebir referanstır.
3. ⬜ **Roma içerik taslağı** — bölgeleme, akslar, ilgi noktası setleri
   (Claude taslak çıkarır → kullanıcı onaylar) — **sıradaki adım**
4. ✅ **İsim + alan adı** — layersofcity.com satın alındı (2026-07-08);
   repo rename kullanıcıda
5. ⬜ **Kodlama v1** — iskelet + Roma verisi + EN/TR + gece-gündüz tema
6. ⬜ **Yayın** — GitHub Pages + alan adı + analitik
7. ⬜ **İkinci şehir** — şablonun şehirden bağımsızlığının kanıtı
8. ⬜ **Gelişim** — kalan 4 dil, affiliate/gelir katmanı, yeni şehirler

## H. Şehir künyesi, canlı veriler ve bütçe (2. tur kararları)

- **Şehir çubuğu:** haritada şehir adı yanında anlık tarih, şehrin yerel saati
  (canlı) ve hava durumu simgesi görünür.
- **Künye kartı** (çubuğa tıklayınca): konuşulan dil · para birimi + dolar
  karşılığı ("1€ ≈ 1.09$" biçiminde) · temel fiyat tablosu (1L su, 1L benzin,
  1L süt, 1kg et, 1kg peynir, kutu bira, 1 Big Mac) · 5 günlük hava tahmini.
- **Canlı veri politikası:** yalnızca anahtarsız/ücretsiz API'ler —
  Open-Meteo (hava), Frankfurter (döviz). Fiyat tablosu editoryaldir; şehir
  verisiyle birlikte elle güncellenir ve güncelleme tarihi gösterilir.
  API kesilirse uygulama bozulmaz (bölüm gizlenir / son değer gösterilir).
- **Bütçe seçici (genel):** ★ / ★★ / ★★★ — şehir çubuğunun altında, şeffaf
  zeminde, etiketsiz; isteğe bağlı filtre (soru ekranı değil). Tek seçim **Keşfet + Yaşam + İhtiyaçlar**
  gruplarını birden süzer (★ ekonomik / ★★ orta / ★★★ yüksek). Cevaplanan
  sorular: nerede kalırım, nerede/ne yerim, araç nereden kiralarım.
  Varsayılan: hepsi görünür.
- **İhtiyaçlar grubu (5. grup):** nokta bazlı pratik ihtiyaçlar — kiralık araç,
  market, müze, kütüphane, hastane, eczane, yakıt istasyonu. Kategori çipleriyle
  açılır; bütçelendirilebilir (`budget` alanı). Yaşam grubu yalnızca bölge gösterir.
- **Hat rozetleri:** Metro A/B/C harfleri hat renginde rozet olarak haritada.
- **Logotip fontu: Ballet** (Omnibus-Type, OFL) — kullanıcı seçimi; açılış
  ekranında hafif eğik, turistik karakterde; yerel barındırılır.
- **Tasarım vurgusu:** yazı minimum, çizgisel simge tercih; etiketler kısa
  (Kapılar, Hatlar, Oteller, Konutlar).

## I. Ekran düzeni ve yol tarifi (son tur — kullanıcı eskizi)

Kullanıcının el eskizine göre **panel tamamen kaldırıldı; harita tam ekran**:

- Sol üst: şehir çubuğu (Roma · tarih · saat · hava) → tıklayınca künye;
  altında **bütçe yıldızları** (şeffaf zemin, etiketsiz).
- Sağ üst: **Kapılar** ve **Hatlar** çipleri (tıkla-aç/kapa).
- Sağ kenar: kayarak açılan **Yaşam çekmecesi** (Oteller, Konutlar,
  Alt merkezler, Öğrenciler).
- Alt orta: **Keşfet · İhtiyaç** barı; ikisi de yukarı açılan **fonsuz ikon
  menüleri** (yazı yerine çizgisel ikonlar).
- Sağ alt: **Konumum** düğmesi, hemen altında yuvarlak **Tur** düğmesi (▶) —
  dokununca rehberli mod başlar.
- Mobil ve masaüstü aynı düzeni kullanır.
- **Yol tarifi:** haritada yer seçilince yer kartı açılır; "Yol tarifi" düğmesi
  Google Maps'i dış bağlantıyla açar (anahtarsız URL şeması). Navigasyon
  Google'a devredilir — uygulama oryantasyon aracı olarak kalır.
