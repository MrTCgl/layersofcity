# İkonik Landmark Allowlist'leri (şehir bazlı)

> **Amaç:** OSM boru hattındaki ızgara seyreltme + kalite vekili
> (`docs/VERI.md` → "OSM üretim boru hattı") dünyaca ünlü zorunlu simgeleri
> eleyebiliyor — İstanbul'da Topkapı Sarayı bu yüzden atlanmıştı. Bu dosya,
> her şehir için **seyreltme tavanına bakılmaksızın** `kesfet-poi.geojson`'a
> girmesi gereken "olmazsa olmaz" simge listesidir.
>
> **Kullanım (VERI.md adım 5):** şehir eklerken boru hattı bittikten sonra bu
> listeyi çıktıyla **ada göre** çakıştır; eksik olanı `theme:"tarihi"` (modern
> yapı ise `modern`, ünlü park/manzara ise `doga`) olarak elle ekle.
> Koordinatlar şehir işlenirken doldurulur; buradaki liste **kontrol
> listesidir**, "çok bilinen, gelir zaten" diye hiçbir madde atlanmaz.

## Durum

| Şehir | Durum | Not |
|---|---|---|
| İstanbul | ✅ uygulandı (2026-07-12) | Topkapı/Ayasofya/Sultanahmet vb. 49 nokta |
| Roma | ✅ uygulandı (2026-07-12) | Palatino/Fori Imperiali/Campidoglio/Vittoriano vb. 42 nokta |
| London | 🔲 şehir eklenince | aşağıdaki liste |
| Paris | ✅ uygulandı (2026-07-12) | Tour Eiffel/Louvre/Notre-Dame/Sacré-Cœur vb. — kesfet-poi'ye 24 nokta elle eklendi |
| Berlin | ✅ uygulandı (2026-07-18) | Brandenburger Tor/Reichstag/Berliner Dom/Fernsehturm/Museumsinsel/East Side Gallery/Checkpoint Charlie vb. allowlist; doğal bölgeye Tiergarten/Tempelhofer Feld/Grunewald/Görlitzer/Mauerpark elle eklendi |
| Madrid | ✅ uygulandı (2026-07-18) | Palacio Real/Prado/Reina Sofía/Thyssen/Puerta del Sol/Plaza Mayor/Cibeles/Bernabéu/Gran Vía allowlist; doğal bölgeye Retiro/Casa de Campo/Botánico/Madrid Río elle eklendi |
| New York | ✅ uygulandı (2026-07-15) | Statue of Liberty/Empire State/Chrysler/Times Sq/Central Park vb. |
| Tokyo | ✅ uygulandı (2026-07-15) | Sensō-ji/Meiji Jingū/Tokyo Tower/Skytree/teamLab/Rainbow Bridge/Tsukiji vb. |
| İzmir | ✅ uygulandı (2026-07-15) | Saat Kulesi/Kadifekale/Agora/Asansör/Kemeraltı vb. + Kemeraltı yeme-içme |

> Liste kapalı değildir; şehri araştırırken eksik gördüğün ana simgeyi ekle.
> Amaç: bir turistin şehirle özdeşleştirdiği ilk ~30-50 yer eksiksiz olsun.

---

## London

- **tarihi/simge:** Big Ben & Houses of Parliament (Westminster), Tower of
  London, Tower Bridge, Buckingham Palace, St Paul's Cathedral, Westminster
  Abbey, Trafalgar Square (Nelson's Column), Piccadilly Circus, Leicester
  Square, Covent Garden, Kensington Palace, Shakespeare's Globe, Monument to
  the Great Fire, 10 Downing Street, Royal Albert Hall
- **müze/galeri (tarihi/modern):** British Museum, National Gallery, Tate
  Modern, Tate Britain, Natural History Museum, Victoria and Albert Museum
- **modern:** London Eye, The Shard, The O2, Wembley Stadium
- **doğa:** Hyde Park, St James's Park, Regent's Park, Greenwich Park (Royal
  Observatory, Cutty Sark)
- **alışveriş:** Camden Market, Harrods, Oxford Street, Borough Market

## Paris

- **tarihi/simge:** Tour Eiffel, Notre-Dame de Paris, Arc de Triomphe,
  Sacré-Cœur (Montmartre), Sainte-Chapelle, Panthéon, Les Invalides (Napolyon
  mezarı), Opéra Garnier, Place de la Concorde, Place de la Bastille, Place des
  Vosges (Le Marais), Conciergerie, Île de la Cité, Pont Alexandre III,
  Trocadéro, Père-Lachaise
- **müze:** Louvre, Musée d'Orsay, Centre Pompidou (modern), Musée Rodin,
  Musée de l'Orangerie
- **modern:** La Défense / Grande Arche, Tour Montparnasse
- **doğa:** Jardin du Luxembourg, Jardin des Tuileries, Bois de Boulogne
- **alışveriş/gezi:** Champs-Élysées, Galeries Lafayette, Moulin Rouge (Pigalle)

## Berlin

- **tarihi/simge:** Brandenburger Tor, Reichstag, Berliner Dom, Charlottenburg
  Sarayı, Gedächtniskirche (Kaiser Wilhelm), Siegessäule (Zafer Sütunu),
  Gendarmenmarkt, Nikolaiviertel, Unter den Linden, Bebelplatz
- **duvar/anma:** East Side Gallery, Checkpoint Charlie, Holocaust-Mahnmal
  (Denkmal für die ermordeten Juden Europas), Berlin Wall Memorial (Bernauer
  Straße), Topographie des Terrors
- **müze:** Museumsinsel (Pergamonmuseum, Neues Museum, Altes Museum)
- **modern:** Fernsehturm (Alexanderplatz), Potsdamer Platz, Sony Center,
  Oberbaumbrücke
- **doğa:** Tiergarten, Tempelhofer Feld
- **alışveriş:** Hackescher Markt, KaDeWe, Kurfürstendamm

## Madrid

- **tarihi/simge:** Palacio Real, Puerta del Sol, Plaza Mayor, Puerta de
  Alcalá, Plaza de Cibeles, Catedral de la Almudena, Templo de Debod, Plaza de
  España, Metrópolis binası, Estación de Atocha, Círculo de Bellas Artes
- **müze:** Museo del Prado, Museo Reina Sofía (modern), Museo
  Thyssen-Bornemisza
- **modern:** Estadio Santiago Bernabéu, Cuatro Torres (CTBA), Puerta de Europa
  (KIO kuleleri)
- **doğa:** Parque del Retiro, Real Jardín Botánico, Casa de Campo
- **alışveriş/gezi:** Gran Vía, Mercado de San Miguel, El Rastro, Barrio de las
  Letras

## New York

- **tarihi/simge:** Statue of Liberty, Ellis Island, Brooklyn Bridge, Grand
  Central Terminal, Flatiron Building, Wall Street / Charging Bull, St.
  Patrick's Cathedral, Washington Square Park, Federal Hall
- **gökdelen/modern:** Empire State Building, Chrysler Building, Rockefeller
  Center (Top of the Rock), One World Trade Center & 9/11 Memorial, The Vessel
  / Hudson Yards, Times Square
- **müze:** Metropolitan Museum of Art, MoMA (modern), American Museum of
  Natural History, Guggenheim, Whitney
- **doğa:** Central Park, The High Line, Little Island, Coney Island
- **alışveriş/gezi:** Fifth Avenue, Broadway (Theater District), Staten Island
  Ferry

## Tokyo

- **tarihi/tapınak:** Sensō-ji (Asakusa, Kaminarimon), Meiji Jingū, Imperial
  Palace (Kōkyo), Yasukuni Shrine, Zōjō-ji, Nezu Shrine, Tokyo Station (tarihi
  bina), Ryōgoku Kokugikan (sumo)
- **modern:** Tokyo Tower, Tokyo Skytree, Shibuya Crossing (Shibuya Scramble),
  Roppongi Hills / Mori Tower, teamLab, Odaiba (Rainbow Bridge, Gundam)
- **doğa:** Shinjuku Gyoen, Ueno Park, Hama-rikyū Gardens, Yoyogi Park
- **alışveriş/gezi:** Ginza, Akihabara, Harajuku (Takeshita-dōri),
  Nakamise-dōri, Shinjuku (Golden Gai)

## İzmir

- **tarihi/simge:** İzmir Saat Kulesi (Konak Meydanı), Konak Meydanı, Yalı
  (Konak) Camii, Kemeraltı Çarşısı, Kızlarağası Hanı, Smyrna Agorası (Agora
  Ören Yeri), Kadifekale, Tarihi Asansör (Karataş), Hisar Camii, Şadırvanaltı
  Camii, Kemeraltı Havra Sokağı sinagogları (Beth Israel), St. Polycarp
  Kilisesi, Basmane Garı, Cumhuriyet Meydanı & Atatürk Anıtı
- **müze:** İzmir Arkeoloji Müzesi, Etnografya Müzesi, Ahmet Piriştina Kent
  Arşivi (APIKAM), Ödemiş dışıdır — merkez müzeleri İhtiyaç/muze'de
- **modern:** Arkas Sanat Merkezi, Ahmed Adnan Saygun Sanat Merkezi (AASSM),
  Konak Pier (Eiffel yapısı, alışveriş)
- **doğa:** Kordon (Birinci/İkinci Kordon), Kültürpark, Bostanlı Sahili,
  İnciraltı Kent Ormanı, (kuzeyde Gediz Deltası kuş cenneti — sınır dışı)
- **yeme-içme (Kemeraltı, kullanıcı isteği):** kumru (Kumrucu Sabri), söğüş
  (Söğüşçü Cimbom), gevrek/boyoz (İpek Gevrek), şambali (Hisarönü Şambalicisi),
  Kemeraltı baklavası, Bolulu Hasan Usta süt tatlıları, kokoreç, Suluhan
  tarihi han kahveleri
- **gastronomi:** Toyosu / eski Tsukiji piyasası, Omoide Yokochō
