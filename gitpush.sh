#!/bin/bash

# ─── Commit-Nachricht ────────────────────────────────────────────────────────
if [ $# -ge 1 ]; then
  commit_msg="$1"
else
  read -p "Commit Nachricht: " commit_msg
fi

if [ -z "$commit_msg" ]; then
  echo "Fehler: Leer darfs auch nich sein, ja!."
  exit 1
fi

export commit_msg

# ─── Hilfsfunktion: ein einzelnes Repo committen & pushen ────────────────────
commit_and_push() {
  local dir="$1"
  cd "$dir" || return 1

  # Auf main/master wechseln
  git checkout main 2>/dev/null || git checkout master 2>/dev/null

  git add -A

  if ! git diff-index --quiet HEAD 2>/dev/null; then
    git commit -m "$commit_msg"
  fi

  git push origin HEAD 2>/dev/null || true
}

export -f commit_and_push

# ─── Tiefe zuerst: alle Submodule von innen nach außen ──────────────────────
# git submodule foreach gibt Pfade von außen nach innen aus → umkehren
mapfile -t submodule_paths < <(
  git submodule foreach --recursive --quiet 'echo "$displaypath"' 2>/dev/null \
  | awk '{ print NR, $0 }' \
  | sort -rn \
  | awk '{ print $2 }'
)

ROOT_DIR="$(pwd)"

for rel_path in "${submodule_paths[@]}"; do
  echo "→ Submodul: $rel_path"
  commit_and_push "$ROOT_DIR/$rel_path"
  cd "$ROOT_DIR"
done

# ─── Root-Repo zuletzt ───────────────────────────────────────────────────────
echo "→ Root-Repo"
cd "$ROOT_DIR"
git add -A

if ! git diff-index --quiet HEAD 2>/dev/null; then
  git commit -m "$commit_msg"
fi

git push --recurse-submodules=on-demand

echo ""
echo "✓ Fertig."

# Made with ai
