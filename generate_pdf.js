// Script pour générer des PDF à partir des pages de recettes
// Usage: node generate_pdf.js <url> <output_path>

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const url = process.argv[2];
    const outputPath = process.argv[3];
    
    if (!url || !outputPath) {
        console.error('Usage: node generate_pdf.js <url> <output_path>');
        process.exit(1);
    }
    
    // Créer le dossier de sortie si nécessaire
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log(`Génération du PDF pour ${url}...`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true
    });
    
    await browser.close();
    console.log(`✅ PDF généré : ${outputPath}`);
})();