# 🍳 Site de Recettes Perso
# Backend : Flask + Markdown

from flask import Flask, render_template
import markdown
import os

app = Flask(__name__)

# Chemin vers ton dossier de recettes Obsidian
RECIPES_DIR = "/mnt/c/Users/VinZ/Documents/Astrobot/Astrobot/02_Personnel/🍳 Recettes de Cuisine"

@app.route("/")
def home():
    recipes = []
    for filename in os.listdir(RECIPES_DIR):
        if filename.endswith(".md"):
            with open(os.path.join(RECIPES_DIR, filename), "r", encoding="utf-8") as f:
                content = f.read()
                html = markdown.markdown(content)
                recipes.append({
                    "title": filename.replace(".md", ""),
                    "html": html,
                    "filename": filename
                })
    return render_template("index.html", recipes=recipes)

@app.route("/recipe/<filename>")
def recipe(filename):
    with open(os.path.join(RECIPES_DIR, filename), "r", encoding="utf-8") as f:
        content = f.read()
        html = markdown.markdown(content)
    return render_template("recipe.html", content=html, title=filename.replace(".md", ""))

if __name__ == "__main__":
    app.run(debug=True)