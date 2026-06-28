import os
from datetime import datetime

base_urls = [
    "https://trafkhop-entertainment.github.io/TrafkSite/"
]
directory = "."

output_files = ["sitemap.xml"]

sitemap_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

today = datetime.now().strftime("%Y-%m-%d")

print(f"Generating Sitemap for {len(base_urls)} base URLs:")

def get_priority(url_path):

    p = url_path.lower()

    if "/backups/" in p or "/backup/" in p or "/old/" in p:
        return "0.10"

    if "/gameideas/" in p or "/game-ideas/" in p or "/game_ideas/" in p:
        return "0.45"

    code_exts = (".js", ".ts", ".py", ".css", ".c", ".cpp", ".h", ".hpp",
                 ".sh", ".cmake", ".toml", ".yaml", ".yml", ".json", ".xml")
    if any(p.endswith(ext) for ext in code_exts):
        return "0.65"

    # ── Default
    return "0.85"

found_files = []
for root, dirs, files in os.walk(directory):
    dirs[:] = [d for d in dirs if d != ".git"]

    for filename in files:
        rel_path = os.path.relpath(os.path.join(root, filename), directory)
        url_path = rel_path.replace("\\", "/")

        if url_path in [p.replace("\\", "/") for p in output_files]:
            continue

        name, ext = os.path.splitext(filename)

        found_files.append(url_path)

for base in base_urls:
    if not base.endswith("/"):
        base += "/"

    for file_path in found_files:
        loc = (base + file_path).replace("&", "&amp;")
        priority = get_priority(file_path)
        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>{loc}</loc>")
        sitemap_lines.append(f"    <lastmod>{today}</lastmod>")
        sitemap_lines.append(f"    <priority>{priority}</priority>")
        sitemap_lines.append("  </url>")

sitemap_lines.append("</urlset>")

content = "\n".join(sitemap_lines)

for path in output_files:
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"File saved under: {path}")

print(f"Finish! {len(found_files) * len(base_urls)} Entries generated.")

#MADE WITH AI
