{
  description = "build klimatkalendern";

  inputs = {
    nixpkgs.url = "github:kompismoln/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
    }:
    let
      pname = "klimatkalendern";
      version = "5.1.2";
      src = ./.;
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      inherit (nixpkgs) lib;
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f system);
    in
    rec {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          elixirPackage = pkgs.beam.packages.erlang_26.elixir_1_15;
          beamPackages = pkgs.beam.packages.erlang_26.extend (
            self: super: {
              elixir = self.elixir_1_15;
            }
          );
        in
        rec {
          default = pkgs.callPackage ./nixpkg {
            mobilizon-src = {
              inherit src pname version;
            };
            elixir = elixirPackage;
            inherit beamPackages mobilizon-frontend;
          };
          mobilizon-frontend = pkgs.stdenv.mkDerivation {
            inherit src pname version;

            nativeBuildInputs = with pkgs; [
              imagemagick
              nodejs
              pnpm.configHook
            ];

            pnpmDeps = pkgs.pnpm.fetchDeps {
              inherit pname version src;
              fetcherVersion = 2;
              hash = "sha256-A3xLFr2duWfekyuX63Gt/brPu3MaVV7UQ3bheaV+lAc=";
            };

            buildPhase = ''
              runHook preBuild
              pnpm build
              runHook postBuild
            '';

            installPhase = ''
              mkdir -p $out/static
              cp -r priv/static $out/static
            '';
          };
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          elixirPackage = pkgs.beam.packages.erlang_26.elixir_1_15;
          inotify' = if pkgs.stdenv.isDarwin then pkgs.fswatch else pkgs.inotify-tools;
        in
        {
          default = pkgs.mkShell {
            name = "${pname}-dev";
            packages = with pkgs; [
              (writeScriptBin "npm" ''echo "use pnpm"'')
              (writeScriptBin "npx" ''echo "use pnpm dlx"'')
              pnpm
              mix2nix
              elixirPackage
              cmake
              nodejs
              unzip
              openssl
              file
              imagemagick
              libwebp
              gifsicle
              jpegoptim
              optipng
              pngquant
              inotify'
            ];
          };
        }
      );
    };
}
