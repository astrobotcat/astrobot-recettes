# DEV.md - Synchronisation Automatique des Recettes

## 🔹 Contexte
Ce projet utilise un système de synchronisation automatique pour éviter les oublis de push entre le dossier local de travail (`/home/vinz/projets/recettes-site/`) et le repo Git (`astrobot-recettes`).

## 🔹 Script de Synchronisation
- **Nom** : `sync_recettes.sh`
- **Emplacement** : Racine du repo (`/home/vinz/.openclaw/workspace/astrobot-recettes/`).
- **Fonctionnalités** :
  - Synchronise les fichiers modifiés ou ajoutés avec `rsync`.
  - Exclut les dossiers sensibles (`venv/`, `__pycache__/`, `.git/`).
  - Commit et push automatiques vers GitHub.
  - Log des actions dans `sync.log`.

### 📌 Usage
```bash
# Exécuter le script manuellement
./sync_recettes.sh

# Exécuter avec un message de commit personnalisé
./sync_recettes.sh --commit-message "Mon message personnalisé"
```

## 🔹 Cron Job
Le script est exécuté **automatiquement toutes les heures** via un cron job.

### Configuration
```bash
0 * * * * /home/vinz/.openclaw/workspace/astrobot-recettes/sync_recettes.sh
```

### Vérifier les logs
```bash
tail -f /home/vinz/.openclaw/workspace/astrobot-recettes/sync.log
```

## 🔹 Déploiement Vercel
- Le déploiement est **automatiquement déclenché** après un push vers GitHub.
- Pour vérifier le statut du déploiement, utiliser l'API Vercel (non implémenté dans le script pour l'instant).

## 🔹 Fichiers Exclus
Les dossiers suivants sont **ignorés** lors de la synchronisation :
- `venv/`
- `__pycache__/`
- `.git/`

## 🔹 Améliorations Possibles
- Ajouter une vérification du statut du déploiement Vercel via l'API.
- Notifier l'utilisateur (ex: Telegram) en cas d'échec de synchronisation.
- Ajouter un système de rollback en cas d'erreur.