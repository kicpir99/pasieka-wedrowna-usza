# 🐝 Pasieka Wędrowna „Usza” — Raport Wdrożeniowy i Instrukcja dla Właścicieli

**Wersja dokumentu:** 1.0 (Wersja Produkcyjna)  
**Data:** Październik 2026  
**Status projektu:** Frontend w 100% zintegrowany z WooCommerce API  

---

## 📌 Podsumowanie Wykonanych Prac (Co jest w 100% gotowe)

Sklep internetowy Pasieki Wędrownej „Usza” został zbudowany w nowoczesnej architekturze **Headless e-Commerce** (superszybki, luksusowy interfejs w React połączony w tle z panelem zarządzania WordPress/WooCommerce).

### ✅ 1. Pełna baza 17 produktów w WooCommerce
Wszystkie miody odmianowe oraz produkty pszczele zostały automatycznie zaimportowane przez API do bazy WooCommerce ze swoimi unikalnymi identyfikatorami:
* **Miód Akacjowy** (`ID: 37`)
* **Miód Lipowy** (`ID: 50`)
* **Miód Wrzosowy** (`ID: 52`)
* **Miód ze Spadzi Iglastej** (`ID: 54`)
* **Miód Wielokwiatowy** (`ID: 56`)
* **Miód Gryczany** (`ID: 58`)
* **Miód Rzepakowy** (`ID: 60`)
* **Miód Mniszkowy** (`ID: 62`)
* **Miód Leśny** (`ID: 64`)
* **Miód Malinowy** (`ID: 66`)
* **Miód Nawłociowy** (`ID: 68`)
* **Miód Faceliowy** (`ID: 70`)
* **Pierzga Pszczela (Bee Bread)** (`ID: 72`)
* **Propolis – Kit Pszczeli** (`ID: 74`)
* **Pyłek Pszczeli Kwiatowy** (`ID: 76`)
* **Świeca z Wosku Pszczelego** (`ID: 78`)
* **Odkład Pszczeli + Szkolenie** (`ID: 80`)

Każdy produkt posiada przypisaną kategorię, ceny, opisy oraz komplet parametrów rzemieślniczych (rok zbioru, lokalizacja pasieki, zawartość wody, profil sensoryczny).

### ✅ 2. W pełni natywna kasa (Zero przeskakiwania na surowego WordPressa)
* Klient przechodzi cały proces zakupu bezpośrednio w eleganckim, autorskim interfejsie.
* Wybór metod dostawy: **Paczkomat InPost (15 zł / gratis od 180 zł)**, **Kurier InPost (18 zł / gratis od 180 zł)**, **Odbiór osobisty w pasiece (0 zł)**.
* Metody płatności: **BLIK**, **Szybki przelew Przelewy24**, **Płatność przy odbiorze (Pobranie)** oraz **Tradycyjny przelew**.
* Po złożeniu zamówienia klient otrzymuje dedykowany, luksusowy ekran z podziękowaniem i numerem zamówienia, a dane transakcji natychmiast trafiają do panelu WooCommerce.

### ✅ 3. Autentyczna mapa i baza Paczkomatów InPost
* Zintegrowano oficjalną bazę **14 901 prawdziwych Paczkomatów InPost** (cały Dolny Śląsk, Lubań, Wrocław z wszystkimi dzielnicami i ulicami, oraz wszystkie polskie miasta).
* Wyszukiwarka z lupką pozwala wpisać dowolną ulicę (np. *Strzegomska*), miasto (*Lubań*) lub kod automatu (*WRO01A*).
* Interaktywna mapa OpenStreetMap/Leaflet działa bezawaryjnie bez konieczności podawania tokenów czy NIP-u.

### ✅ 4. Bezpieczeństwo i polityka kont użytkowników
* Domyślnie zakup odbywa się jako **Gość** (najwyższa konwersja, klient nie jest zmuszany do rejestracji).
* Opcjonalna rejestracja wymaga bezpiecznego hasła (min. 8 znaków z cyfrą lub wielką literą) z wizualnym wskaźnikiem siły hasła i przyciskiem podglądu (ikonka oka).
* Przycisk śledzenia w panelu *Moje Konto* wyświetla się wyłącznie klientom posiadającym konto.

---

## 📋 Lista Zadań dla Właścicieli Pasieki (Przed startem sprzedaży)

Poniżej znajduje się lista 5 kroków konfiguracyjnych, które właściciele pasieki muszą uzupełnić w panelu WordPress/WooCommerce:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CHECKLISTA WŁAŚCICIELI PASIEKI                       │
├────┬──────────────────────────────────────────┬────────────────────────┤
│ 1. │ Aktywacja produkcyjna Przelewy24 / PayU  │ Wymaga umowy z bramką  │
│ 2. │ Podanie właściwego numeru konta pasieki  │ Wpisanie w kod / panel │
│ 3. │ Konfiguracja wysyłki e-maili (SMTP)      │ Poczta ze sklepu       │
│ 4. │ Podpięcie umowy InPost (Manager Paczek)  │ Generowanie etykiet    │
│ 5. │ Weryfikacja Regulaminu i Polityki RODO   │ Podstawa prawna sklepu │
└────┴──────────────────────────────────────────┴────────────────────────┘
```

---

### Krok 1: Produkcyjna Bramka Płatności (Przelewy24 / BLIK)
Aby klienci mogli rzeczywiście opłacać zamówienia przez BLIK i karty:
1. Właściciele pasieki podpisują umowę z operatorem płatności (np. **Przelewy24** lub **PayU**).
2. Po aktywacji konta operator przekazuje dane dostępowe:
   * **ID Sprzedawcy (Merchant ID)**
   * **Klucz CRC**
   * **Klucz API / Raportów**
3. W panelu WordPress: przejdź do **WooCommerce $\rightarrow$ Ustawienia $\rightarrow$ Płatności $\rightarrow$ Przelewy24**.
4. Wklej otrzymane klucze i **odznacz opcję „Tryb testowy / Sandbox”**.
5. Zapisz zmiany.

---

### Krok 2: Numer Konta do Tradycyjnego Przelewu
Dla klientów wybierających tradycyjny przelew bankowy obecnie wyświetla się przykładowy numer konta:
`12 1090 2398 0000 0001 4820 9123`

* **Zadanie dla Właścicieli:**  
  Przekazać oficjalny numer rachunku bankowego pasieki, nazwę odbiorcy oraz bank, aby zaktualizować go w kodzie kasy i w szablonie wiadomości e-mail w WooCommerce.

---

### Krok 3: Poczta e-mail i powiadomienia (SMTP)
Aby potwierdzenia zamówień do klientów i powiadomienia o nowym zakupie do pasieki dochodziły w 100% niezawodnie (i nie wpadały do spamu):
1. W panelu WordPress wejdź w **Wtyczki $\rightarrow$ Dodaj nową** i zainstaluj **WP Mail SMTP** (darmowa wtyczka).
2. Skonfiguruj wysyłkę z oficjalnego adresu e-mail pasieki (np. `kontakt@pasiekausza.pl` lub `sklep@pasiekausza.pl`).
3. W **WooCommerce $\rightarrow$ Ustawienia $\rightarrow$ E-maile** upewnij się, że pole *„Adres odbiorcy powiadomień o nowym zamówieniu”* wskazuje adres mailowy właściciela pasieki.

---

### Krok 4: Umowa z InPostem (Manager Paczek)
Aby jednym kliknięciem generować etykiety nadawcze na paczkomaty i dla kuriera:
1. Zarejestruj pasiekę w usłudze **InPost Manager Paczek** (dla firm lub klientów biznesowych).
2. W WordPressie zainstaluj bezpłatną wtyczkę **InPost PL** (oficjalna wtyczka InPostu dla WooCommerce).
3. Podaj w niej swój klucz API z Managera Paczek.
4. **Efekt:** Przy każdym zamówieniu w panelu WordPress pojawi się przycisk *„Wygeneruj etykietę InPost”* — wystarczy kliknąć, wydrukować naklejkę i nakleić na ekotubę z miodem!

---

### Krok 5: Dane Firmowe, Regulamin i RODO
W zakładce **Regulamin** oraz **Polityka Prywatności** na stronie należy uzupełnić:
* Pełną nazwę podmiotu (np. *Gospodarstwo Pasieczne / Rolniczy Handel Detaliczny (RHD) / NIP / Weterynaryjny Numer Identyfikacyjny WNI*),
* Adres pasieki i dane do kontaktu telefonicznego,
* Prawo odstąpienia od umowy i informacje o reklamacjach żywności.

---

## 🍯 Jak zarządzać sklepem na co dzień (Dla Właścicieli Pasieki)

### 1. Gdzie sprawdzam nowe zamówienia?
* Zaloguj się na `https://sklep.pasiekausza.pl/wp-admin`.
* W menu po lewej kliknij **WooCommerce $\rightarrow$ Zamówienia**.
* Zobaczysz listę zamówień z numerami, nazwiskami klientów, wybranym paczkomatem i kwotą.
* Po spakowaniu słoików zmień status z *W trakcie realizacji* na *Zrealizowane* — klient automatycznie otrzyma e-mail z informacją, że miód jest w drodze!

### 2. Jak zmienić cenę miodu lub oznaczyć brak w magazynie?
* W menu kliknij **Produkty $\rightarrow$ Wszystkie produkty**.
* Kliknij np. *Miód Lipowy*.
* W sekcji *Dane produktu*:
  * Zmień **Cenę standardową** (np. z 35 na 38 zł).
  * W zakładce *Magazyn* możesz zmienić stan na *Brak w magazynie* (wtedy na stronie głównej automatycznie pojawi się oznaczenie „Wyprzedany w tym sezonie”).
* Kliknij niebieski przycisk **Zaktualizuj** po prawej stronie. Zmiana pojawi się w sklepie!

---

*Dokument przygotowany dla zespołu Pasieki Wędrownej „Usza”. W razie pytań technicznych frontend i konfiguracja API są w pełni udokumentowane w repozytorium projektu.*
