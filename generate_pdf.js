// Script pour générer un PDF à partir d'une recette
// URL et chemin de sortie codés en dur pour éviter les arguments

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const url = "https://astrobot-recettes.vercel.app/recipe/Pates_Aglio_e_Olio.md";
    const outputPath = "/home/vinz/.openclaw/workspace/astrobot-recettes/static/pdfs/Pates_Aglio_e_Olio.pdf";
    
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