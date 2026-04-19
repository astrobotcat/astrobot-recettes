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
- **Vérification automatique** : Le script vérifie le statut du déploiement via l'API Vercel après chaque push.
  - Si le déploiement échoue (`status != "READY"`), un **rollback automatique** est effectué.
  - Un message Telegram est envoyé pour notifier l'échec et le rollback.

### 📌 Vérification manuelle du déploiement
```bash
curl -s "https://api.vercel.com/v6/deployments?projectId=astrobot-recettes&limit=1" \
  -H "Authorization: Bearer $(cat ~/.openclaw/vercel_token)" | jq -r '.deployments[0].readyState'
```

## 🔹 Notifications Telegram
- **En cas d'échec** : Un message est envoyé à VinZ (@vinzelnino) avec l'erreur et un lien vers `sync.log`.
- **En cas de succès** : Un message confirme la synchro et le déploiement Vercel.

### 📌 Exemples de messages
- **Succès** : `✅ Synchro Git et déploiement Vercel réussis pour le commit: [message]`
- **Échec** : `❌ Synchro Git échouée : [erreur]. Voir sync.log pour détails.`

## 🔹 Rollback Automatique
- Si le déploiement Vercel échoue, le script **annule le dernier commit** et force le push.
- Un message Telegram est envoyé pour confirmer le rollback.

### 📌 Commandes utilisées
```bash
git reset --hard HEAD~1
git push --force origin main
```

## 🔹 Fichiers Exclus
Les dossiers suivants sont **ignorés** lors de la synchronisation :
- `venv/`
- `__pycache__/`
- `.git/`
- `.env`
- `*.pyc`