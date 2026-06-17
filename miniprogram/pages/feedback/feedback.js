const app = getApp();
const { post } = require('../../utils/request');
const { demoFeedback } = require('../../utils/demo-data');
const { reportFallback } = require('../../utils/local-fallback');

Page({
  data: { form: {}, submitting: false, price: 0, verifyCode: '', estSales: 0 },

  onLoad() {
    const sel = app.globalData.selected || {};
    const price = Number(sel.comboPrice) || 0;
    // 预填演示核销数，方便录屏（可改）
    const f = app.globalData.feedback || demoFeedback;
    const redeem = Number(f.redeemCount) || 0;
    this.setData({
      form: Object.assign({}, f),
      price,
      verifyCode: sel.verifyCode || '',
      estSales: redeem * price, // C3：销售额 = 核销数 × 活动价，自动算
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    this.setData({ [`form.${key}`]: val });
    if (key === 'redeemCount') {
      const redeem = Number(val) || 0;
      this.setData({ estSales: redeem * this.data.price });
    }
  },

  validNum(v) {
    if (String(v).trim() === '') return false;
    const n = Number(v);
    return !isNaN(n) && n >= 0;
  },

  async submit() {
    const f = this.data.form;
    if (!this.validNum(f.redeemCount)) {
      wx.showToast({ title: '核销数需为非负数字', icon: 'none' });
      return;
    }
    const estSales = (Number(f.redeemCount) || 0) * this.data.price; // 后端口径一致：自动算
    app.globalData.feedback = Object.assign({}, f, { estSales });
    this.setData({ submitting: true });
    wx.showLoading({ title: '生成复盘中…', mask: true });

    const sel = app.globalData.selected || {};
    const storeName = (app.globalData.store && app.globalData.store.name) || '北门鸡排饭';
    const payload = {
      campaign: Object.assign({}, sel, { store: storeName }),
      feedback: {
        redeemCount: Number(f.redeemCount),
        estSales,
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
