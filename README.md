# Klimatkalendern
Klimatkalendern är en gemensam kalender för alla sveriges miljörörelser.

# Clearing mix and stuff

```
rm -rf deps
rm -rf _build
nix develop
elixir --version ska vara 1.15
mix local.hex --force
mix local.rebar --force
mix deps.clean --all
mix deps.get
MIX_ENV=prod mix compile
```
