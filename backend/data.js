// 读取人工整理的 processed 样本数据（非爬虫）。供 prompt 拼装与 /api/data 使用。
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'processed');

function load(name) {
  const p = path.join(DATA_DIR, name);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

let cache = null;

function getData() {
  if (cache) return cache;
  cache = {
    campusSamples: load('campus_samples.json'),
    menuItems: load('menu_items.json'),
    dashboardStats: load('dashboard_stats.json'),
  };
  return cache;
}

module.exports = { getData };
