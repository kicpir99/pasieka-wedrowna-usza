# 🍯 Pasieka Wędrowna „Usza” — Co jest jeszcze potrzebne do startu sprzedaży?
### Kompletny przewodnik, audyt operacyjny i lista materiałów dla Właścicieli Pasieki

**Dla kogo:** Magdalena i Piotr Szymkowicz (Właściciele Pasieki)  
**Data opracowania:** Październik 2026  
**Cel dokumentu:** Wskazanie krok po kroku elementów formalnych, technicznych, logistycznych i organizacyjnych, których potrzebujemy od Was, aby uruchomić oficjalną sprzedaż miodów online.

---

> [!NOTE]
> **Dobra wiadomość na start:**  
> Cała techniczna strona sklepu — naturalny, swojski i ciepły wygląd, katalog 17 produktów pszczelich, prosty i przejrzysty koszyk, kasa, dobierak miodów oraz mapa z bazą 14 901 Paczkomatów InPost — **jest już w 100% gotowa i działa**.  
> Poniższa lista to wyłącznie formalności, dane dostępowe oraz potwierdzenie Waszych zasad pakowania i sprzedaży, które musicie przekazać jako właściciele pasieki. Wszystko opisaliśmy prostym, nietechnicznym językiem.

---

## 📋 Spis Treści Checklisty

1. [Status podatkowy, fakturowanie i KSeF](#1-status-podatkowy-fakturowanie-i-ksef)
2. [Płatności online (BLIK / Szybkie przelewy Przelewy24 lub PayU)](#2-płatności-online-blik--przelewy24--payu)
3. [Konto bankowe do tradycyjnych przelewów](#3-konto-bankowe-do-tradycyjnych-przelewów)
4. [Firmowa poczta e-mail i powiadomienia (SMTP)](#4-firmowa-poczta-e-mail-i-powiadomienia-smtp)
5. [InPost — Umowa i automatyczne etykiety (Manager Paczek)](#5-inpost--umowa-i-automatyczne-etykiety-manager-paczek)
6. [Sposób pakowania przesyłek, ochrona szkła i czas wysyłki (BARDZO WAŻNE)](#6-sposób-pakowania-przesyłek-ochrona-szkła-i-czas-wysyłki-bardzo-ważne)
7. [Dane formalne do Regulaminu i Polityki Prywatności (RODO / Weterynaria)](#7-dane-formalne-do-regulaminu-i-polityki-prywatności-rodo--weterynaria)
8. [Weryfikacja cen, gramatur i stanów magazynowych (Ujednolicenie słoików)](#8-weryfikacja-cen-gramatur-i-stanów-magazynowych-ujednolicenie-słoików)
9. [Audyt treści sklepu — historia pasieki, pożytki, badania i deklaracje marketingowe](#9-audyt-treści-sklepu--historia-pasieki-pożytki-badania-i-deklaracje-marketingowe)
10. [📝 Szybki formularz do skopiowania i odesłania](#10--szybki-formularz-do-skopiowania-i-odesłania)

---

## 1. Status podatkowy, fakturowanie i KSeF

### 📥 Co dokładnie musicie nam przekazać?
1. **Informację o statusie podatkowym pasieki:**
   * Czy działacie jako **Rolnik Ryczałtowy / Rolniczy Handel Detaliczny (RHD)** zwolniony podmiotowo z VAT?
   * Czy jesteście **czynnym podatnikiem VAT** (np. jednoosobowa działalność gospodarcza / spółka)?
2. **Nazwę programu do fakturowania / księgowości:**
   * Z jakiego programu korzystacie do wystawiania faktur? (np. *Fakturownia.pl*, *wFirma*, *iFirma*, *InFakt*, *Subiekt*, itp.) lub namiary na Waszą księgową.

### 💡 Po co to jest nam potrzebne?
* **Prawidłowe stawki na paragonach i fakturach:** W formularzu zamówienia dodaliśmy opcję *„Chcę fakturę VAT na firmę (B2B)”*. Miód i produkty pszczele mają stawkę **5% VAT**, natomiast świece woskowe czy warsztaty **23% VAT** (lub zwolnienie ZW w przypadku rolnika ryczałtowego).
* **Zgodność z KSeF (Krajowym Systemem e-Faktur):**  
  Od 2026 r. transakcje między firmami (B2B) muszą trafiać do KSeF. Sklep internetowy nie powinien łączyć się bezpośrednio z serwerami rządowymi — zamiast tego łączymy WooCommerce z Waszym programem księgowym (np. Fakturownią), a to program księgowy sam, automatycznie wysyła e-fakturę do KSeF i generuje PDF dla klienta.
* **Oszczędność Waszego czasu:** Dzięki spięciu sklepu z programem księgowym nie będziecie musieli ręcznie przepisywać faktur ani wypisywać papierków.

### 🛠️ Jak to zrobić krok po kroku?
1. Jeśli macie księgową / biuro rachunkowe: wyślijcie krótkie pytanie:  
   *„Dzień dobry, uruchamiamy sklep internetowy z miodami. W jakim programie wystawiamy faktury i czy jesteśmy czynnym podatnikiem VAT, czy rolnikiem ryczałtowym?”*
2. Jeśli nie korzystacie jeszcze z żadnego programu:  
   Polecamy założyć konto na [Fakturownia.pl](https://fakturownia.pl) lub [wFirma.pl](https://wfirma.pl) — posiadają one bezpłatne/tanie wtyczki do WooCommerce, które zrobią wszystko automatycznie.

---

## 2. Płatności online (BLIK / Przelewy24 / PayU)

### 📥 Co dokładnie musicie nam przekazać?
* **Podpisanie umowy z operatorem płatności** (polecamy **Przelewy24** lub **PayU**) oraz przekazanie nam kluczy konfiguracyjnych z Waszego konta:
  * **ID Sprzedawcy (Merchant ID)**
  * **Klucz CRC**
  * **Klucz Raportów / API**  
  *(Alternatywnie: tymczasowy login i hasło do panelu Przelewy24, a my sami wkleimy klucze do sklepu).*

### 💡 Po co to jest nam potrzebne?
* Ponad **80% Polaków kupuje w internecie za pomocą BLIK-a** na telefonie lub szybkiego przelewu w swoim banku. Bez płatności online większość klientów zrezygnuje z zakupu.
* Pieniądze od klientów trafiają **bezpośrednio na Wasze konto bankowe**.
* Sklep po opłaceniu zamówienia automatycznie oznacza je jako *„Płatność przyjęta — przygotuj do wysyłki”*, więc od razu wiecie, które słoiki pakować.

### 🛠️ Jak to zrobić krok po kroku?
1. Wejdźcie na stronę **[www.przelewy24.pl](https://www.przelewy24.pl)** (lub [www.payu.pl](https://poland.payu.com)).
2. Kliknijcie **Zarejestruj się** i wybierzcie rejestrację jako firma lub gospodarstwo rolne.
3. Wypełnijcie krótki formularz z danymi pasieki i numerem konta bankowego.
4. Wykonajcie przelew weryfikacyjny (zwykle 1 zł ze swojego konta, aby potwierdzić tożsamość).
5. Po aktywacji konta (zwykle 1–2 dni robocze) wejdźcie w panelu Przelewy24 w:  
   *Moje konto $\rightarrow$ Dane integracji* i skopiujcie wygenerowane klucze, a następnie prześlijcie je nam.

---

## 3. Konto bankowe do tradycyjnych przelewów

### 📥 Co dokładnie musicie nam przekazać?
* **Oficjalny numer rachunku bankowego (26 cyfr)**
* **Pełną nazwę odbiorcy** (np. *Pasieka Wędrowna „Usza” Magdalena i Piotr Szymkowicz*)
* **Nazwę banku** (np. *Santander Bank Polska / PKO BP / Bank Spółdzielczy*)

### 💡 Po co to jest nam potrzebne?
* Część starszych klientów lub osób zamawiających większe ilości woli wykonać tradycyjny przelew ze swojego banku lub na poczcie.
* Obecnie w kasie wyświetla się przykładowy numer konta (`12 1090...`), który musimy zastąpić Waszym prawdziwym rachunkiem, aby pieniądze trafiły do Was.
* Dane te pojawią się na ekranie po zakupie oraz w mailu z potwierdzeniem.

---

## 4. Firmowa poczta e-mail i powiadomienia (SMTP)

### 📥 Co dokładnie musicie nam przekazać?
1. **Adres e-mail w domenie pasieki**, z którego sklep ma wysyłać wiadomości:
   * **Wariant polecany (dwie skrzynki):**
     * `kontakt@pasiekausza.pl` — do kontaktu z klientami, zapytań o miody i oferty.
     * `zamowienia@pasiekausza.pl` — automat wysyłający potwierdzenia zakupów i faktury.
   * **Wariant prosty (jedna skrzynka do wszystkiego):**
     * np. `kontakt@pasiekausza.pl` lub `sklep@pasiekausza.pl`.
2. **Dane dostępowe do serwera poczty (SMTP):**
   * Serwer poczty wychodzącej (np. `mail.pasiekausza.pl`)
   * Login (adres e-mail)
   * Hasło do skrzynki pocztowej
   * Port (zwykle 465 lub 587)

### 💡 Po co to jest nam potrzebne?
* **Wiarygodność i zaufanie:** Klient widząc maila z oficjalnego adresu `@pasiekausza.pl` wie, że kupuje z prawdziwej, legalnej pasieki, a nie z przypadkowego adresu prywatnego.
* **Niezawodność (uniknięcie folderu SPAM):** Jeśli sklep wysyła maile bez konfiguracji SMTP, serwery pocztowe (Gmail, Onet, WP) wrzucają potwierdzenia zamówień do spamu. Dzięki oficjalnej konfiguracji SMTP maile dochodzą w 100%.
* **Powiadomienia na Wasz telefon:** Przy każdym nowym zamówieniu natychmiast otrzymacie e-mail: *„Nowe zamówienie #1234: 2x Miód Lipowy 1200g, Paczkomat WRO01A”*.

---

## 5. InPost — Umowa i automatyczne etykiety (Manager Paczek)

### 📥 Co dokładnie musicie nam przekazać?
* **Założenie konta biznesowego w InPost Manager Paczek**
* **Klucz API InPost** oraz **ID Organizacji**  
  *(Zezwala on sklepowi na automatyczne generowanie listów przewozowych)*

### 💡 Po co to jest nam potrzebne?
* **Koniec z ręcznym wypisywaniem paczek:** Klienci wybierają swój Paczkomat na naszej mapie. Dzięki połączeniu z InPostem w panelu WordPress klikacie tylko **jeden przycisk: „Generuj etykietę InPost”**.
* Drukujecie gotową naklejkę adresową, naklejacie na paczkę i wrzucacie do dowolnego automatu InPost bez stania w kolejkach (lub kurier InPost odbiera je bezpośrednio z pasieki).
* Klient automatycznie otrzymuje SMS i e-mail z kodem odbioru i linkiem do śledzenia przesyłki.

### 🛠️ Jak to zrobić krok po kroku?
1. Wejdźcie na **[manager.paczkomaty.pl](https://manager.paczkomaty.pl)** i załóżcie darmowe konto firmowe/biznesowe.
2. Po zalogowaniu przejdźcie do zakładki: **Moje konto $\rightarrow$ API**.
3. Kliknijcie **Wygeneruj token API** i skopiujcie:
   * **Token (Klucz API)**
   * **ID Organizacji (Organization ID)**
4. Prześlijcie nam oba ciągi znaków — my wgramy je do wtyczki InPost w WordPressie.

---

## 6. Sposób pakowania przesyłek, ochrona szkła i czas wysyłki (BARDZO WAŻNE)

> [!IMPORTANT]
> **Dlaczego to jest kluczowy punkt?**  
> Miód w szklanych słoikach to towar ciężki i wrażliwy w transporcie kurierskim oraz w automatach Paczkomat. W prototypie strony użyliśmy różnych haseł marketingowych, które musimy **w 100% dostosować do Waszych faktycznych opakowań magazynowych**, aby nie wprowadzać klientów w błąd!

### 📥 Co dokładnie musimy z Wami ustalić?

#### 1. W co fizycznie pakujecie słoiki z miodem?
Na stronie obecnie pojawiają się różne określenia:
* W sklepie na górnym banerze: *„Bezpieczna dostawa w tubach”*.
* Na stronie głównej i karcie produktu: *„Pancerne tuby”*.
* W stopce sklepu: *„Bezpieczne pakowanie z tektury falistej”* oraz *„w pancernych tubach tekturowych”*.
* W koszyku zakupowym: *„Ekotuby plaster miodu z osłoną termiczną”*.

**Pytanie do Właścicieli:**
* Czy zamawiacie **sztywne okrągłe tuby tekturowe** na każdy słoik?
* Czy pakujecie miody w **kartony fasonowe z tektury falistej z kratownicą/przegródkami wewnętrznymi** na 1, 2, 3 lub 6 słoików?
* Czy używacie **papierowych owijek amortyzujących o strukturze plastra miodu** (Geami)?
* Czy stosujecie **folię bąbelkową lub rękawy powietrzne (air columns)**?  
*(Dajcie nam znać, jak dokładnie pakujecie paczkę — ujednolicimy opisy w całym sklepie, koszyku i stopce do Waszego standardu).*

#### 2. Czy stosujecie zabezpieczenia termiczne latem?
* W koszyku widnieje wzmianka o *„osłonie termicznej chroniącej biokomponenty ula przed upałem”*.
* **Pytanie do Właścicieli:** Czy rzeczywiście używacie wkładek termoizolacyjnych w okresie letnim, czy wykreślamy to zdanie z koszyka?

#### 3. Zabezpieczenie wieczka słoika:
* W opiniach klientów pojawia się wzmianka o *„plombie pasiecznej”*.
* **Pytanie do Właścicieli:** Czy Wasze słoiki posiadają papierową banderolę/plombę na wieczku, pieczęć lakową, czy standardową nakrętkę twist-off z fabrycznym klikiem?

#### 4. Deklarowany czas nadania przesyłki:
* Na stronie głównej i w sklepie widnieje: *„Wysyłka w 24h”*.
* W formularzu kasy widnieje: *„Wysyłka w 24–48h bezpośrednio z naszej dolnośląskiej pracowni”*.
* **Pytanie do Właścicieli:** Jaki jest Wasz realny czas na przygotowanie i nadanie paczki?  
  *(Zalecamy bezpieczniejszy zapis: „Wysyłka w 24–48h robocze”, chyba że gwarantujecie nadanie w 24h dla zamówień złożonych np. do godz. 12:00).*

#### 5. Gwarancja „Zero stłuczek” i procedura reklamacji szkła:
* W kasie i koszyku obiecujemy klientom: *„100% Gwarancja szkła – w razie stłuczki w transporcie wysyłamy nowy słoik w 24h na nasz koszt”*.
* **Pytanie do Właścicieli:** Czy akceptujecie taką procedurę? (Klient przesyła zdjęcie uszkodzonego słoika na maila/SMS, a Wy bez zbędnych formalności nadajecie nowy słoik na koszt pasieki). Daje to klientom ogromne poczucie bezpieczeństwa.

---

## 7. Dane formalne do Regulaminu i Polityki Prywatności (RODO / Weterynaria)

### 📥 Co dokładnie musicie nam przekazać?
Zgodnie z polskim prawem konsumenckim i sanitarnym, w stopce sklepu oraz w Regulaminie muszą znaleźć się oficjalne dane sprzedawcy żywności:
1. **Pełna nazwa podmiotu:** (np. *Gospodarstwo Pasieczne „Pasieka Wędrowna Usza” Magdalena i Piotr Szymkowicz*)
2. **Forma działalności:** (np. *Rolniczy Handel Detaliczny (RHD)*, *Działy Specjalne Produkcji Rolnej*, lub *Działalność Gospodarcza*)
3. **Numery rejestrowe:**
   * **NIP** oraz **REGON** (jeśli nadano)
   * **Weterynaryjny Numer Identyfikacyjny (WNI):** *(Bardzo ważny! Nadany przez Powiatowego Lekarza Weterynarii w Środzie Śląskiej, potwierdza legalność i badania miodu. Zaczyna się od prefiksu 02).*
4. **Adres stacjonarny:** Miejscowość, ulica, numer domu, kod pocztowy (gdzie mieści się pracownia pasieczna i punkt ewentualnego odbioru osobistego — obecnie wpisane: *ul. Łąkowa 3, 55-300 Ciechów*).
5. **Numer telefonu do kontaktu z klientami** oraz godziny, w których klienci mogą dzwonić (obecnie wpisane: *+48 697 512 103*).

---

## 8. Weryfikacja cen, gramatur i stanów magazynowych (Ujednolicenie słoików)

> [!WARNING]
> **Wykryta niespójność gramatur:**  
> W sekcji jakości na stronie głównej widniały wcześniej słoiki *450g i 900g*, natomiast w katalogu sklepu i bazie WooCommerce wprowadziliśmy słoiki **400g i 1200g**.  
> W kodzie strony ujednoliciliśmy to do bazy sklepowej (**400g i 1200g**). Prosimy o potwierdzenie, czy te gramatury odpowiadają Waszym słoikom.

Poniżej znajduje się lista 17 produktów wprowadzonych do sklepu:

| Lp. | Produkt | Gramatura | Wprowadzona Cena | Czy dostępny od ręki? |
| :---: | :--- | :---: | :---: | :---: |
| 1. | **Miód Akacjowy (RAW)** | 400g / 1200g | 36 zł / 75 zł | ✅ Dostępny |
| 2. | **Miód Lipowy (RAW)** | 400g / 1200g | 35 zł / 75 zł | ✅ Dostępny |
| 3. | **Miód Wrzosowy (Królewski)** | 400g / 1200g | 55 zł / 120 zł | ✅ Dostępny |
| 4. | **Miód ze Spadzi Iglastej** | 400g / 1200g | 48 zł / 98 zł | ✅ Dostępny |
| 5. | **Miód Wielokwiatowy Łąkowy** | 400g / 1200g | 30 zł / 65 zł | ✅ Dostępny |
| 6. | **Miód Gryczany** | 400g / 1200g | 35 zł / 75 zł | ✅ Dostępny |
| 7. | **Miód Rzepakowy Kremowany** | 400g / 1200g | 30 zł / 65 zł | ✅ Dostępny |
| 8. | **Miód Mniszkowy Majowy** | 400g / 1200g | 38 zł / 80 zł | ✅ Dostępny |
| 9. | **Miód Leśny z Maliną Leśną** | 400g / 1200g | 38 zł / 80 zł | ✅ Dostępny |
| 10. | **Miód Malinowy Letni** | 400g / 1200g | 38 zł / 80 zł | ✅ Dostępny |
| 11. | **Miód Nawłociowy (Jesienny)** | 400g / 1200g | 35 zł / 75 zł | ✅ Dostępny |
| 12. | **Miód Faceliowy** | 400g / 1200g | 34 zł / 72 zł | ✅ Dostępny |
| 13. | **Pierzga Pszczela (Bee Bread)** | 100g / 200g / 500g | 35 zł / 65 zł / 150 zł | ✅ Dostępny |
| 14. | **Propolis – Kit Pszczeli 20%** | 50 ml | 29 zł | ✅ Dostępny |
| 15. | **Pyłek Pszczeli Kwiatowy** | 200g / 500g | 28 zł / 60 zł | ✅ Dostępny |
| 16. | **Świeca z Wosku Pszczelego** | 1 szt. | 22 zł | ✅ Dostępny |
| 17. | **Odkład Pszczeli + Szkolenie** | 1 rodzina | 350 zł | ⏳ Przedsprzedaż wiosenna |

*Jeśli któraś cena ma być inna lub pojemności to np. 450g / 900g — dajcie znać, zmienimy to od razu w panelu.*

---

## 9. Audyt treści sklepu — historia pasieki, pożytki, badania i deklaracje marketingowe

### 9.1. Pożytki wędrowne Dolnego Śląska
* W prototypie wyczyściliśmy wszelkie robocze wzmianki o innych regionach (*Warmii, Mazurach*). Pasieka Usza jest w 100% dolnośląska!
* **Pytanie do Właścicieli:** Czy potwierdzacie oficjalne rejony wędrówek z ulami podawane na stronie: *Ciechów, Wzgórza Trzebnickie, Dolina Baryczy, Bory Dolnośląskie, Góry Sowie, Masyw Ślęży*?

### 9.2. Profile sensoryczne miodów (skala 1-5)
Każdy miód w sklepie posiada wizualną kartę smaku w 4 wymiarach (ocenianą od 1 do 5). Wpisaliśmy wartości według tradycyjnej wiedzy pszczelarskiej, ale prosimy o weryfikację:

| Miód | Słodycz (1-5) | Kwasowość (1-5) | Aromat (1-5) | Krystalizacja (1-5) | Konsystencja | Wasza korekta |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Lipa** | 4 | 3 | 4 | 3 | krupiec | [ ] OK / [ ] Zmień na: |
| **Wrzos** | 3 | 4 | 5 | 3 | patoka / galaretka | [ ] OK / [ ] Zmień na: |
| **Spadź iglasta** | 3 | 2 | 5 | 2 | patoka | [ ] OK / [ ] Zmień na: |
| **Akacja** | 5 | 1 | 1 | 1 | płynna (długo nie krystalizuje) | [ ] OK / [ ] Zmień na: |
| **Wielokwiat** | 4 | 2 | 2 | 4 | krupiec | [ ] OK / [ ] Zmień na: |
| **Gryka** | 3 | 4 | 5 | 3 | krupiec | [ ] OK / [ ] Zmień na: |
| **Rzepak** | 5 | 1 | 2 | 5 | kremowany | [ ] OK / [ ] Zmień na: |
| **Mniszek** | 5 | 2 | 3 | 4 | krupiec | [ ] OK / [ ] Zmień na: |
| **Leśny** | 4 | 2 | 4 | 3 | krupiec | [ ] OK / [ ] Zmień na: |
| **Malina** | 4 | 2 | 3 | 3 | krupiec | [ ] OK / [ ] Zmień na: |
| **Nawłoć** | 4 | 3 | 4 | 4 | krupiec | [ ] OK / [ ] Zmień na: |
| **Facelia** | 4 | 2 | 2 | 3 | krupiec | [ ] OK / [ ] Zmień na: |

### 9.3. Bukiety i nuty smakowe
* Obecnie w kodzie filtrów mamy 41 nut smakowych (*Kwiat lipy, Żywica jodłowa, Palony karmel, Melasa, Białe kwiaty...*).
* **Pytanie do Właścicieli:** Czy zostawić 41 nut, czy uprościć do 12–15 głównych (*kwiatowy, lipowy, ziołowy, leśny, żywiczny, karmelowy, owocowy, cytrusowy, wytrawny, łagodny*)?

### 9.4. Badania laboratoryjne vs Certyfikat Weterynaryjny PIW Środa Śląska
* Na karcie każdego miodu zaprogramowaliśmy zakładkę „Badania Laboratoryjne” z parametrami: wilgotność (np. 16.4%), liczba diastazowa (np. 18.2 DN), HMF, przewodność.
* **Pytanie do Właścicieli:** Czy wykonujecie badania fizykochemiczne każdej partii w laboratorium i chcecie publikować te liczby, czy wolicie oficjalne **„Świadectwo Jakości i Certyfikat Pasieki Usza”** (WNI, coroczny nadzór PIW Środa Śląska, badania AFB i gwarancja 100% miodu RAW)?

### 9.5. Historia pasieki i dane stacjonarne
* **Rok założenia pasieki:** Na stronie głównej widnieje *„Od 1984 r.”*, a w sekcji O nas *„Po ponad 10 latach pracy z pszczołami”*. Jaki oficjalny rok tradycji wpisać?
* **Liczba rodzin pszczelich:** Czy podawać liczbę uli (np. *150 uli wędrownych*), czy ogólne sformułowanie *„kilkadziesiąt rodzin pszczelich prowadzonych wędrownie”*?

### 9.6. Oferta specjalna: B2B, Odkłady i Skarby Ula
* **Zestawy dla firm (B2B):** Czy realizujecie zamówienia na kosze prezentowe i zestawy miodów dla firm?
* **Produkt #17 – Odkład pszczeli ze szkoleniem (350 zł):** Czy w sezonie 2026/2027 sprzedajecie odkłady i prowadzicie szkolenia przy ulu w Ciechowie, czy ukryć ten produkt?

### 9.7. Koszty dostawy, darmowa wysyłka i opinie klientów
* **Próg darmowej dostawy:** Ustawiliśmy **darmową dostawę od 180 zł** (Paczkomat 15 zł, Kurier InPost 18 zł). Czy próg 180 zł Wam odpowiada?
* **Opinie klientów:** Czy macie 3–5 prawdziwych opinii od stałych klientów (np. z Facebooka lub wizytówki Google), które możemy wkleić zamiast wpisów przykładowych?
* **Materiały wideo:** Na blogu osadzony jest film z YouTube (*af2qEqCfBTY* - *Zimowanie pszczół*). Czy to Wasz kanał, czy podmienić wideo?

---

## 10. 📝 Szybki formularz do skopiowania i odesłania

Możecie skopiować poniższy blok tekstu, uzupełnić brakujące dane i odesłać go nam w mailu lub komunikatorze:

```text
==================================================================
PAKIET STARTOWY DLA PASIEKI USZA — FORMULARZ DANYCH I WERYFIKACJI
==================================================================

1. DANE FORMALNE I WETERYNARYJNE:
   - Pełna nazwa pasieki/firmy: 
   - Imię i nazwisko właścicieli: Magdalena i Piotr Szymkowicz
   - Dokładny adres pasieki (do odbioru i faktur): 
   - NIP (jeśli jest): 
   - Weterynaryjny Numer Identyfikacyjny (WNI z PIW Środa Śląska): 
   - Telefon do kontaktu z klientami: 
   - Godziny kontaktu telefonicznego i odbioru osobistego: 

2. HISTORIA I SKALA PASIEKI:
   - Oficjalny rok założenia / tradycji (np. 1984 czy inny): 
   - Liczba rodzin pszczelich / uli (podawać na stronie czy pominąć): 
   - Główne rejony wędrówek z ulami na Dolnym Śląsku: 

3. PAKOWANIE PRZESYŁEK I BEZPIECZEŃSTWO SZKŁA (BARDZO WAŻNE):
   - W co fizycznie pakujecie słoiki do wysyłki?:
     [ ] Sztywne okrągłe tuby tekturowe
     [ ] Kartony fasonowe z kratownicą/przegródkami z tektury falistej
     [ ] Papierowe owijki o strukturze plastra miodu
     [ ] Folia bąbelkowa / rękawy powietrzne
     [ ] Inne: _____________________________________________
   - Czy stosujecie zabezpieczenia termiczne w upały?: [ ] Tak / [ ] Nie
   - Czy słoiki mają banderolę/plombę na wieczku?: [ ] Tak / [ ] Nie
   - Realny czas nadania paczki: [ ] 24h / [ ] 24-48h robocze
   - Czy akceptujecie gwarancję dosyłki nowego słoika w razie stłuczki?: [ ] Tak / [ ] Nie

4. PODATKI, KSIĘGOWOŚĆ I FAKTURY (KSeF):
   - Forma opodatkowania: [ ] Rolnik ryczałtowy / RHD (zwolniony z VAT)
                         [ ] Czynny podatnik VAT
   - Program do wystawiania faktur (np. Fakturownia / wFirma / inny): 
   - Kontakt do księgowej (opcjonalnie): 

5. PŁATNOŚCI ONLINE (Przelewy24 / PayU):
   - Status umowy: [ ] Podpisana / [ ] W trakcie rejestracji
   - ID Sprzedawcy (Merchant ID): 
   - Klucz CRC: 
   - Klucz API / Raportów: 

6. RACHUNEK BANKOWY (Do przelewów tradycyjnych):
   - Numer konta IBAN (26 cyfr): 
   - Nazwa banku: 
   - Nazwa odbiorcy: 

7. INPOST (Manager Paczek):
   - Status konta: [ ] Założone / [ ] Czeka na rejestrację
   - Token API: 
   - ID Organizacji: 

8. POCZTA E-MAIL (SMTP):
   - Preferowany adres (np. kontakt@pasiekausza.pl): 
   - Hasło do skrzynki (lub dostęp do hostingu): 

9. WERYFIKACJA OFERTY I PARAMETRÓW:
   - Gramatury słoików w pasiece: [ ] 400g i 1200g / [ ] 450g i 900g / [ ] Inne: _____
   - Próg darmowej dostawy: [ ] 180 zł jest OK / [ ] Zmień na: _____ zł
   - Bukiety smakowe: [ ] Zostawić 41 szczegółowych / [ ] Uprościć do 12-15 głównych
   - Badania laboratoryjne: [ ] Podajemy parametry liczbowe / [ ] Jeden Certyfikat Jakości PIW
   - Odkłady pszczele i szkolenia: [ ] Zostawić w ofercie / [ ] Ukryć na start sprzedaży
   - Zestawy prezentowe B2B dla firm: [ ] Tak, oferujemy / [ ] Ukryć na start
   - Prawdziwe opinie klientów: (można wkleić 2-3 cytaty lub link do profilu)
   - Zmiany w cenach miodów z tabeli: (wpisz jeśli któreś ceny mają ulec zmianie)
==================================================================
```

---

*Dokument przygotowany z myślą o prostym i bezpiecznym wdrożeniu sklepu Pasieki Wędrownej „Usza”. W razie jakichkolwiek pytań służymy pomocą przy każdym z powyższych kroków!*
