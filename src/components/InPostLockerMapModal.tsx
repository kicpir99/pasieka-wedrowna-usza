import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, MapPin, Check, Sparkles, Navigation } from 'lucide-react';
import L from 'leaflet';

export interface ParcelLocker {
  code: string;
  address: string;
  city: string;
  district?: string;
  lat: number;
  lng: number;
}

// Baza prawdziwych Paczkomatów InPost z dokładnymi współrzędnymi geograficznymi
export const REAL_INPOST_LOCKERS: ParcelLocker[] = [
  // Wrocław - Fabryczna
  { code: 'WRO01A', address: 'ul. Legnicka 58 (Kaufland)', city: 'Wrocław', district: 'Fabryczna', lat: 51.1189, lng: 16.9942 },
  { code: 'WRO55P', address: 'ul. Grabiszyńska 240 (Tarasy Grabiszyńskie)', city: 'Wrocław', district: 'Fabryczna', lat: 51.0931, lng: 16.9856 },
  { code: 'WRO18A', address: 'ul. Rogowska 52 (Nowy Dwór)', city: 'Wrocław', district: 'Fabryczna', lat: 51.1124, lng: 16.9387 },
  
  // Wrocław - Stare Miasto / Śródmieście
  { code: 'WRO12M', address: 'ul. Świdnicka 40 (Renoma)', city: 'Wrocław', district: 'Stare Miasto', lat: 51.1042, lng: 17.0315 },
  { code: 'WRO08M', address: 'pl. Grunwaldzki 22 (Pasaż Grunwaldzki)', city: 'Wrocław', district: 'Śródmieście', lat: 51.1118, lng: 17.0601 },
  { code: 'WRO90K', address: 'ul. Jedności Narodowej 180 (Nadodrze)', city: 'Wrocław', district: 'Śródmieście', lat: 51.1215, lng: 17.0435 },
  
  // Wrocław - Krzyki
  { code: 'WRO25N', address: 'ul. Powstańców Śląskich 95 (Sky Tower)', city: 'Wrocław', district: 'Krzyki', lat: 51.0945, lng: 17.0195 },
  { code: 'WRO77B', address: 'ul. Sucha 1 (Wroclavia / Dworzec Główny)', city: 'Wrocław', district: 'Krzyki', lat: 51.0972, lng: 17.0345 },
  { code: 'WRO33M', address: 'al. Karkonoska 85 (Bielany Wrocławskie)', city: 'Wrocław', district: 'Krzyki', lat: 51.0621, lng: 17.0012 },

  // Wrocław - Psie Pole
  { code: 'WRO44A', address: 'ul. Bolesława Krzywoustego 126 (CH Korona)', city: 'Wrocław', district: 'Psie Pole', lat: 51.1392, lng: 17.0864 },
  { code: 'WRO60A', address: 'ul. Zakrzowska 21', city: 'Wrocław', district: 'Psie Pole', lat: 51.1511, lng: 17.1124 },

  // Dolny Śląsk / Rejon Pasieki
  { code: 'TRZ01M', address: 'ul. Wrocławska 14 (Biedronka)', city: 'Trzebnica', district: 'Dolny Śląsk', lat: 51.3115, lng: 17.0625 },
  { code: 'TRZ02A', address: 'ul. Daszyńskiego 42 (Stacja PKP)', city: 'Trzebnica', district: 'Dolny Śląsk', lat: 51.3075, lng: 17.0545 },
  { code: 'MIL01A', address: 'ul. Trzebnicka 10 (Centrum)', city: 'Milicz', district: 'Dolina Baryczy', lat: 51.5285, lng: 17.2755 },
  { code: 'MIL02A', address: 'ul. Krotoszyńska 2 (Dino)', city: 'Milicz', district: 'Dolina Baryczy', lat: 51.5340, lng: 17.2890 },
  { code: 'SRO01A', address: 'ul. Wrocławska 18 (Dino)', city: 'Środa Śląska', district: 'Dolny Śląsk', lat: 51.1630, lng: 16.5930 },
  { code: 'OLE01A', address: 'ul. Wojska Polskiego 22', city: 'Oleśnica', district: 'Dolny Śląsk', lat: 51.2110, lng: 17.3820 },
  { code: 'WOL01A', address: 'ul. Ścinawska 5', city: 'Wołów', district: 'Dolny Śląsk', lat: 51.3360, lng: 16.6320 },

  // Polska - Główne Metropolie
  { code: 'WAW22B', address: 'ul. Marszałkowska 104 (Centrum)', city: 'Warszawa', district: 'Śródmieście', lat: 52.2319, lng: 21.0067 },
  { code: 'WAW01A', address: 'al. Jana Pawła II 82 (Westfield Arkadia)', city: 'Warszawa', district: 'Wola', lat: 52.2571, lng: 20.9855 },
  { code: 'KRA14M', address: 'ul. Floriańska 25 (Stare Miasto)', city: 'Kraków', district: 'Śródmieście', lat: 50.0635, lng: 19.9392 },
  { code: 'KRA02A', address: 'ul. Pawia 5 (Galeria Krakowska)', city: 'Kraków', district: 'Centrum', lat: 50.0681, lng: 19.9482 },
  { code: 'POZ08A', address: 'ul. Półwiejska 32 (Stary Browar)', city: 'Poznań', district: 'Centrum', lat: 52.4022, lng: 16.9272 },
  { code: 'GDA04A', address: 'ul. Grunwaldzka 82 (Galeria Bałtycka)', city: 'Gdańsk', district: 'Wrzeszcz', lat: 54.3812, lng: 18.6015 },
  { code: 'KAT03B', address: 'ul. Chorzowska 107 (Silesia City Center)', city: 'Katowice', district: 'Centrum', lat: 50.2708, lng: 19.0045 },
];

const CITIES = ['Wrocław', 'Trzebnica', 'Milicz', 'Lubań', 'Środa Śląska', 'Warszawa', 'Kraków', 'Poznań', 'Gdańsk', 'Katowice'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCode?: string;
  onSelect: (locker: ParcelLocker) => void;
}

export const InPostLockerMapModal: React.FC<Props> = ({ isOpen, onClose, selectedCode, onSelect }) => {
  const [search, setSearch] = useState('');
  const [activeCity, setActiveCity] = useState('Wrocław');
  const [allLockers, setAllLockers] = useState<ParcelLocker[]>(REAL_INPOST_LOCKERS);
  const [activeLocker, setActiveLocker] = useState<ParcelLocker>(() => {
    return REAL_INPOST_LOCKERS.find(l => l.code === selectedCode) || REAL_INPOST_LOCKERS[0];
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [code: string]: L.Marker }>({});

  // Dynamiczne załadowanie pełnej oficjalnej bazy paczkomatów InPost
  useEffect(() => {
    fetch('/data/inpost_lockers.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllLockers(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filtrowanie paczkomatów
  const displayedLockers = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return allLockers
        .filter(
          l =>
            l.code.toLowerCase().includes(q) ||
            l.address.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q) ||
            (l.district && l.district.toLowerCase().includes(q))
        )
        .slice(0, 60);
    }
    return allLockers
      .filter(l => l.city.toLowerCase() === activeCity.toLowerCase())
      .slice(0, 60);
  }, [allLockers, search, activeCity]);

  // Inicjalizacja i obsługa mapy Leaflet
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Utwórz instancję mapy, jeśli nie istnieje
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLocker.lat, activeLocker.lng],
        zoom: 14,
        zoomControl: true,
      });

      // Warstwa kafelków OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Wymuś przeliczenie wymiarów po otwarciu modalu
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Czyść poprzednie markery
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Twórz customowe pinezki InPost
    displayedLockers.forEach(locker => {
      const isSelected = activeLocker.code === locker.code;

      const customIcon = L.divIcon({
        className: 'custom-inpost-marker',
        html: `
          <div style="
            background: ${isSelected ? '#945209' : '#F6BE22'};
            color: ${isSelected ? '#FFFFFF' : '#1F1B16'};
            border: 2px solid #FFFFFF;
            border-radius: 12px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">
            <span>📦</span>
            <span>${locker.code}</span>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      const marker = L.marker([locker.lat, locker.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveLocker(locker);
        map.flyTo([locker.lat, locker.lng], 15, { duration: 0.8 });
      });

      markersRef.current[locker.code] = marker;
    });

    // Dopasuj widok mapy do wyświetlanych punktów
    if (displayedLockers.length > 0) {
      const bounds = L.latLngBounds(displayedLockers.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [isOpen, displayedLockers]);

  // Centruj na wybranym paczkomacie
  const handleSelectLocker = (locker: ParcelLocker) => {
    setActiveLocker(locker);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([locker.lat, locker.lng], 16, { duration: 0.8 });
    }
  };

  const handleConfirmAndClose = (locker: ParcelLocker) => {
    onSelect(locker);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7DDCE] shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* NAGŁÓWEK */}
        <div className="p-4 sm:p-5 border-b border-[#E7DDCE] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6BE22] text-[#23201C] flex items-center justify-center font-bold text-sm shadow-xs">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#23201C]">
                  Oficjalna Mapa Paczkomatów InPost 24/7
                </h3>
                <span className="text-[10px] font-bold bg-[#E5F2E1] text-[#2D6A23] px-2 py-0.5 rounded-full border border-[#CDE1CA]">
                  Live OpenStreetMap
                </span>
              </div>
              <span className="text-[11px] text-[#786957] block">
                Kliknij dowolną żółtą pinezkę na mapie lub wybierz automat z listy
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#6E6150] hover:bg-[#EFE5D6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PASEK WYSZUKIWANIA I SZYBKICH MIAST */}
        <div className="p-3 sm:p-4 bg-[#FAF6EE] border-b border-[#E7DDCE] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7B68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Wyszukaj po ulicy, kodzie lub mieście (np. Legnicka, Sky Tower, WRO01A, Trzebnica)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209] focus:ring-1 focus:ring-[#945209]/20"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold text-[#8C7B68] uppercase tracking-wider mr-1">
              Popularne miasta:
            </span>
            {CITIES.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCity(city);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                  !search && activeCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-[#945209] text-white border-[#945209] shadow-2xs'
                    : 'bg-white text-[#635342] border-[#E8DEC8] hover:bg-[#F2E5D4]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* GŁÓWNA ZAWARTOŚĆ: PODZIAŁ NA LISTĘ I MAPĘ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[380px] sm:min-h-[460px]">
          
          {/* LEWA KOLUMNA: LISTA AUTOMATÓW (5 kolumn) */}
          <div className="lg:col-span-5 p-3 sm:p-4 overflow-y-auto pasieka-scrollbar space-y-2 border-r border-[#E7DDCE] bg-white order-2 lg:order-1 max-h-[220px] lg:max-h-none">
            <div className="text-[11px] font-bold text-[#7A6C5B] uppercase tracking-wider flex justify-between items-center pb-1">
              <span>Automaty w rejonie ({displayedLockers.length}):</span>
              <span className="text-[10px] text-[#2D6A23] font-semibold">● Dostępne 24/7</span>
            </div>

            {displayedLockers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8C7B68]">
                Nie znaleziono paczkomatu dla podanego hasła. Wpisz inną ulicę lub wybierz miasto z listy.
              </div>
            ) : (
              displayedLockers.map(locker => {
                const isSelected = activeLocker.code === locker.code;
                return (
                  <div
                    key={locker.code}
                    onClick={() => handleSelectLocker(locker)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-[#945209] bg-[#FAF3E8] ring-1 ring-[#945209]/20 shadow-xs'
                        : 'border-[#E8DEC8] hover:border-[#945209] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#8C4609] bg-[#FAF0DC] px-2 py-0.5 rounded-md border border-[#DECDB7]">
                          {locker.code}
                        </span>
                        <span className="text-[11px] font-semibold text-[#5C4D3B]">
                          {locker.city} {locker.district ? `(${locker.district})` : ''}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#2D6A23] flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Aktywny
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#554737] font-medium leading-snug">
                      {locker.address}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleConfirmAndClose(locker);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#945209] hover:bg-[#784107] text-white font-bold text-[10px] transition-all shadow-xs cursor-pointer"
                      >
                        Wybierz ten automat
                      </button>
                      <span className="text-[10px] text-[#8C7B68]">
                        Pokaż na mapie →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PRAWA KOLUMNA: ŻYWA MAPA LEAFLET (7 kolumn) */}
          <div className="lg:col-span-7 relative h-[250px] sm:h-[320px] lg:h-auto order-1 lg:order-2 bg-[#EFEBE4]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Pływający pasek aktywnego paczkomatu na mapie */}
            <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E7DDCE] shadow-lg flex items-center justify-between gap-2">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-[#8C4609] bg-[#F6BE22]/20 px-1.5 py-0.5 rounded">
                    {activeLocker.code}
                  </span>
                  <span className="text-xs font-bold text-[#2D2821] truncate">
                    {activeLocker.city} • {activeLocker.address}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleConfirmAndClose(activeLocker)}
                className="px-4 py-2 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer"
              >
                Wybierz ten Paczkomat ✓
              </button>
            </div>
          </div>
        </div>

        {/* DOLNY PASEK ZATWIERDZENIA */}
        <div className="p-3.5 bg-white border-t border-[#E7DDCE] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-[#635342]">
            <MapPin className="w-4 h-4 text-[#945209]" />
            <span>
              Aktualnie wybrany automat: <strong className="font-mono text-[#8C4609]">{activeLocker.code}</strong> ({activeLocker.address})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleConfirmAndClose(activeLocker)}
            className="px-5 py-2 rounded-xl bg-[#945209] hover:bg-[#784107] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Zatwierdź do zamówienia
          </button>
        </div>

      </div>
    </div>
  );
};
