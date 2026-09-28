# 🐝 Instrukcja Integracji: WordPress + WooCommerce (Headless API)

Ten dokument opisuje krok po kroku, jak podłączyć sklep **Pasieka Wędrowna „Usza”** do WordPressa i WooCommerce, aby klient mógł samodzielnie dodawać produkty, zmieniać ceny i zarządzać zamówieniami z poziomu panelu WordPress (`/wp-admin`), bez ingerencji w kod frontendowy.

---

## 1. Wymagania wstępne w WordPressie

1. Zainstalowany WordPress z włączonymi ładnymi odnośnikami (tzw. Permalinks: *Ustawienia -> Bezpośrednie odnośniki -> Nazwa wpisu*).
2. Zainstalowane i aktywowane wtyczki:
   * **WooCommerce** (oficjalna wtyczka e-commerce).
   * **Advanced Custom Fields (ACF)** (darmowa wtyczka do pól specyfikacji miodu).
   * Opcjonalnie wtyczki płatności i dostawy: **Przelewy24** / **PayU** oraz **InPost Paczkomaty**.

---

## 2. Wygenerowanie kluczy WooCommerce REST API

1. W panelu WordPressa przejdź do:  
   **WooCommerce $\rightarrow$ Ustawienia $\rightarrow$ Zaawansowane $\rightarrow$ REST API**.
2. Kliknij **Dodaj klucz** (Add key).
3. Wypełnij formularz:
   * **Opis:** `Pasieka React Frontend`
   * **Użytkownik:** Wybierz administratora.
   * **Prawa dostępu:** `Odczyt` (Read) lub `Odczyt/Zapis` (Read/Write).
4. Kliknij **Wygeneruj klucz API**.
5. Skopiuj dwa wygenerowane ciągi znaków:
   * **Klucz klienta** (Consumer Key: `ck_...`)
   * **Tajny klucz klienta** (Consumer Secret: `cs_...`)

---

## 3. Konfiguracja zmiennych środowiskowych w React (.env)

W głównym folderze projektu utwórz lub zedytuj plik `.env`:

```env
# Adres Twojej domeny WordPress (bez ukośnika na końcu)
VITE_WOOCOMMERCE_URL=https://twojadomena.pl

# Klucze wygenerowane w kroku 2
VITE_WOOCOMMERCE_KEY=ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_WOOCOMMERCE_SECRET=cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> **Wskazówka:** Jeśli te zmienne nie są ustawione, sklep automatycznie korzysta z bazy lokalnej (Fallback Mode), więc strona zawsze działa bezbłędnie.

---

## 4. Konfiguracja pól specyfikacji miodu w ACF (Advanced Custom Fields)

Aby klient mógł łatwo w formularzu wpisywać dane takie jak *zawartość wody*, *rocznik*, *konsystencja* czy *nuty smakowe*, w panelu WordPress przejdź do:  
**ACF $\rightarrow$ Grupy pól $\rightarrow$ Dodaj nową grupę pól** (np. o nazwie *„Parametry Miodu”*), przypisz ją do typu wpisu **Produkt** i dodaj następujące pola:

| Etykieta pola | Nazwa pola (Field Name) | Typ pola | Przykładowa wartość |
| :--- | :--- | :--- | :--- |
| **Nazwa botaniczna** | `botanical_name` | Tekst | *Robinia pseudoacacia* |
| **Rocznik zbioru** | `harvest_year` | Liczba | `2026` |
| **Miesiąc miodobrania** | `harvest_month` | Tekst | `Czerwiec` |
| **Numer partii** | `batch_number` | Tekst | `AKA-26/06` |
| **Lokalizacja pasieki**| `apiary_location` | Tekst | `Pasieka Wędrowna • Dolny Śląsk` |
| **Roślina wiodąca** | `dominant_plant` | Tekst | `Robinia akacjowa` |
| **Pyłek przewodni (%)**| `dominant_pollen_percentage` | Liczba | `74` |
| **Zawartość wody (%)** | `water_content_percentage` | Liczba (dziesiętna) | `17.2` |
| **Konsystencja** | `consistency` | Wybór (Select) | `patoka` / `krupiec` / `kremowany` |
| **Intensywność smaku**| `flavor_intensity` | Wybór (Select) | `lagodny` / `sredni` / `wyrazisty` |
| **Nuty smakowe** | `flavor_notes` | Tekst (rozdzielane przecinkami) | `Kwiat akacji, Wanilia, Łagodny nektar` |
| **Słodkość (1-5)** | `sensory_sweetness` | Liczba | `4` |
| **Kwasowość (1-5)** | `sensory_acidity` | Liczba | `2` |
| **Moc aromatu (1-5)** | `sensory_intensity` | Liczba | `3` |
| **Krystalizacja (1-5)**| `sensory_crystallization` | Liczba | `2` |

> **Ważne:** W ustawieniach grupy pól ACF zaznacz opcję: **„Pokaż w REST API”** (Show in REST API: Tak).

---

## 5. Odblokowanie nagłówków CORS w WordPressie (Wymagane)

Gdy React pobiera dane z innej domeny (np. WordPress na `api.pasiekausza.pl` a frontend na `pasiekausza.pl`), serwer WordPress musi zezwolić na odczyt.  
Wklej poniższy fragment na końcu pliku `functions.php` w motywie WordPressa:

```php
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Wpnonce');
        return $value;
    });
}, 15);
```

---

## 6. Jak to teraz działa w całości?

1. **Klient dodaje miód w WordPressie:** Wpisuje nazwę, cenę, wgrywa zdjęcie i zaznacza parametry.
2. **React pobiera dane w tle:** Komponent [`src/services/wooCommerceService.ts`](file:///c:/Users/kacpe/Desktop/tes/src/services/wooCommerceService.ts) automatycznie przetwarza dane z formatu WooCommerce na model strony pasieki.
3. **Pamięć podręczna (Cache):** Dane są buforowane na 5 minut, dzięki czemu strona ładuje się błyskawicznie bez ciągłego obciążania serwera WordPress.
4. **Koszyk i Płatności:** Po kliknięciu „Przejdź do kasy” klient trafia do kasy WooCommerce z polskimi bramkami płatności (BLIK, Przelewy24, PayU) oraz paczkomatami InPost.
