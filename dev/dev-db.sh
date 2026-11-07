# shellcheck shell=bash
# A throwaway PostgreSQL + PostGIS cluster for development and tests, listening on
# localhost:${MOBILIZON_DATABASE_PORT:-5432} with the roles config/dev.exs and config/test.exs use.

port="${MOBILIZON_DATABASE_PORT:-5432}"
password="${MOBILIZON_DATABASE_PASSWORD:-mobilizon}"
roles=(mobilizon mobilizon_test)

# Accommodating for postgres, which refuses to run as root: as root (cloud sessions), the cluster
# belongs to DEV_DB_OS_USER and lives where that user can reach it.
if [[ $(id -u) == 0 ]]; then
  os_user="${DEV_DB_OS_USER:-postgres}"
  dir="${DEV_DB_DIR:-/var/lib/klimatkalendern/dev-db}"
  as_owner() { runuser -u "$os_user" -- "$@"; }
else
  os_user="$(id -un)"
  dir="${DEV_DB_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/klimatkalendern/dev-db}"
  as_owner() { "$@"; }
fi
data="$dir/data"
sock="$dir/sock"

usage() {
  echo "Usage: dev-db {start|stop|status|reset|enter [psql args...]}"
}

init_pg() {
  mkdir -p "$dir"
  chmod 700 "$dir"
  [[ $(id -u) != 0 ]] || chown "$os_user" "$dir"
  as_owner initdb -D "$data" -U postgres --auth-local=trust --auth-host=scram-sha-256 \
    --encoding=UTF8 --locale=C.UTF-8 >/dev/null
  # Policy: the socket sits in $dir, which only its owner can enter, so trust on it is private;
  # TCP is localhost only and takes the password config/*.exs gives.
  as_owner tee "$data/pg_hba.conf" >/dev/null <<EOF
local all all              trust
host  all all 127.0.0.1/32 scram-sha-256
host  all all ::1/128      scram-sha-256
EOF
}

pg_is_running() {
  as_owner pg_ctl -D "$data" status >/dev/null 2>&1
}

start_pg() {
  as_owner mkdir -p "$sock"
  as_owner pg_ctl -D "$data" -l "$data/server.log" -w start \
    -o "-c listen_addresses=localhost -c port=$port -c unix_socket_directories='$sock'" >/dev/null ||
    {
      echo "postgres failed to start; last log lines:" >&2
      tail -n 20 "$data/server.log" >&2
      exit 1
    }
}

psql_su() {
  psql -h "$sock" -p "$port" -U postgres -d postgres -v ON_ERROR_STOP=1 -qtA "$@"
}

# Fact: ecto.create and the migrations create the database and its extensions (postgis, unaccent,
# pg_trgm), which takes a superuser.
setup_roles() {
  local role
  for role in "${roles[@]}"; do
    if [[ -z "$(psql_su -c "SELECT 1 FROM pg_roles WHERE rolname = '$role'")" ]]; then
      psql_su -c "CREATE ROLE $role WITH LOGIN SUPERUSER PASSWORD '$password'"
    fi
  done
}

start_db() {
  [[ -d $data ]] || init_pg
  pg_is_running || start_pg
  setup_roles
}

stop_db() {
  if pg_is_running; then
    as_owner pg_ctl -D "$data" -w stop >/dev/null
  else
    echo "postgres not running"
  fi
}

case "${1:-}" in
start) start_db ;;
stop) stop_db ;;
status) pg_is_running && echo "running ($data, localhost:$port)" || echo "stopped" ;;
enter)
  shift
  exec psql -h "$sock" -p "$port" -U postgres "$@"
  ;;
reset)
  stop_db
  rm -rf "$dir"
  ;;
*)
  usage
  exit 1
  ;;
esac
