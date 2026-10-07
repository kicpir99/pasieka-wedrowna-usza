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
