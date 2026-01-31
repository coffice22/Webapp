<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2563eb; margin-top: 0; }
        .content p { line-height: 1.6; color: #333; font-size: 16px; }
        .reservation-details { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6b7280; font-weight: 600; }
        .detail-value { color: #1f2937; font-weight: 500; }
        .total-row { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 10px; }
        .total-row .detail-label { color: #1e40af; font-size: 18px; }
        .total-row .detail-value { color: #1e40af; font-size: 20px; font-weight: bold; }
        .btn { display: inline-block; padding: 14px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Réservation confirmée</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Référence #<?= htmlspecialchars(substr($reservation['id'], 0, 8)) ?></p>
        </div>

        <div class="content">
            <h2>Votre réservation est confirmée !</h2>

            <p>Merci pour votre réservation. Voici les détails :</p>

            <div class="reservation-details">
                <div class="detail-row">
                    <span class="detail-label">Espace :</span>
                    <span class="detail-value"><?= htmlspecialchars($reservation['espace_nom'] ?? 'N/A') ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date de début :</span>
                    <span class="detail-value"><?= date('d/m/Y H:i', strtotime($reservation['date_debut'])) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date de fin :</span>
                    <span class="detail-value"><?= date('d/m/Y H:i', strtotime($reservation['date_fin'])) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Statut :</span>
                    <span class="detail-value"><?= htmlspecialchars($reservation['statut'] ?? 'confirmee') ?></span>
                </div>
                <?php if (!empty($reservation['nombre_personnes'])): ?>
                <div class="detail-row">
                    <span class="detail-label">Nombre de personnes :</span>
                    <span class="detail-value"><?= htmlspecialchars($reservation['nombre_personnes']) ?></span>
                </div>
                <?php endif; ?>

                <div class="total-row detail-row">
                    <span class="detail-label">Montant total :</span>
                    <span class="detail-value"><?= number_format($reservation['prix_total'] ?? 0, 2, ',', ' ') ?> DZD</span>
                </div>
            </div>

            <?php if (!empty($reservation['notes'])): ?>
            <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <strong>Notes :</strong><br>
                <?= nl2br(htmlspecialchars($reservation['notes'])) ?>
            </p>
            <?php endif; ?>

            <p style="text-align: center;">
                <a href="https://coffice.dz/dashboard/reservations" class="btn">Voir ma réservation</a>
            </p>

            <p style="color: #6b7280; font-size: 14px;">
                <strong>Adresse :</strong> Mohammadia Mall, 4ème étage, Bureau 1178, Mohammadia, Alger
            </p>

            <p style="color: #6b7280; font-size: 14px;">
                Nous vous attendons avec impatience. N'hésitez pas à nous contacter pour toute question.
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
