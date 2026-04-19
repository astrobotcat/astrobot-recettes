# 🍳 Site de Recettes Perso
# Backend : Flask + Markdown

from flask import Flask, render_template
import markdown
import os

app = Flask(__name__)

# Chemin vers le dossier "recettes" (relatif à la racine du projet)
RECIPES_DIR = "./recettes"

@app.route("/")
def home():
    recipes = []
    for filename in os.listdir(RECIPES_DIR):
        if filename.endswith(".md"):
            with open(os.path.join(RECIPES_DIR, filename), "r", encoding="utf-8") as f:
                content = f.read()
                html = markdown.markdown(content)
                # Remplacer les underscores par des espaces pour l'affichage
                title = filename.replace(".md", "").replace("_", " ")
                recipes.append({
                    "title": title,
                    "html": html,
                    "filename": filename
                })
    return render_template("index.html", recipes=recipes)

@app.route("/pdf/<filename>.pdf")
def download_pdf(filename):
    import subprocess
    from flask import send_from_directory
    
    # Chemin vers le script de génération PDF
    pdf_script = "/home/vinz/.openclaw/workspace/astrobot-recettes/generate_pdf.sh"
    pdf_dir = "/home/vinz/.openclaw/workspace/astrobot-recettes/static/pdfs"
    pdf_path = os.path.join(pdf_dir, f"{filename}.pdf")
    
    # Générer le PDF si nécessaire
    if not os.path.exists(pdf_path):
        recipe_url = f"https://astrobot-recettes.vercel.app/recipe/{filename.replace('_', '%20')}.md"
        subprocess.run([pdf_script, recipe_url, pdf_path], check=True)
    
    return send_from_directory(pdf_dir, f"{filename}.pdf", as_attachment=True)


@app.route("/recipe/<filename>")
def recipe(filename):
    # Remplacer les underscores par des espaces pour l'affichage
    title = filename.replace(".md", "").replace("_", " ")
    with open(os.path.join(RECIPES_DIR, filename), "r", encoding="utf-8") as f:
        content = f.read()
        html = markdown.markdown(content)
    return render_template("recipe.html", content=html, title=title)

if __name__ == "__main__":
    app.run(debug=True)