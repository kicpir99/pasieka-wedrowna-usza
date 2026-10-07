import { WOO_CONFIG } from './wooCommerceService';

export interface PageContent {
  title?: string;
  leadParagraph?: string;
  bodyParagraphs?: string[];
  quote?: string;
  isLiveWP: boolean;
}

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
 * Pobiera treść strony statycznej (np. "O nas" - slug "o-nas") z WordPress REST API (/wp-json/wp/v2/pages?slug=...)
 * z automatycznym bezpiecznym fallbackiem do treści domyślnych w React.
 */
export async function fetchWordPressPage(slug: string): Promise<PageContent> {
  if (!WOO_CONFIG.url) {
    return { isLiveWP: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const endpoint = `${WOO_CONFIG.url}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=publish`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isLiveWP: false };
    }

    const pages = await response.json();
    if (!Array.isArray(pages) || pages.length === 0) {
      return { isLiveWP: false };
    }

    const wpPage = pages[0];
    const rawContent: string = wpPage.content?.rendered || '';

    // Rozdzielanie akapitów HTML
    const paragraphMatches = [...rawContent.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map(m => cleanHtml(m[1])).filter(Boolean);
    // Wyciąganie cytatu blockquote jeśli istnieje
    const blockquoteMatch = rawContent.match(/<blockquote[^>]*>(.*?)<\/blockquote>/is);
    const quote = blockquoteMatch ? cleanHtml(blockquoteMatch[1]) : undefined;

    return {
      title: cleanHtml(wpPage.title?.rendered || ''),
      leadParagraph: paragraphMatches[0] || undefined,
      bodyParagraphs: paragraphMatches.length > 1 ? paragraphMatches.slice(1) : undefined,
      quote,
      isLiveWP: true,
    };
  } catch (err: any) {
    return { isLiveWP: false };
  }
}
