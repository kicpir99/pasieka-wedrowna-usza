import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPageProps {
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
}

export const BlogPage: React.FC<BlogPageProps> = ({ displayResolution }) => {
  const posts = [
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
      date: 'Wkrótce',
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
      date: 'Wkrótce',
      readTime: '5 min czytania',
      category: 'Apiterapia',
      image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/pierzga.jpg',
      excerpt:
        'Wszystko co musisz wiedzieć o najcenniejszym pokarmie ula. Praktyczny przewodnik po kuracji pierzgą dla dorosłych i dzieci, właściwościach i łączeniu z letnią wodą.',
      featured: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 max-w-3xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wiedza i Życie Pasieki</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
            Blog Wędrownej Pasieki Usza
          </h1>
          <p className="text-sm sm:text-base text-[#C7BDB0] leading-relaxed">
            Dzielimy się pasją do pszczół, wiedzą o apiterapii i relacjami z codziennej pracy przy ulach na Dolnym Śląsku.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12`}>
        {posts.filter(p => p.featured).map(post => (
          <article 
            key={post.id}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7DCCE] shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3 text-xs text-[#8C7A6B]">
                <span className="px-3 py-1 rounded-full bg-[#FAF0E1] text-[#945209] font-bold">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#23201C] tracking-tight">
                {post.title}
              </h2>

              <p className="text-sm text-[#594C3F] leading-relaxed">
                {post.excerpt}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/o-nas"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#945209] transition-colors"
                >
                  <span>Dowiedz się więcej o naszej pasiece</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {post.videoUrl && (
                  <a
                    href={post.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C4302B] hover:text-[#9B2622] transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Oglądaj na YouTube</span>
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md aspect-video border border-[#E4D7C7] bg-black">
              {post.videoEmbed ? (
                <iframe
                  className="w-full h-full"
                  src={post.videoEmbed}
                  title={post.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              )}
            </div>
          </article>
        ))}

        {/* Other Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.filter(p => !p.featured).map(post => (
            <article 
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-[#E7DCCE] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="h-44 rounded-2xl overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8C7A6B]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E1] text-[#945209] font-semibold text-[11px]">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#23201C] tracking-tight">
                  {post.title}
                </h3>
                <p className="text-xs text-[#635747] leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EFE5D8]">
                <span className="text-[11px] font-semibold text-[#A69784]">Artykuł w przygotowaniu</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
