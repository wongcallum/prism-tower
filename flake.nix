{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    { self, flake-parts, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" ];
      perSystem =
        let
          revision = toString (self.shortRev or self.dirtyShortRev or self.lastModified or "unknown");
        in
        { pkgs, ... }:
        {
          devShells = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              nodejs
              nodePackages.pnpm_10
            ];
          };

          # Use: inputs.prism-tower.packages.${system}.default.override
          packages.default = pkgs.callPackage ./package.nix { inherit revision; };
        };
    };
}
