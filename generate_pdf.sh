#!/bin/bash

# Script pour générer un PDF à partir d'une recette avec wkhtmltopdf
# Usage: ./generate_pdf.sh <url> <output_path>

URL="$1"
OUTPUT="$2"

if [ -z "$URL" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: $0 <url> <output_path>"
    exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
wkhtmltopdf "$URL" "$OUTPUT"
echo "✅ PDF généré : $OUTPUT"