const app = getApp();
const { post } = require('../../utils/request');
const { demoFeedback } = require('../../utils/demo-data');
const { reportFallback } = require('../../utils/local-fallback');

Page({
  data: { form: {}, submitting: false },

  onLoad() {
    // 预填推荐演示值，方便录屏（可改）
    const f = app.globalData.feedback || demoFeedback;
    this.setData({ form: Object.assign({}, f) });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  validNum(v) {
    if (String(v).trim() === '') return false;
    const n = Number(v);
    return !isNaN(n) && n >= 0;
  },

  async submit() {
    const f = this.data.form;
    if (!this.validNum(f.redeemCount) || !this.validNum(f.estSales)) {
      wx.showToast({ title: '核销数与销售额需为非负数字', icon: 'none' });
      return;
    }
    app.globalData.feedback = Object.assign({}, f);
    this.setData({ submitting: true });
    wx.showLoading({ title: '生成复盘中…', mask: true });

    const payload = {
      campaign: app.globalData.selected,
      feedback: {
        redeemCount: Number(f.redeemCount),
        estSales: Number(f.estSales),
        customerFeedback: f.customerFeedback,
        ownerNote: f.ownerNote,
      },
    };

    let res;
    try {
      res = await post('/api/generate-report', payload);
    } catch (e) {
      res = reportFallback;
    }
    app.globalData.report = res.report;
    app.globalData.reportSource = res.source || '';

    wx.hideLoading();
    this.setData({ submitting: false });
    wx.redirectTo({ url: '/pages/report/report' });
  },
});
