{
  description = "build klimatkalendern";

  inputs = {
    nixpkgs.url = "github:ahbk/nixpkgs/my-nixos";
  };

  outputs =
    {
      self,
      nixpkgs,
    }@inputs:
    let
      inherit (nixpkgs.lib) nixosSystem;

      name = "klimatkalendern";
      hostname = "klimatkalendern.local";
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      version = "5.1.1";
    in
    {
      nixosConfigurations.nixos = nixosSystem {
        specialArgs = {
          inherit inputs;
        };
        modules = [
          (import ./nix/nixos.nix)
          (import ./nix/nixos-hardware.nix)
          self.nixosModules.mobilizon
        ];
      };
      nixosModules = {
        mobilizon = {
          services.nginx.virtualHosts.${hostname} = {
            enableACME = false;
            forceSSL = false;
          };
          services.mobilizon = {
            package = pkgs.mobilizon.overrideAttrs (old: {
              inherit version;
              src = self;
            });
            enable = true;
            settings.":mobilizon" = {
              "Mobilizon.Web.Endpoint" = {
                url.host = hostname;
              };
              "Mobilizon.Storage.Repo" = {
              };
              ":instance" = {
                inherit name hostname;
                email_from = "hej@${hostname}";
                email_reply_to = "hej@${hostname}";
              };
            };
          };
        };
      };
    };
}
