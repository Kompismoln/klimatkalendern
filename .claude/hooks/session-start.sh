#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: puts the flake's dev shell on PATH, installs the
# frontend and Elixir dependencies, starts dev-db, migrates the test database and installs the
# timezone data, so that `mix test` and `pnpm test` run as they are.
set -euo pipefail

if [[ ${CLAUDE_CODE_REMOTE:-} != true ]]; then
  exit 0
fi

# Fact: a SessionStart hook's stdout goes into the session's context; the installs' and migrations'
# logs go to stderr instead.
exec >&2

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"
export NIX_CONFIG="extra-experimental-features = nix-command flakes
${NIX_CONFIG:-}"
roots=_build/nix-roots
mkdir -p "$roots"

# Accommodating for the session's network, which refuses GitHub's archives to repositories not
# attached to the session: the github: inputs are fetched over git, which lands them at the store
# path the archive would have, so nix finds them there.
jq -r '.nodes[].locked // empty | select(.type == "github")
  | "git+https://github.com/\(.owner)/\(.repo)?rev=\(.rev)&shallow=1"' flake.lock |
  while read -r ref; do
    nix flake prefetch --quiet "$ref" >/dev/null
  done

# Policy: the dev shell's PATH goes to the session's commands, and to the rest of this hook; the
# profile roots it, so that nix store gc keeps it.
env_file="$roots/dev-shell.env"
nix print-dev-env --quiet --no-warn-dirty --profile "$roots/dev-shell" --json |
  jq -r '"export PATH=\(.variables.PATH.value | @sh):\"$PATH\""' >"$env_file"
cat >>"$env_file" <<'ENV'
export LANG=C.UTF-8
# Accommodating for pnpm, which won't replace node_modules from another pnpm version without a TTY.
export npm_config_confirm_modules_purge=false
ENV
# shellcheck source=/dev/null
. "$env_file"
if [[ -n ${CLAUDE_ENV_FILE:-} ]]; then
  cat "$env_file" >>"$CLAUDE_ENV_FILE"
fi

hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  pnpm install --frozen-lockfile
  sha256sum .claude/hooks/session-start.sh package.json pnpm-lock.yaml pnpm-workspace.yaml >"$hashes"
fi

# Fact: lint-staged's pre-commit runs mix format and mix credo in the dev env, which compiles its
# deps; the test env compiles the app too.
hashes=deps/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  mix local.hex --force --if-missing
  mix local.rebar --force --if-missing
  mix deps.get
  mix deps.compile
  MIX_ENV="test" mix compile
  sha256sum .claude/hooks/session-start.sh mix.exs mix.lock >"$hashes"
fi

dev-db start
MIX_ENV="test" mix ecto.create --quiet
MIX_ENV="test" mix ecto.migrate --quiet
MIX_ENV="test" dev/tz-data.sh
