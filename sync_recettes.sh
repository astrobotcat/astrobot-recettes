#!/bin/bash

# Script de synchronisation automatique entre /projets/recettes-site/ et le repo Git
# Usage: ./sync_recettes.sh [--commit-message "message"]

# Chemins
SOURCE_DIR="/home/vinz/projets/recettes-site/"
REPO_DIR="/home/vinz/.openclaw/workspace/astrobot-recettes/"
LOG_FILE="/home/vinz/.openclaw/workspace/astrobot-recettes/sync.log"
COMMIT_MESSAGE="Auto-sync: Mise à jour des recettes et fichiers associés"
TELEGRAM_CHANNEL="telegram"
TELEGRAM_TARGET="1591095126"  # ID Telegram de VinZ (@vinzelnino)
VERCEL_TOKEN="$(cat ~/.openclaw/vercel_token)"
PROJECT_ID="astrobot-recettes"  # ID du projet Vercel

# Fonction de notification Telegram
send_telegram_notification() {
    local message="$1"
    message action="send" channel="$TELEGRAM_CHANNEL" target="$TELEGRAM_TARGET" message="$message" > /dev/null 2>&1
}

# Override du message de commit ou mode dry-run
DRY_RUN=false
if [ "$1" == "--commit-message" ] && [ -n "$2" ]; then
    COMMIT_MESSAGE="$2"
    shift 2
fi

if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 Mode DRY-RUN activé : aucune modification ne sera appliquée." >> "$LOG_FILE"
    shift
fi

# Fonction de log (déplacée en haut pour être accessible partout)
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Fonction pour gérer les erreurs
handle_error() {
    local error_message="$1"
    log "❌ ERREUR: $error_message"
    send_telegram_notification "❌ Synchro Git échouée : $error_message. Voir sync.log pour détails."
    exit 1
}

# Synchronisation avec rsync
log "Début de la synchronisation depuis $SOURCE_DIR vers $REPO_DIR"
if [ "$DRY_RUN" = true ]; then
    log "🔍 DRY-RUN: rsync -av --dry-run --exclude='venv/' --exclude='__pycache__/' --exclude='.git/' \"$SOURCE_DIR\" \"$REPO_DIR\""
    rsync -av --dry-run --exclude='venv/' --exclude='__pycache__/' --exclude='.git/' "$SOURCE_DIR" "$REPO_DIR" >> "$LOG_FILE" 2>&1
    RSYNC_EXIT_CODE=$?
    log "🚨 DRY-RUN: rsync terminé avec le code $RSYNC_EXIT_CODE (0 = succès, 23 = fichiers manquants)."
else
    rsync -av --progress --exclude='venv/' --exclude='__pycache__/' --exclude='.git/' "$SOURCE_DIR" "$REPO_DIR" >> "$LOG_FILE" 2>&1
    RSYNC_EXIT_CODE=$?
    if [ $RSYNC_EXIT_CODE -ne 0 ]; then
        handle_error "Échec de la synchronisation rsync (code $RSYNC_EXIT_CODE)"
    fi
fi

# Vérification des différences
cd "$REPO_DIR" || exit 1
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    log "Aucun changement détecté. Fin du script."
    exit 0
fi

if [ "$DRY_RUN" = true ]; then
    log "🔍 DRY-RUN: Changements détectés (non appliqués) :"
    echo "$CHANGES" | while read -r line; do
        log "  $line"
    done
    log "🚨 DRY-RUN: Fin du script sans modifications."
    exit 0
fi

# Ajout des fichiers et commit
log "Changements détectés. Commit en cours..."
git add . >> "$LOG_FILE" 2>&1 || handle_error "Échec de git add"
git commit -m "$COMMIT_MESSAGE" >> "$LOG_FILE" 2>&1 || handle_error "Échec de git commit"

# Push vers GitHub
log "Push vers GitHub..."
git push origin main >> "$LOG_FILE" 2>&1 || handle_error "Échec de git push"

# Vérification du déploiement Vercel
log "Vérification du déploiement Vercel..."

# Fonction pour vérifier le statut du déploiement Vercel
check_vercel_deployment() {
    local response
    response=$(curl -s -X GET "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json")
    
    if [ -z "$response" ]; then
        handle_error "Impossible de récupérer le statut du déploiement Vercel"
    fi
    
    local status
    status=$(echo "$response" | jq -r '.deployments[0].readyState')
    
    if [ "$status" != "READY" ]; then
        log "❌ Déploiement Vercel échoué avec le statut: $status"
        send_telegram_notification "❌ Déploiement Vercel échoué pour le commit $COMMIT_MESSAGE. Statut: $status. Rollback en cours..."
        
        # Rollback du dernier commit
        git reset --hard HEAD~1 >> "$LOG_FILE" 2>&1 || handle_error "Échec du rollback git"
        git push --force origin main >> "$LOG_FILE" 2>&1 || handle_error "Échec du push après rollback"
        
        send_telegram_notification "✅ Rollback effectué avec succès. Le dernier commit a été annulé."
        exit 1
    else
        log "✅ Déploiement Vercel réussi avec le statut: $status"
        send_telegram_notification "✅ Synchro Git et déploiement Vercel réussis pour le commit: $COMMIT_MESSAGE"
    fi
}

# Vérification du déploiement Vercel
check_vercel_deployment

log "Synchronisation terminée avec succès !"