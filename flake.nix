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
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      elixirPackage = pkgs.beam.packages.erlang_26.elixir_1_15;
      beamPackages = pkgs.beam.packages.erlang_26.extend (
        self: super: {
          elixir = self.elixir_1_15;
        }
      );
    in
    rec {
      packages."aarch64-darwin".default = packages.${system}.default;
      packages.${system}.default = pkgs.callPackage ./nixpkg {
        mobilizon-src = {
          inherit src pname version;
        };
        elixir = elixirPackage;
        inherit beamPackages;
        mobilizon-frontend = pkgs.callPackage ./nixpkg/frontend.nix {
          mobilizon-src = {
            inherit src pname version;
          };
        };
      };

      nixosModules.mobilizon = { };

      devShells.${system} = {
        default = pkgs.mkShell {
          name = "${pname}-dev";
          packages = with pkgs; [
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
            inotify-tools
          ];
        };
      };
    };
}
