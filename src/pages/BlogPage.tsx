import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Video, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchBlogPosts, BlogPost, DEFAULT_BLOG_POSTS } from '../services/blogService';

interface BlogPageProps {
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
}

export const BlogPage: React.FC<BlogPageProps> = ({ displayResolution }) => {
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLiveWP, setIsLiveWP] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetchBlogPosts().then((res) => {
      setPosts(res.posts);
      setIsLiveWP(res.isLiveWordPress);
      setIsLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 max-w-3xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wiedza i Życie Pasieki</span>
            {isLiveWP && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-normal pl-1.5 border-l border-[#554A3B]">
                <Sparkles className="w-3 h-3" /> Na żywo z WordPress
              </span>
            )}
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
        {posts.filter(p => p.featured).slice(0, 1).map(post => (
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
                {post.content ? (
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span>Czytaj cały artykuł</span>
                    <ArrowRight className="w-4 h-4 text-[#E5983A]" />
                  </button>
                ) : (
                  <Link
                    to="/o-nas"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#945209] transition-colors"
                  >
                    <span>Dowiedz się więcej o naszej pasiece</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.filter(p => !p.featured).map(post => (
            <article 
              key={post.id}
              className="bg-white rounded-3xl p-6 border border-[#E7DCCE] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="h-44 rounded-2xl overflow-hidden bg-[#F2EDE4]">
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
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8C7A6B]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E1] text-[#945209] font-semibold text-[11px]">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#23201C] tracking-tight line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-[#635747] leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFE5D8] flex items-center justify-between">
                <span className="text-[11px] text-[#A69784]">{post.date}</span>
                {post.content ? (
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="text-xs font-bold text-[#945209] hover:text-[#733E05] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Czytaj</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-[#A69784]">Artykuł w przygotowaniu</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal czytnika artykułu z WordPressa */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl border border-[#E3D6C4] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EAE0D1] bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FAF0E1] text-[#945209] text-xs font-bold">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-[#8C7A6B]">
                  • {selectedPost.date} • {selectedPost.readTime}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full text-[#6E6150] hover:bg-[#EFE5D6] transition-colors cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-[#2E2822]">
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#23201C] tracking-tight leading-tight">
                {selectedPost.title}
              </h1>

              {selectedPost.videoEmbed ? (
                <div className="rounded-2xl overflow-hidden shadow-md aspect-video border border-[#E4D7C7] bg-black">
                  <iframe
                    className="w-full h-full"
                    src={selectedPost.videoEmbed}
                    title={selectedPost.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : selectedPost.image ? (
                <div className="rounded-2xl overflow-hidden max-h-96 border border-[#E4D7C7]">
                  <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                </div>
              ) : null}

              {/* Render WordPress HTML Content */}
              <div 
                className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed space-y-4 [&>p]:leading-relaxed [&>h2]:font-serif [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#23201C] [&>h3]:font-serif [&>h3]:text-lg [&>h3]:font-bold [&>img]:rounded-2xl [&>img]:my-4"
                dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }}
              />

              {selectedPost.videoUrl && (
                <div className="pt-4 border-t border-[#EAE0D1]">
                  <a
                    href={selectedPost.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C4302B] hover:bg-[#A82520] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Obejrzyj ten film bezpośrednio na kanale YouTube Pasieki</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAE0D1] bg-[#F7F2EB] flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] font-semibold text-xs transition-all cursor-pointer"
              >
                Zamknij artykuł
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
