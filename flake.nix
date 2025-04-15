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
      mixNix = import ./mix.nix;

      inherit (pkgs.beamPackages) buildMix;
    in
    {
      inherit self mixNix;

      packages.${system} = {
        default = buildMix {
          inherit name version src;
          patches = [ ];
          nativeBuildInputs = [
            pkgs.git
            pkgs.cmake
          ];
          beamDeps = import ./mix.nix {
            inherit (pkgs) lib beamPackages;
          };
        };
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
