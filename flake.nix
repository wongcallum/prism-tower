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
          links = [ ];
          searchUrl = "";
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
          services,
          links,
          searchUrl,
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
            hash = "sha256-BKGzbkoG5Ua7xzdwsO05nSXqQovWjWcYqV8iE3p0zeQ=";
          };

          preBuild = ''
            echo '${builtins.toJSON services}' > public/services.json
            echo '${builtins.toJSON links}' > public/links.json
          '';

          buildPhase = ''
            runHook preBuild
            export SEARCH_URL=${pkgs.lib.escapeShellArg searchUrl}
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
        { lib, ... }:
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

            links = lib.mkOption {
              description = "Extra links that will appear in search autocomplete";
              default = [ ];
              type = lib.types.listOf (
                lib.types.submodule {
                  options = {
                    name = lib.mkOption {
                      type = lib.types.str;
                      example = "ArchWiki";
                    };
                    url = lib.mkOption {
                      type = lib.types.str;
                      example = "https://wiki.archlinux.org";
                    };
                  };
                }
              );
            };

            searchUrl = lib.mkOption {
              description = "URL for the search bar";
              default = "https://google.com/search";
              type = lib.types.str;
            };
          };
        };
    };
}
