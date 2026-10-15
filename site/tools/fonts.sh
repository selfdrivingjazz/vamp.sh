#!/usr/bin/env bash
# Rebuild fonts/*.woff2 from upstream (OFL). Needs curl, unzip, uv.
set -euo pipefail
cd "$(dirname "$0")/../fonts"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
FT="uvx --from fonttools[woff] --with brotli fonttools"
curl -sSL -o "$T/archivo.ttf" "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf"
curl -sSL -o "$T/geist.zip" https://github.com/vercel/geist-font/releases/download/v1.7.2/geist-font-v1.7.2.zip
curl -sSL -o "$T/dep.zip" https://github.com/rektdeckard/departure-mono/releases/download/v1.500/DepartureMono-1.500.zip
unzip -qo "$T/geist.zip" -d "$T/geist"; unzip -qo "$T/dep.zip" -d "$T/dep"

$FT varLib.instancer "$T/archivo.ttf" wght=800 wdth=100:125 -o "$T/archivo-800.ttf" -q
$FT subset "$T/archivo-800.ttf" --unicodes="U+0020-007E,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026" \
  --layout-features='kern,liga,calt' --flavor=woff2 --output-file=archivo-800.woff2
$FT varLib.instancer "$T/geist/geist-font/GeistMono/webfonts/GeistMono[wght].woff2" wght=400:500 -o "$T/geist-mono.ttf" -q
$FT subset "$T/geist-mono.ttf" --unicodes="U+0020-007E,U+00A0,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192" \
  --layout-features='kern' --flavor=woff2 --output-file=geist-mono.woff2
$FT subset "$T/dep/DepartureMono-1.500/DepartureMono-Regular.woff2" --unicodes="U+0020-007E,U+2013,U+2014,U+2019,U+2026,U+2605" \
  --flavor=woff2 --output-file=departure-mono.woff2
ls -la *.woff2
