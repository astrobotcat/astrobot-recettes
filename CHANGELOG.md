# CHANGELOG.md - Historique des Modifications par dev-agent

## 📅 2026-04-19
### 🔄 Synchro Git/Vercel
- **Mission** : Ajout des notifications Telegram et vérification Vercel.
- **Modifications** :
  - `sync_recettes.sh` : Ajout des notifications en cas d'échec (`rsync`, `git`, Vercel).
  - `sync_recettes.sh` : Ajout du rollback automatique si Vercel échoue.
  - `DEV.md` : Documentation des nouvelles fonctionnalités.
- **Tests** :
  - Erreur `rsync` simulée → notification Telegram envoyée.
  - Rollback Vercel testé avec succès.
- **PR** : [Lien vers la PR](#) *(à remplir par dev-agent)*.

## 📅 2026-04-19
### 📊 Dashboard Vercel
- **Mission** : Création d'un dashboard pour surveiller les déploiements.
- **Modifications** :
  - `vercel_dashboard.sh` : Script pour générer `VERCEL_DASHBOARD.md`.
  - `VERCEL_DASHBOARD.md` : Fichier généré avec les 5 derniers déploiements.
- **Tests** :
  - Script exécuté manuellement → dashboard généré avec succès.
- **PR** : [Lien vers la PR](#) *(à remplir par dev-agent)*.

## 📅 2026-04-19
### 📄 Export PDF des Recettes
- **Mission** : Ajout d'un bouton "Télécharger en PDF".
- **Modifications** :
  - `generate_pdf.sh` : Script pour convertir les pages en PDF avec `wkhtmltopdf`.
  - *(À venir)* : Bouton dans `templates/recipe.html`.
- **Tests** :
  - Script testé avec `wkhtmltopdf` → PDF généré.
- **PR** : [Lien vers la PR](#) *(à remplir par dev-agent)*.