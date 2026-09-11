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
| London | ✅ uygulandı (2026-07-18) | Big Ben/Tower Bridge/Buckingham/St Paul's/British Museum/Tate Modern/London Eye/Shard allowlist; doğal bölgeye Hyde Park/Regent's/Greenwich/Richmond/Hampstead elle eklendi |
| Paris | ✅ uygulandı (2026-07-12) | Tour Eiffel/Louvre/Notre-Dame/Sacré-Cœur vb. — kesfet-poi'ye 24 nokta elle eklendi |
| Berlin | ✅ uygulandı (2026-07-18) | Brandenburger Tor/Reichstag/Berliner Dom/Fernsehturm/Museumsinsel/East Side Gallery/Checkpoint Charlie vb. allowlist; doğal bölgeye Tiergarten/Tempelhofer Feld/Grunewald/Görlitzer/Mauerpark elle eklendi |
| Madrid | ✅ uygulandı (2026-07-18) | Palacio Real/Prado/Reina Sofía/Thyssen/Puerta del Sol/Plaza Mayor/Cibeles/Bernabéu/Gran Vía allowlist; doğal bölgeye Retiro/Casa de Campo/Botánico/Madrid Río elle eklendi |
| New York | ✅ uygulandı (2026-07-15) | Statue of Liberty/Empire State/Chrysler/Times Sq/Central Park vb. |
| Tokyo | ✅ uygulandı (2026-07-15) | Sensō-ji/Meiji Jingū/Tokyo Tower/Skytree/teamLab/Rainbow Bridge/Tsukiji vb. |
| İzmir | ✅ uygulandı (2026-07-15) | Saat Kulesi/Kadifekale/Agora/Asansör/Kemeraltı vb. + Kemeraltı yeme-içme |
| Barcelona | ✅ uygulandı (2026-07-22) | Sagrada Família/Park Güell/Casa Batlló-Milà/Boqueria/Camp Nou/MNAC allowlist; doğal bölgeye Ciutadella/Montjuïc/Laberint/Fòrum elle eklendi |
| Amsterdam | ✅ uygulandı (2026-07-22) | Rijksmuseum/Van Gogh/Anne Frank Huis/Dam-Koninklijk Paleis/Westerkerk/Rembrandthuis/NEMO/A'DAM Toren/Eye/Concertgebouw allowlist; doğal bölgeye Vondelpark/Oosterpark/Westerpark/Amstelpark elle eklendi |
| Lisboa | ✅ uygulandı (2026-07-22) | Torre de Belém/Jerónimos/Castelo de São Jorge/Praça do Comércio/Santa Justa/Padrão dos Descobrimentos/MAAT/Gulbenkian/Oceanário allowlist; doğal bölgeye Eduardo VII/Estrela/Monsanto elle eklendi |
| Wien | ✅ uygulandı (2026-07-22) | Stephansdom/Schönbrunn/Hofburg/Belvedere/Staatsoper/Riesenrad/Hundertwasserhaus/Kunsthistorisches/Albertina/MuseumsQuartier allowlist; doğal bölgeye Prater/Stadtpark/Schönbrunn/Volksgarten elle eklendi |
| Praha | ✅ uygulandı (2026-07-22) | Pražský hrad/Karlův most/Staroměstské náměstí/Orloj/Katedrála sv. Víta/Vyšehrad/Tančící dům/Petřín allowlist; doğal bölgeye Petřín/Letná/Stromovka/Kampa elle eklendi |
| Singapore | ✅ uygulandı (2026-07-22) | Merlion/Marina Bay Sands/Gardens by the Bay/Raffles Hotel/Sultan Mosque/Chinatown/Little India/Jewel Changi allowlist; doğal bölgeye Botanic Gardens/Fort Canning/Sentosa/Mount Faber elle eklendi |
| Padova | ✅ uygulandı (2026-08-26) | Scrovegni/Sant'Antonio/Prato della Valle/Palazzo della Ragione/Orto Botanico/Pedrocchi/Palazzo Bo/Duomo-Battistero allowlist; doğal bölgeye Parco Iris/Treves/Europa elle eklendi |
| Vancouver | ✅ uygulandı (2026-09-10) | Canada Place/Gastown Steam Clock/Stanley Park/Granville Island/Capilano vb. |
| Moskova | ✅ uygulandı (2026-09-11) | Kreml/Kızıl Meydan/Aziz Vasil/ГУМ/Bolşoy/Tretyakov/Kurtarıcı İsa/Novodeviçi/Kolomenskoye/Tsaritsıno allowlist; modern: Moskva-City/Ostankino/Zaryadye/Kozmonotika/Garaj; doğal bölgeye Gorki/Vorobyovı/Sokolniki/İzmaylovskiy/Losinıy Ostrov/Serebryanıy Bor elle eklendi |

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

## Barcelona

- **tarihi/simge:** Sagrada Família, Casa Batlló, Casa Milà (La Pedrera),
  Casa Vicens, Park Güell, Catedral de Barcelona (La Seu), Basílica de Santa
  Maria del Mar, Basílica de Santa Maria del Pi, Palau de la Música Catalana,
  Hospital de Sant Pau (Recinte Modernista), Arc de Triomf, La Rambla,
  Mercat de la Boqueria (Sant Josep), Plaça Reial, Plaça de Sant Jaume,
  Barri Gòtic, Monument a Colom (Mirador de Colom), Font Màgica de Montjuïc,
  Palau Nacional (MNAC), Poble Espanyol, Castell de Montjuïc, Temple del
  Sagrat Cor (Tibidabo), Bunkers del Carmel (Turó de la Rovira)
- **modern:** Torre Glòries (Agbar), Fundació Joan Miró, MACBA, CCCB,
  Museu Picasso, CosmoCaixa, Camp Nou (FC Barcelona), Estadi Olímpic Lluís
  Companys, Pavelló Mies van der Rohe, Mercat dels Encants
- **doğa/gezi:** Parc de la Ciutadella, Parc de Montjuïc, Platja de la
  Barceloneta, Parc del Laberint d'Horta, Jardí Botànic, Parc del Fòrum,
  Passeig de Gràcia, Port Vell

> Not: Park Güell, Casa Batlló, Casa Milà, Sagrada Família OSM'de wikidata'lı
> olduğundan boru hattı doğal çeker; allowlist güvence içindir. Montjuïc/
> Ciutadella dogal bölge allowlist'inde ayrıca var.


## Amsterdam

- **tarihi/simge:** Anne Frank Huis, Dam & Koninklijk Paleis, Nieuwe Kerk, Oude
  Kerk, Westerkerk, Begijnhof, Museum Het Rembrandthuis, Nationaal Monument,
  Munttoren, Magere Brug, Bloemenmarkt, De Waag (Nieuwmarkt), Portugese
  Synagoge, Pathé Tuschinski, Centraal Station (tarihi bina)
- **modern/müze:** Rijksmuseum, Van Gogh Museum, Stedelijk Museum, Moco Museum,
  Het Scheepvaartmuseum, NEMO Science Museum, A'DAM Toren (Lookout), Eye
  Filmmuseum, Concertgebouw, Heineken Experience
- **doğa/gezi:** Vondelpark, Oosterpark, Westerpark, Sarphatipark, ARTIS,
  Hortus Botanicus, Jordaan, De Wallen (Burgwallen), Grachtengordel (kanal halkası)

> Not: Rijksmuseum/Van Gogh/Anne Frank OSM'de wikidata'lı; allowlist güvence.
> Vondelpark/Oosterpark/Westerpark dogal bölge allowlist'inde ayrıca var.


## Lisboa

- **tarihi/simge:** Torre de Belém, Mosteiro dos Jerónimos, Castelo de São
  Jorge, Praça do Comércio (Terreiro do Paço), Arco da Rua Augusta, Elevador de
  Santa Justa, Sé de Lisboa, Igreja de São Roque, São Vicente de Fora, Panteão
  Nacional, Convento do Carmo, Praça do Rossio, Aqueduto das Águas Livres,
  Miradouro de Santa Luzia, Cristo Rei (karşı yaka)
- **modern/müze:** Padrão dos Descobrimentos, MAAT, Centro Cultural de Belém,
  Museu Calouste Gulbenkian, Oceanário de Lisboa, Torre Vasco da Gama, Ponte 25
  de Abril
- **doğa/gezi:** Parque Eduardo VII, Jardim da Estrela, Jardim Botânico,
  Miradouro da Senhora do Monte, Alfama, Bairro Alto, Parque das Nações

> Not: Belém simgeleri ve Santa Justa OSM'de wikidata'lı; allowlist güvence.
> Overpass o gün modern temasını timeout'ladı → modern büyük ölçüde ikonik'ten.


## Wien (Viyana)

- **tarihi/simge:** Stephansdom, Schloss Schönbrunn, Hofburg, Schloss Belvedere,
  Karlskirche, Wiener Staatsoper, Rathaus, Parlament, Votivkirche, Peterskirche,
  Michaelerkirche, Burgtheater, Heldenplatz, Ankeruhr, Kapuzinergruft, Wiener
  Riesenrad (Prater)
- **modern/müze:** Hundertwasserhaus, Secession, Kunsthistorisches Museum,
  Naturhistorisches Museum, Albertina, MuseumsQuartier, Musikverein
- **doğa/gezi:** Prater (Wurstelprater), Stadtpark, Volksgarten, Schlosspark
  Schönbrunn, Naschmarkt (gastronomi)

> Not: Overpass o gün alışveriş temasını timeout'ladı (Viyana alışverişi cadde
> bazlı — Mariahilfer/Kärntner Straße; bolge-ticari zonları kapsıyor).


## Praha (Prag)

- **tarihi/simge:** Pražský hrad, Karlův most, Staroměstské náměstí,
  Staroměstský orloj, Katedrála svatého Víta, Týnský chrám, Prašná brána,
  Václavské náměstí, Národní divadlo, Národní muzeum, Staronová synagoga
  (Josefov), Vyšehrad, Loreta, Strahovský klášter, Petřínská rozhledna,
  Klementinum, Obecní dům, Rudolfinum, Kostel svatého Mikuláše
- **modern:** Tančící dům (Dancing House), Žižkovská televizní věž, DOX
- **doğa/gezi:** Petřín, Letenské sady, Stromovka, Kampa, Vyšehrad

> Not: Overpass o gün modern temasını timeout'ladı → modern büyük ölçüde
> ikonik'ten (Prag zaten tarihi ağırlıklı bir şehir).


## Singapore

- **tarihi/simge:** Merlion (Merlion Park), Raffles Hotel, Masjid Sultan
  (Sultan Mosque), Sri Mariamman Temple, Thian Hock Keng, Buddha Tooth Relic
  Temple, St Andrew's Cathedral, Chinatown, Little India, Kampong Glam
- **modern:** Marina Bay Sands, Gardens by the Bay, ArtScience Museum,
  Singapore Flyer, Esplanade, National Gallery Singapore, Jewel Changi Airport,
  National Stadium
- **doğa/gezi:** Singapore Botanic Gardens, Fort Canning Park, Sentosa, Mount
  Faber, Singapore Zoo; gastronomi: Lau Pa Sat, Clarke Quay; alışveriş: Orchard

---

## Padova

- **tarihi/simge:** Cappella degli Scrovegni, Musei Civici agli Eremitani,
  Chiesa degli Eremitani, Basilica di Sant'Antonio (il Santo), Monumento
  equestre al Gattamelata, Oratorio di San Giorgio, Scoletta del Santo,
  Prato della Valle, Basilica/Abbazia di Santa Giustina, Palazzo della Ragione
  (il Salone), Piazza delle Erbe, Piazza della Frutta, Piazza dei Signori,
  Torre dell'Orologio, Palazzo del Capitanio, Caffè Pedrocchi, Palazzo Bo
  (Teatro Anatomico), Duomo (Cattedrale di Santa Maria Assunta), Battistero
  della Cattedrale, Loggia e Odeo Cornaro, Castello Carrarese, La Specola,
  Porta Portello, Porta Savonarola, Porta San Giovanni, Ponte San Lorenzo,
  Ponte Molino, Teatro Verdi, Palazzo Zuckermann, Oratorio di San Michele,
  Chiesa di Santa Maria dei Servi, Chiesa del Carmine, Palazzo Moroni,
  Museo Diocesano, Ghetto/Sinagoga, Villa Giusti
- **UNESCO:** Orto botanico (1997) + "Padova Urbs picta" 14. yy fresk döngüleri
  (2021): Scrovegni, Eremitani, Palazzo della Ragione, Battistero, Oratorio di
  San Michele, San Giorgio, Scoletta del Santo, Carmine
- **modern:** Stadio Euganeo, Fiera di Padova
- **doğa:** Orto botanico, Prato della Valle, Parco Treves, Giardini dell'Arena,
  Parco Iris, Parco Milcovich, Parco d'Europa, Parco del Roncajette

---

## Vancouver

- **tarihi/simge:** Gastown Steam Clock, Gastown (Maple Tree Square), Canada
  Place, Marine Building, Sun Tower, Fairmont Hotel Vancouver, Christ Church
  Cathedral, St. Paul's Anglican Church, Orpheum Theatre, Vogue Theatre,
  Chinatown Millennium Gate, Dr. Sun Yat-Sen Classical Chinese Garden,
  Brockton Point Totem Poles, Nine O'Clock Gun, Hollow Tree, Lions Gate
  Bridge, Burrard Bridge, Roedde House Museum, Hastings Mill Store Museum,
  Point Atkinson Lighthouse, Britannia Shipyards, Gulf of Georgia Cannery,
  Steveston Village, Burnaby Village Museum, Empress of Japan Figurehead
- **modern:** Vancouver Lookout (Harbour Centre), Science World, BC Place,
  Rogers Arena, Vancouver Convention Centre, Vancouver Art Gallery, Museum of
  Anthropology (UBC), Vancouver Public Library Central Branch, Digital Orca,
  The Polygon Gallery, SFU Burnaby Academic Quadrangle, Olympic Cauldron
- **doğa:** Stanley Park (Seawall, Prospect Point), English Bay Beach,
  Kitsilano Beach, Jericho Beach, Spanish Banks, Queen Elizabeth Park +
  Bloedel Conservatory, VanDusen Botanical Garden, Nitobe Memorial Garden,
  UBC Botanical Garden, Pacific Spirit Regional Park, Capilano Suspension
  Bridge, Lynn Canyon Suspension Bridge, Grouse Mountain, Mount Seymour
  Provincial Park, Cypress Provincial Park, Deep Cove / Quarry Rock,
  Ambleside Park, Lighthouse Park
- **gastronomi:** Granville Island Public Market, Richmond Night Market
- **alışveriş:** CF Pacific Centre, Metropolis at Metrotown, Oakridge Park,
  Aberdeen Centre, Park Royal

---

## Moskova (2026-09-11)

**tarihi:** Московский Кремль · Красная площадь · Собор Василия Блаженного ·
Мавзолей Ленина · ГУМ · Государственный исторический музей · Оружейная палата ·
Храм Христа Спасителя · Большой театр · Малый театр · Третьяковская галерея ·
ГМИИ им. Пушкина · Новодевичий монастырь · Донской · Данилов · Новоспасский ·
Высоко-Петровский монастырь · Крутицкое подворье · Коломенское · Царицыно ·
Кусково · Измайловский кремль · Дом Пашкова · Триумфальная арка · Парк Победы ·
Царь-пушка · Царь-колокол · Александровский сад · Манежная площадь ·
Петровский путевой дворец · Сандуны · Елисеевский · Патриаршие пруды ·
Чистые пруды · МГУ (Ломоносов) · Котельническая набережная

**modern:** Москва-Сити · Башня Федерация · Останкинская телебашня · Зарядье ·
Музей космонавтики · Рабочий и колхозница · ВДНХ · Гараж · ГЭС-2 · Винзавод ·
Красный Октябрь · Лужники · Бункер-42 · Мосфильм · ЦУМ

**doga:** Парк Горького · Воробьёвы горы · Сокольники · Измайловский парк ·
Лосиный Остров · Битцевский лес · Серебряный Бор · Главный ботанический сад ·
Аптекарский огород · Нескучный сад · Филёвский парк · Кузьминки

> Bulunamayan tek madde: **Гостиница «Украина»** (OSM'de otel adı
> «Рэдиссон Коллекшен» olarak da eşleşmedi). Yedi Kızkardeş binaları listede
> MGU ana binası + Котельническая набережная ile temsil ediliyor.
