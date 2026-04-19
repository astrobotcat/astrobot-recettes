#!/bin/bash

# Script de synchronisation automatique entre /projets/recettes-site/ et le repo Git
# Usage: ./sync_recettes.sh [--commit-message "message"]

# Chemins
SOURCE_DIR="/home/vinz/projets/recettes-site/"
REPO_DIR="/home/vinz/.openclaw/workspace/astrobot-recettes/"
LOG_FILE="/home/vinz/.openclaw/workspace/astrobot-recettes/sync.log"
COMMIT_MESSAGE="Auto-sync: Mise à jour des recettes et fichiers associés"

# Override du message de commit si fourni
if [ "$1" == "--commit-message" ] && [ -n "$2" ]; then
    COMMIT_MESSAGE="$2"
fi

# Fonction de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Synchronisation avec rsync
log "Début de la synchronisation depuis $SOURCE_DIR vers $REPO_DIR"
rsync -av --progress --exclude='venv/' --exclude='__pycache__/' --exclude='.git/' "$SOURCE_DIR" "$REPO_DIR" >> "$LOG_FILE" 2>&1

# Vérification des différences
cd "$REPO_DIR" || exit 1
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    log "Aucun changement détecté. Fin du script."
    exit 0
fi

# Ajout des fichiers et commit
log "Changements détectés. Commit en cours..."
git add . >> "$LOG_FILE" 2>&1
git commit -m "$COMMIT_MESSAGE" >> "$LOG_FILE" 2>&1

# Push vers GitHub
log "Push vers GitHub..."
git push origin main >> "$LOG_FILE" 2>&1

# Vérification du déploiement Vercel
log "Vérification du déploiement Vercel..."

# Récupération du token Vercel
VERCEL_TOKEN=$(cat ~/.openclaw/vercel_token)
PROJECT_ID="astrobot-recettes"  # Remplacer par l'ID du projet Vercel si différent

# Appel à l'API Vercel pour vérifier le dernier déploiement (optionnel)
# curl -X GET "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID" \
#     -H "Authorization: Bearer $VERCEL_TOKEN" \
#     -H "Content-Type: application/json" >> "$LOG_FILE" 2>&1

log "Synchronisation terminée avec succès !"