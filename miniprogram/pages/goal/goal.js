const app = getApp();
const { goalOptions } = require('../../utils/demo-data');

const goalDesc = {
  '拉午高峰': '缩短午间排队，提升 11:40-12:20 出餐与翻台',
  '晚自习夜宵': '抓住 21 点后自习党的扛饿夜宵需求',
  '考试周套餐': '围绕考研/期末作息，做能量补给套餐',
  '社团团购': '社团/宿舍拼单，凑齐免配送更划算',
  '新品推广': '给新生与老客一个尝鲜记忆点',
  '清库存': '低客流窗口处理当日备货，减少损耗',
};

Page({
  data: { options: goalOptions, desc: goalDesc, goal: '晚自习夜宵' },

  onLoad() {
    this.setData({ goal: app.globalData.goal || '晚自习夜宵' });
  },

  pick(e) {
    this.setData({ goal: e.currentTarget.dataset.goal });
  },

  generate() {
    app.globalData.goal = this.data.goal;
    wx.navigateTo({ url: '/pages/trends/trends' });
  },
});
