export interface VarietyHotspot {
  angle: number; // 0, 120, 240
  position: 'left' | 'right';
  verticalPos: 'top' | 'middle' | 'bottom';
  badge: string;
  category: string;
  title: string;
  description: string;
  iconName: 'droplets' | 'coffee' | 'shield' | 'heart' | 'flame' | 'trees' | 'sparkles' | 'feather' | 'zap' | 'sun' | 'leaf';
}

export const VARIETY_HOTSPOTS_MAP: Record<string, VarietyHotspot[]> = {
  'miod-lipowy': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Pasieka',
      category: 'Pasieka Wędrowna Usza',
      title: 'Szlachetny Pożytek Lipowy',
      description: 'Pozyskiwany z nektaru pachnących kwiatów lipy drobnolistnej. Pieczęć pasieki wędrownej i 100% czysty skład.',
      iconName: 'shield',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Na Zimno',
      category: 'RAW • Max 36°C',
      title: 'Nigdy Niepodgrzewany (RAW)',
      description: 'Wirowany wyłącznie na zimno. Zachowuje pełnię aktywnych enzymów, biopierwiastków i kojący aromat kwiatów lipy.',
      iconName: 'droplets',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Rytuał',
      category: 'Czysty Nektar & Napary',
      title: 'Kojący Bukiet do Herbaty',
      description: 'Aksamitna słodycz i odświeżający mentolowy finisz. Niezastąpiony przy przeziębieniach i wieczornym wyciszeniu.',
      iconName: 'sparkles',
    },
  ],

  'miod-wrzosowy': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Rarytas',
      category: 'Pasieka Wędrowna Usza',
      title: 'Królewski Miód z Wrzosu',
      description: 'Pozyskiwany z jesiennego kwitnienia wrzosu. Niezwykle trudny do odwirowania ze względu na naturalną galaretowatość.',
      iconName: 'trees',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Medycyna',
      category: 'Drogi Moczowe',
      title: 'Tarcza Przeciwzapalna',
      description: 'Bogaty w enzymy i związki fenolowe o silnym działaniu antyseptycznym i moczopędnym. Wspiera zdrowie nerek i prostaty.',
      iconName: 'shield',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Koneser',
      category: 'Gorzka Pomarańcza & Żywica',
      title: 'Unikatowy Wytrawny Bukiet',
      description: 'Bursztynowo-rubinowa barwa i wyrazisty, szlachetnie gorzkawy smak. Doskonały kompan do dojrzałych serów.',
      iconName: 'sparkles',
    },
  ],

  'miod-ze-spadzi-iglastej': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Rarytas',
      category: 'Pasieka Wędrowna Usza',
      title: 'Czarny Diament Lasu',
      description: 'Gęsty, ciemny miód ze spadzi jodłowej i świerkowej. Szlachetny leśny pożytek pasieki wędrownej.',
      iconName: 'trees',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Minerały',
      category: '9x Więcej Biopierwiastków',
      title: 'Królewska Tarcza Odporności',
      description: 'Spadź iglasta zawiera 9-krotnie więcej potasu, magnezu i mikroelementów niż tradycyjne miody kwiatowe.',
      iconName: 'sparkles',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Bukiet',
      category: 'Leśne Igliwie',
      title: 'Żywiczny Aromat Iglasty',
      description: 'Głęboka ciemnobrunatna barwa i szlachetna, stonowana słodycz z nutą karmelu i żywicy.',
      iconName: 'shield',
    },
  ],

  'miod-akacjowy': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Pożytek',
      category: 'Pasieka Wędrowna Usza',
      title: 'Jasny Nektar z Białej Robinii',
      description: 'Krystalicznie czysty, jasnosłomkowy miód zebrany przez pszczoły z pachnących kwiatów białej robinii akacjowej.',
      iconName: 'feather',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Łagodność',
      category: 'Niska Kwasowość',
      title: 'Najdelikatniejszy dla Żołądka',
      description: 'Aksamitna łagodność i niska kwasowość. Wyjątkowo przyjazny przy nadkwasocie, dla dzieci i do codziennego słodzenia.',
      iconName: 'heart',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Patoka',
      category: 'Zioła & Napoje',
      title: 'Długo Płynny Waniliowy Bukiet',
      description: 'Wysoka zawartość naturalnej fruktozy sprawia, że krystalizuje najwolniej ze wszystkich miodów krajowych.',
      iconName: 'coffee',
    },
  ],

  'miod-gryczany': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Pasieka',
      category: 'Pasieka Wędrowna Usza',
      title: 'Czysty Nektar Gryki',
      description: 'Ciemny, wyrazisty miód zebrany z kwiatów gryki, o intensywnym zapachu palonego karmelu i suszonej śliwki.',
      iconName: 'shield',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Moc',
      category: 'Rutyna i Żelazo',
      title: 'Wsparcie Serca i Krążenia',
      description: 'Gryka nasyca miód rutyną i łatwo przyswajalnym żelazem, które naturalnie uszczelniają naczynia krwionośne.',
      iconName: 'heart',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Kulinaria',
      category: 'Pieczywo & Piernik',
      title: 'Do Pajdy Chleba i Piernika',
      description: 'Niezastąpiony do tradycyjnego piernika, ciemnych marynat do mięs oraz na chrupiący chleb na zakwasie.',
      iconName: 'flame',
    },
  ],

  'miod-rzepakowy': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Wiosna',
      category: 'Pasieka Wędrowna Usza',
      title: 'Pierwsze Majowe Miodobranie',
      description: 'Wczesnowiosenny, świeży zbiór z majowych kwiatów rzepaku. Łagodny, ciepły zapach budzącej się przyrody.',
      iconName: 'sun',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Energia',
      category: 'Glukoza dla Serca',
      title: 'Szybki Zastrzyk Sił',
      description: 'Wysoka zawartość łatwo przyswajalnej glukozy błyskawicznie odżywia mięsień sercowy i regeneruje organizm.',
      iconName: 'zap',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Krem',
      category: 'Kremowany na Zimno',
      title: 'Aksamitna Maślana Struktura',
      description: 'Miód kremowany mechanicznie bez podgrzewania — zachowuje delikatną strukturę, która nie spływa z pieczywa.',
      iconName: 'droplets',
    },
  ],

  'miod-wielokwiatowy': [
    {
      angle: 0,
      position: 'left',
      verticalPos: 'top',
      badge: 'Bukiet',
      category: 'Pasieka Wędrowna Usza',
      title: 'Mozaika Dzikich Kwiatów',
      description: 'Bogaty bukiet nektaru kwiatów polnych i ziół. Każdy zbiór odzwierciedla naturalną zmienność kwitnienia.',
      iconName: 'sun',
    },
    {
      angle: 120,
      position: 'right',
      verticalPos: 'top',
      badge: 'Odporność',
      category: 'Dla Całej Rodziny',
      title: 'Codzienna Profilaktyka',
      description: 'Zrównoważony profil pyłkowy sprzyja budowaniu naturalnej tolerancji alergicznej i odporności organizmu.',
      iconName: 'heart',
    },
    {
      angle: 240,
      position: 'left',
      verticalPos: 'bottom',
      badge: 'Uniwersalny',
      category: 'Do Kuchni i Napojów',
      title: 'Słodycz na Dzień Dobry',
      description: 'Idealny dodatek do porannej owsianki, herbaty z cytryną, twarogu oraz domowych wypieków.',
      iconName: 'droplets',
    },
  ],
};

// Aliases for legacy short IDs
VARIETY_HOTSPOTS_MAP['lipowy'] = VARIETY_HOTSPOTS_MAP['miod-lipowy'];
VARIETY_HOTSPOTS_MAP['lipowy-warminski'] = VARIETY_HOTSPOTS_MAP['miod-lipowy'];
VARIETY_HOTSPOTS_MAP['gryczany'] = VARIETY_HOTSPOTS_MAP['miod-gryczany'];
VARIETY_HOTSPOTS_MAP['gryczany-mazurski'] = VARIETY_HOTSPOTS_MAP['miod-gryczany'];
VARIETY_HOTSPOTS_MAP['spadziowy'] = VARIETY_HOTSPOTS_MAP['miod-ze-spadzi-iglastej'];
VARIETY_HOTSPOTS_MAP['spadz-iglastej'] = VARIETY_HOTSPOTS_MAP['miod-ze-spadzi-iglastej'];
VARIETY_HOTSPOTS_MAP['wrzosowy'] = VARIETY_HOTSPOTS_MAP['miod-wrzosowy'];
VARIETY_HOTSPOTS_MAP['akacja'] = VARIETY_HOTSPOTS_MAP['miod-akacjowy'];
VARIETY_HOTSPOTS_MAP['akacjowy'] = VARIETY_HOTSPOTS_MAP['miod-akacjowy'];
VARIETY_HOTSPOTS_MAP['rzepakowy'] = VARIETY_HOTSPOTS_MAP['miod-rzepakowy'];
VARIETY_HOTSPOTS_MAP['wielokwiatowy'] = VARIETY_HOTSPOTS_MAP['miod-wielokwiatowy'];

export function getVarietyHotspots(varietyId: string): VarietyHotspot[] {
  const normId = varietyId.toLowerCase();
  return (
    VARIETY_HOTSPOTS_MAP[normId] ||
    VARIETY_HOTSPOTS_MAP[varietyId] ||
    VARIETY_HOTSPOTS_MAP['miod-lipowy']
  );
}
