const app = getApp();
const { post } = require('../../utils/request');
const { campaignsFallback } = require('../../utils/local-fallback');

Page({
  data: { loading: true, campaigns: [], source: '', goal: '' },

  onLoad() {
    this.setData({ goal: app.globalData.goal });
    this.generate();
  },

  async generate() {
    this.setData({ loading: true });
    const g = app.globalData;
    // 趋势上下文由后端直接读取 dashboard_stats 构建（handoff §8），前端只传店铺与目标
    const payload = {
      store: g.store,
      goal: g.goal,
    };
    try {
      const res = await post('/api/generate-campaigns', payload);
      this.apply(res);
    } catch (e) {
      // 后端完全连不上 → 本地兜底，保证录屏不断
      this.apply(campaignsFallback);
    }
  },

  apply(res) {
    app.globalData.campaigns = res.campaigns || [];
    app.globalData.campaignSource = res.source || '';
    this.setData({
      loading: false,
      campaigns: res.campaigns || [],
      source: res.source || '',
    });
  },

  retry() {
    this.generate();
  },

  openDetail(e) {
    const idx = e.currentTarget.dataset.idx;
    app.globalData.selected = this.data.campaigns[idx];
    wx.navigateTo({ url: '/pages/material/material' });
  },
});
