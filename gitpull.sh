#!/bin/bash

ROOT_DIR="$(pwd)"

echo "TrafkSite Repo"
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null

git submodule update --init --recursive

git submodule foreach --recursive '
  echo "→ Submodul: $displaypath"
  git checkout main 2>/dev/null || git checkout master 2>/dev/null
  git pull origin HEAD 2>/dev/null || true
'

echo ""
echo "All up to date!"
