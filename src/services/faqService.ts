import { WOO_CONFIG } from './wooCommerceService';

export interface FAQItem {
  question: string;
  category: string;
  answer: string;
  highlight?: string;
}

export const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    category: 'Biologia i jakość',
    question: 'Czy krystalizacja i rozwarstwienie miodu oznaczają, że miód się zepsuł?',
    answer: 'Absolutnie nie! Krystalizacja to w 100% naturalny proces fizyczny, świadczący o tym, że miód nie był pasteryzowany ani zafałszowany sztucznym syropem. Czas przejścia w postać krupca zależy od naturalnego stosunku glukozy do fruktozy w nektarze. Czasami na dnie słoika pojawia się gęstsza warstwa kryształków glukozy, a na górze lżejsza fruktoza – to zjawisko naturalnej sedymentacji (częste np. w miodach gryczanych). Wystarczy słoik przemieszać.',
    highlight: 'Naturalny proces dowodzący braku obróbki termicznej.',
  },
  {
    category: 'Jakość i surowość',
    question: 'Czym jest biały nalot na ściankach i powierzchni słoika („kwiat miodu”)?',
    answer: 'Biały, marmurkowy nalot lub wykwity na ściankach słoika w miodzie skrystalizowanym to tzw. „wykwity glukozowe” lub tradycyjny „kwiat miodu”. Powstaje w wyniku uwięzienia mikroskopijnych pęcherzyków powietrza między kryształami glukozy podczas powolnego dojrzewania w chłodzie. To najważniejsza dla koneserów wizualna gwarancja, że miód jest surowy (RAW), niefiltrowany ciśnieniowo i nieprzegrzewany.',
    highlight: 'Dla konesera to bezsporny dowód 100% surowego miodu.',
  },
  {
    category: 'Stosowanie i zdrowie',
    question: 'W jakiej temperaturze miód traci właściwości lecznicze i jak go chronić?',
    answer: 'Graniczną temperaturą jest 40°C. Powyżej tego progu cenne białka enzymatyczne pszczół (m.in. inhibina, diastaza, inwertaza i lizozym) ulegają bezpowrotnej denaturacji termicznej, a miód traci swoje unikalne działanie bio-bójcze. Dlatego miodu nigdy nie dodajemy do wrzątku – zawsze odczekaj kilka minut, aż kubek herbaty lub naparu będzie przyjemnie ciepły w dłoniach.',
    highlight: 'Żelazna zasada 40°C: chroń żywe enzymy ula.',
  },
  {
    category: 'Bezpieczeństwo i dzieci',
    question: 'Dlaczego miodu nie wolno podawać niemowlętom poniżej 12. miesiąca życia?',
    answer: 'Jest to oficjalny, rygorystyczny standard medyczny rekomendowany przez WHO oraz Główny Inspektorat Sanitarny (GIS). W surowym miodzie mogą występować naturalne przetrwalniki bakterii Clostridium botulinum z pyłku roślinnego. Dla dojrzałego układu pokarmowego dorosłych i starszych dzieci są one całkowicie nieszkodliwe, jednak u niemowląt do 1. roku życia, z braku rozwiniętej mikroflory jelitowej, mogą wywołać botulizm dziecięcy. Po ukończeniu 12 miesięcy miód jest wysoce zalecany.',
    highlight: 'Oficjalny standard medyczny chroniący najmłodszych.',
  },
  {
    category: 'Przechowywanie',
    question: 'Jak poprawnie rozpuścić skrystalizowany miód w domu bez utraty enzymów?',
    answer: 'Jeśli wolisz płynną patokę, wstaw odkręcony słoik do garnka z ciepłą wodą o temperaturze nieprzekraczającej 36–38°C (tzw. kąpiel wodna) i co jakiś czas zamieszaj drewnianą lub szklaną łyżeczką. Proces potrwa dłużej, ale zachowasz 100% witamin i enzymów. Nigdy nie używaj mikrofalówki!',
    highlight: 'Łagodna kąpiel wodna do 38°C.',
  },
  {
    category: 'Przechowywanie',
    question: 'Jak najlepiej przechowywać słoik miodu w domowych warunkach?',
    answer: 'Miód rzemieślniczy najlepiej czuje się w suchym, ciemnym i chłodnym miejscu (optymalna temperatura to 10–18°C, np. spiżarnia lub zamknięta szafka z dala od kuchenki i słońca). Zawsze pamiętaj o szczelnym dokręcaniu wieczka – miód silnie chłonie wilgoć oraz zapachy z otoczenia.',
    highlight: 'Ciemne, suche miejsce w temperaturze 10–18°C.',
  },
];

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

/**
 * Pobiera pytania FAQ z WordPress REST API (wp-json/wp/v2/faq lub wp-json/pasieka/v1/faq)
 * z automatycznym bezpiecznym fallbackiem do DEFAULT_FAQ_ITEMS.
 */
export async function fetchFAQs(): Promise<{ items: FAQItem[]; isLiveWP: boolean }> {
  if (!WOO_CONFIG.url) {
    return { items: DEFAULT_FAQ_ITEMS, isLiveWP: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Próba pobrania pytań z WordPress Custom Post Type 'faq' lub endpointu dedykowanego
    const endpoint = `${WOO_CONFIG.url}/wp-json/wp/v2/faq?per_page=30`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WordPress FAQ API returned status ${response.status}`);
    }

    const rawList = await response.json();
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return { items: DEFAULT_FAQ_ITEMS, isLiveWP: false };
    }

    const mapped: FAQItem[] = rawList.map((item: any) => ({
      question: cleanHtml(item.title?.rendered || 'Pytanie'),
      answer: cleanHtml(item.content?.rendered || item.excerpt?.rendered || ''),
      category: item.faq_category || item.category || 'Miód i Pasieka',
      highlight: item.meta?.highlight || undefined,
    }));

    return { items: mapped, isLiveWP: true };
  } catch (err: any) {
    return { items: DEFAULT_FAQ_ITEMS, isLiveWP: false };
  }
}
