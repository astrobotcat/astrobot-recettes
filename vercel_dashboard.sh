#!/bin/bash

# Script pour générer un dashboard Vercel
# Usage: ./vercel_dashboard.sh

# Chemins
REPO_DIR="/home/vinz/.openclaw/workspace/astrobot-recettes/"
DASHBOARD_FILE="$REPO_DIR/VERCEL_DASHBOARD.md"
VERCEL_TOKEN="$(cat ~/.openclaw/vercel_token)"
PROJECT_ID="astrobot-recettes"

# Fonction de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Récupérer les déploiements Vercel
log "Récupération des déploiements Vercel..."
response=$(curl -s -X GET "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=5" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json")

if [ -z "$response" ]; then
    log "❌ Erreur : Impossible de récupérer les déploiements Vercel"
    exit 1
fi

# Générer le dashboard
log "Génération du dashboard..."
cat > "$DASHBOARD_FILE" <<EOF
# 📊 Dashboard Vercel - Projet $PROJECT_ID

*Dernière mise à jour : $(date '+%Y-%m-%d %H:%M:%S')*

| ID Déploiement | Statut | URL | Date |
|---------------|--------|-----|------|
EOF

echo "$response" | jq -r '.deployments[] | "| \(.uid) | \(.readyState) | [Lien](\(.url)) | \((.createdAt / 1000) | strftime("%Y-%m-%d %H:%M:%S")) |"' >> "$DASHBOARD_FILE"

log "✅ Dashboard généré : $DASHBOARD_FILE"