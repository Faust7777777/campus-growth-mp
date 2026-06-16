const app = getApp();

Page({
  data: { store: null, hasReport: false, tip: '' },

  onShow() {
    const g = app.globalData;
    this.setData({
      store: g.store,
      hasReport: !!g.report,
      tip: this.buildTip(g.store, g.goal),
    });
  },

  buildTip(store, goal) {
    const idle = (store && store.idleTime) || '下午时段';
    return `当前目标「${goal}」。${idle}客流偏少，建议围绕校园场景做一轮活动，AI 可直接帮你生成方案与文案。`;
  },

  startFlow() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  viewReport() {
    if (!app.globalData.report) {
      wx.showToast({ title: '暂无活动反馈', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/report/report' });
  },

  resetDemo() {
    app.resetDemo();
    this.onShow();
    wx.showToast({ title: '已重置演示数据', icon: 'success' });
  },
});
