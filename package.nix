{
  lib,
  stdenv,
  nodejs,
  pnpmConfigHook,
  pnpm_10,
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
    pnpm_10
  ];

  # https://nixos.org/manual/nixpkgs/unstable/#javascript-pnpm
  # https://github.com/NixOS/nixpkgs/blob/master/pkgs/build-support/node/fetch-pnpm-deps/default.nix
  pnpmInstallFlags = [ "--prod" ];
  pnpmDeps = fetchPnpmDeps {
    fetcherVersion = 3;
    hash = "sha256-99SOCAGcQnMqOWyOnGDsTzZHtOh8ngVHmEE949H5KdQ=";
    pnpm = pnpm_10;
    inherit (finalAttrs)
      pname
      version
      src
      pnpmInstallFlags
      ;
  };

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
