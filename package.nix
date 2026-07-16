{
  lib,
  stdenv,
  nodejs,
  pnpmConfigHook,
  pnpm_11,
  fetchPnpmDeps,
  revision,
  services ? [ ],
  links ? [ ],
  searchUrl ? "",
}:
stdenv.mkDerivation (finalAttrs: {
  pname = "prism-tower";
  version = revision;
  src = ./.;

  nativeBuildInputs = [
    nodejs
    pnpmConfigHook
    pnpm_11
  ];

  # https://nixos.org/manual/nixpkgs/unstable/#javascript-pnpm
  # https://github.com/NixOS/nixpkgs/blob/master/pkgs/build-support/node/fetch-pnpm-deps/default.nix
  pnpmInstallFlags = [ "--prod" ];
  pnpmDeps =
    (fetchPnpmDeps {
      fetcherVersion = 4;
      hash = "sha256-JzHTAbUQQDqdTeSoRElaarrzGnbXZXq8/6Pbj6w0Fkg=";
      pnpm = pnpm_11;
      inherit (finalAttrs)
        pname
        version
        src
        pnpmInstallFlags
        ;
    }).overrideAttrs
      (old: {
        # This is bad practice, but I don't have all the disk space in the world.
        # Fetching the native dependencies of all architectures increases the deps size by 8x.
        installPhase = builtins.replaceStrings [ "--force" ] [ "" ] old.installPhase;
      });

  env = {
    SEARCH_URL = lib.escapeShellArg searchUrl;
  };

  preBuild = ''
    echo '${builtins.toJSON services}' > public/services.json
    echo '${builtins.toJSON links}' > public/links.json
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
})
