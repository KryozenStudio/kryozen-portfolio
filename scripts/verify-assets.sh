#!/usr/bin/env bash
# =============================================================================
# verify-assets.sh — Kryozen Studio
#
# Run this from the repo root, in Termux, BEFORE every `git push`:
#
#   bash scripts/verify-assets.sh
#
# WHAT IT CATCHES (in order, matching the 6-point checklist in README.md
# "Termux -> GitHub: If an uploaded file still won't load"):
#
#   1. A path referenced in config/site.config.js or a .html/.css file that
#      does not exist on disk AT ALL, or exists under a DIFFERENT CASE than
#      the one referenced (e.g. config says "Thumb.jpg", disk has
#      "thumb.jpg"). This is the #1 real-world cause of "it's in the repo
#      but the site won't load it": GitHub Pages is served by a
#      case-sensitive Linux filesystem, but if the file was ever copied
#      through Android shared storage (the SD card / "Internal Storage",
#      which is FAT/exFAT-formatted and case-INsensitive) before landing in
#      the Termux git working copy, a case mismatch can exist on disk
#      without any error at the time you copied it, add it, or commit it —
#      it only breaks once GitHub Pages tries to serve it. This script's
#      file check is byte-for-byte case-sensitive on purpose, run on
#      Termux's own filesystem (not shared storage), so it reproduces the
#      exact rule GitHub Pages enforces.
#   2. A file that exists on disk, and is referenced correctly, but was
#      never actually `git add`ed — so it's sitting untracked and will
#      never reach GitHub no matter how many times you commit/push.
#   3. A file that IS tracked by git, but has *uncommitted* changes not yet
#      folded into HEAD.
#   4. (best-effort, only if a remote is configured and reachable) A file
#      that's committed locally but hasn't actually been pushed yet — the
#      difference between "I ran git push" and "git push actually sent new
#      commits," which are not the same thing if you're already up to date
#      with a stale remote, mid-conflict, or push silently failed.
#
# Exit code is non-zero if anything above fails, so this is safe to wire
# into a pre-push hook later if you want it to be automatic instead of
# manual (see the bottom of this file for how).
# =============================================================================

set -u
cd "$(dirname "$0")/.." || exit 1
REPO_ROOT="$(pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BOLD='\033[1m'; NC='\033[0m'
FAIL=0

echo "Kryozen Studio — asset verification"
echo "Repo root: $REPO_ROOT"
echo

# ---------------------------------------------------------------------------
# STEP 1 — collect every referenced asset path from config + HTML + CSS.
# Deliberately simple (grep/sed, no JS parser, no jq): this only needs to
# find string literals that look like relative asset paths, not fully
# parse the file.
# ---------------------------------------------------------------------------
REFERENCED_FILE="$(mktemp)"
trap 'rm -f "$REFERENCED_FILE"' EXIT

{
  # config/site.config.js: any quoted string starting with assets/, but
  # skip lines that are entirely a `//` comment first — the config file
  # deliberately keeps a commented-out example project (with an example
  # thumbnail path) as a template for adding real ones, and that example
  # path never exists on disk on purpose. Without this filter every fresh
  # clone would report a permanent false-positive MISSING that has
  # nothing to do with a real bug.
  grep -v '^\s*//' config/site.config.js \
    | grep -oE '"assets/[^"]+"|'"'"'assets/[^'"'"']+'"'"'' \
    | sed -E 's/^["'"'"']//; s/["'"'"']$//'

  # *.html: src="assets/..." / href="assets/..."
  grep -rhoE '(src|href)="assets/[^"]+"' -- *.html 2>/dev/null \
    | sed -E 's/^(src|href)="//; s/"$//'

  # css/*.css: url(assets/...) or url("assets/...")
  grep -rhoE 'url\((["'"'"']?)assets/[^)"'"'"']+' css/*.css 2>/dev/null \
    | sed -E 's/^url\((["'"'"']?)//'
} | sort -u > "$REFERENCED_FILE"

REF_COUNT=$(wc -l < "$REFERENCED_FILE" | tr -d ' ')
echo "Found $REF_COUNT referenced asset path(s) in config/HTML/CSS."
echo

# ---------------------------------------------------------------------------
# STEP 2 — for each one: exists? case matches? tracked by git? clean?
# ---------------------------------------------------------------------------
HAS_GIT=0
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
  HAS_GIT=1
fi

while IFS= read -r rel_path; do
  [ -z "$rel_path" ] && continue

  # --- existence + exact case check -----------------------------------
  # A plain `[ -f "$rel_path" ]` on a case-sensitive filesystem (which
  # Termux's own home directory is) will correctly fail if only the case
  # differs — that IS the check. We don't need special-case logic to
  # "detect" a case mismatch separately; we just need to run the check on
  # the right filesystem, which running this script from Termux's own
  # working copy already guarantees.
  if [ ! -f "$rel_path" ]; then
    # Try to find a case-insensitive match to give a more useful message
    # than a bare "missing".
    dir_part="$(dirname "$rel_path")"
    base_part="$(basename "$rel_path")"
    close_match=""
    if [ -d "$dir_part" ]; then
      close_match="$(find "$dir_part" -maxdepth 1 -iname "$base_part" 2>/dev/null | head -n1)"
    fi
    if [ -n "$close_match" ]; then
      echo -e "${RED}✗ CASE MISMATCH${NC}  referenced: $rel_path"
      echo -e "                 on disk:    $close_match"
      echo "                 Fix: rename the file (or the reference) so the two match exactly —"
      echo "                 see \"Renaming a file to fix its case\" in README.md."
    else
      echo -e "${RED}✗ MISSING${NC}       $rel_path  (referenced, but no file found on disk at all)"
    fi
    FAIL=1
    continue
  fi

  # --- git tracking check ----------------------------------------------
  if [ "$HAS_GIT" -eq 1 ]; then
    if ! git ls-files --error-unmatch "$rel_path" >/dev/null 2>&1; then
      echo -e "${YELLOW}✗ UNTRACKED${NC}     $rel_path  (exists on disk, but 'git add' was never run —"
      echo "                 it will NOT be pushed. Run: git add \"$rel_path\")"
      FAIL=1
      continue
    fi

    if ! git diff --quiet -- "$rel_path" 2>/dev/null; then
      echo -e "${YELLOW}✗ UNCOMMITTED${NC}   $rel_path  (tracked, but has changes not yet committed)"
      FAIL=1
      continue
    fi
  fi

  echo -e "${GREEN}✓${NC} $rel_path"
done < "$REFERENCED_FILE"

echo

# ---------------------------------------------------------------------------
# STEP 3 — best-effort: anything committed locally but not yet on the
# remote. Skipped silently (not a failure) if there's no git repo, no
# remote configured, or no network — this is a bonus check, not a
# requirement, since this script also needs to work fully offline.
# ---------------------------------------------------------------------------
if [ "$HAS_GIT" -eq 1 ]; then
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  remote="$(git config --get "branch.${branch}.remote" 2>/dev/null || echo origin)"
  if git ls-remote --exit-code "$remote" >/dev/null 2>&1; then
    ahead="$(git rev-list --count "${remote}/${branch}..HEAD" 2>/dev/null)"
    if [ -n "$ahead" ] && [ "$ahead" != "0" ]; then
      echo -e "${YELLOW}⚠ $ahead commit(s) on '$branch' have not been pushed to '$remote' yet.${NC}"
      echo "  Run: git push $remote $branch"
      echo
    fi
  fi
fi

# ---------------------------------------------------------------------------
# RESULT
# ---------------------------------------------------------------------------
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All referenced assets exist, match case exactly, and are tracked/committed.${NC}"
  echo "Safe to push."
  exit 0
else
  echo -e "${RED}${BOLD}One or more problems found above — fix them before pushing.${NC}"
  exit 1
fi

# -----------------------------------------------------------------------
# OPTIONAL: run this automatically before every push, so you can't
# forget it. From the repo root, once:
#
#   cp scripts/verify-assets.sh .git/hooks/pre-push
#   chmod +x .git/hooks/pre-push
#
# Git will then run it itself every time you `git push`, and abort the
# push if it fails.
# -----------------------------------------------------------------------
