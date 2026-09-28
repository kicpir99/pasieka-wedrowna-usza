import React, { useState } from 'react';
import { HoneyProduct } from '../types';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Droplet, Sparkles, MapPin, Scale, Flame, Clock, Leaf } from 'lucide-react';
import { HIVE_TREASURE_IDS } from '../data/honeyProducts';
import { getProductBadges } from '../utils/honeyHelpers';

interface ProductCardProps {
  product: HoneyProduct;
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onOpenDetails?: (product: HoneyProduct) => void;
  onOpenDetail?: (product: HoneyProduct) => void;
  onToggleCompare?: (product: HoneyProduct) => void;
  isCompared?: boolean;
  onSelectFlavorNote?: (note: string) => void;
  activeFlavorNote?: string | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
  onOpenDetail,
  onToggleCompare,
  isCompared = false,
  onSelectFlavorNote,
  activeFlavorNote,
}) => {
  const [selectedWeight, setSelectedWeight] = useState<number>(
    product.sizes[0]?.weightGrams || 400
  );

  const currentSize = product.sizes.find((s) => s.weightGrams === selectedWeight) || product.sizes[0];
  const badges = getProductBadges(product);

  const handleProductClick = () => {
    try {
      sessionStorage.setItem('pasieka_last_product_id', product.id);
      sessionStorage.setItem('pasieka_home_scroll_y', String(window.pageYOffset || document.documentElement.scrollTop || 0));
      sessionStorage.removeItem('pasieka_from_hero');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div 
      id={`produkt-karta-${product.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-[#E7DCCE] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      
      {/* Product Image & Top Overlays */}
      <Link 
        to={`/produkt/${product.id}`} 
        onClick={handleProductClick}
        className="relative aspect-[4/3] bg-[#EFE7DA] overflow-hidden cursor-pointer block"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges (Automated) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {badges.map((b) => (
            <span
              key={b.type}
              title={b.tooltip}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide shadow-sm backdrop-blur-[2px] ${b.bgClass} ${b.textClass}`}
            >
              {b.iconType === 'flame' && <Flame className="w-3 h-3 text-[#FFE3B8] fill-[#FFE3B8]" />}
              {b.iconType === 'sparkles' && <Sparkles className="w-3 h-3 text-[#B7E4C7]" />}
              {b.iconType === 'clock' && <Clock className="w-3 h-3 text-[#EFE7DA]" />}
              {b.iconType === 'leaf' && <Leaf className="w-3 h-3 text-[#C8E6C9]" />}
              <span>{b.label}</span>
            </span>
          ))}
        </div>

        {/* Compare Button */}
        {onToggleCompare && !HIVE_TREASURE_IDS.includes(product.id) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-12 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isCompared 
                ? 'bg-[#1B4332] text-white border border-[#1B4332]' 
                : 'bg-white/80 text-[#4A4033] border border-white/40 hover:bg-white hover:text-[#1B4332]'
            }`}
            title={isCompared ? "Usuń z porównania" : "Porównaj ten miód (waga)"}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}

        {/* Color preview pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 text-[11px] text-[#4A4033] shadow-sm font-semibold border border-black/5 backdrop-blur-[2px]">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/25 shrink-0 shadow-2xs"
            style={{ backgroundColor: product.colorHex }}
          />
          <span className="whitespace-nowrap">{product.colorName}</span>
        </div>

      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title & Origin */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider">
            <Link
              to={`/sklep?kategoria=${product.category}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[#8C531B] hover:text-[#1B4332] hover:underline transition-colors uppercase"
              title={`Filtruj zbiory: ${product.category}`}
            >
              <span>
                {product.category === 'wiosenne' ? '🌸 Wiosenny' :
                 product.category === 'letnie' ? '☀️ Letni' :
                 product.category === 'lesne-spadz' ? '🌲 Leśny / Spadź' :
                 product.category === 'z-dodatkami' ? '🐝 Skarby Ula' :
                 product.category === 'zestawy' ? '🕯️ Manufaktura' : '🍯 Pasieka'}
              </span>
            </Link>
            <div className="flex items-center gap-1 text-[#554C3F]">
              <Star className="w-3.5 h-3.5 fill-[#F3C06B] text-[#F3C06B]" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
            </div>
          </div>
          
          <Link 
            to={`/produkt/${product.id}`}
            onClick={handleProductClick}
          >
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#23201C] hover:text-[#8E5116] transition-colors cursor-pointer leading-tight">
              {product.name}
            </h3>
          </Link>

          <p className="text-[13px] text-[#554C3F] line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Dominujące nuty bukietu */}
        {product.flavorNotes && product.flavorNotes.length > 0 && (
          <div className="pt-0.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 text-[#D9821E]" />
              <span>Bukiet smakowy:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.flavorNotes.map((note) => {
                const isSelected = activeFlavorNote?.toLowerCase() === note.toLowerCase();
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectFlavorNote?.(note);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs ring-1 ring-[#1B4332]'
                        : 'bg-[#FAF6EE] text-[#554C3F] border-[#E8DCCB] hover:bg-[#F2E8D8] hover:text-[#23201C] hover:border-[#D9821E]/40'
                    }`}
                    title={`Filtruj miody o nucie: ${note}`}
                  >
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Properties Mini-Specs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F4EFE6]">
          <div className="flex items-center gap-2 text-xs text-[#665A4B]">
            <Droplet className="w-3.5 h-3.5 text-[#D9821E]" />
            <span className="font-medium">
              {product.consistency === 'patoka' ? 'Patoka (płynny)' : product.consistency === 'krupiec' ? 'Krupiec (twardy)' : 'Kremowany'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#665A4B]">
            <Sparkles className="w-3.5 h-3.5 text-[#C4B7A5]" />
            <span className="capitalize">{product.flavorIntensity} aromat</span>
          </div>
        </div>

        {/* Weight Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#7A6A5A]">
            <span className="font-medium">
              {HIVE_TREASURE_IDS.includes(product.id) ? 'Wybierz wariant:' : 'Wybierz słoik:'}
            </span>
            <span className="text-[10px] font-mono text-[#8C7A6B]">
              {currentSize.weightGrams >= 50
                ? `${Math.round((currentSize.pricePln / currentSize.weightGrams) * 1000)} zł/kg`
                : ''}
            </span>
          </div>

          <div className={`grid gap-2 pt-1 ${product.sizes.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {product.sizes.map((s) => {
              const isSelected = selectedWeight === s.weightGrams;

              return (
                <button
                  key={s.weightGrams}
                  type="button"
                  onClick={() => setSelectedWeight(s.weightGrams)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs ring-1 ring-[#1B4332]/25'
                      : 'bg-[#FAF8F5] text-[#4A4033] border-[#E2D5C3] hover:border-[#D9821E] hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs leading-none">
                    {s.label}
                  </div>
                  <div className={`text-[11px] font-semibold mt-1 leading-none ${
                    isSelected ? 'text-[#F3C06B]' : 'text-[#8C5815]'
                  }`}>
                    {s.pricePln} zł
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3.5 border-t border-[#E8E1D5] flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A6B] block leading-none mb-1">
              Do zapłaty:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-black text-2xl text-[#1B4332] leading-none tracking-tight tabular-nums">
                {currentSize.pricePln}
              </span>
              <span className="text-xs font-bold text-[#8C7A6B]">zł</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => (onOpenDetails || onOpenDetail)?.(product)}
              className="px-2.5 py-2 rounded-xl border border-[#D9D0C3] text-[#4A4033] hover:bg-[#F4EFE6] hover:border-[#C2B7A7] text-xs font-bold transition-all cursor-pointer"
              title="Szybki podgląd i opis miodu"
            >
              Podgląd
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(product, currentSize.weightGrams, currentSize.pricePln)}
              className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Kupuję</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
