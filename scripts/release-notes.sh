#!/bin/sh
# Prints the CHANGELOG.md section for one version: scripts/release-notes.sh 0.2.0
awk -v v="$1" '
  /^## \[/ { if (found) exit; if (index($0, "## [" v "]") == 1) { found = 1; next } }
  found
' CHANGELOG.md | sed -e '/./,$!d'
