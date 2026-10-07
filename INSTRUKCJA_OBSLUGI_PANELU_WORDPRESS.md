# 🍯 Pasieka Wędrowna „Usza” — Podręcznik Administratora WordPress & WooCommerce
### Kompletny przewodnik zarządzania sklepem dla Właścicieli Pasieki (Magdalena i Piotr Szymkowicz)

---

> [!NOTE]
> **Dobra wiadomość:**  
> Wtyczka łącząca sklep z WordPressem (`Pasieka Usza - Headless REST API Connector`) została **pomyślnie zainstalowana i jest już w 100% aktywna na serwerze!**  
> Oznacza to, że każda zmiana wprowadzona w panelu WordPressa natychmiast odzwierciedla się w sklepie internetowym. Wszystko zostało zaprojektowane tak, abyście mogli samodzielnie zarządzać ofertą, cenami, blogiem i pytaniami bez pisania ani jednej linijki kodu.

---

## 📋 Spis Treści Podręcznika

1. [Logowanie do panelu administracyjnego](#1-logowanie-do-panelu-administracyjnego)
2. [Zarządzanie Miodami i Cenami (WooCommerce)](#2-zarządzanie-miodami-i-cenami-woocommerce)
   * 2.1. Zmiana ceny lub gramatury istniejącego miodu
   * 2.2. Dodanie nowej odmiany miodu (krok po kroku)
   * 2.3. Oznaczanie miodu jako Bestseller lub Świeży Zbiór
3. [Dodawanie produktów do „Skarbów Ula” (Oferta & Sklep)](#3-dodawanie-produktów-do-skarbów-ula-oferta--sklep)
   * 3.1. Jak działa kategoria „Skarby Ula”
   * 3.2. Jak dodać nowy produkt (np. Mydło miodowe, Maść propolisową)
4. [Profile sensoryczne, badania i wskazówki kulinarne (Pola dedykowane)](#4-profile-sensoryczne-badania-i-wskazówki-kulinarne)
5. [Zarządzanie pytaniami i odpowiedziami FAQ](#5-zarządzanie-pytaniami-i-odpowiedziami-faq)
6. [Prowadzenie Bloga i dodawanie filmów wideo z YouTube](#6-prowadzenie-bloga-i-dodawanie-filmów-wideo-z-youtube)
7. [Formularz kontaktowy — jak działa i gdzie trafiają wiadomości klientów](#7-formularz-kontaktowy--jak-działa-i-gdzie-trafiają-wiadomości)
8. [Edycja podstrony „O nas” (Historia i cytat pasieki)](#8-edycja-podstrony-o-nas-historia-i-cytat-pasieki)
9. [Codzienna obsługa zamówień i etykiety InPost](#9-codzienna-obsługa-zamówień-i-etykiety-inpost)
10. [Edycja tekstów na Stronie Głównej (Co zmienia się w WordPressie, a co w kodzie?)](#10-edycja-tekstów-na-stronie-głównej-co-zmienia-się-w-wordpressie-a-co-w-kodzie)

---

## 1. Logowanie do panelu administracyjnego

* **Adres logowania:**  
  👉 **`https://sklep.pasiekausza.pl/wp-admin`**
* **Login i hasło:**  
  Wpiszcie swoje dane logowania do konta administratora WordPressa.
* **Wskazówka:** Warto zapisać ten adres w zakładkach w przeglądarce (np. na komputerze lub telefonie), aby mieć szybki dostęp do zamówień i oferty z każdego miejsca.

---

## 2. Zarządzanie Miodami i Cenami (WooCommerce)

Wszystkie produkty, które klienci widzą w sklepie, znajdują się w zakładce **Produkty** w lewym menu WordPressa.

```
Panel WordPress (lewe menu)
└── 🛍️ Produkty
    ├── Wszystkie produkty  <-- tu edytujecie ceny, wagi i stany magazynowe
    ├── Dodaj nowy          <-- tu dodajecie nowy miód lub produkt ulowy
    └── Kategorie           <-- wiosenne, letnie, leśne, skarby ula
```

### 2.1. Zmiana ceny lub gramatury istniejącego miodu
1. W lewym menu kliknijcie: **Produkty $\rightarrow$ Wszystkie produkty**.
2. Najedźcie kursorem na wybrany miód (np. *Miód Lipowy*) i kliknijcie **Edytuj**.
3. Przewińcie stronę w dół do sekcji **Dane produktu**:
   * Jeśli produkt ma jedną stałą cenę: pole **Cena podstawowa (zł)**.
   * Jeśli produkt ma warianty wagowe (np. 400g / 1200g): wejdźcie w zakładkę **Warianty** po lewej stronie ramki danych produktu $\rightarrow$ rozwińcie dany wariant (np. *1200g*) i zmieńcie kwotę.
4. Kliknijcie niebieski przycisk **„Zaktualizuj”** po prawej stronie na górze.  
   *(Cena w sklepie zmieni się natychmiast).*

### 2.2. Dodanie nowej odmiany miodu (krok po kroku)
Gdy pozyskacie nowy rodzaj miodu (np. *Miód Mniszkowy z Imbirem* lub *Miód Koniczynowy*):
1. Kliknijcie: **Produkty $\rightarrow$ Dodaj nowy**.
2. **Nazwa produktu:** Wpiszcie oficjalną nazwę (np. *Miód Koniczynowy RAW*).
3. **Główny opis:** Wpiszcie 2–3 akapity o smaku, pożytku i właściwościach miodu.
4. **Obrazek produktu (po prawej stronie na dole):** Kliknijcie *„Ustaw obrazek produktu”* i wgrajcie ładne zdjęcie słoika na jasnym tle.
5. **Kategorie produktów (po prawej stronie):** Zaznaczcie właściwą porę zbioru:
   * `🌸 Wiosenne` (np. rzepak, mniszek, akacja)
   * `☀️ Letnie` (np. lipa, facelia, gryka, malina)
   * `🌲 Leśne & Spadziowe` (np. spadź iglasta, wrzos, leśny)
6. **Cena:** Wpiszcie cenę słoika w sekcji *Dane produktu*.
7. Kliknijcie niebieski przycisk **„Opublikuj”**. Miód pojawi się w sklepie automatycznie!

---

## 3. Dodawanie produktów do „Skarbów Ula” (Oferta & Sklep)

Poza miodami w pasiece pozyskujecie cenne dary ula: pierzgę, propolis, pyłek, wosk oraz odkład pszczeli. Sklep posiada dedykowaną podstronę **Oferta („Skarby Ula”)**.

### 3.1. Jak działa mechanizm Skarbów Ula?
Sklep rozpoznaje produkt jako „Skarb Ula” na podstawie **kategorii w WooCommerce**.

### 3.2. Jak dodać nowy produkt do Skarbów Ula (np. Mydło z miodem, Maść propolisową, Eko-zestaw):
1. Wejdźcie w: **Produkty $\rightarrow$ Dodaj nowy**.
2. Wpiszcie nazwę (np. *Maść Propolisowa 20%*), cenę i dodajcie zdjęcie.
3. W sekcji **Kategorie produktów** (po prawej stronie):
   * Zaznaczcie kategorię: **`Skarby Ula`** (lub `Apiterapia`, `Świece`, `Manufaktura`).
4. Wpiszcie krótki opis i kliknijcie **Opublikuj**.
5. **Efekt na stronie:**
   * W sklepie głównym produkt pojawi się w sekcji Skarbów Ula.
   * Na podstronie **Oferta (`/oferta`)** sklep **automatycznie wygeneruje nowy, kolejny kafelek z Waszym zdjęciem, ceną i przyciskiem do zakupu**!

---

## 4. Profile sensoryczne, badania i wskazówki kulinarne

Na karcie każdego miodu w sklepie zaprogramowaliśmy unikalne karty degustacji (suwaki słodyczy, kwasowości, aromatu i krystalizacji) oraz zakładki o zdrowiu i kulinariach.

### Gdzie to uzupełnić w WordPressie?
W oknie edycji produktu (pod głównym polem opisu) znajduje się sekcja **Pola własne (Custom Fields)** lub zakładki wtyczki ACF:

| Nazwa pola w WordPressie | Dozwolona wartość | Co to robi na stronie sklepu? |
| :--- | :--- | :--- |
| `sensory_sweetness` | Cyfra od `1` do `5` | Ustawia suwak **Słodycz** (1 = łagodny, 5 = mocno słodki) |
| `sensory_acidity` | Cyfra od `1` do `5` | Ustawia suwak **Kwasowość** (1 = brak, 5 = wyczuwalnie kwaskowaty) |
| `sensory_intensity` | Cyfra od `1` do `5` | Ustawia suwak **Intensywność aromatu** |
| `sensory_crystallization` | Cyfra od `1` do `5` | Ustawia suwak **Szybkość krystalizacji** (1 = płynny, 5 = szybki krupiec) |
| `flavor_notes` | Tekst oddzielony przecinkami | Wyświetla nuty smakowe, np. *Kwiat lipy, Mięta leśna, Żywiczny finisz* |
| `water_content_percentage` | Liczba, np. `16.4` | Wyświetla wilgotność w tabeli badań laboratoryjnych |
| `batch_number` | Tekst, np. `LIP-26/07` | Wyświetla oficjalny numer partii słoika |
| `recommended_dose` | Tekst | Wyświetla zalecane dawkowanie (np. *1-2 łyżeczki rano na czczo*) |
| `culinary_ideas` | Tekst (każdy pomysł w nowej linii) | Wyświetla listę pomysłów kulinarnych (food pairing) |

> [!TIP]
> **Jeśli nie wypełnicie tych pól:**  
> Sklep automatycznie przyjmie bezpieczne, tradycyjne wartości domyślne dla danej odmiany miodu, więc żaden produkt nigdy nie będzie wyglądał na pusty.

---

## 5. Zarządzanie pytaniami i odpowiedziami FAQ

Po aktywacji naszej wtyczki w lewym menu WordPressa pojawiła się dedykowana zakładka **Pytania FAQ**.

```
Panel WordPress (lewe menu)
└── ❓ Pytania FAQ
    ├── Wszystkie pytania FAQ  <-- lista pytań widocznych na stronie
    └── Dodaj nowe pytanie     <-- kliknij, aby dodać nowe pytanie
```

### Jak dodać nowe pytanie do sekcji FAQ na stronie głównej?
1. Kliknijcie: **Pytania FAQ $\rightarrow$ Dodaj nowe pytanie**.
2. W polu **Tytuł** wpiszcie pytanie, które często zadają Wam klienci (np. *„Czy wysyłacie miód w bezpiecznych opakowaniach chroniących szkło?”*).
3. W dużym polu tekstowym poniżej wpiszcie Waszą wyczerpującą odpowiedź.
4. Kliknijcie niebieski przycisk **„Opublikuj”**.
5. **Efekt:** Nowe pytanie od razu pojawi się w rozwijanym akordeonie na stronie głównej sklepu!

---

## 6. Prowadzenie Bloga i dodawanie filmów wideo z YouTube

Blog pozwala budować pozycję w Google (SEO) oraz dzielić się relacjami z życia pasieki wędrownej.

```
Panel WordPress (lewe menu)
└── ✍️ Wpisy
    ├── Wszystkie wpisy  <-- lista artykułów na blogu
    └── Dodaj nowy       <-- kliknij, aby opublikować nowy artykuł
```

### Jak dodać nowy wpis i wkleić wideo z pasieki?
1. Kliknijcie: **Wpisy $\rightarrow$ Dodaj nowy**.
2. **Tytuł:** Wpiszcie chwytliwy tytuł (np. *„Miodobranie lipowe 2026 – dlaczego tegoroczna lipa jest tak aromatyczna?”*).
3. **Treść:** Wpiszcie treść artykułu.
4. **Dodanie filmu z YouTube:**  
   Wystarczy wkleić w treść zwykły link do Waszego filmu z YouTube, np.:  
   `https://www.youtube.com/watch?v=af2qEqCfBTY`  
   *(Nasz system sam rozpozna film i wyświetli na blogu elegancki odtwarzacz wideo bez żadnych reklam!)*
5. **Obrazek wyróżniający:** Po prawej stronie w sekcji *Obrazek wyróżniający* wgrajcie zdjęcie z pasieki (będzie miniaturką wpisu na liście).
6. Kliknijcie **„Opublikuj”**.
7. **Efekt:** Najnowszy wpis automatycznie stanie się głównym, wyróżnionym artykułem na samej górze strony Bloga, a system sam policzy czas czytania i sformatuje datę.

---

## 7. Formularz kontaktowy — jak działa i gdzie trafiają wiadomości?

Gdy klient odwiedzi podstronę **Kontakt (`/kontakt`)** i wyśle zapytanie przez formularz:
1. Sklep przesyła dane bezpiecznym łączem do WordPressa (`POST /wp-json/pasieka/v1/contact`).
2. WordPress uruchamia funkcję `wp_mail()` i wysyła sformatowaną wiadomość na oficjalny adres e-mail administratora pasieki (`kontakt@pasiekausza.pl`).
3. **W mailu otrzymujecie:**
   * Imię i nazwisko klienta,
   * Numer telefonu klienta,
   * Adres e-mail,
   * Wybrany temat oraz treść pytania.
4. **Jak odpowiedzieć klientowi?**  
   Wiadomość ma automatycznie ustawiony nagłówek `Reply-To`. Oznacza to, że wystarczy w swoim programie pocztowym (np. na telefonie lub w poczcie) kliknąć **„Odpowiedz” (Reply)**, a Wasza odpowiedź trafi bezpośrednio do klienta!

---

## 8. Edycja podstrony „O nas” (Historia i cytat pasieki)

Chcecie zmienić motto przewodnie lub dopisać nowy fragment o historii Waszej pasieki w Ciechowie?

```
Panel WordPress (lewe menu)
└── 📄 Strony
    └── O nas  <-- kliknij Edytuj
```

1. Wejdźcie w: **Strony $\rightarrow$ Wszystkie strony $\rightarrow$ O nas**.
2. W edytorze możecie zmienić tekst opowieści lub cytat w bloku cytatu (`<blockquote>`).
3. Kliknijcie **Zaktualizuj**. Sklep natychmiast pobierze zaktualizowaną treść z WordPressa i zachowa naszą ciepłą, tradycyjną oprawę graficzną.

---

## 9. Codzienna obsługa zamówień i etykiety InPost

Gdy klient kupi miód w sklepie:

```
Panel WordPress (lewe menu)
└── 🛒 WooCommerce
    └── Zamówienia  <-- lista wszystkich zakupów klientów
```

1. **Powiadomienie:** W ułamku sekundy otrzymujecie e-mail z podsumowaniem: *„Nowe zamówienie #1234: 2x Miód Lipowy 1200g, Paczkomat WRO01A”*.
2. **Wejście w zamówienie:** Logujecie się do WordPressa $\rightarrow$ **WooCommerce $\rightarrow$ Zamówienia** $\rightarrow$ klikacie dane zamówienie.
3. **Widzicie wszystko:**
   * Jakie miody spakować,
   * Wybrany kod Paczkomatu InPost i telefon klienta,
   * Czy zamówienie jest opłacone przez BLIK / szybki przelew (status: *W trakcie realizacji*),
   * Jeśli klient wybrał fakturę B2B: pełne dane firmy i NIP do faktury.
4. **Etykieta InPost:** Klikacie przycisk **„Generuj etykietę InPost”** $\rightarrow$ drukujecie naklejkę $\rightarrow$ naklejacie na tubę z miodem i nadajecie w automacie!
5. **Zakończenie:** Zmieniacie status zamówienia na **„Zrealizowane”**. Klient automatycznie otrzymuje e-mail z podziękowaniem i kodem śledzenia paczki.

---
 
## 10. Edycja tekstów na Stronie Głównej (Co zmienia się w WordPressie, a co w kodzie?)

Sklep Pasieki Usza działa w nowoczesnej, szybkiej architekturze **Headless (React + WordPress)**. Dzięki temu treści na stronie dzielą się na dwie grupy:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TREŚCI W SKLEPIE                              │
├──────────────────────────────────┬─────────────────────────────────────┤
│   DYNAMICZNE (Z PANELU WORDPRESS)│   WIZERUNKOWE (SZKIELET DESIGNU)    │
│  - Opisy i ceny miodów w sklepie │  - Hasła główne Hero 3D             │
│  - Treści kafelków miodów        │  - Sekcja „Wędrowna pasieka...”     │
│  - Pytania i odpowiedzi FAQ      │  - Bloki „Brak standaryzacji”       │
│  - Artykuły i filmy na Blogu     │  - Sekcja „Żelazne zasady jakości”  │
│  - Opowieść na podstronie „O nas”│                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### 10.1. Opisy miodów na Stronie Głównej i w Sklepie
* **Gdzie to zmienić:** W panelu WordPress: **Produkty $\rightarrow$ Wszystkie produkty $\rightarrow$ Edytuj miód**.
* **Które pola:**
  * **Krótki opis produktu** (pod głównym edytorem): to podtytuł wyświetlany na kafelkach miodów na stronie głównej oraz w sklepie.
  * **Opis główny produktu**: szczegółowy tekst o pożytku, smaku i zbiorach.
  * **Pola własne (sensory_*, flavor_notes)**: suwaki smaku i nuty degustacyjne.
* **Efekt:** Każda zmiana opisu miodu w WooCommerce **automatycznie aktualizuje się na stronie głównej** (w sekcji „Najchętniej Wybierane Miody”), na karcie produktu oraz w modalu szybkiego zakupu.

### 10.2. Podstrona „O nas” (`/o-nas`)
* **Gdzie to zmienić:** W panelu WordPress: **Strony $\rightarrow$ Wszystkie strony $\rightarrow$ O nas**.
* **Jak to działa:** Edytując treść strony w edytorze blokowym (Gutenberg) lub klasycznym, możecie dopisywać nowe akapity o pasiece oraz zmieniać cytat. Aplikacja pobiera te teksty na żywo przez REST API (`/wp-json/wp/v2/pages?slug=o-nas`).

### 10.3. Stałe sekcje wizerunkowe Strony Głównej (np. „Wędrowna pasieka z pasją”, „Żelazne zasady jakości”)
* **Dlaczego są osadzone w szablonie?**  
  Strona główna to interaktywna aplikacja z fizyką obrotu słoików 3D, animowaną wstęgą miodową GSAP, certyfikatami weterynaryjnymi i ściśle dopasowanym układem kafelków. Aby zapewnić **błyskawiczne ładowanie strony (poniżej 1 sekundy)** i gwarancję, że nikt przypadkowo nie zepsuje precyzyjnego układu graficznego, te fundamentalne hasła brandingowe są zintegrowane w kodzie frontendu.
* **Jak zmienić te hasła, gdy zajdzie taka potrzeba?**
  * **Standardowo:** Ponieważ hasła tożsamościowe pasieki (np. zasady „Tylko dojrzały nektar”, „Promień 2 km”) zmienia się niezwykle rzadko, zmianę zgłasza się autorowi kodu — zmiana w plikach źródłowych ([`HomePage.tsx`](file:///c:/Users/kacpe/Desktop/tes/src/pages/HomePage.tsx) lub [`HoneyQualitySection.tsx`](file:///c:/Users/kacpe/Desktop/tes/src/components/HoneyQualitySection.tsx)) trwa 1–2 minuty.
  * **Opcjonalnie (jeśli właściciele chcą edytować je z WP):** Możemy w każdej chwili podpiąć te sekcje pod dedykowaną stronę `Strona Główna` w panelu WordPress, aby każde hasło dało się przepisać bezpośrednio w edytorze WordPressa.

---

### 🛡️ Złote zasady bezpieczeństwa sklepu:
1. **Hasła:** Używajcie silnego hasła do panelu WordPressa.
2. **Wtyczki:** Nie instalujcie przypadkowych, niesprawdzonych wtyczek z internetu — sklep jest zoptymalizowany i lekki, a każda zbędna wtyczka mogłaby spowolnić działanie.
3. **Aktualizacje:** Gdy w menu pojawi się informacja o aktualizacji WordPressa lub WooCommerce, klikajcie aktualizację raz w miesiącu, aby zachować najwyższe bezpieczeństwo.

---

*Podręcznik przygotowany dla Pasieki Wędrownej „Usza”. W razie jakichkolwiek pytań lub potrzeby dodania niestandardowych opcji, zawsze służymy wsparciem technicznym!*
