<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2563eb; margin-top: 0; }
        .content p { line-height: 1.6; color: #333; font-size: 16px; }
        .btn { display: inline-block; padding: 14px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .btn:hover { background-color: #1d4ed8; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning-box p { margin: 5px 0; color: #92400e; font-size: 14px; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; font-size: 14px; color: #6b7280; }
        .footer a { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Réinitialisation</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">de votre mot de passe</p>
        </div>

        <div class="content">
            <h2>Bonjour <?= htmlspecialchars($name) ?>,</h2>

            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Coffice.</p>

            <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>

            <p style="text-align: center;">
                <a href="<?= htmlspecialchars($reset_url) ?>" class="btn">Réinitialiser mon mot de passe</a>
            </p>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Ou copiez ce lien dans votre navigateur :<br>
                <a href="<?= htmlspecialchars($reset_url) ?>" style="color: #2563eb; word-break: break-all;"><?= htmlspecialchars($reset_url) ?></a>
            </p>

            <div class="warning-box">
                <p><strong>⚠️ Important :</strong></p>
                <p>• Ce lien est valide pendant <?= htmlspecialchars($expires_in) ?> uniquement</p>
                <p>• Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</p>
                <p>• Pour votre sécurité, ne partagez jamais ce lien</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Si vous avez des difficultés, contactez-nous à <a href="mailto:contact@coffice.dz" style="color: #2563eb;">contact@coffice.dz</a>
            </p>
        </div>

        <div class="footer">
            <p><strong>Coffice</strong></p>
            <p>Mohammadia Mall, 4ème étage, Bureau 1178</p>
            <p>Mohammadia, Alger, Algérie</p>
            <p style="margin-top: 15px;">
                <a href="mailto:contact@coffice.dz">contact@coffice.dz</a> |
                <a href="https://coffice.dz">coffice.dz</a>
            </p>
        </div>
    </div>
</body>
</html>
