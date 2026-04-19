#!/bin/bash

VAULT="/mnt/c/Users/VinZ/Documents/Astrobot/Astrobot/"

# Vérifier les liens internes dans les fichiers Markdown
echo "🔍 Vérification des liens internes..."
find "$VAULT" -name "*.md" -exec grep -H "\[\[.*\]\]" {} \; | while read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    link=$(echo "$line" | grep -o '\[\[.*\]\]' | sed 's/\[\[//;s/\]\]//' | cut -d'|' -f1)
    
    # Vérifier si le lien existe
    if [ ! -f "$VAULT$link.md" ] && [ ! -f "$VAULT$(dirname "$file")/$link.md" ]; then
        echo "❌ Lien cassé dans $file : [[ $link ]]"
    fi
done

echo "✅ Vérification terminée."