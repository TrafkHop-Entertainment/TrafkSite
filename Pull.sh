#!/bin/bash

ROOT_DIR="$(pwd)"

echo "TrafkSite Repo"
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null

git submodule update --init --recursive

# Submodule unter Projects/Contributions/ werden uebersprungen: das sind
# fremde Repos, in denen wir an einem eigenen Feature-Branch fuer einen
# Pull Request arbeiten. Ein erzwungenes "checkout main" wuerde uns von
# diesem Branch runterwerfen.
git submodule foreach --recursive '
  case "$displaypath" in
    Projects/Contributions/*)
      echo "→ Submodul: $displaypath (Contribution, uebersprungen)"
      ;;
    *)
      echo "→ Submodul: $displaypath"
      git checkout main 2>/dev/null || git checkout master 2>/dev/null
      git pull origin HEAD 2>/dev/null || true
      ;;
  esac
'

echo ""
echo "All up to date!"
