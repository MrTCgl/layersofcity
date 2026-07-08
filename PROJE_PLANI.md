# Şehir Katmanları — Proje Planı

> Çalışma adı henüz kesinleşmedi ("citylayers" öne çıkan aday).
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
| **1. Varış** | Giriş kapıları (Fiumicino ✈, Ciampino ✈, Termini 🚂, Tiburtina 🚂) ve her kapıdan merkeze giden net bağlantı çizgisi | Şehre nereden girerim, merkeze nasıl ulaşırım? |
| **2. Omurga** | Merkez(ler) işareti, Metro A/B/C, kilit tramvay hatları, alt merkez ↔ merkez ana aksları | Merkez neresi, ana akslar hangileri? |
| **3. Keşfet** | İlgi noktaları — tema filtreli: tarihi, modern, doğa, gastronomi, alışveriş, sağlık turizmi. Gün içi yoğun bölgeler | Ne göreceğim, nereler kalabalık? |
| **4. Yaşam** | Otel yoğunluğu bölgeleri, konut bölgeleri, alt merkezler, üniversite/kampüs/öğrenci bölgeleri | Nerede kalırım / yaşarım / okurum? |

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

## E. İsim ve alan adı (açık karar)

RDAP kontrolü 2026-07-08 itibarıyla:

| Aday | Durum |
|---|---|
| citylayers.com | ❌ Alınmış — Atom.com pazarında **satılık** (fiyat muhtemelen yüksek) |
| **citylayers.io** | ✅ Müsait |
| citylayers.net / .co | ✅ Müsait |
| citylayers.org, citylayer.com, layercity.com, layeredcity.com | ❌ Alınmış |
| **layersofcity.com** | ✅ Müsait — **öne çıkan aday** (kullanıcı beğendi) |
| unfoldcity.com, cityunfolded.com, cityinlayers.com | ✅ Müsait |
| understandcity.com, firstday.city, cityreader.app, readthecity.com | ✅ Müsait |
| citystrata.com, stratacity.com, urbanstrata.com, cityunfold.com | ❌ Alınmış |

Karar kullanıcıda; satın almadan hemen önce kayıt firmasında son kontrol yapılmalı.

## F. GitHub repo ismi

- Repo ismi projeye özel olacak, "ROMA" içermeyecek.
- GitHub'da repo yeniden adlandırma tek işlemdir (Settings → General → Rename)
  ve eski adrese gelen istekler otomatik yönlendirilir; kod tarafında hiçbir şey kırılmaz.
- Karar: **alan adı kesinleşince** repo aynı isimle yeniden adlandırılır
  (örn. `citylayers`). Ayrı bir proje/kod taşıma işlemi gerekmez.

## G. Yol haritası

1. ✅ **Konsept kilitleme** — bu belge
2. ⬜ **Görsel prototip** — kod öncesi tıklanabilir tasarım taslağı:
   şehir seçimi, harita ekranı, katman menüsü, tema/dil anahtarları.
   Amaç: ucuz aşamada bol revizyon.
3. ⬜ **Roma içerik taslağı** — bölgeleme, akslar, ilgi noktası setleri
   (Claude taslak çıkarır → kullanıcı onaylar)
4. ⬜ **İsim + alan adı kararı** ve satın alma (kullanıcı) → repo rename
5. ⬜ **Kodlama v1** — iskelet + Roma verisi + EN/TR + gece-gündüz tema
6. ⬜ **Yayın** — GitHub Pages + alan adı + analitik
7. ⬜ **İkinci şehir** — şablonun şehirden bağımsızlığının kanıtı
8. ⬜ **Gelişim** — kalan 4 dil, affiliate/gelir katmanı, yeni şehirler
