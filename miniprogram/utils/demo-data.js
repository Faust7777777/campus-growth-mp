// 默认演示数据：PRD Demo 推荐路径（北门鸡排饭 / 大连理工大学盘锦校区）。
const defaultStore = {
  name: '北门鸡排饭',
  school: '大连理工大学盘锦校区',
  type: '快餐 / 鸡排饭',
  price: '18',
  signature: '招牌鸡排饭',
  idleTime: '下午 15:00-17:00',
  problem: '晚自习后和下午课间客流不足',
};

const demoFeedback = {
  redeemCount: '23',
  estSales: '386',
  customerFeedback: '学生反馈量足、扛饿，价格能接受',
  ownerNote: '夜宵时段忙，利润一般，想少打点折',
};

// 增长目标选项（PRD 4.3）
const goalOptions = [
  '拉午高峰',
  '晚自习夜宵',
  '考试周套餐',
  '社团团购',
  '新品推广',
  '清库存',
];

module.exports = { defaultStore, demoFeedback, goalOptions };
