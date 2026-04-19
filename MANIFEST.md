# MANIFEST.md - Règles pour dev-agent

## 📌 Fichiers Autorisés
| Fichier/Dossier | Modifiable ? | Règles |
|-----------------|--------------|--------|
| `sync_recettes.sh` | ✅ | Script de synchro Git/Vercel. Toujours tester avant de commiter. |
| `templates/*.html` | ✅ | Pages du site. Ne pas casser le design existant. |
| `static/css/style.css` | ✅ | CSS du site. Toujours vérifier la compatibilité mobile. |
| `app.py` | ✅ | Backend Flask. Ne pas modifier les routes existantes sans review. |
| `DEV.md` | ✅ | Documentation. Toujours mettre à jour après une modification. |
| `CHANGELOG.md` | ✅ | Historique des changements. Un commit = une entrée. |
| `vercel_dashboard.sh` | ✅ | Script de dashboard Vercel. Toujours tester l'API avant de commiter. |
| `generate_pdf.sh` | ✅ | Script d'export PDF. Toujours tester avec `wkhtmltopdf`. |

## ❌ Fichiers Interdits
| Fichier/Dossier | Raison |
|-----------------|--------|
| `.env` | Contient des secrets (tokens, mots de passe). |
| `~/.ssh/` | Clés SSH. Risque de sécurité. |
| `venv/` | Environnement Python. Ne pas modifier manuellement. |
| `node_modules/` | Dépendances Node.js. Ne pas modifier. |
| `*.pyc` | Fichiers compilés Python. Ne pas commiter. |

## 🔒 Règles de Sécurité
1. **Toujours travailler sur une branche** : `dev-agent/[mission]` (ex: `dev-agent/notifications-telegram`).
2. **Demander une review avant de merger** sur `main`.
3. **Ne jamais utiliser `git push --force`** sans confirmation.
4. **Notifier Telegram** avant toute action critique (ex: `⚠️ Prêt à merger la branche X. OK ?`).
5. **Tester les modifications** avant de commiter (ex: `./sync_recettes.sh --dry-run`).

## 📝 Feedback Obligatoire
- **Après chaque mission**, mettre à jour `CHANGELOG.md` avec :
  - La date.
  - La description des modifications.
  - Le lien vers la PR (si applicable).
- **Envoyer un résumé Telegram** à @vinzelnino avec :
  - `✅ Mission accomplie : [Titre]`
  - Les fichiers modifiés.
  - Les tests effectués.