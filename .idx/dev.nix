{ pkgs, ... }: {

  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_18
    pkgs.docker
    pkgs.openssl.dev
  ];

  # Sets environment variables in the workspace
  env = {
    SOME_ENV_VAR = "hello";
  };

  # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
  idx.extensions = [
    "mads-hartmann.bash-ide-vscode"
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "bradlc.vscode-tailwindcss"
    "streetsidesoftware.code-spell-checker"
    "cweijan.vscode-database-client2"
    "wix.vscode-import-cost"
    "Prisma.prisma"
  ];

  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
  };

  services.docker.enable = true;
}