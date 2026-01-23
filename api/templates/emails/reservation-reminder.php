<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rappel de réservation</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #f59e0b; margin-top: 0; }
        .content p { line-height: 1.6; color: #333; font-size: 16px; }
        .reservation-details { background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .detail-row { padding: 8px 0; }
        .detail-label { color: #92400e; font-weight: 600; display: inline-block; width: 180px; }
        .detail-value { color: #78350f; font-weight: 500; }
        .btn { display: inline-block; padding: 14px 30px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Rappel</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Votre réservation commence demain</p>
        </div>

        <div class="content">
            <h2>N'oubliez pas votre réservation !</h2>

            <p>Ce message est un rappel amical concernant votre réservation qui commence demain.</p>

            <div class="reservation-details">
                <div class="detail-row">
                    <span class="detail-label">Espace :</span>
                    <span class="detail-value"><?= htmlspecialchars($reservation['espace_nom'] ?? 'N/A') ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date de début :</span>
                    <span class="detail-value"><?= date('d/m/Y à H:i', strtotime($reservation['date_debut'])) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date de fin :</span>
                    <span class="detail-value"><?= date('d/m/Y à H:i', strtotime($reservation['date_fin'])) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Référence :</span>
                    <span class="detail-value">#<?= htmlspecialchars(substr($reservation['id'], 0, 8)) ?></span>
                </div>
            </div>

            <p><strong>Adresse :</strong><br>
            Coffice - Mohammadia Mall<br>
            4ème étage, Bureau 1178<br>
            Mohammadia, Alger</p>

            <p style="text-align: center;">
                <a href="https://coffice.dz/dashboard/reservations/<?= htmlspecialchars($reservation['id']) ?>" class="btn">Voir les détails</a>
            </p>

            <p style="color: #6b7280; font-size: 14px;">
                Nous vous attendons avec plaisir. Si vous avez besoin de modifier ou d'annuler votre réservation, veuillez nous contacter au plus vite.
            </p>
        </div>

        <div class="footer">
            <p><strong>Coffice</strong></p>
            <p>Mohammadia Mall, 4ème étage, Bureau 1178</p>
            <p>Mohammadia, Alger, Algérie</p>
            <p style="margin-top: 15px;">
                <a href="mailto:contact@coffice.dz" style="color: #2563eb; text-decoration: none;">contact@coffice.dz</a> |
                <a href="https://coffice.dz" style="color: #2563eb; text-decoration: none;">coffice.dz</a>
            </p>
        </div>
    </div>
</body>
</html>
