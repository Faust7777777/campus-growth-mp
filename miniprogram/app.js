const { defaultStore, demoFeedback } = require('./utils/demo-data');

App({
  globalData: {
    // 后端地址：开发者工具需勾选「不校验合法域名」
    baseUrl: 'http://127.0.0.1:3000',
    store: null,          // 店铺建档信息
    goal: '晚自习夜宵',    // 增长目标
    campaigns: [],        // AI 生成的活动方案
    campaignSource: '',   // ai | fallback
    selected: null,       // 选中的活动
    feedback: null,       // 核销反馈
    report: null,         // 复盘报告
    reportSource: '',
  },

  onLaunch() {
    // 预填演示数据，方便录屏直接走主流程（用户仍可修改）
    if (!this.globalData.store) {
      this.globalData.store = Object.assign({}, defaultStore);
    }
  },

  // 一键重置为演示初始状态
  resetDemo() {
    this.globalData.store = Object.assign({}, defaultStore);
    this.globalData.goal = '晚自习夜宵';
    this.globalData.campaigns = [];
    this.globalData.campaignSource = '';
    this.globalData.selected = null;
    this.globalData.feedback = null;
    this.globalData.report = null;
    this.globalData.reportSource = '';
  },

  // 录屏用：把核销反馈也填成推荐值
  fillDemoFeedback() {
    this.globalData.feedback = Object.assign({}, demoFeedback);
  },
});
