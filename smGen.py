import os
from datetime import datetime

base_urls = [
    "https://trafkhop-entertainment.github.io/TrafkSite/"
]
directory = "."
allowed_extensions = (".html", ".md", ".txt")

# 1. Hier definieren wir die Liste der Pfade, an denen die Datei gespeichert werden soll
output_files = ["sitemap.xml", "projects/AskAlfonz/AskAlfonz/sitemap.xml"]

sitemap_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

today = datetime.now().strftime("%Y-%m-%d")

print(f"Generiere Sitemap für {len(base_urls)} Basis-URLs...")

found_files = []
for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith(allowed_extensions):
            rel_path = os.path.relpath(os.path.join(root, filename), directory)
            url_path = rel_path.replace("\\", "/")
            if url_path.endswith("index.html"):
                url_path = url_path[:-10]
            found_files.append(url_path)

for base in base_urls:
    if not base.endswith("/"):
        base += "/"

    for file_path in found_files:
        loc = (base + file_path).replace("&", "&amp;")
        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>{loc}</loc>")
        sitemap_lines.append(f"    <lastmod>{today}</lastmod>")
        sitemap_lines.append("    <priority>0.80</priority>")
        sitemap_lines.append("  </url>")

sitemap_lines.append("</urlset>")

# 2. Wir gehen die Liste der Pfade durch und speichern die Datei an jedem Ort
content = "\n".join(sitemap_lines)

for path in output_files:
    # Optional: Sicherstellen, dass der Ordner existiert (falls 'projects/...' noch nicht da ist)
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Datei erfolgreich gespeichert unter: {path}")

print(f"Fertig! Insgesamt {len(found_files) * len(base_urls)} Einträge generiert.")
