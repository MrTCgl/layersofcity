# CLAUDE.md — Proje Anayasası

Bu proje "layersofcity" (çalışma adı): yeni bir metropole giden kişinin şehri
sade bir harita üzerinde katmanlarla "okumasını" sağlayan statik web uygulaması.
Navigasyon değil, **oryantasyon** aracıdır.

## Okuma sırası (her oturumun başında)

1. `PROJE_PLANI.md` — konsept, katman yapısı, yol haritası
2. `docs/TASARIM.md` — renkler, tipografi, ikon ve harita stili kuralları
3. `docs/VERI.md` — klasör yapısı, GeoJSON şeması, i18n formatı
4. `docs/ETAPLAR.md` — kodlama etapları ve **güncel durum**

## Değişmez kararlar

Bu kararlar kullanıcı ile tartışılarak alındı. Bir oturumda değiştirme; gerekçen
varsa kullanıcıya sor:

- **Saf statik site.** Sunucu, veritabanı, API anahtarı, build zorunluluğu yok.
  Vanilla HTML/CSS/JS. Tek harici çalışma bağımlılığı: **MapLibre GL JS**.
  Framework (React/Vue/vb.) ekleme.
- **Çok şehirli mimari.** Şehir = `data/<sehir>/` klasörü. Yeni şehir eklemek
  kod değişikliği gerektirmemeli.
- **Kullanıcıya soru sorulmaz.** Persona/anket/sihirbaz ekranı yok. Ziyaret
  amaçları katman grupları olarak var olur: Varış, Omurga, Keşfet, Yaşam.
- **Açılış ekranı = sade dünya haritası.** Üzerinde yalnızca hazır şehirlerin
  nokta+isimleri. Şehre tıklamak giriştir. Sol üst logo her yerden bu ekrana döndürür.
- **Az yazı, sade görünüm.** Uzun paragraf yok; kısa etiket ve tek cümlelik ipuçları.
  Çizgisel (stroke) ikonlar; canlı/cırtlak renk yok. Ayrıntı: `docs/TASARIM.md`.
- **Tema:** açık (soluk pastel) + koyu. Harita altlığı temayla birlikte değişir.
- **6 dil mimarisi** (en, de, fr, it, es, tr); içerik önce en+tr.
  Arayüzde sabit yazı (hardcoded string) bırakma; her metin i18n dosyasından gelir.
- **Üyelik yok.** Tercihler `localStorage`'da. Analitik ancak yayın etabında ve
  çerezsiz araçla (Plausible/Umami) eklenir.
- **Rehberli mod** isteğe bağlıdır; varsayılan kapalı, kimseye dayatılmaz.

## Çalışma disiplini (limitli oturumlar için)

- Kodlama `docs/ETAPLAR.md`'deki sırayla, **oturum başına bir etap** hedefiyle yapılır.
- Etaba başlarken durumunu `🔵 devam ediyor` yap; bitince `✅ tamam` yap,
  tarih düş, commit'le ve push'la.
- Oturum yarıda kalırsa: yapılanları commit'le, etabın "Durum notu" satırına
  kalınan yeri tek cümleyle yaz. Push etmeden oturumu bitirme.
- Bir etabın "Bitti sayılır" listesi tamamlanmadan sonraki etaba geçme.
- Her etap sonunda tarayıcıda elle doğrula (mobil genişlik dahil, iki temada).

## Üslup kuralları

- Kod: değişken/fonksiyon adları ve kod içi yorumlar **İngilizce**.
- Commit mesajları ve dokümanlar **Türkçe** (kullanıcı Türkçe okuyor).
- Kullanıcıya görünen her metin i18n anahtarıdır; Türkçesi `sen` diliyle, kısa ve samimi.
