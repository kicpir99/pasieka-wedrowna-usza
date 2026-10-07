<?php
/**
 * Plugin Name: Pasieka Usza - Headless REST API Connector
 * Description: Lekki moduł łączący sklep Pasieki Wędrownej Usza z panelem WordPress. Obsługuje formularz kontaktowy (wp_mail), pytania FAQ oraz metadane produktów (profile sensoryczne i badania).
 * Version: 1.0.0
 * Author: Zespół Wdrożeniowy Pasieki Usza
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 1. ENDPOINT FORMULARZA KONTAKTOWEGO (POST /wp-json/pasieka/v1/contact)
 * Odbiera wiadomości z formularza na stronie i wysyła je na e-mail pasieki przez WP Mail SMTP.
 */
add_action('rest_api_init', function () {
    register_rest_route('pasieka/v1', '/contact', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $params = $request->get_json_params();

            $name = sanitize_text_field($params['name'] ?? '');
            $email = sanitize_email($params['email'] ?? '');
            $phone = sanitize_text_field($params['phone'] ?? '');
            $subject = sanitize_text_field($params['subject'] ?? 'Zapytanie ze sklepu Pasieka Usza');
            $message = sanitize_textarea_field($params['message'] ?? '');

            if (empty($name) || empty($email) || empty($message)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Wypełnij wszystkie wymagane pola (imię, e-mail, treść wiadomości).'
                ], 400);
            }

            // Odbiorca: oficjalny e-mail pasieki (lub administratora WordPress)
            $to = get_option('admin_email');
            $mail_subject = "[Pasieka Usza] " . $subject . " - od: " . $name;

            $mail_body  = "Otrzymano nową wiadomość z formularza na stronie sklepu Pasieka Usza:\n\n";
            $mail_body .= "--------------------------------------------------\n";
            $mail_body .= "Imię i nazwisko: " . $name . "\n";
            $mail_body .= "Adres e-mail:    " . $email . "\n";
            $mail_body .= "Telefon:         " . ($phone ? $phone : "Nie podano") . "\n";
            $mail_body .= "Temat:           " . $subject . "\n";
            $mail_body .= "--------------------------------------------------\n\n";
            $mail_body .= "Treść wiadomości:\n" . $message . "\n\n";
            $mail_body .= "--\nWiadomość wysłana ze sklepu pasiekausza.pl";

            $headers = [
                'Content-Type: text/plain; charset=UTF-8',
                'Reply-To: ' . $name . ' <' . $email . '>'
            ];

            $sent = wp_mail($to, $mail_subject, $mail_body, $headers);

            if ($sent) {
                return new WP_REST_Response([
                    'success' => true,
                    'message' => 'Dziękujemy! Twoja wiadomość została pomyślnie wysłana do Pasieki Usza.'
                ], 200);
            } else {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Wystąpił problem z wysyłką poczty na serwerze. Spróbuj zadzwonić pod numer pasieki.'
                ], 500);
            }
        }
    ]);
});

/**
 * 2. MODUŁ FAQ (Custom Post Type 'faq')
 * Tworzy w menu WordPress zakładkę "Pytania FAQ", aby właściciele mogli łatwo dodawać i edytować pytania.
 */
add_action('init', function () {
    register_post_type('faq', [
        'labels' => [
            'name' => 'Pytania FAQ',
            'singular_name' => 'Pytanie FAQ',
            'add_new' => 'Dodaj nowe pytanie',
            'add_new_item' => 'Dodaj nowe pytanie FAQ',
            'edit_item' => 'Edytuj pytanie FAQ',
        ],
        'public' => true,
        'show_in_rest' => true, // Zezwala na dostęp przez REST API: /wp-json/wp/v2/faq
        'menu_icon' => 'dashicons-editor-help',
        'supports' => ['title', 'editor', 'custom-fields'],
        'has_archive' => false,
    ]);
});

/**
 * 3. UDOSTĘPNIENIE METADANYCH PRODUKTÓW W REST API WOOCOMMERCE
 * Zapewnia, że pola ACF (profile sensoryczne, wilgotność, badania) są dostępne w /wp-json/wc/v3/products
 */
add_action('init', function () {
    $meta_keys = [
        'sensory_sweetness',
        'sensory_acidity',
        'sensory_intensity',
        'sensory_crystallization',
        'flavor_notes',
        'recommended_use',
        'water_content_percentage',
        'batch_number',
        'health_benefits',
        'pairing',
        'culinary_ideas',
        'recommended_dose',
    ];

    foreach ($meta_keys as $key) {
        register_post_meta('product', $key, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
        ]);
    }
});

/**
 * 4. ENDPOINT INTELIGENTNYCH PRZYPOMNIEŃ O MIODZIE (POST /wp-json/pasieka/v1/send-reminder-email)
 * Wysyła elegancki, markowy e-mail HTML z 1-kliknięciowym linkiem do odnowienia zapasu miodu.
 */
add_action('rest_api_init', function () {
    register_rest_route('pasieka/v1', '/send-reminder-email', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            $params = $request->get_json_params();

            $email = sanitize_email($params['email'] ?? '');
            $customer_name = sanitize_text_field($params['customer_name'] ?? 'Kliencie Pasieki');
            $product_name = sanitize_text_field($params['product_name'] ?? 'Miód z Pasieki Usza');
            $weight_label = sanitize_text_field($params['weight_label'] ?? '1200g');
            $reorder_url = esc_url_raw($params['reorder_url'] ?? 'https://pasieka-usza.pl/sklep');

            if (empty($email)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Adres e-mail jest wymagany.'
                ], 400);
            }

            $mail_subject = "🍯 Twój słoik miodu powoli się kończy – odnów zapas w 1 kliknięcie! (Pasieka Usza)";

            $mail_body = '<!DOCTYPE html>
            <html lang="pl">
            <head><meta charset="UTF-8"><title>' . esc_html($mail_subject) . '</title></head>
            <body style="font-family: Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 20px; color: #2D2821;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #EADBCA; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="background-color: #1B4332; padding: 30px 40px; text-align: center;">
                            <span style="font-size: 38px;">🐝</span>
                            <h1 style="color: #FAF5ED; font-size: 22px; margin: 10px 0 0 0; font-family: Georgia, serif; letter-spacing: 1px;">Pasieka Wędrowna Usza</h1>
                            <p style="color: #E5983A; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Tradycja pszczelarska od pokoleń</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 35px 40px;">
                            <h2 style="color: #2D2821; font-size: 18px; margin-top: 0; font-family: Georgia, serif;">Dzień dobry, ' . esc_html($customer_name) . '!</h2>
                            <p style="font-size: 14px; line-height: 1.6; color: #5C4F40;">
                                Zgodnie z Twoją prośbą przesyłamy dyskretne przypomnienie – Twój ulubiony <strong style="color: #1B4332;">' . esc_html($product_name) . ' (' . esc_html($weight_label) . ')</strong> powoli się kończy.
                            </p>
                            <p style="font-size: 14px; line-height: 1.6; color: #5C4F40;">
                                Aby w Twojej domowej spiżarni nigdy nie zabrakło prawdziwego, surowego miodu prosto z dolnośląskich pasieczysk, przygotowaliśmy dla Ciebie <strong>1-kliknięciowy koszyk</strong>.
                            </p>

                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
                                <tr>
                                    <td align="center" style="border-radius: 14px; background-color: #1B4332;">
                                        <a href="' . esc_url($reorder_url) . '" target="_blank" style="font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 32px; display: inline-block; border-radius: 14px; font-family: Arial, sans-serif;">
                                            🍯 Odnów zapas miodu (1-Click) &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="background-color: #FAF5EB; border: 1px solid #E7DCCE; border-radius: 14px; padding: 18px 20px; margin-top: 25px;">
                                <p style="font-size: 12px; font-weight: bold; color: #8C4609; margin: 0 0 6px 0;">🛡️ Bezpieczeństwo i Twoja pełna swoboda:</p>
                                <p style="font-size: 11.5px; line-height: 1.5; color: #6E5E4E; margin: 0;">
                                    To nie jest klasyczna subskrypcja. <strong>Nie pobieramy żadnych automatycznych opłat z karty</strong>. Płacisz standardowo dopiero po przejściu do koszyka (BLIK-iem, przelewem lub kartą). Jeśli nie potrzebujesz teraz miodu – po prostu zignoruj tę wiadomość!
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #F7EFE2; padding: 25px 40px; text-align: center; border-top: 1px solid #EADBCA;">
                            <p style="font-size: 11px; color: #8B7A68; margin: 0 0 6px 0;">
                                Pasieka Wędrowna Usza • Ciechów / Wrocław • Dolny Śląsk
                            </p>
                            <p style="font-size: 10px; color: #A69784; margin: 0;">
                                Nadzór weterynaryjny PLW: WNI 28143502 • tel. +48 601 234 567
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>';

            $headers = [
                'Content-Type: text/html; charset=UTF-8',
                'From: Pasieka Wędrowna Usza <sklep@pasiekausza.pl>'
            ];

            $sent = wp_mail($email, $mail_subject, $mail_body, $headers);

            return new WP_REST_Response([
                'success' => true,
                'message' => 'Przypomnienie e-mail zostało wysłane do klienta.',
                'sent' => $sent,
                'recipient' => $email
            ], 200);
        }
    ]);
});
