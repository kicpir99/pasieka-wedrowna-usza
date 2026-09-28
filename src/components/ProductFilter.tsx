import React, { useEffect, useMemo, useState } from 'react';
import { HoneyCategory, FilterState, HealthIntentFilter } from '../types';
export type { FilterState, HealthIntentFilter };
import { HONEY_PRODUCTS, HONEY_VARIETIES } from '../data/honeyProducts';
import { Search, Sparkles, X, ChevronDown, ChevronUp, ChevronRight, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';

const HEALTH_INTENTS: { id: HealthIntentFilter; label: string; icon: string; desc: string }[] = [
  { id: 'wszystkie', label: 'Wszystkie miody', icon: '✨', desc: `${HONEY_VARIETIES.length} odmian surowego miodu z Dolnego Śląska` },
  { id: 'odpornosc', label: 'Odporność & Infekcje', icon: '🛡️', desc: 'Miód lipowy, spadziowy, nawłociowy' },
  { id: 'lagodne', label: 'Łagodne & Dla Dzieci', icon: '🥞', desc: 'Miód rzepakowy, akacjowy, faceliowy' },
  { id: 'koneser', label: 'Głębokie & Koneser', icon: '🌲', desc: 'Miód gryczany, wrzosowy, spadziowy' },
  { id: 'prezent', label: 'Na Prezent & Rarytas', icon: '🎁', desc: 'Miód wrzosowy, spadź iglasta, miody limitowane' },
];

interface ProductFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalProductsCount?: number;
  filteredProductsCount?: number;
  totalCount?: number;
  filteredCount?: number;
}

// Wybrane kluczowe nuty smakowe miodów odmianowych promowane w pierwszej linii
const POPULAR_NOTES = [
  'Kwiat lipy',
  'Mięta leśna',
  'Wrzosiec',
  'Zioła polne',
  'Gorzka pomarańcza',
  'Suszona śliwka',
  'Karmel',
  'Melasa',
  'Białe kwiaty',
  'Wanilia',
  'Cytrusy',
  'Jagody leśne',
];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  filters,
  onFilterChange,
  totalProductsCount,
  filteredProductsCount,
  totalCount,
  filteredCount,
}) => {
  const effectiveTotalCount = totalProductsCount ?? totalCount ?? HONEY_VARIETIES.length;
  const effectiveFilteredCount = filteredProductsCount ?? filteredCount ?? effectiveTotalCount;

  const [isFlavorFilterOpen, setIsFlavorFilterOpen] = useState(Boolean(filters.flavorNote));
  const [isAllNotesExpanded, setIsAllNotesExpanded] = useState(false);

  // Automatycznie rozwiń panel nut, jeśli filtr został wybrany zewnętrznie (np. z karty produktu)
  useEffect(() => {
    if (filters.flavorNote) {
      setIsFlavorFilterOpen(true);
    }
  }, [filters.flavorNote]);

  const categories: { id: HoneyCategory; label: string }[] = [
    { id: 'wszystkie', label: 'Wszystkie odmiany miodów' },
    { id: 'wiosenne', label: '🌸 Wiosenne (Rzepak, Akacja, Mniszek)' },
    { id: 'letnie', label: '☀️ Letnie (Lipa, Gryka, Facelia)' },
    { id: 'lesne-spadz', label: '🌲 Leśne & Spadziowe (Spadź, Wrzos, Leśny)' },
  ];

  // Wszystkie unikalne nuty smakowe zebrane z bazy odmian miodów
  const allUniqueFlavorNotes = useMemo(() => {
    const notesSet = new Set<string>();
    HONEY_VARIETIES.forEach((p) => {
      p.flavorNotes?.forEach((n) => notesSet.add(n));
    });
    return Array.from(notesSet).sort((a, b) => a.localeCompare(b, 'pl'));
  }, []);

  const handleHealthIntentChange = (healthIntent: HealthIntentFilter) => {
    onFilterChange({ ...filters, healthIntent });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value as HoneyCategory });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleConsistencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, consistency: e.target.value });
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, intensity: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] });
  };

  const handleToggleFlavorNote = (note: string) => {
    if (filters.flavorNote?.toLowerCase() === note.toLowerCase()) {
      onFilterChange({ ...filters, flavorNote: null });
    } else {
      onFilterChange({ ...filters, flavorNote: note });
    }
  };

  const resetFilters = () => {
    onFilterChange({
      category: 'wszystkie',
      healthIntent: 'wszystkie',
      consistency: 'all',
      intensity: 'all',
      searchQuery: '',
      flavorNote: null,
      sortBy: 'popular',
    });
  };

  const hasActiveFilters =
    filters.category !== 'wszystkie' ||
    (filters.healthIntent && filters.healthIntent !== 'wszystkie') ||
    filters.consistency !== 'all' ||
    filters.intensity !== 'all' ||
    Boolean(filters.flavorNote) ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-3">
      {/* GŁÓWNY ZUNIFIKOWANY PASEK KONTROLNY */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8DED1] p-3 sm:p-4 shadow-xs space-y-3">
        
        {/* WIERSZ 1: Kolekcje i Cele Zakupu (Szybkie Segmented Pills) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EADFCF]">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              Kolekcje i Cel:
            </span>

            {/* Wskaźnik na telefony informujący o możliwości przewijania w prawo */}
            <span className="flex sm:hidden items-center gap-1 text-[10.5px] font-semibold text-[#D9821E] bg-[#D9821E]/10 px-2 py-0.5 rounded-full animate-pulse">
              <span>Przesuń opcje</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Kontener z subtelnym cieniem/fade na prawej krawędzi sygnalizującym ucięcie na mobile */}
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0.5 scrollbar-none flex-nowrap sm:flex-wrap pr-8 sm:pr-0 scroll-smooth">
              {HEALTH_INTENTS.map((intent) => {
                const isSelected = (filters.healthIntent || 'wszystkie') === intent.id;
                return (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => handleHealthIntentChange(intent.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#1B4332] text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-[#524637] border border-[#DFD3C2] hover:bg-[#F5ECE0] hover:border-[#D9821E]'
                    }`}
                    title={intent.desc}
                  >
                    <span>{intent.icon}</span>
                    <span>{intent.label}</span>
                    {intent.id === 'wszystkie' && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#EAE0D2] text-[#6A5A4A]'}`}>
                        {effectiveTotalCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Gradient mask on right edge on mobile showing there is more content to scroll */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-9 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent flex items-center justify-end pr-0.5 sm:hidden">
              <ChevronRight className="w-3.5 h-3.5 text-[#D9821E]" />
            </div>
          </div>
        </div>

        {/* WIERSZ 2: Kompaktowy pasek narzędzi (Wyszukiwarka + Precyzyjne filtry w dropdownach) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          
          {/* Wyszukiwarka */}
          <div className="relative flex-1 min-w-[200px] max-w-full lg:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj miodu, nuty (np. lipa, gardło)..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white border border-[#DFCBB5] text-[#2D2821] placeholder-[#8E806E] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7E6C] hover:text-[#2D2821]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Zestaw kompaktowych selektorów */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            
            {/* Pora zbioru */}
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className={`w-full sm:w-auto py-1.5 px-2.5 rounded-xl text-xs border focus:outline-none cursor-pointer transition-colors ${
                filters.category !== 'wszystkie'
                  ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332] font-semibold'
                  : 'bg-white border-[#DFCBB5] text-[#3D3328]'
              }`}
              title="Filtruj wg pory zbioru"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Konsystencja */}
            <select
              value={filters.consistency}
              onChange={handleConsistencyChange}
              className={`w-full sm:w-auto py-1.5 px-2.5 rounded-xl text-xs border focus:outline-none cursor-pointer transition-colors ${
                filters.consistency !== 'all'
                  ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332] font-semibold'
                  : 'bg-white border-[#DFCBB5] text-[#3D3328]'
              }`}
              title="Konsystencja miodu"
            >
              <option value="all">Konsystencja: Wszystkie</option>
              <option value="kremowany">🧈 Kremowany</option>
              <option value="patoka">🍯 Patoka (płynny)</option>
              <option value="krupiec">💎 Krupiec (skrystalizowany)</option>
            </select>

            {/* Smak / Intensywność */}
            <select
              value={filters.intensity}
              onChange={handleIntensityChange}
              className={`w-full sm:w-auto py-1.5 px-2.5 rounded-xl text-xs border focus:outline-none cursor-pointer transition-colors ${
                filters.intensity !== 'all'
                  ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332] font-semibold'
                  : 'bg-white border-[#DFCBB5] text-[#3D3328]'
              }`}
              title="Intensywność smaku"
            >
              <option value="all">Aromat: Każdy</option>
              <option value="lagodny">Łagodny / Słodki</option>
              <option value="sredni">Średni / Zrównoważony</option>
              <option value="wyrazisty">Wyrazisty / Głęboki</option>
            </select>

            {/* Sortowanie */}
            <select
              value={filters.sortBy || 'popular'}
              onChange={handleSortChange}
              className="w-full sm:w-auto py-1.5 px-2.5 rounded-xl text-xs bg-white border border-[#DFCBB5] text-[#3D3328] focus:outline-none cursor-pointer font-medium"
              title="Sortowanie produktów"
            >
              <option value="popular">Najczęściej wybierane</option>
              <option value="harvest">Ostatnie zbiory (Data)</option>
              <option value="price-asc">Cena: rosnąco</option>
              <option value="price-desc">Cena: malejąco</option>
            </select>

            {/* Przycisk Nuty Bukietu (Wysuwana szufladka) */}
            <button
              type="button"
              onClick={() => setIsFlavorFilterOpen(!isFlavorFilterOpen)}
              className={`col-span-2 sm:col-span-1 justify-center sm:justify-start px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                filters.flavorNote
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                  : isFlavorFilterOpen
                  ? 'bg-[#F2E5D0] text-[#7A4B13] border-[#D9821E]'
                  : 'bg-white text-[#524637] border-[#DFD3C2] hover:border-[#D9821E]'
              }`}
              title="Filtruj wg nut smakowych (karmel, żywica, malina...)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              <span>{filters.flavorNote ? `Nuta: ${filters.flavorNote}` : `Nuty bukietu (${allUniqueFlavorNotes.length})`}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFlavorFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Przycisk Wyczyść (widoczny tylko gdy filtry są aktywne) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8C4609] hover:bg-[#EFE3CF] rounded-xl transition-colors cursor-pointer font-semibold ml-auto sm:ml-0"
                title="Wyczyść wszystkie filtry"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* WIERSZ 3: Rozwijana chmura nut bukietu smakowego */}
        {isFlavorFilterOpen && (
          <div className="pt-2 border-t border-[#EADFCF] space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-[11.5px] font-semibold text-[#5C5042] flex items-center gap-1">
                <span>Wybierz nutę smakową, aby odkryć pasujące miody:</span>
                {filters.flavorNote && (
                  <span className="text-[#1B4332] font-bold">
                    (Aktywna: {filters.flavorNote})
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={filters.flavorNote || ''}
                  onChange={(e) => onFilterChange({ ...filters, flavorNote: e.target.value || null })}
                  className="py-1 px-2 text-xs bg-white border border-[#DFCBB5] rounded-lg text-[#241D17] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="">Wszystkie nuty ({allUniqueFlavorNotes.length})...</option>
                  {allUniqueFlavorNotes.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsAllNotesExpanded(!isAllNotesExpanded)}
                  className="text-xs font-bold text-[#D9821E] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>{isAllNotesExpanded ? 'Mniej' : 'Pokaż wszystkie'}</span>
                  {isAllNotesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Note Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(isAllNotesExpanded ? allUniqueFlavorNotes : POPULAR_NOTES).map((note) => {
                const isSelected = filters.flavorNote?.toLowerCase() === note.toLowerCase();
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleToggleFlavorNote(note)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4332] text-white ring-1 ring-[#1B4332]/30 shadow-xs'
                        : 'bg-white text-[#594D42] border border-[#DFD3C2] hover:border-[#D9821E] hover:bg-[#FAF5ED]'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-[#E6C065]" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-[#D9821E]/60" />
                    )}
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* PASEK STANU I PODSUMOWANIE WYNIKÓW */}
      <div className="flex items-center justify-between text-xs text-[#716656] px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Pokazujemy <strong>{effectiveFilteredCount}</strong> z {effectiveTotalCount} dostępnych miodów odmianowych
          </span>
          {hasActiveFilters && (
            <span className="text-[#1B4332] font-semibold text-[11px] bg-[#1B4332]/10 px-2 py-0.5 rounded-md">
              Aktywne filtry
            </span>
          )}
        </div>
        <span className="text-[11px] italic text-[#8A7968] hidden sm:inline">
          * Wszystkie partie są niefiltrowane pod ciśnieniem, 100% polskie
        </span>
      </div>
    </div>
  );
};

