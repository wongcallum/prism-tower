{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    { self, flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ flake-parts.flakeModules.easyOverlay ];
      systems = [ "x86_64-linux" ];
      perSystem =
        let
          revision = toString (self.shortRev or self.dirtyShortRev or self.lastModified or "unknown");
        in
        { config, pkgs, ... }:
        {
          devShells.default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              nodejs
              corepack
            ];
          };

          packages.prism-tower = pkgs.callPackage ./package.nix { inherit revision; };

          overlayAttrs = {
            inherit (config.packages) prism-tower;
          };
        };
    };
}
