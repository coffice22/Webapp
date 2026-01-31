<?php

/**
 * Classe Mailer - Gestionnaire d'envoi d'emails
 * Supporte PHPMailer (si installé) ou la fonction mail() native de PHP
 */
class Mailer
{
    private static $usePHPMailer = false;
    private static $config = [];

    /**
     * Initialiser la configuration du mailer
     */
    public static function init(): void
    {
        self::$config = [
            'from_email' => env('MAIL_FROM_ADDRESS', 'noreply@coffice.dz'),
            'from_name' => env('MAIL_FROM_NAME', 'Coffice'),
            'smtp_host' => env('MAIL_HOST', 'localhost'),
            'smtp_port' => env('MAIL_PORT', 587),
            'smtp_username' => env('MAIL_USERNAME', ''),
            'smtp_password' => env('MAIL_PASSWORD', ''),
            'smtp_encryption' => env('MAIL_ENCRYPTION', 'tls'),
            'use_smtp' => env('MAIL_MAILER', 'smtp') === 'smtp'
        ];

        self::$usePHPMailer = class_exists('PHPMailer\PHPMailer\PHPMailer');
    }

    /**
     * Envoyer un email
     *
     * @param string $to Email du destinataire
     * @param string $subject Sujet de l'email
     * @param string $body Corps de l'email (HTML)
     * @param string|null $plainText Version texte brut (optionnel)
     * @return bool Succès de l'envoi
     */
    public static function send(string $to, string $subject, string $body, ?string $plainText = null): bool
    {
        if (empty(self::$config)) {
            self::init();
        }

        try {
            if (self::$usePHPMailer && self::$config['use_smtp']) {
                return self::sendWithPHPMailer($to, $subject, $body, $plainText);
            } else {
                return self::sendWithMailFunction($to, $subject, $body);
            }
        } catch (Exception $e) {
            Logger::error('Email sending failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Envoyer avec PHPMailer (recommandé)
     */
    private static function sendWithPHPMailer(string $to, string $subject, string $body, ?string $plainText): bool
    {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = self::$config['smtp_host'];
        $mail->SMTPAuth = !empty(self::$config['smtp_username']);
        $mail->Username = self::$config['smtp_username'];
        $mail->Password = self::$config['smtp_password'];
        $mail->SMTPSecure = self::$config['smtp_encryption'];
        $mail->Port = self::$config['smtp_port'];
        $mail->CharSet = 'UTF-8';

        $mail->setFrom(self::$config['from_email'], self::$config['from_name']);
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        if ($plainText) {
            $mail->AltBody = $plainText;
        }

        return $mail->send();
    }

    /**
     * Envoyer avec la fonction mail() native de PHP
     */
    private static function sendWithMailFunction(string $to, string $subject, string $body): bool
    {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . self::$config['from_name'] . ' <' . self::$config['from_email'] . '>',
            'Reply-To: ' . self::$config['from_email'],
            'X-Mailer: PHP/' . phpversion()
        ];

        return mail($to, $subject, $body, implode("\r\n", $headers));
    }

    /**
     * Envoyer un email de bienvenue
     */
    public static function sendWelcomeEmail(string $to, string $name): bool
    {
        $subject = 'Bienvenue chez Coffice !';
        $body = self::renderTemplate('welcome', [
            'name' => $name,
            'login_url' => env('APP_URL', 'https://coffice.dz') . '/login'
        ]);

        return self::send($to, $subject, $body);
    }

    /**
     * Envoyer un email de confirmation de réservation
     */
    public static function sendReservationConfirmation(string $to, array $reservation): bool
    {
        $subject = 'Confirmation de réservation #' . substr($reservation['id'], 0, 8);
        $body = self::renderTemplate('reservation-confirmation', [
            'reservation' => $reservation
        ]);

        return self::send($to, $subject, $body);
    }

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public static function sendPasswordReset(string $to, string $name, string $token): bool
    {
        $subject = 'Réinitialisation de votre mot de passe';
        $resetUrl = env('APP_URL', 'https://coffice.dz') . '/reset-password?token=' . $token;

        $body = self::renderTemplate('password-reset', [
            'name' => $name,
            'reset_url' => $resetUrl,
            'expires_in' => '1 heure'
        ]);

        return self::send($to, $subject, $body);
    }

    /**
     * Envoyer un email de notification de domiciliation
     */
    public static function sendDomiciliationStatus(string $to, string $status, array $domiciliation): bool
    {
        $statusLabels = [
            'en_attente' => 'En attente de validation',
            'validee' => 'Validée',
            'active' => 'Activée',
            'rejetee' => 'Rejetée',
            'expiree' => 'Expirée'
        ];

        $subject = 'Domiciliation ' . ($statusLabels[$status] ?? $status);
        $body = self::renderTemplate('domiciliation-status', [
            'status' => $status,
            'status_label' => $statusLabels[$status] ?? $status,
            'domiciliation' => $domiciliation
        ]);

        return self::send($to, $subject, $body);
    }

    /**
     * Envoyer un rappel de réservation (24h avant)
     */
    public static function sendReservationReminder(string $to, array $reservation): bool
    {
        $subject = 'Rappel: Votre réservation demain';
        $body = self::renderTemplate('reservation-reminder', [
            'reservation' => $reservation
        ]);

        return self::send($to, $subject, $body);
    }

    /**
     * Rendre un template d'email
     */
    private static function renderTemplate(string $template, array $data): string
    {
        $templatePath = __DIR__ . '/../templates/emails/' . $template . '.php';

        if (!file_exists($templatePath)) {
            Logger::warning('Email template not found: ' . $template);
            return self::renderDefaultTemplate($data);
        }

        ob_start();
        extract($data);
        require $templatePath;
        return ob_get_clean();
    }

    /**
     * Template par défaut si le fichier n'existe pas
     */
    private static function renderDefaultTemplate(array $data): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                .content { background: #f9fafb; padding: 30px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Coffice</h1>
                </div>
                <div class="content">
                    <p>' . json_encode($data) . '</p>
                </div>
                <div class="footer">
                    <p>Coffice - Mohammadia Mall, 4ème étage, Bureau 1178, Alger</p>
                    <p>contact@coffice.dz | +213 XXX XXX XXX</p>
                </div>
            </div>
        </body>
        </html>
        ';
    }
}
