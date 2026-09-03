#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"
cp "$project_root/worker/index.js" "$dist_root/server/index.js"
cp "$project_root/worker/base-v30.js" "$dist_root/server/base-v30.js"
cp "$project_root/worker/v31-"*.js "$dist_root/server/"
cp "$project_root/worker/v32.js" "$dist_root/server/v32.js"
cp "$project_root/worker/v33.js" "$dist_root/server/v33.js"
cp "$project_root/worker/v34.js" "$dist_root/server/v34.js"
cp "$project_root/worker/v35.js" "$dist_root/server/v35.js"
cp "$project_root/worker/v36.js" "$dist_root/server/v36.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"

echo "Built $dist_root"
