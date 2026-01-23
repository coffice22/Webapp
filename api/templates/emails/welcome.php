<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez Coffice</title>
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
        .features { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .features ul { list-style: none; padding: 0; }
        .features li { padding: 8px 0; padding-left: 24px; position: relative; }
        .features li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; font-size: 14px; color: #6b7280; }
        .footer a { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>☕ Coffice</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Votre espace de coworking à Alger</p>
        </div>

        <div class="content">
            <h2>Bienvenue <?= htmlspecialchars($name) ?> !</h2>

            <p>Nous sommes ravis de vous accueillir dans la communauté Coffice. Votre compte a été créé avec succès.</p>

            <div class="features">
                <h3 style="margin-top: 0; color: #1f2937;">Ce que vous pouvez faire maintenant :</h3>
                <ul>
                    <li>Réserver vos espaces de coworking préférés</li>
                    <li>Accéder à nos salles de réunion équipées</li>
                    <li>Bénéficier de nos services de domiciliation</li>
                    <li>Profiter de notre kitchenette et de nos équipements</li>
                </ul>
            </div>

            <p style="text-align: center;">
                <a href="<?= htmlspecialchars($login_url) ?>" class="btn">Accéder à mon compte</a>
            </p>

            <p>Si vous avez des questions, n'hésitez pas à nous contacter. Notre équipe est là pour vous accompagner.</p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                <strong>À très bientôt chez Coffice !</strong><br>
                L'équipe Coffice
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
