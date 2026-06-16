// 把 data/processed/*.json 同源拷贝为小程序可 require 的 processed.js。
// 用法： node tools/gen-miniprogram-data.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
// 小程序只展示聚合结果，只打包 dashboard_stats（纯聚合）。
// campus_samples 是逐条脱敏摘要（更接近原始），不进前端包；仅后端离线读取。
const d = {
  dashboardStats: require(path.join(root, 'data/processed/dashboard_stats.json')),
};
const out =
  '// 自动生成：由 data/processed/dashboard_stats.json 同源拷贝，供小程序离线读取趋势聚合数据。\n' +
  '// 仅含聚合数据，不含逐条样本。重新生成： node tools/gen-miniprogram-data.js\n' +
  'module.exports = ' + JSON.stringify(d, null, 2) + ';\n';

fs.writeFileSync(path.join(root, 'miniprogram/data/processed.js'), out);
console.log('miniprogram/data/processed.js updated:', Buffer.byteLength(out), 'bytes');
