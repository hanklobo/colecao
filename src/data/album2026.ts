import type { Section, Sticker } from '../types';

function makeStickers(
  startId: number,
  sectionId: string,
  names: string[],
): Sticker[] {
  return names.map((name, i) => ({ id: startId + i, name, sectionId }));
}

// Real, well-known squad members per team (11 each). This is a best-effort
// roster as of late 2025 and MUST be reconciled with the official Panini
// checklist before a wide launch — names/numbers can differ.
const TEAM_PLAYERS: Record<string, string[]> = {
  USA: ['Christian Pulisic', 'Weston McKennie', 'Tyler Adams', 'Gio Reyna', 'Tim Weah', 'Yunus Musah', 'Sergiño Dest', 'Antonee Robinson', 'Matt Turner', 'Folarin Balogun', 'Ricardo Pepi'],
  URU: ['Federico Valverde', 'Darwin Núñez', 'Ronald Araújo', 'Rodrigo Bentancur', 'José María Giménez', 'Facundo Pellistri', 'Manuel Ugarte', 'Nicolás de la Cruz', 'Sergio Rochet', 'Maximiliano Araújo', 'Brian Rodríguez'],
  PAN: ['Aníbal Godoy', 'Adalberto Carrasquilla', 'Michael Murillo', 'Fidel Escobar', 'José Fajardo', 'Ismael Díaz', 'César Blackman', 'Édgar Bárcenas', 'Orlando Mosquera', 'Cecilio Waterman', 'Eric Davis'],
  BOL: ['Marcelo Martins', 'Carmelo Algarañaz', 'Henry Vaca', 'Roberto Fernández', 'Diego Bejarano', 'Luis Haquín', 'Ramiro Vaca', 'Boris Céspedes', 'Carlos Lampe', 'Miguel Terceros', 'José Sagredo'],
  ARG: ['Lionel Messi', 'Julián Álvarez', 'Lautaro Martínez', 'Emiliano Martínez', 'Rodrigo De Paul', 'Enzo Fernández', 'Alexis Mac Allister', 'Cristian Romero', 'Nicolás Otamendi', 'Nahuel Molina', 'Ángel Di María'],
  JAM: ['Leon Bailey', 'Michail Antonio', 'Demarai Gray', 'Bobby De Cordova-Reid', 'Damion Lowe', 'Ravel Morrison', 'Andre Blake', 'Dexter Lembikisa', 'Kasey Palmer', "Di'Shon Bernard", 'Greg Leigh'],
  ROM: ['Nicolae Stanciu', 'Dennis Man', 'Răzvan Marin', 'Ianis Hagi', 'Radu Drăgușin', 'Andrei Rațiu', 'Florinel Coman', 'Valentin Mihăilă', 'Horațiu Moldovan', 'George Pușcaș', 'Marius Marin'],
  DZA: ['Riyad Mahrez', 'Ismaël Bennacer', 'Saïd Benrahma', 'Youcef Atal', 'Aïssa Mandi', 'Ramy Bensebaini', 'Baghdad Bounedjah', 'Houssem Aouar', 'Islam Slimani', 'Adam Ounas', "Raïs M'Bolhi"],
  BRA: ['Vinícius Júnior', 'Rodrygo', 'Neymar', 'Raphinha', 'Casemiro', 'Marquinhos', 'Éder Militão', 'Bruno Guimarães', 'Alisson', 'Lucas Paquetá', 'Gabriel Jesus'],
  MEX: ['Hirving Lozano', 'Santiago Giménez', 'Edson Álvarez', 'Raúl Jiménez', 'Guillermo Ochoa', 'César Montes', 'Luis Chávez', 'Orbelín Pineda', 'Jesús Gallardo', 'Uriel Antuna', 'Johan Vásquez'],
  AUS: ['Mathew Ryan', 'Harry Souttar', 'Jackson Irvine', 'Aaron Mooy', 'Mitchell Duke', 'Riley McGree', 'Craig Goodwin', 'Connor Metcalfe', 'Martin Boyle', 'Cameron Devlin', 'Kye Rowles'],
  TUN: ['Youssef Msakni', 'Wahbi Khazri', 'Aïssa Laïdouni', 'Ellyes Skhiri', 'Montassar Talbi', 'Hannibal Mejbri', 'Naïm Sliti', 'Ali Maâloul', 'Mohamed Dräger', 'Issam Jebali', 'Aymen Dahmen'],
  FRA: ['Kylian Mbappé', 'Antoine Griezmann', 'Aurélien Tchouaméni', 'Eduardo Camavinga', 'Ousmane Dembélé', 'Theo Hernández', 'Dayot Upamecano', 'William Saliba', 'Mike Maignan', 'Marcus Thuram', 'Adrien Rabiot'],
  MAR: ['Achraf Hakimi', 'Hakim Ziyech', 'Sofyan Amrabat', 'Youssef En-Nesyri', 'Noussair Mazraoui', 'Azzedine Ounahi', 'Romain Saïss', 'Yassine Bounou', 'Brahim Díaz', 'Sofiane Boufal', 'Nayef Aguerd'],
  JPN: ['Takefusa Kubo', 'Kaoru Mitoma', 'Wataru Endo', 'Daichi Kamada', 'Ritsu Doan', 'Takehiro Tomiyasu', 'Ao Tanaka', 'Junya Ito', 'Ayase Ueda', 'Hidemasa Morita', 'Shuichi Gonda'],
  ECU: ['Moisés Caicedo', 'Enner Valencia', 'Piero Hincapié', 'Pervis Estupiñán', 'Gonzalo Plata', 'Kendry Páez', 'Félix Torres', 'Ángelo Preciado', 'Hernán Galíndez', 'Jeremy Sarmiento', 'Alan Franco'],
  ESP: ['Rodri', 'Pedri', 'Gavi', 'Lamine Yamal', 'Nico Williams', 'Álvaro Morata', 'Dani Olmo', 'Fabián Ruiz', 'Unai Simón', 'Robin Le Normand', 'Mikel Merino'],
  COL: ['James Rodríguez', 'Luis Díaz', 'Rafael Santos Borré', 'Jhon Durán', 'Jefferson Lerma', 'Davinson Sánchez', 'Richard Ríos', 'Daniel Muñoz', 'Camilo Vargas', 'Johan Mojica', 'Jorge Carrascal'],
  KOR: ['Son Heung-min', 'Lee Kang-in', 'Kim Min-jae', 'Hwang Hee-chan', 'Hwang In-beom', 'Cho Gue-sung', 'Kim Young-gwon', 'Lee Jae-sung', 'Jo Hyeon-woo', 'Seol Young-woo', 'Oh Hyeon-gyu'],
  CAN: ['Alphonso Davies', 'Jonathan David', 'Cyle Larin', 'Stephen Eustáquio', 'Tajon Buchanan', 'Jonathan Osorio', 'Alistair Johnston', 'Maxime Crépeau', 'Ismaël Koné', 'Richie Laryea', 'Derek Cornelius'],
  GER: ['Jamal Musiala', 'Kai Havertz', 'Joshua Kimmich', 'İlkay Gündoğan', 'Florian Wirtz', 'Antonio Rüdiger', 'Leroy Sané', 'Serge Gnabry', 'Manuel Neuer', 'Niclas Füllkrug', 'Leon Goretzka'],
  CRO: ['Luka Modrić', 'Mateo Kovačić', 'Marcelo Brozović', 'Ivan Perišić', 'Joško Gvardiol', 'Andrej Kramarić', 'Mario Pašalić', 'Borna Sosa', 'Dominik Livaković', 'Josip Stanišić', 'Luka Sučić'],
  SEN: ['Sadio Mané', 'Kalidou Koulibaly', 'Édouard Mendy', 'Ismaïla Sarr', 'Idrissa Gueye', 'Nampalys Mendy', 'Boulaye Dia', 'Pape Matar Sarr', 'Nicolas Jackson', 'Krépin Diatta', 'Youssouf Sabaly'],
  IRN: ['Mehdi Taremi', 'Sardar Azmoun', 'Alireza Jahanbakhsh', 'Saman Ghoddos', 'Ramin Rezaeian', 'Majid Hosseini', 'Alireza Beiranvand', 'Mehdi Ghayedi', 'Saeid Ezatolahi', 'Milad Mohammadi', 'Karim Ansarifard'],
  ENG: ['Harry Kane', 'Jude Bellingham', 'Phil Foden', 'Bukayo Saka', 'Declan Rice', 'John Stones', 'Marcus Rashford', 'Trent Alexander-Arnold', 'Jordan Pickford', 'Cole Palmer', 'Kyle Walker'],
  NED: ['Virgil van Dijk', 'Memphis Depay', 'Frenkie de Jong', 'Cody Gakpo', 'Nathan Aké', 'Denzel Dumfries', 'Xavi Simons', 'Tijjani Reijnders', 'Bart Verbruggen', 'Steven Bergwijn', 'Micky van de Ven'],
  NGA: ['Victor Osimhen', 'Ademola Lookman', 'Samuel Chukwueze', 'Wilfred Ndidi', 'Alex Iwobi', 'William Troost-Ekong', 'Kelechi Iheanacho', 'Calvin Bassey', 'Stanley Nwabali', 'Moses Simon', 'Frank Onyeka'],
  VEN: ['Salomón Rondón', 'Yeferson Soteldo', 'Darwin Machís', 'Tomás Rincón', 'Yangel Herrera', 'Josef Martínez', 'Jefferson Savarino', 'Eduard Bello', 'Rafael Romo', 'Nahuel Ferraresi', 'Jon Aramburu'],
  POR: ['Cristiano Ronaldo', 'Bruno Fernandes', 'Bernardo Silva', 'Rafael Leão', 'Rúben Dias', 'João Cancelo', 'Vitinha', 'João Félix', 'Diogo Costa', 'Gonçalo Ramos', 'Nuno Mendes'],
  DEN: ['Christian Eriksen', 'Rasmus Højlund', 'Pierre-Emile Højbjerg', 'Andreas Christensen', 'Joakim Mæhle', 'Jannik Vestergaard', 'Kasper Schmeichel', 'Mikkel Damsgaard', 'Thomas Delaney', 'Jonas Wind', 'Victor Kristiansen'],
  GHA: ['Mohammed Kudus', 'Thomas Partey', 'Iñaki Williams', 'Jordan Ayew', 'Mohammed Salisu', 'Alexander Djiku', 'Antoine Semenyo', 'Kamaldeen Sulemana', 'Lawrence Ati-Zigi', 'Majeed Ashimeru', 'Tariq Lamptey'],
  KSA: ['Salem Al-Dawsari', 'Firas Al-Buraikan', 'Mohammed Kanno', 'Saud Abdulhamid', 'Ali Al-Bulaihi', 'Abdullah Al-Malki', 'Mohammed Al-Owais', 'Sami Al-Najei', 'Hassan Al-Tambakti', 'Salman Al-Faraj', 'Abdulrahman Ghareeb'],
  BEL: ['Kevin De Bruyne', 'Romelu Lukaku', 'Jérémy Doku', 'Youri Tielemans', 'Amadou Onana', 'Leandro Trossard', 'Thibaut Courtois', 'Wout Faes', 'Timothy Castagne', 'Dodi Lukebakio', 'Arthur Theate'],
  SRB: ['Dušan Vlahović', 'Aleksandar Mitrović', 'Sergej Milinković-Savić', 'Dušan Tadić', 'Filip Kostić', 'Nikola Milenković', 'Lazar Samardžić', 'Strahinja Pavlović', 'Vanja Milinković-Savić', 'Saša Lukić', 'Andrija Živković'],
  HON: ['Anthony Lozano', 'Alberth Elis', 'Romell Quioto', 'Luis Palma', 'Andy Najar', 'Edrick Menjívar', 'Denil Maldonado', 'Kervin Arriaga', 'Deiby Flores', 'Jorge Álvarez', 'Rigoberto Rivas'],
  UZB: ['Eldor Shomurodov', 'Abbosbek Fayzullaev', 'Jaloliddin Masharipov', 'Odiljon Hamrobekov', 'Otabek Shukurov', 'Igor Sergeev', 'Utkir Yusupov', 'Khojimat Erkinov', 'Abduvohid Nematov', 'Rustam Ashurmatov', 'Sherzod Nasrullaev'],
  AUT: ['David Alaba', 'Marcel Sabitzer', 'Marko Arnautović', 'Christoph Baumgartner', 'Konrad Laimer', 'Nicolas Seiwald', 'Phillipp Mwene', 'Patrick Wimmer', 'Alexander Schlager', 'Romano Schmid', 'Maximilian Wöber'],
  SUI: ['Granit Xhaka', 'Manuel Akanji', 'Breel Embolo', 'Xherdan Shaqiri', 'Remo Freuler', 'Ricardo Rodríguez', 'Yann Sommer', 'Ruben Vargas', 'Fabian Rieder', 'Dan Ndoye', 'Silvan Widmer'],
  IRQ: ['Aymen Hussein', 'Ali Jasim', 'Ibrahim Bayesh', 'Bashar Resan', 'Zidane Iqbal', 'Rebin Sulaka', 'Jalal Hassan', 'Amjad Attwan', 'Sherko Kareem', 'Mohanad Ali', 'Frans Putros'],
  COD: ['Cédric Bakambu', 'Yoane Wissa', 'Chancel Mbemba', 'Silas Katompa', 'Gaël Kakuta', 'Théo Bongonda', 'Arthur Masuaku', 'Dieumerci Mbokani', 'Meschack Elia', 'Samuel Moutoussamy', 'Lionel Mpasi'],
  TUR: ['Hakan Çalhanoğlu', 'Arda Güler', 'Kenan Yıldız', 'Kerem Aktürkoğlu', 'Çağlar Söyüncü', 'Merih Demiral', 'Ferdi Kadıoğlu', 'Orkun Kökçü', 'Uğurcan Çakır', 'Yusuf Yazıcı', 'Barış Alper Yılmaz'],
  SVK: ['Stanislav Lobotka', 'Milan Škriniar', 'Dávid Hancko', 'Ondrej Duda', 'Lukáš Haraslín', 'Róbert Mak', 'Ivan Schranz', 'Juraj Kucka', 'Martin Dúbravka', 'Tomáš Suslov', 'Dávid Strelec'],
  CMR: ['André Onana', 'Vincent Aboubakar', 'Karl Toko Ekambi', 'Bryan Mbeumo', 'Zambo Anguissa', 'Choupo-Moting', 'Jean-Charles Castelletto', 'Pierre Kunde', 'Olivier Ntcham', 'Georges-Kévin Nkoudou', 'Collins Fai'],
  NZL: ['Chris Wood', 'Marco Rojas', 'Liberato Cacace', 'Matthew Garbett', 'Sarpreet Singh', 'Joe Bell', 'Ben Waine', 'Elijah Just', 'Oliver Sail', 'Tyler Bindon', 'Alex Paulsen'],
  ITA: ['Federico Chiesa', 'Gianluigi Donnarumma', 'Nicolò Barella', 'Sandro Tonali', 'Federico Dimarco', 'Alessandro Bastoni', 'Giacomo Raspadori', 'Davide Frattesi', 'Bryan Cristante', 'Giovanni Di Lorenzo', 'Mateo Retegui'],
  CIV: ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé', 'Wilfried Singo', 'Serge Aurier', 'Ibrahim Sangaré', 'Simon Adingra', 'Jean-Philippe Krasso', 'Yahia Fofana', 'Evan Ndicka', 'Seko Fofana'],
  JOR: ['Mousa Al-Tamari', 'Yazan Al-Naimat', 'Nizar Al-Rashdan', 'Mahmoud Al-Mardi', 'Ali Olwan', 'Ehsan Haddad', 'Yazeed Abulaila', 'Noor Al-Rawabdeh', 'Abdallah Nasib', 'Mohammad Abu Hashish', 'Salem Al-Ajalin'],
  EGY: ['Mohamed Salah', 'Omar Marmoush', 'Mohamed Elneny', 'Trezeguet', 'Mostafa Mohamed', 'Ahmed Hegazy', 'Mohamed Abdelmonem', 'Mohamed El-Shenawy', 'Emam Ashour', 'Mahmoud Hassan', 'Zizo'],
};

function teamStickers(startId: number, sectionId: string): Sticker[] {
  const players = TEAM_PLAYERS[sectionId] ?? [];
  return makeStickers(startId, sectionId, ['Escudo', 'Foto da equipe', ...players]);
}

const TEAMS: { id: string; name: string; flag: string; group: string }[] = [
  // Grupo A
  { id: 'USA', name: 'Estados Unidos', flag: '🇺🇸', group: 'A' },
  { id: 'URU', name: 'Uruguai', flag: '🇺🇾', group: 'A' },
  { id: 'PAN', name: 'Panamá', flag: '🇵🇦', group: 'A' },
  { id: 'BOL', name: 'Bolívia', flag: '🇧🇴', group: 'A' },
  // Grupo B
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'B' },
  { id: 'JAM', name: 'Jamaica', flag: '🇯🇲', group: 'B' },
  { id: 'ROM', name: 'Romênia', flag: '🇷🇴', group: 'B' },
  { id: 'DZA', name: 'Argélia', flag: '🇩🇿', group: 'B' },
  // Grupo C
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'C' },
  { id: 'MEX', name: 'México', flag: '🇲🇽', group: 'C' },
  { id: 'AUS', name: 'Austrália', flag: '🇦🇺', group: 'C' },
  { id: 'TUN', name: 'Tunísia', flag: '🇹🇳', group: 'C' },
  // Grupo D
  { id: 'FRA', name: 'França', flag: '🇫🇷', group: 'D' },
  { id: 'MAR', name: 'Marrocos', flag: '🇲🇦', group: 'D' },
  { id: 'JPN', name: 'Japão', flag: '🇯🇵', group: 'D' },
  { id: 'ECU', name: 'Equador', flag: '🇪🇨', group: 'D' },
  // Grupo E
  { id: 'ESP', name: 'Espanha', flag: '🇪🇸', group: 'E' },
  { id: 'COL', name: 'Colômbia', flag: '🇨🇴', group: 'E' },
  { id: 'KOR', name: 'Coreia do Sul', flag: '🇰🇷', group: 'E' },
  { id: 'CAN', name: 'Canadá', flag: '🇨🇦', group: 'E' },
  // Grupo F
  { id: 'GER', name: 'Alemanha', flag: '🇩🇪', group: 'F' },
  { id: 'CRO', name: 'Croácia', flag: '🇭🇷', group: 'F' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳', group: 'F' },
  { id: 'IRN', name: 'Irã', flag: '🇮🇷', group: 'F' },
  // Grupo G
  { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'G' },
  { id: 'NED', name: 'Holanda', flag: '🇳🇱', group: 'G' },
  { id: 'NGA', name: 'Nigéria', flag: '🇳🇬', group: 'G' },
  { id: 'VEN', name: 'Venezuela', flag: '🇻🇪', group: 'G' },
  // Grupo H
  { id: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'H' },
  { id: 'DEN', name: 'Dinamarca', flag: '🇩🇰', group: 'H' },
  { id: 'GHA', name: 'Gana', flag: '🇬🇭', group: 'H' },
  { id: 'KSA', name: 'Arábia Saudita', flag: '🇸🇦', group: 'H' },
  // Grupo I
  { id: 'BEL', name: 'Bélgica', flag: '🇧🇪', group: 'I' },
  { id: 'SRB', name: 'Sérvia', flag: '🇷🇸', group: 'I' },
  { id: 'HON', name: 'Honduras', flag: '🇭🇳', group: 'I' },
  { id: 'UZB', name: 'Uzbequistão', flag: '🇺🇿', group: 'I' },
  // Grupo J
  { id: 'AUT', name: 'Áustria', flag: '🇦🇹', group: 'J' },
  { id: 'SUI', name: 'Suíça', flag: '🇨🇭', group: 'J' },
  { id: 'IRQ', name: 'Iraque', flag: '🇮🇶', group: 'J' },
  { id: 'COD', name: 'R.D. Congo', flag: '🇨🇩', group: 'J' },
  // Grupo K
  { id: 'TUR', name: 'Turquia', flag: '🇹🇷', group: 'K' },
  { id: 'SVK', name: 'Eslováquia', flag: '🇸🇰', group: 'K' },
  { id: 'CMR', name: 'Camarões', flag: '🇨🇲', group: 'K' },
  { id: 'NZL', name: 'Nova Zelândia', flag: '🇳🇿', group: 'K' },
  // Grupo L
  { id: 'ITA', name: 'Itália', flag: '🇮🇹', group: 'L' },
  { id: 'CIV', name: 'Costa do Marfim', flag: '🇨🇮', group: 'L' },
  { id: 'JOR', name: 'Jordânia', flag: '🇯🇴', group: 'L' },
  { id: 'EGY', name: 'Egito', flag: '🇪🇬', group: 'L' },
];

function buildSections(): Section[] {
  const sections: Section[] = [];
  let id = 1;

  // Special opening section
  const introNames = [
    'Logo Copa 2026',
    'Troféu FIFA',
    'Sede EUA',
    'Sede Canadá',
    'Sede México',
    'Mascote oficial',
    'Bola oficial',
    'Mapa das sedes',
    'Países anfitriões',
    'Copa do Mundo 2026',
  ];
  sections.push({
    id: 'INTRO',
    name: 'Abertura',
    stickers: makeStickers(id, 'INTRO', introNames),
  });
  id += introNames.length;

  // One section per team
  for (const team of TEAMS) {
    sections.push({
      id: team.id,
      name: team.name,
      flag: team.flag,
      flagCode: team.id,
      group: team.group,
      stickers: teamStickers(id, team.id),
    });
    id += 13;
  }

  // Stadiums section
  const stadiumNames = [
    'MetLife Stadium',
    'MetLife Stadium (interior)',
    'SoFi Stadium',
    'SoFi Stadium (interior)',
    'AT&T Stadium',
    'AT&T Stadium (interior)',
    'Levi\'s Stadium',
    'Levi\'s Stadium (interior)',
    'Rose Bowl',
    'Rose Bowl (interior)',
    'Arrowhead Stadium',
    'Arrowhead Stadium (interior)',
    'Lincoln Financial Field',
    'Lincoln Financial Field (interior)',
    'BC Place',
    'BC Place (interior)',
    'BMO Field',
    'BMO Field (interior)',
    'Estadio Azteca',
    'Estadio Azteca (interior)',
    'Estadio Akron',
    'Estadio Akron (interior)',
    'Estadio BBVA',
    'Estadio BBVA (interior)',
    'Gillette Stadium',
    'Gillette Stadium (interior)',
    'NRG Stadium',
    'NRG Stadium (interior)',
    'State Farm Stadium',
    'State Farm Stadium (interior)',
    'Allegiant Stadium',
    'Allegiant Stadium (interior)',
  ];
  sections.push({
    id: 'EST',
    name: 'Estádios',
    stickers: makeStickers(id, 'EST', stadiumNames),
  });
  id += stadiumNames.length;

  // ── Extra / special sticker sections ──────────────────────────────────────
  const EXTRAS: { id: string; name: string; flag: string; names: string[] }[] = [
    {
      id: 'LEND',
      name: 'Lendas da Copa',
      flag: '👑',
      names: [
        'Pelé', 'Diego Maradona', 'Zinedine Zidane', 'Ronaldo Fenômeno',
        'Franz Beckenbauer', 'Johan Cruyff', 'Garrincha', 'Romário',
        'Ronaldinho Gaúcho', 'Paolo Maldini', 'Lothar Matthäus', 'Bobby Charlton',
      ],
    },
    {
      id: 'CRAQ',
      name: 'Craques da Copa',
      flag: '⭐',
      names: [
        'Lionel Messi', 'Kylian Mbappé', 'Erling Haaland', 'Vinícius Júnior',
        'Jude Bellingham', 'Harry Kane', 'Neymar Jr', 'Kevin De Bruyne',
        'Rodri', 'Lautaro Martínez', 'Pedri', 'Jamal Musiala',
      ],
    },
    {
      id: 'BRIL',
      name: 'Especiais Brilhantes',
      flag: '✨',
      names: [
        'Bola de Ouro', 'Chuteira de Ouro', 'Luva de Ouro', 'Bola de Prata',
        'Bola de Bronze', 'Melhor Jovem', 'Prêmio Fair Play',
        'Seleção do Torneio I', 'Seleção do Torneio II',
        'Seleção do Torneio III', 'Seleção do Torneio IV',
      ],
    },
    {
      id: 'FIFA',
      name: 'FIFA Fan Festival',
      flag: '🎪',
      names: [
        'Logo FIFA', 'Troféu da Copa', 'Mascote Maple', 'Mascote Zayu',
        'Mascote Clutch', 'Bola Trionda', 'Árbitros da Copa', 'Pôster Oficial',
        'FIFA Fan Festival', 'Ingresso Oficial', 'Voluntários', 'Hino da Copa',
      ],
    },
  ];

  for (const ex of EXTRAS) {
    sections.push({
      id: ex.id,
      name: ex.name,
      flag: ex.flag,
      stickers: makeStickers(id, ex.id, ex.names),
    });
    id += ex.names.length;
  }

  return sections;
}

export const SECTIONS: Section[] = buildSections();

export const ALL_STICKERS = SECTIONS.flatMap((s) => s.stickers);

export const TOTAL_STICKERS = ALL_STICKERS.length;

export const STICKER_MAP: Record<number, Sticker & { section: Section }> =
  Object.fromEntries(
    SECTIONS.flatMap((s) =>
      s.stickers.map((st) => [st.id, { ...st, section: s }]),
    ),
  );
