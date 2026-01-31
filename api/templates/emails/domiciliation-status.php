<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statut de domiciliation</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { color: white; padding: 40px 20px; text-align: center; }
        .header-validee { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .header-active { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .header-rejetee { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .header-en_attente { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .header-expiree { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .content h2 { margin-top: 0; }
        .content p { line-height: 1.6; color: #333; font-size: 16px; }
        .status-box { border-radius: 8px; padding: 20px; margin: 20px 0; }
        .status-validee { background-color: #d1fae5; border-left: 4px solid #10b981; }
        .status-active { background-color: #d1fae5; border-left: 4px solid #10b981; }
        .status-rejetee { background-color: #fee2e2; border-left: 4px solid #ef4444; }
        .status-en_attente { background-color: #fef3c7; border-left: 4px solid #f59e0b; }
        .btn { display: inline-block; padding: 14px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header header-<?= htmlspecialchars($status) ?>">
            <h1>🏢 Domiciliation</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;"><?= htmlspecialchars($status_label) ?></p>
        </div>

        <div class="content">
            <?php if ($status === 'validee' || $status === 'active'): ?>
                <h2 style="color: #10b981;">Bonne nouvelle !</h2>
                <p>Votre demande de domiciliation a été <?= $status === 'active' ? 'activée' : 'validée' ?> avec succès.</p>

                <div class="status-box status-<?= htmlspecialchars($status) ?>">
                    <p><strong>Entreprise :</strong> <?= htmlspecialchars($domiciliation['nom_entreprise'] ?? 'N/A') ?></p>
                    <p><strong>Numéro de registre :</strong> <?= htmlspecialchars($domiciliation['numero_registre'] ?? 'N/A') ?></p>
                    <?php if (!empty($domiciliation['date_debut'])): ?>
                    <p><strong>Date de début :</strong> <?= date('d/m/Y', strtotime($domiciliation['date_debut'])) ?></p>
                    <?php endif; ?>
                    <?php if (!empty($domiciliation['duree_mois'])): ?>
                    <p><strong>Durée :</strong> <?= htmlspecialchars($domiciliation['duree_mois']) ?> mois</p>
                    <?php endif; ?>
                </div>

                <p>Vous pouvez maintenant utiliser notre adresse comme siège social de votre entreprise :</p>
                <p style="background-color: #f9fafb; padding: 15px; border-radius: 6px; font-weight: 500;">
                    Coffice - Mohammadia Mall<br>
                    4ème étage, Bureau 1178<br>
                    Mohammadia, Alger, Algérie
                </p>

            <?php elseif ($status === 'rejetee'): ?>
                <h2 style="color: #ef4444;">Demande non validée</h2>
                <p>Nous regrettons de vous informer que votre demande de domiciliation n'a pas pu être validée.</p>

                <div class="status-box status-rejetee">
                    <p><strong>Raison :</strong> <?= htmlspecialchars($domiciliation['raison_rejet'] ?? 'Veuillez nous contacter pour plus d\'informations.') ?></p>
                </div>

                <p>Pour plus d'informations ou pour soumettre une nouvelle demande, n'hésitez pas à nous contacter.</p>

            <?php else: ?>
                <h2 style="color: #f59e0b;">Demande en cours</h2>
                <p>Votre demande de domiciliation est actuellement en cours de traitement.</p>

                <div class="status-box status-en_attente">
                    <p><strong>Entreprise :</strong> <?= htmlspecialchars($domiciliation['nom_entreprise'] ?? 'N/A') ?></p>
                    <p><strong>Statut :</strong> <?= htmlspecialchars($status_label) ?></p>
                </div>

                <p>Nous examinons votre dossier et reviendrons vers vous dans les plus brefs délais.</p>
            <?php endif; ?>

            <p style="text-align: center;">
                <a href="https://coffice.dz/dashboard/domiciliation" class="btn">Voir ma demande</a>
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
