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
      version = "5.2.0";
      src = ./.;
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          beamPackages = pkgs.beam.packages.erlang_27.extend (
            self: _: {
              elixir = self.elixir_1_17;
            }
          );
        in
        rec {
          default = pkgs.callPackage ./nixpkg {
            mobilizon-src = {
              pname = "${name}-elixir";
              inherit src version;
            };
            inherit beamPackages mobilizon-frontend;
          };
          mobilizon-frontend = pkgs.stdenv.mkDerivation {
            pname = "${name}-frontend";
            inherit src version;

            nativeBuildInputs = with pkgs; [
              imagemagick
              nodejs
              pnpm
              pnpmConfigHook
            ];

            pnpmDeps = pkgs.fetchPnpmDeps {
              pname = name;
              inherit version;
              src = pkgs.lib.fileset.toSource {
                root = src;
                fileset = pkgs.lib.fileset.unions [
                  (src + "/package.json")
                  (src + "/pnpm-lock.yaml")
                ];
              };
              fetcherVersion = 3;
              hash = "sha256-EHD+93Hvn3o7i5Uv0npLK89IU9L5L4G7uQRzas+E2Ik=";
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
          elixirPackage = pkgs.beam.packages.erlang_27.elixir_1_17;
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
