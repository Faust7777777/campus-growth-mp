// 归一化 AI 返回的活动方案：真实模型常把字段名写成变体（如 xiaohongshu→xiaohuashu），
// 这里把 copy 的 key 映射回小程序约定的 5 个标准字段，避免前端读不到而漏渲染。

const COPY_ALIASES = {
  wechatGroup: ['wechatgroup', 'wechat_group', 'wechat', 'weixin', 'weixingroup', 'groupchat', 'group', '群话术', '微信群', '微信群话术'],
  moments: ['moments', 'moment', 'friendcircle', 'pyq', 'pengyouquan', '朋友圈', '朋友圈文案'],
  xiaohongshu: ['xiaohongshu', 'xiaohuashu', 'xhs', 'redbook', 'rednote', 'red', '小红书', '小红书文案'],
  videoScript: ['videoscript', 'video', 'shortvideo', 'douyin', 'tiktok', 'script', '短视频', '短视频脚本', '视频脚本'],
  customerReply: ['customerreply', 'reply', 'customerservice', 'service', 'kefu', '顾客回复', '回复话术', '客服话术'],
};

const CANON_KEYS = Object.keys(COPY_ALIASES);

function canonKey(rawKey) {
  const k = String(rawKey).toLowerCase().replace(/[\s_-]/g, '');
  for (const canon of CANON_KEYS) {
    if (canon.toLowerCase() === k) return canon;
    if (COPY_ALIASES[canon].some((a) => a.toLowerCase().replace(/[\s_-]/g, '') === k)) return canon;
  }
  // 部分包含匹配（兜底）
  for (const canon of CANON_KEYS) {
    if (COPY_ALIASES[canon].some((a) => k.includes(a.toLowerCase().replace(/[\s_-]/g, '')) && a.length > 2)) return canon;
  }
  return null;
}

function normalizeCopy(copy) {
  const out = {};
  if (copy && typeof copy === 'object') {
    for (const [rawKey, val] of Object.entries(copy)) {
      const canon = canonKey(rawKey);
      if (canon && !out[canon] && val) out[canon] = String(val);
    }
  }
  // 保证 5 个标准字段都存在（缺失留空，前端会过滤）
  for (const canon of CANON_KEYS) if (!(canon in out)) out[canon] = '';
  return out;
}

function asArray(v) {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === 'string') return v.split(/[、,，;；]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

const MARGIN_FLOOR = 0.2; // 毛利率底线 20%

// C1：由套餐菜品 + 菜单成本算成本，与活动价比对，强制毛利底线（去风险化的确定性核心）
function computeCombo(comboItems, comboPrice, menu) {
  const items = menu && menu.items ? menu.items : [];
  let cost = 0;
  let matched = 0;
  for (const ci of comboItems) {
    const m = items.find((it) => String(ci).includes(it.name) || it.name.includes(String(ci)));
    if (m && typeof m.cost === 'number') {
      cost += m.cost;
      matched++;
    }
  }
  let price = Number(comboPrice) || 0;
  // 演示兜底：套餐项没匹配到成本时，按活动价 55% 估成本
  if (matched === 0 && price > 0) cost = Math.round(price * 0.55);

  let status = '✓ 毛利达标';
  let blocked = false;
  if (price <= 0) {
    status = '价格待定';
  } else if (price < cost) {
    blocked = true;
    price = Math.ceil(cost / (1 - MARGIN_FLOOR));
    status = '⚠ 原价低于成本，已自动上调至保本线';
  } else if ((price - cost) / price < MARGIN_FLOOR) {
    blocked = true;
    price = Math.ceil(cost / (1 - MARGIN_FLOOR));
    status = `⚠ 毛利率不足 ${MARGIN_FLOOR * 100}%，已自动上调`;
  }
  const grossMargin = Math.max(0, price - cost);
  const marginRate = price > 0 ? Math.round((grossMargin / price) * 100) : 0;
  return { comboCost: cost, comboPrice: price, grossMargin, marginRate, status, blocked, matched };
}

// C3：核销码（北门鸡排 BMJP- 四位），用于可识别归因
function makeVerifyCode() {
  return 'BMJP-' + String(1000 + Math.floor(Math.random() * 9000));
}

function normalizeCampaign(c, i, menu) {
  const comboItems = asArray(c.comboItems || c.items);
  const margin = computeCombo(comboItems, c.comboPrice, menu);
  return {
    id: c.id || `c_ai_${i + 1}`,
    name: c.name || `活动方案 ${i + 1}`,
    scene: c.scene || '',
    comboName: c.comboName || c.combo || '',
    comboItems,
    priceSuggestion: c.priceSuggestion || c.price || '',
    comboPrice: margin.comboPrice, // C1：经毛利校验后的活动价
    margin, // C1：{comboCost, grossMargin, marginRate, status, blocked}
    verifyCode: c.verifyCode || makeVerifyCode(), // C3：核销码
    token: c.token || '',
    expectedHook: c.expectedHook || c.hook || '',
    risk: c.risk || '',
    publishTime: c.publishTime || c.publish || '',
    copy: normalizeCopy(c.copy),
  };
}

module.exports = { normalizeCampaign, normalizeCopy, computeCombo };
