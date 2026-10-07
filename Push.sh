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

# Locale-unabhaengig (KEIN grep auf die GPG-Textausgabe, die ist auf diesem
# System auf Deutsch, "Good signature from" kaeme also nie vor, selbst bei
# einer tatsaechlich gueltigen Signatur). %G? ist der maschinenlesbare
# Pruefcode von git selbst: G = gueltig (bekanntes Vertrauen), U = gueltig,
# aber Schluessel nicht explizit als vertrauenswuerdig markiert - beides
# akzeptieren wir, zusaetzlich muss der Signierschluessel (%GF) exakt der
# erwartete sein.
verify_last_commit_signed() {
  local status fpr
  status="$(git log -1 --format='%G?' 2>/dev/null)"
  fpr="$(git log -1 --format='%GF' 2>/dev/null)"
  [[ "$status" == "G" || "$status" == "U" ]] && [[ "$fpr" == "$SIGNING_KEY" ]]
}
export -f verify_last_commit_signed

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

  if ! verify_last_commit_signed; then
    echo "FEHLER: Letzter Commit in $dir ist NICHT gueltig mit dem erwarteten Schluessel signiert, wird NICHT gepusht." >&2
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

if ! verify_last_commit_signed; then
  echo "FEHLER: Letzter Commit im Hauptrepo ist NICHT gueltig mit dem erwarteten Schluessel signiert. Kein Push." >&2
  exit 1
fi

git push --recurse-submodules=on-demand

echo ""
echo "Upload complete (⌐■_■)"