// C2 数据飞轮（演示精度）：把每次生成/复盘事件按店落到本地 JSONL，
// 下次生成时回灌"该店历史活动摘要"给 AI。演示用，非生产存储。
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'data', 'store_history.jsonl');

function append(event) {
  try {
    fs.appendFileSync(FILE, JSON.stringify({ ts: Date.now(), ...event }) + '\n', 'utf-8');
  } catch (e) {
    console.warn('history append failed:', e.message);
  }
}

function readAll() {
  try {
    return fs
      .readFileSync(FILE, 'utf-8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

function forStore(store) {
  return readAll().filter((e) => e.store === store);
}

// 给 prompt 用的历史摘要：做过几场、最近一场表现如何
function summary(store) {
  const evs = forStore(store);
  const gens = evs.filter((e) => e.type === 'generate');
  const reports = evs.filter((e) => e.type === 'report');
  if (gens.length === 0) return { count: 0, text: '' };

  let text = `该店历史上已生成过 ${gens.length} 场活动。`;
  const lastRep = reports[reports.length - 1];
  if (lastRep) {
    text += `最近一场「${lastRep.campaignName || '活动'}」核销 ${lastRep.redeemCount} 单、销售额约 ${lastRep.estSales} 元`;
    if (lastRep.ownerNote) text += `，老板评价：${lastRep.ownerNote}`;
    text += '。请参考历史，避免重复同质方案，并针对上次问题改进。';
  } else {
    const lastGen = gens[gens.length - 1];
    if (lastGen && lastGen.names) text += `最近生成过：${lastGen.names.join('、')}，请避免重复。`;
  }
  return { count: gens.length, text };
}

module.exports = { append, forStore, summary };
