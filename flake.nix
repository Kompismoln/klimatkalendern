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
      version = "5.2.4";
      src = ./.;
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      mkDevDb =
        pkgs:
        pkgs.writeShellApplication {
          name = "dev-db";
          runtimeInputs = [
            (pkgs.postgresql_16.withPackages (ps: [ ps.postgis ]))
            pkgs.coreutils
          ]
          # Dependency: runuser, for running postgres as another user when invoked as root.
          ++ pkgs.lib.optional pkgs.stdenv.hostPlatform.isLinux pkgs.util-linux;
          text = builtins.readFile ./dev/dev-db.sh;
        };

      # Dependency: the participant exports (lib/service/export/participants) call priv/python's
      # modules, which take weasyprint (PDF) and pyexcel-ods3 (ODS); nixpkgs has no pyexcel-ods3.
      mkExportPython =
        pkgs:
        pkgs.python3.withPackages (
          ps:
          let
            pyexcel-ezodf = ps.buildPythonPackage rec {
              pname = "pyexcel-ezodf";
              version = "0.3.4";
              pyproject = true;
              src = ps.fetchPypi {
                inherit pname version;
                hash = "sha256-ly7uqbDkurYN/FzctzeMx7peBwoLcoJ0bAGCxd4BH/E=";
              };
              build-system = [ ps.setuptools ];
              dependencies = [ ps.lxml ];
              doCheck = false;
              pythonImportsCheck = [ "ezodf" ];
            };
            pyexcel-ods3 = ps.buildPythonPackage rec {
              pname = "pyexcel-ods3";
              version = "0.6.1";
              pyproject = true;
              src = ps.fetchPypi {
                inherit pname version;
                hash = "sha256-U3QPybxukeQ83A7k9Ve7OyUthJPTTywR0mqTxTz+vC4=";
              };
              build-system = [ ps.setuptools ];
              dependencies = [
                ps.pyexcel-io
                ps.lxml
                pyexcel-ezodf
              ];
              doCheck = false;
              pythonImportsCheck = [ "pyexcel_ods3" ];
            };
          in
          [
            ps.weasyprint
            pyexcel-ods3
          ]
        );
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          beamPackages = pkgs.beam.packages.erlang_27.overrideScope (
            self: _: {
              elixir = self.elixir_1_17;
            }
          );
        in
        rec {
          dev-db = mkDevDb pkgs;
          default = pkgs.callPackage ./nixpkg {
            mobilizon-src = {
              pname = "${name}-elixir";
              inherit src version;
              patches = [ ];
            };
            inherit mobilizon-frontend;
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
              fetcherVersion = 4;
              hash = "sha256-jkTRPUFud6RURaar7paN9R8Tduh3uRLkiGCjr8X9X5Y=";
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
              (mkDevDb pkgs)
              (mkExportPython pkgs)
              exiftool
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
