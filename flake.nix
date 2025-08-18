{
  description = "build klimatkalendern";

  inputs = {
    nixpkgs.url = "github:kompismoln/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      nixpkgs,
      ...
    }:
    let
      name = "klimatkalendern";
      version = "5.1.2";
      src = ./.;
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f system);
    in
    {
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
              pname = "${name}-elixir";
              inherit src version;
            };
            elixir = elixirPackage;
            inherit beamPackages mobilizon-frontend;
          };
          mobilizon-frontend = pkgs.stdenv.mkDerivation {
            pname = "${name}-frontend";
            inherit src version;

            nativeBuildInputs = with pkgs; [
              imagemagick
              nodejs
              pnpm.configHook
            ];

            pnpmDeps = pkgs.pnpm.fetchDeps {
              pname = name;
              inherit version src;
              fetcherVersion = 2;
              hash = "sha256-0CeK4swILuEw80zV41IuEM2RQTqLGtT6WbllNUetuqc=";
            };

            buildPhase = ''
              runHook preBuild
              pnpm build
              runHook postBuild
            '';

            installPhase = ''
              mkdir -p $out/static
              cp -r priv/static/. $out/static
            '';
            #postInstall = ''
            #  mkdir -p $out/static
            #  cp -r priv/static $out/static
            #'';
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
            name = "${name}-devshell";
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
