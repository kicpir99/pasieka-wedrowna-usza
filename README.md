# Pasieka Usza – Headless E-Commerce Platform

> Nowoczesna, bezgłowa (Headless) platforma e-commerce zrealizowana dla dolnośląskiej rzemieślniczej pasieki wędrownej **Pasieka Usza**, łącząca zoptymalizowany frontend SPA (React 19 + TypeScript + Vite) z produkcyjnym backendem WordPress & WooCommerce REST API v3.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![WooCommerce](https://img.shields.io/badge/WooCommerce-REST_API_v3-96588a.svg?logo=woocommerce)](https://woocommerce.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg?logo=leaflet)](https://leafletjs.com/)

---

## 🎯 Architektura i Założenia Projektu

Projekt powstał jako komercyjne wdrożenie headless e-commerce, którego celem było zastąpienie tradycyjnego, ociężałego motywu WordPress nowoczesną aplikacją Single Page Application (SPA). Rozwiązanie zachowuje pełną elastyczność panelu administracyjnego WordPress / WooCommerce dla właścicieli pasieki, dostarczając klientowi końcowemu błyskawiczny czas ładowania, płynne animacje i doświadczenie zakupowe klasy premium.

```
┌────────────────────────────────────────────────────────┐
│            Frontend: React 19 + Vite (SPA)             │
│   Tailwind CSS v4 • Lenis Smooth Scroll • GSAP 3       │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTPS / REST API v3
              (Basic Auth / HMAC / CORS)
                           │
┌──────────────────────────▼─────────────────────────────┐
│          Backend: WordPress + WooCommerce v3           │
│     Custom Post Types • ACF Meta • Mailer Endpoints    │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Kluczowe Funkcjonalności

### 1. Headless WooCommerce Engine
- **Dwukierunkowa integracja REST API (`/wp-json/wc/v3`):** dynamiczne pobieranie katalogu produktów, kategorii, stanów magazynowych oraz bezpośrednie tworzenie zamówień (`POST /orders`).
- **Inteligentny mechanizm Fallback & Stale-While-Revalidate:** w przypadku chwilowej niedostępności backendu aplikacja serwuje zoptymalizowane dane z pamięci podręcznej (`localStorage`), gwarantując 100% ciągłości działania (Zero Downtime UX).
- **Obsługa wariantów i gramatur:** automatyczne mapowanie atrybutów wagowych (400g / 1200g) oraz przeliczanie cen jednostkowych.

### 2. Zaawansowany Checkout & Logistyka
- **Integracja InPost Paczkomaty 24/7:**
  - Wbudowana baza ponad 14 000 oficjalnych maszyn InPost w Polsce z indeksowaniem po kodzie, ulicy i mieście.
  - Interaktywna mapa geolokalizacyjna oparta o **Leaflet** i OpenStreetMap z niestandardowymi markerami i klastrowaniem.
- **Kalkulator gabarytów i wagi brutto:** dynamiczny algorytm szacujący wagę zamówienia (miód netto + bezpieczne szkło słoika + opakowanie komorowe) w celu automatycznego doboru gabarytu skrytki (Gabaryt A / B / C).
- **Progresywny pasek darmowej dostawy:** inteligentny rekomendator produktów impulsowych dobierający produkty brakujące do progu darmowej wysyłki (180 zł).
- **Obsługa B2B / Faktury VAT:** pełna walidacja formalna numeru NIP oraz integracja danych do faktury przekazywanych w metadanych zamówienia WooCommerce.
- **Subskrypcje 1-Click Reorder:** obsługa inteligentnych cyklicznych przypomnień o odnowieniu zapasów miodu (co 30, 60 lub 90 dni).

### 3. Autorskie Komponenty Interaktywne
- **Wizualizator Słoików 360° (`FramelessJar360Viewer`):**
  - Odtwarzanie klatkowe z preloaderem WebP i akceleracją GPU.
  - Responsywny mechanizm hot-spotów sensorycznych (nuty smakowe, parametry laboratoryjne HMF, liczba diastazowa, zawartość wody).
  - Inteligentne zachowanie: auto-obrót w trybie idle, płynna pauza przy geście użytkownika i powrót do obrotu po 2.5s.
- **Quiz Doboru Miodu (`HoneyFinderQuiz`):** algorytm wielokryterialny rekomendujący odmianę miodu na podstawie preferencji smakowych, dolegliwości zdrowotnych i przeznaczenia kulinarnego.
- **Komparator Produktów (`ComparisonModal`):** zestawienie sensoryczne i analityczne dwóch wybranych odmian miodu (profil słodyczy, kwasowości, intensywności aromatu i krystalizacji).

---

## 🛠️ Stack Technologiczny

| Warstwa | Technologia / Biblioteka | Zastosowanie |
|---|---|---|
| **Core** | React 19, TypeScript 5.8 | Architektura komponentowa, ścisłe typowanie domenowe |
| **Build & Tooling** | Vite 6.2, PostCSS | HMR, optymalizacja chunków, kompresja assetów |
| **Styling** | Tailwind CSS v4, Lucide React | Utility-first styling, responsywny design, system ikon |
| **Animacje** | GSAP 3, Lenis | Płynny scroll (smooth scrolling), choreografia wejść |
| **Mapy & GIS** | Leaflet 1.9, OpenStreetMap | Wybór paczkomatów na żywej mapie wektorowej |
| **Backend / API** | WooCommerce REST API v3, WordPress Core | Zarządzanie bazą produktów, logistyką i zamówieniami |
| **Deployment** | Nginx / Apache, GitHub Actions | CI/CD pipeline, automatyczny build i routing SPA `.htaccess` |

---

## 📁 Struktura Projektu

```text
├── public/
│   ├── .htaccess               # Konfiguracja mod_rewrite dla routingu SPA na Apache
│   ├── assets/                 # Zoptymalizowane grafiki WebP / PNG
│   ├── data/                   # Statyczna baza punktów logistycznych (InPost)
│   ├── frames/                 # Wyrenderowane klatki animacji 360°
│   └── sprites/                # Arkusze sprajtów dla elementów dynamicznych
├── scripts/                    # Skrypty narzędziowe i synchronizacyjne
│   └── sync_all_products_to_woocommerce.js  # Node.js batch sync z WooCommerce REST API
├── src/
│   ├── components/             # Reużywalne komponenty UI (CartDrawer, InPostModal, 360Viewer itp.)
│   ├── context/                # Zarządzanie stanem globalnym (AuthContext, ProductContext)
│   ├── data/                   # Bazy fallback, typy sensoryczne, dane odmian
│   ├── hooks/                  # Własne hooki React (useDisplayResolution itp.)
│   ├── pages/                  # Widoki aplikacji (ShopPage, ProductPage, CheckoutPage itp.)
│   ├── services/               # Warstwa integracji API (wooCommerceService, contactService itp.)
│   ├── types.ts                # Główne definicje typów TypeScript
│   └── utils/                  # Funkcje pomocnicze (preloader klatek, kalkulatory miodu)
├── .env.example                # Szablon zmiennych środowiskowych
└── vite.config.ts              # Konfiguracja bundlera Vite
```

---

## 🚀 Uruchomienie Lokalne

### Wymagania wstępne
- **Node.js:** `>= 20.x`
- **npm:** `>= 10.x`

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/kicpir99/pasieka-wedrowna-usza.git
cd pasieka-wedrowna-usza
```

### 2. Instalacja zależności
```bash
npm install
```

### 3. Konfiguracja środowiska
Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```
Uzupełnij dane dostępowe do instancji WooCommerce (jeśli pracujesz w trybie Live API) lub pozostaw puste, aby korzystać z wbudowanego trybu demonstracyjnego/fallback:
```env
VITE_WOOCOMMERCE_URL="https://twojadomena.pl"
VITE_WOOCOMMERCE_KEY="ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_WOOCOMMERCE_SECRET="cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 4. Uruchomienie serwera deweloperskiego
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

### 5. Budowanie paczki produkcyjnej
```bash
npm run build
```
Zoptymalizowane pliki produkcyjne zostaną wygenerowane w katalogu `dist/`.

---

## 🧪 Weryfikacja Jakości Kodu

Projekt podlega ścisłej kontroli typów TypeScript oraz walidacji poprawności bundlingu:

```bash
# Weryfikacja typów TypeScript (bez emisji plików)
npm run lint

# Kompilacja produkcyjna z optymalizacją wielkości chunków
npm run build
```

---

## 🔒 Bezpieczeństwo i Dobre Praktyki

- **Brak sekretów w repozytorium:** klucze API oraz dane uwierzytelniające są zarządzane wyłącznie poprzez zmienne środowiskowe (`.env`), a pliki wrażliwe są wykluczone przez `.gitignore`.
- **Walidacja danych wejściowych:** rygorystyczna sanityzacja danych adresowych, formatów e-mail, numerów telefonów i NIP przed wysyłką do backendu.
- **Bezpieczny routing SPA:** dedykowany zestaw reguł `.htaccess` chroniący przed błędami 404 przy bezpośrednich wejściach na podstrony (`/sklep`, `/koszyk`, `/zamowienie`).

---

## 👤 Autor

**Kacper Łamasz**  
- GitHub: [@kicpir99](https://github.com/kicpir99)  
- LinkedIn: [kacper-lamasz](https://www.linkedin.com/in/kacper-lamasz/)  
- Portfolio: Junior Python / Fullstack Developer
