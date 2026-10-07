# 🍯 Pasieka Wędrowna „Usza” — Co jest jeszcze potrzebne do startu sprzedaży?
### Kompletny przewodnik i lista materiałów dla Właścicieli Pasieki

**Dla kogo:** Magdalena i Piotr Szymkowicz (Właściciele Pasieki)  
**Data opracowania:** Październik 2026  
**Cel dokumentu:** Wskazanie krok po kroku elementów formalnych, technicznych i organizacyjnych, których potrzebujemy od Was, aby uruchomić oficjalną sprzedaż miodów online.

---

> [!NOTE]
> **Dobra wiadomość na start:**  
> Cała techniczna strona sklepu — naturalny, swojski i ciepły wygląd, katalog 17 produktów pszczelich, prosty i przejrzysty koszyk, kasa, dobierak miodów oraz mapa z bazą 14 901 Paczkomatów InPost — **jest już w 100% gotowa i działa**.  
> Poniższa lista to wyłącznie formalności i dane dostępowe, które musicie przekazać jako właściciele firmy/pasieki. Wszystko opisaliśmy prostym, nietechnicznym językiem.

---

## 📋 Spis Treści Checklisty

1. [Status podatkowy, fakturowanie i KSeF](#1-status-podatkowy-fakturowanie-i-ksef)
2. [Płatności online (BLIK / Szybkie przelewy Przelewy24 lub PayU)](#2-płatności-online-blik--przelewy24--payu)
3. [Konto bankowe do tradycyjnych przelewów](#3-konto-bankowe-do-tradycyjnych-przelewów)
4. [Firmowa poczta e-mail i powiadomienia (SMTP)](#4-firmowa-poczta-e-mail-i-powiadomienia-smtp)
5. [InPost — Umowa i automatyczne etykiety (Manager Paczek)](#5-inpost--umowa-i-automatyczne-etykiety-manager-paczek)
6. [Dane formalne do Regulaminu i Polityki Prywatności (RODO / Weterynaria)](#6-dane-formalne-do-regulaminu-i-polityki-prywatności-rodo--weterynaria)
7. [Weryfikacja cen, gramatur i stanów magazynowych](#7-weryfikacja-cen-gramatur-i-stanów-magazynowych)
8. [Audyt treści sklepu — elementy testowe wymagające Waszej weryfikacji](#8-audyt-treści-sklepu--elementy-testowe-wymagające-waszej-weryfikacji)
   * [8.1. Profile sensoryczne miodów (Słodycz, Kwasowość, Aromat, Krystalizacja)](#81-profile-sensoryczne-miodów-skala-1-5)
   * [8.2. Bukiety i nuty smakowe (selekcja z 41 obecnych)](#82-bukiety-i-nuty-smakowe)
   * [8.3. Badania laboratoryjne vs Certyfikat Weterynaryjny PIW](#83-badania-laboratoryjne-vs-certyfikat-weterynaryjny-piw)
   * [8.4. Spójność historii pasieki i dane stacjonarne (Sekcja „O nas” i Kontakt)](#84-spójność-historii-pasieki-i-dane-stacjonarne)
   * [8.5. Koszyki prezentowe B2B, Odkłady pszczele i Szkolenia](#85-oferta-specjalna-b2b-odkłady-i-szkolenia)
   * [8.6. Koszty dostawy, darmowa wysyłka i opinie klientów](#86-koszty-dostawy-darmowa-wysyłka-i-opinie-klientów)
9. [📝 Szybki formularz do skopiowania i odesłania](#-szybki-formularz-do-skopiowania-i-odesłania)

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

### 🛠️ Jak to zrobić krok po kroku?
* Wystarczy skopiować numer konta z Waszej bankowości internetowej lub umowy rachunku i wpisać go w formularzu na dole tego dokumentu.

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
* **Wiarygodność i zaufanie:** Klient widząc maila z oficjalnego adresu `@pasiekausza.pl` wie, że kupuje z prawdziwej, legalnej pasieki, a nie z przypadkowego adresu prywatnego (np. gmail czy wp.pl).
* **Niezawodność (uniknięcie folderu SPAM):** Jeśli sklep wysyła maile bez konfiguracji SMTP, serwery pocztowe (Gmail, Onet, WP) wrzucają potwierdzenia zamówień do spamu. Dzięki oficjalnej konfiguracji SMTP maile dochodzą w 100%.
* **Powiadomienia na Wasz telefon:** Przy każdym nowym zamówieniu natychmiast otrzymacie e-mail: *„Nowe zamówienie #1234: 2x Miód Lipowy 1200g, Paczkomat WRO01A”*.

### 🛠️ Jak to zrobić krok po kroku?
1. Zalogujcie się do panelu hostingu, gdzie zarejestrowana jest domena `pasiekausza.pl` (np. *Cyberfolks*, *LH.pl*, *OVH*, *dhosting*, itp.).
2. Wejdźcie w zakładkę **Konta pocztowe / E-mail** i kliknijcie **Utwórz nową skrzynkę**.
3. Utwórzcie skrzynkę (np. `kontakt@pasiekausza.pl`), ustawcie bezpieczne hasło i prześlijcie nam te dane.

---

## 5. InPost — Umowa i automatyczne etykiety (Manager Paczek)

### 📥 Co dokładnie musicie nam przekazać?
* **Założenie konta biznesowego w InPost Manager Paczek**
* **Klucz API InPost** oraz **ID Organizacji**  
  *(Zezwala on sklepowi na automatyczne generowanie listów przewozowych)*

### 💡 Po co to jest nam potrzebne?
* **Koniec z ręcznym wypisywaniem paczek:** Klienci wybierają swój Paczkomat na naszej mapie. Dzięki połączeniu z InPostem w panelu WordPress klikacie tylko **jeden przycisk: „Generuj etykietę InPost”**.
* Drukujecie gotową naklejkę adresową, naklejacie na ekotubę i wrzucacie do dowolnego automatu InPost bez stania w kolejkach (lub kurier InPost odbiera je bezpośrednio z pasieki).
* Klient automatycznie otrzymuje SMS i e-mail z kodem odbioru i linkiem do śledzenia przesyłki.

### 🛠️ Jak to zrobić krok po kroku?
1. Wejdźcie na **[manager.paczkomaty.pl](https://manager.paczkomaty.pl)** i załóżcie darmowe konto firmowe/biznesowe.
2. Po zalogowaniu przejdźcie do zakładki: **Moje konto $\rightarrow$ API**.
3. Kliknijcie **Wygeneruj token API** i skopiujcie:
   * **Token (Klucz API)**
   * **ID Organizacji (Organization ID)**
4. Prześlijcie nam oba ciągi znaków — my wgramy je do wtyczki InPost w WordPressie.

---

## 6. Dane formalne do Regulaminu i Polityki Prywatności (RODO / Weterynaria)

### 📥 Co dokładnie musicie nam przekazać?
Zgodnie z polskim prawem konsumenckim i sanitarnym, w stopce sklepu oraz w Regulaminie muszą znaleźć się oficjalne dane sprzedawcy żywności:
1. **Pełna nazwa podmiotu:** (np. *Gospodarstwo Pasieczne „Pasieka Wędrowna Usza” Magdalena i Piotr Szymkowicz*)
2. **Forma działalności:** (np. *Rolniczy Handel Detaliczny (RHD)*, *Działy Specjalne Produkcji Rolnej*, lub *Działalność Gospodarcza*)
3. **Numery rejestrowe:**
   * **NIP** oraz **REGON** (jeśli nadano)
   * **Weterynaryjny Numer Identyfikacyjny (WNI):** *(Bardzo ważny! Nadany przez Powiatowego Lekarza Weterynarii, potwierdza legalność i badania miodu).*
4. **Adres stacjonarny:** Miejscowość, ulica, numer domu, kod pocztowy (gdzie mieści się pracownia pasieczna i punkt ewentualnego odbioru osobistego).
5. **Numer telefonu do kontaktu z klientami** oraz godziny, w których klienci mogą dzwonić (np. *pon.-pt. 8:00 - 18:00*).

### 💡 Po co to jest nam potrzebne?
* **Wymóg prawny:** Każdy sklep internetowy w Polsce musi posiadać regulamin zgodny z ustawą o prawach konsumenta i RODO.
* **Zaufanie kupujących:** Świadomi klienci sprawdzają, czy pasieka posiada WNI i legalny nadzór weterynaryjny. Dla miodów rzemieślniczych jest to kluczowy znak jakości.
* **Ochrona pasieki:** Prawidłowy regulamin zabezpiecza Was w sprawach reklamacji, zwrotów żywności (miód jako produkt spożywczy w zapieczętowanym słoiku podlega specjalnym regułom zwrotu).

---

## 7. Weryfikacja cen, gramatur i stanów magazynowych

### 📥 Co dokładnie musicie sprawdzić?
Poniżej znajduje się lista 17 produktów, które wprowadziliśmy do bazy sklepu. Rzućcie okiem, czy podane ceny i dostępności odpowiadają aktualnemu stanowi w pracowni pasiecznej:

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

*Jeśli któraś cena ma być inna lub któryś miód jest chwilowo wyprzedany — dajcie nam znać, zmienimy to od razu w panelu.*

---

## 8. Audyt treści sklepu — elementy testowe wymagające Waszej weryfikacji

Podczas budowy prototypu wprowadziliśmy szereg parametrów, które były niezbędne do zaprogramowania filtrów, porównywarki i kart produktów. **Poniżej zestawiliśmy wszystkie elementy, które wymagają Waszego autorskiego zatwierdzenia lub korekty:**

---

### 8.1. Profile sensoryczne miodów (skala 1-5)
Każdy miód w sklepie posiada wizualną kartę smaku w 4 wymiarach (ocenianą od 1 do 5). Wpisaliśmy wartości według tradycyjnej wiedzy pszczelarskiej, ale **prosimy o weryfikację według Waszego podniebienia i specyfiki Waszych miodobrań**:

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

*Gdzie: 1 = bardzo niska / delikatna, 5 = bardzo wysoka / dominująca.*

---

### 8.2. Bukiety i nuty smakowe
Obecnie w kodzie filtrów i na kartach mamy aż **41 różnych nut smakowych**:  
> *Kwiat lipy, Mięta leśna, Żywica jodłowa, Palony karmel, Melasa, Białe kwiaty, Kwiat akacji, Majowy mniszek, Owoce leśne, Kwas chlebowy, Ferment ulowy, Gorzka pomarańcza, Ciepły wosk, Nuta dębowa, Nuta marcepanowa, Cytrynowa rześkość...*

* **Pytanie do Właścicieli:**  
  Czy chcecie utrzymać tak bogaty bukiet (41 nut), czy **wolice, abyśmy uprościli listę do 12–15 najbardziej naturalnych i zrozumiałych dla każdego klienta** (np. *kwiatowy, lipowy, ziołowy, leśny, żywiczny, karmelowy, owocowy, cytrusowy, wytrawny, łagodny*)?

---

### 8.3. Badania laboratoryjne vs Certyfikat Weterynaryjny PIW
Na karcie każdego miodu w sklepie zaprogramowaliśmy zakładkę **„Badania Laboratoryjne”**, gdzie obecnie wyświetlają się przykładowe parametry:
* Zawartość wody (np. *16.4%* dla lipy, *19.2%* dla wrzosu),
* Liczba diastazowa DN (np. *18.2 DN*, norma min. 8),
* HMF i przewodność elektryczna,
* Dla odkładów pszczelich wstawiono tymczasowy testowy wpis: *WNI 28143502 (PIW Ostróda)* — co wymaga zmiany na Wasz dolnośląski numer z PIW Środa Śląska!

* **Pytanie do Właścicieli:**  
  1. Czy zlecacie regularne badania fizykochemiczne każdej partii w laboratorium (np. Puławy, Instytut Pszczelnictwa, Eurofins) i chcecie publikować dokładne wyniki w sklepie?  
  2. **Czy wolicie prostsze, bezpieczniejsze rozwiązanie:** zamienić tę zakładkę na oficjalne **„Świadectwo Jakości i Weterynaryjny Certyfikat Pasieki Usza”**, gdzie prezentujemy Wasz legalny numer WNI, potwierdzenie corocznych badań zdrowotności pasieki przez Powiatowego Lekarza Weterynarii i gwarancję 100% naturalnego miodu?

---

### 8.4. Spójność historii pasieki i dane stacjonarne
Przeglądając teksty na podstronach wykryliśmy drobne rozbieżności, które warto ujednolicić:
1. **Rok założenia pasieki:**
   * W jednym miejscu na stronie głównej widnieje: *„Od 1984 r.”*, natomiast w zakładce O nas napisane jest: *„Po ponad 10 latach pracy z pszczołami”*.
   * **Do ustalenia:** Jaki oficjalny rok założenia / tradycji pszczelarskiej mamy wpisać na stronie głównej?
2. **Liczba rodzin pszczelich / uli:**
   * Czy podajemy oficjalną liczbę pni wędrownych (np. *150 uli wędrownych*), czy ogólne sformułowanie *„kilkadziesiąt rodzin pszczelich prowadzonych wędrownie”*?
3. **Dokładny adres stacjonarny:**
   * W zakładce Kontakt wpisana jest *ul. Łąkowa 3, 55-300 Ciechów*, a w szablonie faktury pojawiła się *ul. Lipowa 12*.
   * **Do ustalenia:** Jaki jest dokładny adres pocztowy i adres do ewentualnego odbioru słoików na miejscu?

---

### 8.5. Oferta specjalna B2B, Odkłady i Szkolenia
1. **Zestawy prezentowe dla firm (B2B):**
   * Na stronie Oferta prezentujemy kosze prezentowe, zestawy w drewnianych skrzynkach i ekotubach z miodem. Czy rzeczywiście realizujecie takie zamówienia dla lokalnych firm i urzędów?
2. **Produkt #17: Odkład Pszczeli + Szkolenie (350 zł):**
   * Czy w sezonie wiosennym 2027 planujecie faktycznie sprzedawać odkłady pszczele na ramce wielkopolskiej/dadant i prowadzić warsztaty, czy ten produkt na start sprzedaży miodów ukryć?

---

### 8.6. Koszty dostawy, darmowa wysyłka i opinie klientów
1. **Próg darmowej dostawy:**
   * W kasie ustawiliśmy: Paczkomat 15 zł, Kurier 18 zł, **Darmowa dostawa od 180 zł** (co oznacza zakup średnio 2 dużych słoików miodu lub 4–5 małych). Czy ten próg Wam odpowiada, czy wolicie go podnieść (np. 200 zł) lub obniżyć (np. 150 zł)?
2. **Opinie i recenzje na stronie:**
   * Na stronie głównej i przy miodach wyświetlają się obecnie przykładowe recenzje (Marek K. z Wrocławia, Barbara M. z Legnicy itp.).
   * **Do ustalenia:** Czy macie kilka prawdziwych opinii od swoich stałych klientów (np. z Facebooka, wizytówki Google lub SMS-ów), które możemy tam wkleić, czy wolicie zacząć z czystym kontem opinii zbieranych przez sklep?
3. **Klub Miodowy / Subskrypcja cykliczna:**
   * W sklepie zaprogramowaliśmy opcję „Subskrybuj z dostawą co 30, 60 lub 90 dni z 10% rabatem”. Czy chcecie uruchomić tę opcję od razu, czy zostawić ją jako II etap rozwoju sklepu?

---

## 📝 Szybki formularz do skopiowania i odesłania

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
   - Weterynaryjny Numer Identyfikacyjny (WNI): 
   - Telefon do kontaktu z klientami: 
   - Godziny kontaktu i odbioru osobistego: 

2. HISTORIA PASIEKI:
   - Oficjalny rok założenia / tradycji (np. 1984 czy inny): 
   - Liczba rodzin pszczelich / uli (podawać czy pominąć): 

3. PODATKI, KSIĘGOWOŚĆ I FAKTURY (KSeF):
   - Forma opodatkowania: [ ] Rolnik ryczałtowy / RHD (zwolniony z VAT)
                         [ ] Czynny podatnik VAT
   - Program do wystawiania faktur (np. Fakturownia / wFirma / inny): 
   - Kontakt do księgowej (opcjonalnie): 

4. PŁATNOŚCI ONLINE (Przelewy24 / PayU):
   - Status umowy: [ ] Podpisana / [ ] W trakcie rejestracji
   - ID Sprzedawcy (Merchant ID): 
   - Klucz CRC: 
   - Klucz API / Raportów: 

5. RACHUNEK BANKOWY (Do przelewów tradycyjnych):
   - Numer konta IBAN (26 cyfr): 
   - Nazwa banku: 
   - Nazwa odbiorcy: 

6. INPOST (Manager Paczek):
   - Status konta: [ ] Założone / [ ] Czeka na rejestrację
   - Token API: 
   - ID Organizacji: 

7. POCZTA E-MAIL (SMTP):
   - Preferowany adres (np. kontakt@pasiekausza.pl): 
   - Hasło do skrzynki (lub dostęp do hostingu): 

8. WERYFIKACJA OFERTY I PARAMETRÓW:
   - Gramatury słoików: [ ] Potwierdzam 400g i 1200g / [ ] Zmień na:
   - Próg darmowej dostawy: [ ] 180 zł jest OK / [ ] Zmień na: _____ zł
   - Bukiety smakowe: [ ] Zostawić 41 szczegółowych / [ ] Uprościć do 12-15 głównych
   - Badania lab: [ ] Podajemy parametry z badań / [ ] Jeden oficjalny Certyfikat PIW
   - Odkłady pszczele i szkolenia: [ ] Zostawić w ofercie / [ ] Ukryć na start
   - Subskrypcja miodowa (co miesiąc): [ ] Włączona od razu / [ ] Na później
   - Zmiany w cenach z tabeli: (wpisz jeśli któreś ceny mają ulec zmianie)
==================================================================
```

---

*Dokument przygotowany z myślą o prostym i bezpiecznym wdrożeniu sklepu Pasieki Wędrownej „Usza”. W razie jakichkolwiek pytań służymy pomocą przy każdym z powyższych kroków!*
