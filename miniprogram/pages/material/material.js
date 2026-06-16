const app = getApp();

Page({
  data: {
    c: null,
    copyBlocks: [],
  },

  onLoad() {
    const c = app.globalData.selected;
    if (!c) {
      wx.showToast({ title: '请先选择活动', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    const copy = c.copy || {};
    const copyBlocks = [
      { key: 'wechatGroup', label: '微信群话术', text: copy.wechatGroup },
      { key: 'moments', label: '朋友圈文案', text: copy.moments },
      { key: 'xiaohongshu', label: '小红书文案', text: copy.xiaohongshu },
      { key: 'videoScript', label: '短视频脚本', text: copy.videoScript },
      { key: 'customerReply', label: '顾客回复话术', text: copy.customerReply },
    ].filter((b) => b.text);
    this.setData({ c, copyBlocks });
  },

  copyText(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '文案已复制', icon: 'success' }),
    });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },
});
