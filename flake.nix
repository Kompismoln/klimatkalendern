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
      name = "klimatkalendern";
      version = "5.1.1";
      src = ./.;
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    rec {
      packages."aarch64-darwin".default = packages.${system}.default;
      packages.${system}.default = pkgs.callPackage ./pkgs/mobilizon {
        mixNix = import ./mix.nix;
        elixir = pkgs.beam.packages.erlang_26.elixir_1_15;
        beamPackages = pkgs.beam.packages.erlang_26.extend (self: super: { elixir = self.elixir_1_15; });
        mobilizon-frontend = pkgs.callPackage ./pkgs/mobilizon/frontend.nix {
          mobilizon-src = self;
        };
        mobilizon-src = self;
      };

      nixosModules.mobilizon = { };

      devShells.${system} = {
        default = pkgs.mkShell {
          name = "${name}-dev";
          packages = with pkgs; [
            mix2nix
            elixir
            cmake
            nodejs
            erlang
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
