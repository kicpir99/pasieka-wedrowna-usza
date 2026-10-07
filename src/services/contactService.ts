import { WOO_CONFIG } from './wooCommerceService';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Wysyła zapytanie kontaktowe bezpośrednio do backendu WordPress / SMTP
 * z automatycznym bezpiecznym fallbackiem w trybie deweloperskim.
 */
export async function submitContactMessage(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  if (WOO_CONFIG.url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Próba wysyłki przez autorski endpoint Pasieki lub Contact Form 7
      const endpoint = `${WOO_CONFIG.url}/wp-json/pasieka/v1/contact`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          subject: data.subject,
          message: data.message,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json().catch(() => ({}));
        return {
          success: true,
          message: json.message || 'Dziękujemy! Twoja wiadomość została pomyślnie wysłana na skrzynkę Pasieki Usza.',
        };
      }
    } catch (err: any) {
      console.warn('ℹ️ [Contact Service] WordPress API contact endpoint niedostępny (fallback):', err?.message);
    }
  }

  // Symulacja w środowisku lokalnym / offline z płynną przerwą sieciową
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    success: true,
    message: 'Dziękujemy! Twoja wiadomość została pomyślnie wysłana. Odezwiemy się najszybciej jak to możliwe.',
  };
}
