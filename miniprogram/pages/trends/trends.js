const app = getApp();
const data = require('../../data/processed');

// 给一组 {name, <valKey>} 计算条形百分比
function withPct(list, valKey) {
  const arr = (list || []).slice();
  const max = Math.max(...arr.map((x) => x[valKey] || 0), 1);
  return arr.map((x) => ({ name: x.name, val: x[valKey] || 0, pct: Math.round(((x[valKey] || 0) / max) * 100) }));
}

Page({
  data: {
    meta: {},
    banner: '',
    keywords: [],
    scenes: [],
    itemHeat: [],
    prices: [],
    sentiments: [],
    insights: [],
  },

  onLoad() {
    const ds = data.dashboardStats || {};
    const meta = ds.meta || {};

    // §9 动态文案：处理完(近)全部候选视为全量，否则显示首批
    const target = meta.target_labeled_count || 0;
    const done = meta.completed_labeled_count || 0;
    let banner;
    if (target && done >= target * 0.95) {
      banner = `已分析近 ${meta.period_days || 90} 天校园社群样本 ${done} 条`;
    } else {
      banner = `已完成首批 ${done} 条样本分析`;
    }

    this.setData({
      meta,
      banner,
      keywords: withPct(ds.keyword_rank, 'count'),
      // 「其他」是兜底桶，展示价值低，从场景图滤掉以突出可执行场景
      scenes: withPct((ds.scene_distribution || []).filter((s) => s.name !== '其他').slice(0, 8), 'count'),
      itemHeat: withPct(ds.item_heat_rank, 'score'),
      prices: withPct(ds.price_distribution, 'count'),
      sentiments: withPct(ds.sentiment_distribution, 'count'),
      insights: ds.trend_insights || [],
    });
  },

  goCampaigns() {
    wx.navigateTo({ url: '/pages/campaigns/campaigns' });
  },
});
