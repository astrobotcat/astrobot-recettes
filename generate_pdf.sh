#!/bin/bash

# Script pour générer un PDF à partir d'une recette
# Usage: ./generate_pdf.sh <url> <output_path>

URL="$1"
OUTPUT="$2"

if [ -z "$URL" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: $0 <url> <output_path>"
    exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

# Utiliser wkhtmltopdf si disponible, sinon puppeteer
if command -v wkhtmltopdf &> /dev/null; then
    wkhtmltopdf "$URL" "$OUTPUT"
    echo "✅ PDF généré avec wkhtmltopdf : $OUTPUT"
elif [ -f "generate_pdf.js" ]; then
    echo "⚠️ wkhtmltopdf non trouvé. Utilisation de puppeteer..."
    node generate_pdf.js "$URL" "$OUTPUT"
    echo "✅ PDF généré avec puppeteer : $OUTPUT"
else
    echo "❌ Erreur : wkhtmltopdf et puppeteer non disponibles."
    exit 1
fi