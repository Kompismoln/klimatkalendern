{
  lib,
  callPackage,
  buildNpmPackage,
  imagemagick,
  mobilizon-src,
}:

buildNpmPackage {
  inherit (mobilizon-src) pname version src;

  npmDepsHash = "sha256-TrCAJjtITT5oGTRT+YEjUxDmkSTaVxxd68siDATrNsY=";

  nativeBuildInputs = [ imagemagick ];

  postInstall = ''
    cp -r priv/static $out/static
  '';

  meta = with lib; {
    description = "Frontend for the Mobilizon server";
    homepage = "https://joinmobilizon.org/";
    license = licenses.agpl3Plus;
    maintainers = with maintainers; [
      minijackson
      erictapen
    ];
  };
}
