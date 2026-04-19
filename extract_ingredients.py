import os
import json
import re

RECIPES_DIR = "./recettes"
INGREDIENTS_FILE = "./data/ingredients.json"

def extract_ingredients():
    ingredients_data = {}
    for filename in os.listdir(RECIPES_DIR):
        if filename.endswith(".md"):
            with open(os.path.join(RECIPES_DIR, filename), "r", encoding="utf-8") as f:
                content = f.read()
                # Extraire la section "Ingrédients"
                ingredients_section = re.search(r"## 📝 Ingrédients(.*?)(?=##|$)", content, re.DOTALL)
                if ingredients_section:
                    ingredients = []
                    for line in ingredients_section.group(1).split("\n"):
                        if "-" in line or "*" in line:
                            ingredient = line.split("-")[-1].split("*")[-1].strip()
                            ingredients.append(ingredient)
                    ingredients_data[filename] = ingredients
    with open(INGREDIENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(ingredients_data, f, ensure_ascii=False, indent=2)

extract_ingredients()