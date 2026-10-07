#!/bin/bash
#
# Push.sh - committet und pusht (inkl. Submodule). Jeder erzeugte Commit wird
# EXPLIZIT mit SIGNING_KEY signiert (git commit -S), unabhaengig von der
# globalen "commit.gpgsign"-Einstellung. Vor dem Push wird jeder frisch
# erzeugte Commit nochmal mit "git log --show-signature" geprueft - SystemUpdate.sh
# auf den Zielsystemen akzeptiert nur Commits, die mit diesem Schluessel
# signiert sind (siehe LICENSE / SystemUpdate.sh: SIGNING_FPR).
set -uo pipefail

# Voller Fingerabdruck, keine Kurz-ID (git nimmt bei -S auch Kurz-IDs, aber
# die sind leichter zu faelschen). Siehe LICENSE fuer den vollen Abdruck.
SIGNING_KEY="35A14104CDF11BA0565681206979BC4D23F60269"

if ! gpg --batch --list-secret-keys "$SIGNING_KEY" >/dev/null 2>&1; then
    echo "FEHLER: Privater Schluessel $SIGNING_KEY ist hier nicht vorhanden/entsperrbar." >&2
    echo "        Ohne ihn signierte SystemUpdate.sh-Commits wuerden auf den" >&2
    echo "        Zielsystemen abgelehnt. Abbruch, es wird NICHTS committet." >&2
    exit 1
fi

if [ $# -ge 1 ]; then
  commit_msg="$1"
else
  read -p "Commit Message: " commit_msg
fi

if [ -z "$commit_msg" ]; then
  echo "ERROR: ¯\_(ツ)_/¯"
  exit 1
fi

export commit_msg

commit_and_push() {
  local dir="$1"
  cd "$dir" || return 1

  git checkout main 2>/dev/null || git checkout master 2>/dev/null

  git add -A

  if ! git diff-index --quiet HEAD 2>/dev/null; then
    if ! git commit -S"$SIGNING_KEY" -m "$commit_msg"; then
      echo "FEHLER: Signierter Commit in $dir fehlgeschlagen." >&2
      return 1
    fi
  fi

  if ! git log --show-signature -1 2>&1 | grep -q "Good signature from"; then
    echo "FEHLER: Letzter Commit in $dir ist NICHT gueltig signiert, wird NICHT gepusht." >&2
    return 1
  fi

  git push origin HEAD 2>/dev/null || true
}

export -f commit_and_push

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

echo "TrafkSite Repo;"
cd "$ROOT_DIR"
git add -A

if ! git diff-index --quiet HEAD 2>/dev/null; then
  if ! git commit -S"$SIGNING_KEY" -m "$commit_msg"; then
    echo "FEHLER: Signierter Commit im Hauptrepo fehlgeschlagen. Kein Push." >&2
    exit 1
  fi
fi

if ! git log --show-signature -1 2>&1 | grep -q "Good signature from"; then
  echo "FEHLER: Letzter Commit im Hauptrepo ist NICHT gueltig signiert. Kein Push." >&2
  exit 1
fi

git push --recurse-submodules=on-demand

echo ""
echo "Upload complete (⌐■_■)"