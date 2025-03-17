{
  description = "build klimatkalendern";

  inputs = {
    nixpkgs.url = "github:ahbk/nixpkgs/my-nixos";
  };

  outputs =
    {
      nixpkgs,
      ...
    }:
    let
      name = "klimatkalendern";
      version = "5.1.1";
      src = ./.;
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      inherit (pkgs.beamPackages) buildMix;
    in
    {

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
          ];
        };
      };
    };
}
