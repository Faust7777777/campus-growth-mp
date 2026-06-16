const app = getApp();

Page({
  data: {
    report: null,
    source: '',
    campaignName: '',
    redeem: 0,
    sales: 0,
    avg: '0',
    perf: [],
  },

  onShow() {
    const g = app.globalData;
    if (!g.report) {
      this.setData({ report: null });
      return;
    }
    const fb = g.feedback || {};
    const redeem = Number(fb.redeemCount || 0);
    const sales = Number(fb.estSales || 0);
    const avg = redeem > 0 ? (sales / redeem).toFixed(1) : '0';

    // 活动表现条形图：本次 vs 参考目标
    const redeemTarget = 30;
    const salesTarget = 500;
    const perf = [
      { name: '核销数', val: redeem, target: redeemTarget, pct: Math.min(100, Math.round((redeem / redeemTarget) * 100)) },
      { name: '销售额', val: sales, target: salesTarget, pct: Math.min(100, Math.round((sales / salesTarget) * 100)) },
    ];

    this.setData({
      report: g.report,
      source: g.reportSource,
      campaignName: (g.selected && g.selected.name) || '本次活动',
      redeem, sales, avg, perf,
    });
  },

  regenerate() {
    wx.navigateTo({ url: '/pages/goal/goal' });
  },

  exportSummary() {
    // P1：先用复制摘要替代真正导出
    const r = this.data.report;
    if (!r) return;
    const text = `【${this.data.campaignName} 复盘摘要】\n核销 ${this.data.redeem} 次 / 销售额 ${this.data.sales} 元 / 单均 ${this.data.avg} 元\n总结：${r.summary}\n是否继续：${r.continueAdvice}`;
    wx.setClipboardData({ data: text, success: () => wx.showToast({ title: '摘要已复制', icon: 'success' }) });
  },
});
