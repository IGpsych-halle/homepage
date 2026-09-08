#!/usr/bin/env bash
set -euo pipefail

SFTP_TARGET="a6bfd@wp3.itz.uni-halle.de"
REMOTE_ROOT="/public"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$REPO_ROOT" ]] || {
  echo "FEHLER: Dieses Skript muss innerhalb des lokalen Git-Repos liegen."
  echo "Lege deploy-website.sh und deploy-website.bat in den Root-Ordner des Repos."
  read -r -p "Enter zum Beenden..." _
  exit 1
}

CONFIG_FILE="$HOME/.igpsych-website-deploy.conf"
STATE_FILE="$REPO_ROOT/.git/igpsych-deploy-state"

die() {
  echo
  echo "FEHLER: $*" >&2
  read -r -p "Enter zum Beenden..." _
  exit 1
}

normalize_key_path() {
  local p="$1"
  p="${p/#\~/$HOME}"
  if [[ "$p" =~ ^([A-Za-z]):\\(.*)$ ]]; then
    local drive="${BASH_REMATCH[1],,}"
    local rest="${BASH_REMATCH[2]//\\//}"
    p="/$drive/$rest"
  fi
  printf '%s' "$p"
}

should_deploy() {
  case "$1" in
    README|README.*|readme|readme.*|LICENSE|LICENSE.*|license|license.*) return 1 ;;
    .gitignore|.gitattributes|.github/*|.vscode/*|.idea/*) return 1 ;;
    deploy-website.sh|deploy-website.bat|DEPLOY-README.txt) return 1 ;;
    noticeboard-client*|noticeboard_client*|blackboard_importer*|SchwarzesBrettImporter*) return 1 ;;
    *.pyc|__pycache__/*) return 1 ;;
  esac
  return 0
}

quote_sftp() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  printf '"%s"' "$s"
}

command -v git >/dev/null || die "Git nicht gefunden."
command -v sftp >/dev/null || die "sftp nicht gefunden."
command -v ssh-add >/dev/null || die "ssh-add nicht gefunden."

cd "$REPO_ROOT"

echo
echo "IG Psychologie Halle – Website Deploy"
echo "Repo: $REPO_ROOT"
echo "Ziel: $SFTP_TARGET:$REMOTE_ROOT"
echo

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "Bitte zuerst alle gewünschten Änderungen committen."
fi

CURRENT_COMMIT="$(git rev-parse HEAD)"

if UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
  UPSTREAM_COMMIT="$(git rev-parse "$UPSTREAM" 2>/dev/null || true)"
  if [[ -n "$UPSTREAM_COMMIT" && "$UPSTREAM_COMMIT" != "$CURRENT_COMMIT" ]]; then
    echo "WARNUNG: Lokaler Stand entspricht nicht $UPSTREAM."
    echo "Prüfe, ob du bereits git pull / git push ausgeführt hast."
    echo
    read -r -p "Trotzdem deployen? [j/N]: " ans
    [[ "${ans,,}" == "j" || "${ans,,}" == "ja" || "${ans,,}" == "y" || "${ans,,}" == "yes" ]] || exit 0
  fi
fi

KEY_PATH=""
[[ -f "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

if [[ -z "${KEY_PATH:-}" || ! -f "$KEY_PATH" ]]; then
  echo "Ersteinrichtung auf diesem Rechner:"
  echo "Pfad zum PRIVATEN SSH-Key angeben."
  echo "Beispiele:"
  echo "  ~/.ssh/igpsych"
  echo "  C:\Users\Name\.ssh\igpsych"
  echo
  echo "Nicht die .pub-Datei verwenden."
  read -r -p "Privater Key: " entered
  KEY_PATH="$(normalize_key_path "$entered")"
  [[ -f "$KEY_PATH" ]] || die "Key nicht gefunden: $KEY_PATH"
  [[ "$KEY_PATH" != *.pub ]] || die "Bitte den privaten Key ohne .pub angeben."
  printf 'KEY_PATH=%q\n' "$KEY_PATH" > "$CONFIG_FILE"
  chmod 600 "$CONFIG_FILE" 2>/dev/null || true
  echo "Key-Pfad wurde nur lokal für diesen Benutzer gespeichert."
  echo
fi

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"; [[ -n "${SSH_AGENT_PID:-}" ]] && ssh-agent -k >/dev/null 2>&1 || true' EXIT

declare -A SEEN_DIRS
UPLOAD_COUNT=0
DELETE_COUNT=0

printf 'cd %s\n' "$(quote_sftp "$REMOTE_ROOT")" > "$BATCH_FILE"

add_dirs() {
  local file="$1"
  local dir="${file%/*}"
  [[ "$dir" == "$file" ]] && return 0
  local current=""
  IFS='/' read -ra parts <<< "$dir"
  for part in "${parts[@]}"; do
    [[ -z "$part" ]] && continue
    [[ -z "$current" ]] && current="$part" || current="$current/$part"
    if [[ -z "${SEEN_DIRS[$current]+x}" ]]; then
      printf -- '-mkdir %s\n' "$(quote_sftp "$current")" >> "$BATCH_FILE"
      SEEN_DIRS["$current"]=1
    fi
  done
}

upload_file() {
  local path="$1"
  should_deploy "$path" || return 0
  [[ -f "$REPO_ROOT/$path" ]] || return 0
  add_dirs "$path"
  printf 'put %s %s\n' "$(quote_sftp "$REPO_ROOT/$path")" "$(quote_sftp "$path")" >> "$BATCH_FILE"
  ((UPLOAD_COUNT+=1))
}

delete_file() {
  local path="$1"
  should_deploy "$path" || return 0
  printf -- '-rm %s\n' "$(quote_sftp "$path")" >> "$BATCH_FILE"
  ((DELETE_COUNT+=1))
}

LAST_COMMIT=""
if [[ -f "$STATE_FILE" ]]; then
  LAST_COMMIT="$(tr -d '\r\n' < "$STATE_FILE")"
  git cat-file -e "$LAST_COMMIT^{commit}" 2>/dev/null || LAST_COMMIT=""
fi

if [[ -z "$LAST_COMMIT" ]]; then
  echo "Erster Deploy mit diesem Skript auf diesem lokalen Repo:"
  echo "Alle relevanten, von Git getrackten Website-Dateien werden hochgeladen."
  echo
  while IFS= read -r path; do
    upload_file "$path"
  done < <(git ls-files)
else
  echo "Änderungen seit dem letzten erfolgreichen Deploy:"
  git diff --name-status --find-renames "$LAST_COMMIT" "$CURRENT_COMMIT" || true
  echo

  while IFS=$'\t' read -r status p1 p2; do
    [[ -z "$status" ]] && continue
    case "$status" in
      A*|M*|T*) upload_file "$p1" ;;
      D*) delete_file "$p1" ;;
      R*) delete_file "$p1"; upload_file "$p2" ;;
      C*) upload_file "$p2" ;;
    esac
  done < <(git diff --name-status --find-renames "$LAST_COMMIT" "$CURRENT_COMMIT")
fi

printf 'bye\n' >> "$BATCH_FILE"

if (( UPLOAD_COUNT == 0 && DELETE_COUNT == 0 )); then
  echo "Keine Änderungen seit dem letzten erfolgreichen Deploy."
  exit 0
fi

echo "Deployment-Plan:"
echo "  Uploads: $UPLOAD_COUNT"
echo "  Löschungen: $DELETE_COUNT"
echo
read -r -p "Jetzt deployen? [J/n]: " confirm
if [[ -n "$confirm" && "${confirm,,}" != "j" && "${confirm,,}" != "ja" && "${confirm,,}" != "y" && "${confirm,,}" != "yes" ]]; then
  echo "Abgebrochen."
  exit 0
fi

echo
eval "$(ssh-agent -s)" >/dev/null
echo "Falls nötig, jetzt die Passphrase des SSH-Keys eingeben:"
ssh-add "$KEY_PATH" || die "SSH-Key konnte nicht geladen werden."

echo
echo "Übertrage Dateien..."
if sftp -b "$BATCH_FILE" -i "$KEY_PATH" "$SFTP_TARGET"; then
  printf '%s\n' "$CURRENT_COMMIT" > "$STATE_FILE"
  echo
  echo "DEPLOY ERFOLGREICH"
  echo "Commit: $CURRENT_COMMIT"
  echo "Uploads: $UPLOAD_COUNT | Löschungen: $DELETE_COUNT"
else
  die "SFTP-Deployment fehlgeschlagen. Deploy-Stand wurde nicht aktualisiert."
fi

echo
read -r -p "Enter zum Beenden..." _
