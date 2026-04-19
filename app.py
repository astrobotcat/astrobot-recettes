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
    import requests
    from flask import send_file, abort
    import io
    
    # Clé API PDFShift (à remplacer par ta clé)
    PDFSHIFT_API_KEY = "sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Remplace par ta clé PDFShift
    
    # URL de la recette
    recipe_url = f"https://astrobot-recettes.vercel.app/recipe/{filename.replace('_', '%20')}.md"
    
    # Appel à l'API PDFShift
    response = requests.post(
        "https://api.pdfshift.io/v3/convert/pdf",
        auth=("api", PDFSHIFT_API_KEY),
        json={"source": recipe_url},
        stream=True
    )
    
    if response.status_code != 200:
        abort(500, description="Erreur lors de la génération du PDF")
    
    # Retourner le PDF en streaming
    return send_file(
        io.BytesIO(response.content),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{filename}.pdf"
    )


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