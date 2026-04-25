#!/bin/bash

ROOT_DIR="$(pwd)"

# ─── Root zuerst pullen ──────────────────────────────────────────────────────
echo "→ Root-Repo"
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null

# ─── Submodule initialisieren & auschecken ───────────────────────────────────
git submodule update --init --recursive

# ─── Alle Submodule von außen nach innen pullen ──────────────────────────────
# (beim Pull ist außen-nach-innen korrekt: Parent zuerst, dann Kind)
git submodule foreach --recursive '
  echo "→ Submodul: $displaypath"
  git checkout main 2>/dev/null || git checkout master 2>/dev/null
  git pull origin HEAD 2>/dev/null || true
'

echo ""
echo "✓ Fertig."

# Made with AI
