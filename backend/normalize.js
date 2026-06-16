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

function normalizeCampaign(c, i) {
  return {
    id: c.id || `c_ai_${i + 1}`,
    name: c.name || `活动方案 ${i + 1}`,
    scene: c.scene || '',
    comboName: c.comboName || c.combo || '',
    comboItems: asArray(c.comboItems || c.items),
    priceSuggestion: c.priceSuggestion || c.price || '',
    token: c.token || '',
    expectedHook: c.expectedHook || c.hook || '',
    risk: c.risk || '',
    publishTime: c.publishTime || c.publish || '',
    copy: normalizeCopy(c.copy),
  };
}

module.exports = { normalizeCampaign, normalizeCopy };
