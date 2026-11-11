# Pasieka Usza – Headless E-Commerce Platform

> [English Version](#-english-version) | [Wersja Polska](#-wersja-polska)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![WooCommerce](https://img.shields.io/badge/WooCommerce-REST_API_v3-96588a.svg?logo=woocommerce)](https://woocommerce.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg?logo=leaflet)](https://leafletjs.com/)

---

# 🇬🇧 English Version

> Modern, high-performance Headless E-Commerce Single Page Application built for an artisanal migratory apiary (**Pasieka Usza**), decoupling a responsive React 19 + TypeScript + Vite frontend from a WordPress & WooCommerce REST API v3 production backend.

## 🎯 Architecture & Project Overview

This project was engineered to replace an outdated monolithic WordPress theme with an enterprise-grade headless architecture. By decoupling the presentation layer from the content management system, the store achieves sub-second page transitions, hardware-accelerated animations, and an elevated user experience—while preserving the familiar WordPress / WooCommerce dashboard for store managers.

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

## ✨ Key Features & Engineering Highlights

### 1. Headless WooCommerce Engine
- **Two-way REST API Integration (`/wp-json/wc/v3`):** real-time product catalogs, category filtering, live stock levels, and automated order creation (`POST /orders`).
- **Resilient Fallback & Stale-While-Revalidate Caching:** in case of API timeouts or backend maintenance, the application seamlessly serves verified product snapshots from `localStorage`, ensuring a **Zero Downtime UX**.
- **Dynamic Weight & Unit Pricing:** automatic parsing of multi-weight product variations (400g / 1200g) with live price recalculation.

### 2. High-Conversion Checkout & Logistics
- **InPost Parcel Locker Integration (14,000+ Lockers):**
  - Searchable offline-first database indexed by locker code, street, and municipality.
  - Interactive geolocated map powered by **Leaflet** and OpenStreetMap featuring custom SVG pins and dynamic viewport auto-centering.
- **Volumetric Tare Weight & Parcel Dimension Algorithm:** computes net honey mass plus protective glass tare and corrugated honeycomb buffer to select locker capacity tiers automatically (InPost Size A / B / C).
- **Free Shipping Threshold Optimizer:** dynamic hybrid recommendation engine suggesting impulse add-ons tailored to bridge the remaining spend required for free delivery (180 PLN).
- **B2B Tax Compliance:** client-side validation of Polish tax identification numbers (NIP) adhering to Article 106e VAT requirements with invoice metadata dispatch.
- **1-Click Reorder Subscriptions:** cyclical automated email reminders (30, 60, or 90 days) for honey replenishment.

### 3. Interactive Product Experience
- **Interactive 360° Jar Inspection (`FramelessJar360Viewer`):**
  - Ultra-smooth frame-sequence player with WebP preloading and GPU rasterization.
  - Interactive sensory hotspots displaying honey harvest data (diastase number, HMF content, moisture percentage, botanical origin).
  - Turntable behavior: subtle auto-spin on idle, instant pause on drag/touch, and automatic resumption after 2.5s.
- **Multi-Criteria Honey Finder Quiz (`HoneyFinderQuiz`):** interactive recommendation engine mapping taste preferences and health benefits to the apiary's harvest varieties.
- **Sensory Honey Comparator (`ComparisonModal`):** side-by-side analytical radar comparison of sweetness, acidity, aroma intensity, and crystallization speed.

---

## 🛠️ Tech Stack

| Domain | Technology / Library | Role & Implementation |
|---|---|---|
| **Core** | React 19, TypeScript 5.8 | Component architecture, strict domain modeling |
| **Build & Tooling** | Vite 6.2, PostCSS | Fast HMR, code splitting, asset optimization |
| **Styling & UI** | Tailwind CSS v4, Lucide React | Utility-first design, custom design tokens, SVG icon system |
| **Motion & UX** | GSAP 3, Lenis | Hardware-accelerated transitions, inertia smooth scrolling |
| **GIS & Mapping** | Leaflet 1.9, OpenStreetMap | Parcel locker picking via interactive vector maps |
| **Backend & CMS** | WooCommerce REST API v3, WordPress | Headless inventory, order processing, ACF schema |
| **Deployment** | Apache / Nginx, GitHub Actions | CI/CD automation, `.htaccess` SPA fallback routing |

---

## 📁 Repository Structure

```text
├── public/
│   ├── .htaccess               # Apache mod_rewrite rules for SPA routing
│   ├── assets/                 # Optimized WebP assets, photography & caustics
│   ├── data/                   # Static InPost parcel locker points
│   └── frames/                 # 360-degree prerendered animation frames
├── scripts/                    # Automation utilities
│   └── sync_all_products_to_woocommerce.js  # Node.js batch sync with WooCommerce REST API
├── src/
│   ├── components/             # Reusable UI modules (CartDrawer, InPostModal, 360Viewer)
│   ├── context/                # Global state stores (AuthContext, ProductContext)
│   ├── data/                   # Fallback datasets, sensory scales, harvest records
│   ├── hooks/                  # Custom React hooks (useDisplayResolution)
│   ├── pages/                  # Route views (ShopPage, ProductPage, CheckoutPage)
│   ├── services/               # REST API gateways (wooCommerceService, contactService)
│   ├── types.ts                # TypeScript strict interface contracts
│   └── utils/                  # Domain algorithms (tare calculator, frame preloader)
├── .env.example                # Environment configuration template
└── vite.config.ts              # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `>= 20.x`
- **npm:** `>= 10.x`

### 1. Clone the repository
```bash
git clone https://github.com/kicpir99/pasieka-wedrowna-usza.git
cd pasieka-wedrowna-usza
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your WooCommerce REST API credentials or leave them unset to run the app in offline fallback / mock mode:
```env
VITE_WOOCOMMERCE_URL="https://your-domain.com"
VITE_WOOCOMMERCE_KEY="ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VITE_WOOCOMMERCE_SECRET="cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 4. Run development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Production build & verification
```bash
# Type check without emitting files
npm run lint

# Compile optimized production bundle
npm run build
```

---

## 👤 Author

**Kacper Łamasz**  
- GitHub: [@kicpir99](https://github.com/kicpir99)  
- LinkedIn: [kacper-lamasz](https://www.linkedin.com/in/kacper-lamasz/)  
- Role: Junior Python / Fullstack Developer

<br />

---
---

<br />

# 🇵🇱 Wersja Polska

> Nowoczesna, bezgłowa (Headless) platforma e-commerce zrealizowana dla dolnośląskiej rzemieślniczej pasieki wędrownej **Pasieka Usza**, łącząca zoptymalizowany frontend SPA (React 19 + TypeScript + Vite) z produkcyjnym backendem WordPress & WooCommerce REST API v3.

## 🎯 Architektura i Założenia Projektu

Projekt powstał jako komercyjne wdrożenie headless e-commerce, którego celem było zastąpienie tradycyjnego, ociężałego motywu WordPress nowoczesną aplikacją Single Page Application (SPA). Rozwiązanie zachowuje pełną elastyczność panelu administracyjnego WordPress / WooCommerce dla właścicieli pasieki, dostarczając klientowi końcowemu błyskawiczny czas ładowania, płynne animacje i doświadczenie zakupowe klasy premium.

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

## 🚀 Uruchomienie Lokalne

```bash
# Klonowanie repozytorium
git clone https://github.com/kicpir99/pasieka-wedrowna-usza.git
cd pasieka-wedrowna-usza

# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Weryfikacja typów i build produkcyjny
npm run lint
npm run build
```

---

## 👤 Autor

**Kacper Łamasz**  
- GitHub: [@kicpir99](https://github.com/kicpir99)  
- LinkedIn: [kacper-lamasz](https://www.linkedin.com/in/kacper-lamasz/)  
- Portfolio: Junior Python / Fullstack Developer
