#!/bin/sh
# Deploy the committed site/ to Cloudflare: https://vamp.sh (Worker vamp-sh, static assets, ../wrangler.jsonc)
# and the www.vamp.sh -> https://vamp.sh redirect (Worker vamp-sh-www, ../www/).
# Deploys HEAD, not the working tree: commit first. Needs wrangler auth for the account that holds the
# vamp.sh zone (`npx wrangler login`, or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).
# WRANGLER overrides the wrangler command.
set -eu
cd "$(dirname "$0")/.."
WRANGLER=${WRANGLER:-npx --yes wrangler@4}

rm -rf .deploy
mkdir -p .deploy/src
git archive HEAD site | tar -x -C .deploy/src
node .deploy/src/site/tools/build.mjs --check
cp -RL .deploy/src/site .deploy/site
rm -rf .deploy/site/tools .deploy/site/README.md
sh -n .deploy/site/install
cmp .deploy/site/install .deploy/site/install.sh

$WRANGLER deploy --message "vamp.sh $(git rev-parse --short HEAD)"
$WRANGLER deploy --config www/wrangler.jsonc
echo "deployed $(git rev-parse --short HEAD) to https://vamp.sh"
