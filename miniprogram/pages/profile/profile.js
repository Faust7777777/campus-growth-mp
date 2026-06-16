const app = getApp();

Page({
  data: { form: {} },

  onLoad() {
    this.setData({ form: Object.assign({}, app.globalData.store) });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  next() {
    const f = this.data.form;
    // 必填：店名、类型、客单价、主打菜品
    if (!f.name || !f.type || !String(f.price).trim() || !f.signature) {
      wx.showToast({ title: '请先补全店铺关键信息', icon: 'none' });
      return;
    }
    app.globalData.store = Object.assign({}, f);
    wx.navigateTo({ url: '/pages/goal/goal' });
  },
});
