#!/usr/bin/env bash
# 把 WSL 数据管线产出的聚合结果同步到本小程序项目，并重建前端离线副本。
# 用法（Windows git-bash 或 WSL 中均可）：bash tools/sync-from-pipeline.sh
set -e

WSL_SRC="/home/wuwai/campus-ai-growth-data/data/processed"
DST_DIR="$(cd "$(dirname "$0")/.." && pwd)/data/processed"

copy_one() {
  local name="$1"
  if command -v wsl >/dev/null 2>&1; then
    # 从 Windows 侧调 wsl 读取
    wsl -e bash -lc "cp '$WSL_SRC/$name' '/mnt/c/Users/15892/campus-growth-mp/data/processed/$name'"
  else
    # 已在 WSL/Linux 内
    cp "$WSL_SRC/$name" "$DST_DIR/$name"
  fi
  echo "synced $name"
}

copy_one dashboard_stats.json
copy_one campus_samples.json
# menu_items.json 为店铺自有菜单（人工维护），不从管线覆盖。

node "$(dirname "$0")/gen-miniprogram-data.js"
echo "done. 记得在微信开发者工具里重新编译小程序。"
