{
  description = "homelab dashboard";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages.default = self.lib.mkPrismTower {
          inherit pkgs;
          services = [ ];
        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            nodejs
            nodePackages.pnpm
          ];
        };
      }
    )
    // {
      lib.mkPrismTower =
        {
          pkgs,
          services ? [ ],
        }:
        pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = "prism-tower";
          version = "1.0.0";
          src = ./.;

          nativeBuildInputs = [
            pkgs.nodejs
            pkgs.pnpmConfigHook
            pkgs.pnpm
          ];

          pnpmDeps = pkgs.fetchPnpmDeps {
            inherit (finalAttrs) pname version src;
            fetcherVersion = 3;
            hash = "sha256-AMETI+PaFBrzTbc6ALkXSvkDOqEDuDoYK2faUIpRLBo=";
          };

          preBuild = ''
            echo '${builtins.toJSON services}' > public/services.json
          '';

          buildPhase = ''
            runHook preBuild
            pnpm build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r ./dist/* $out
            runHook postInstall
          '';
        });

      nixosModules.default =
        {
          config,
          pkgs,
          lib,
          ...
        }:
        let
          cfg = config.services.prism-tower;
          prismTowerPkg = self.lib.mkPrismTower {
            inherit pkgs;
            services = cfg.services;
          };
        in
        {
          options.services.prism-tower = {
            enable = lib.mkEnableOption "Prism Tower dashboard";

            services = lib.mkOption {
              description = "List of services to display in the dashboard";
              default = [ ];
              type = lib.types.listOf (
                lib.types.submodule {
                  options = {
                    name = lib.mkOption {
                      type = lib.types.str;
                      example = "Jellyfin";
                    };
                    url = lib.mkOption {
                      type = lib.types.str;
                      example = "https://jellyfin.7sref";
                    };
                    iconUrl = lib.mkOption { type = lib.types.str; };
                    category = lib.mkOption { type = lib.types.str; };
                  };
                }
              );
            };
          };

          config = lib.mkIf cfg.enable {
            services.caddy.virtualHosts."prism.tower.7sref" = {
              extraConfig = ''
                tls {
                  issuer internal {
                    ca 7sref_ca
                  }
                }
                root * ${prismTowerPkg}
                file_server
              '';
            };
          };
        };
    };
}
