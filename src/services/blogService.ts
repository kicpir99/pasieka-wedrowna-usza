import { WOO_CONFIG } from './wooCommerceService';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  videoEmbed?: string;
  videoUrl?: string;
  excerpt: string;
  content?: string;
  featured: boolean;
  slug?: string;
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'przygotowanie-do-zimowania',
    title: 'Przygotowanie pszczół do zimowania',
    date: '25 listopada 2021',
    readTime: '4 min czytania',
    category: 'Życie Pasieki',
    image: 'https://pasiekausza.pl/wp-content/uploads/2021/11/play.jpg',
    videoEmbed: 'https://www.youtube.com/embed/af2qEqCfBTY',
    videoUrl: 'https://www.youtube.com/watch?v=af2qEqCfBTY',
    excerpt:
      'Jest to jedna z najważniejszych i jednocześnie najtrudniejszych czynności wykonywanych na pasiece. Odpowiednio przeprowadzone prace pasieczne, które zaczynamy już pod koniec lata, decydują o sile rodzin na kolejną wiosnę.',
    featured: true,
  },
  {
    id: 'dlaczego-miod-krystalizuje',
    title: 'Dlaczego prawdziwy miód krystalizuje i dlaczego to dowód jakości?',
    date: '12 stycznia 2024',
    readTime: '3 min czytania',
    category: 'Edukacja',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85',
    excerpt:
      'Często pytacie nas, dlaczego miód zmienia stan z płynnego w stały. Wyjaśniamy zjawisko krystalizacji, stosunek glukozy do fruktozy oraz domowe sposoby na sprawdzenie autentyczności miodu.',
    featured: false,
  },
  {
    id: 'pierzga-jak-stosowac',
    title: 'Pierzga pszczela – jak prawidłowo ją dawkować i przechowywać?',
    date: '4 marca 2024',
    readTime: '5 min czytania',
    category: 'Apiterapia',
    image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/pierzga.jpg',
    excerpt:
      'Wszystko co musisz wiedzieć o najcenniejszym pokarmie ula. Praktyczny przewodnik po kuracji pierzgą dla dorosłych i dzieci, właściwościach i łączeniu z letnią wodą.',
    featured: false,
  },
];

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
];

function formatPolishDate(isoDateString: string): string {
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return 'Niedawno';
    const day = d.getDate();
    const month = POLISH_MONTHS[d.getMonth()] || '';
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return 'Niedawno';
  }
}

function stripHtml(html: string): string {
  if (!html) return '';
  const decoded = html
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#038;/g, '&');
  return decoded.replace(/<[^>]*>?/gm, '').trim();
}

function extractYouTube(rawHtml: string): { videoUrl?: string; videoEmbed?: string } {
  if (!rawHtml) return {};
  const ytMatch = rawHtml.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoEmbed: `https://www.youtube.com/embed/${videoId}`,
    };
  }
  return {};
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min czytania`;
}

/**
 * Pobiera wpisy z WordPress REST API (/wp-json/wp/v2/posts?_embed)
 * z automatycznym fallbackiem do DEFAULT_BLOG_POSTS w razie braku połączenia.
 */
export async function fetchBlogPosts(): Promise<{
  posts: BlogPost[];
  isLiveWordPress: boolean;
}> {
  if (!WOO_CONFIG.url) {
    return {
      posts: DEFAULT_BLOG_POSTS,
      isLiveWordPress: false,
    };
  }

  try {
    const endpoint = `${WOO_CONFIG.url}/wp-json/wp/v2/posts?_embed=1&per_page=12&status=publish`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WordPress API HTTP ${response.status}`);
    }

    const rawPosts = await response.json();
    if (!Array.isArray(rawPosts) || rawPosts.length === 0) {
      return { posts: DEFAULT_BLOG_POSTS, isLiveWordPress: false };
    }

    const mapped: BlogPost[] = rawPosts.map((wp: any, idx: number) => {
      const cleanTitle = stripHtml(wp.title?.rendered || 'Bez tytułu');
      const cleanExcerpt = stripHtml(wp.excerpt?.rendered || wp.content?.rendered || '').slice(0, 240) + '...';
      const fullContent = wp.content?.rendered || '';

      // Wyciągnij obrazek wyróżniający
      let featuredImage = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85';
      const media = wp._embedded?.['wp:featuredmedia']?.[0];
      if (media?.source_url) {
        featuredImage = media.source_url;
      }

      // Wyciągnij kategorię
      let category = 'Życie Pasieki';
      const terms = wp._embedded?.['wp:term']?.[0];
      if (Array.isArray(terms) && terms.length > 0 && terms[0]?.name) {
        category = terms[0].name;
      }

      // Wykryj YouTube w treści lub excerpt
      const yt = extractYouTube(fullContent + ' ' + (wp.excerpt?.rendered || ''));

      return {
        id: wp.slug || String(wp.id),
        slug: wp.slug,
        title: cleanTitle,
        date: formatPolishDate(wp.date),
        readTime: estimateReadTime(stripHtml(fullContent) || cleanExcerpt),
        category,
        image: featuredImage,
        videoEmbed: yt.videoEmbed,
        videoUrl: yt.videoUrl,
        excerpt: cleanExcerpt,
        content: fullContent,
        featured: idx === 0, // Pierwszy (najnowszy) wpis jako wyróżniony
      };
    });

    console.info(`✅ [Blog Service] Pomyślnie załadowano ${mapped.length} wpisów blogowych z WordPressa!`);
    return {
      posts: mapped,
      isLiveWordPress: true,
    };
  } catch (err: any) {
    console.warn('ℹ️ [Blog Service] Korzystam z domyślnych wpisów blogowych (brak połączenia z WP API):', err.message);
    return {
      posts: DEFAULT_BLOG_POSTS,
      isLiveWordPress: false,
    };
  }
}
