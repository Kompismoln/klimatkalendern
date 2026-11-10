#!/usr/bin/env bash
# Usage: dev/tz-data.sh [release]
# Installs tz_world's timezone geodata for $MIX_ENV (default dev), as `mix tz_world.update` would,
# unless it's there already. release defaults to the latest of timezone-boundary-builder.
#
# Accommodating for networks where `mix tz_world.update` can't: it asks api.github.com for the
# release, takes CAStore's bundle (not the system's) for TLS, and its client fails on GitHub's
# redirect to release-assets.githubusercontent.com. Here, git finds the release, curl downloads it,
# and tz_world's own functions transform it and build the .dets file the app reads.
set -euo pipefail

cd "$(dirname "$0")/.."
export MIX_ENV="${MIX_ENV:-dev}"
repo=https://github.com/evansiroky/timezone-boundary-builder
priv="_build/$MIX_ENV/lib/tz_world/priv"

if [[ -s $priv/timezones-geodata.dets ]]; then
  exit 0
fi

release="${1:-$(git ls-remote --tags --refs "$repo" | sed 's|.*refs/tags/||' | sort -V | tail -n 1)}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "tz-data: installing timezone-boundary-builder $release for MIX_ENV=$MIX_ENV" >&2
curl -fsSL -o "$tmp/timezones.geojson.zip" "$repo/releases/download/$release/timezones.geojson.zip"

# Fact: get_latest_release/3 hands generate_compressed_data/3 the body as httpc returns it: a charlist.
TZ_DATA_ZIP="$tmp/timezones.geojson.zip" TZ_DATA_RELEASE="$release" mix run --no-start -e '
  zip = System.fetch_env!("TZ_DATA_ZIP") |> File.read!() |> :binary.bin_to_list()
  TzWorld.GeoData.generate_compressed_data(zip, System.fetch_env!("TZ_DATA_RELEASE"))
  :ok = TzWorld.Backend.DetsWithIndexCache.save_dets_geodata()
'
