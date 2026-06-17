// 拼装两个 AI 调用的 prompt，并约束输出为严格 JSON。

// 把聚合榜单格式化为「名称(值)」串
function rankBrief(list, valKey, limit) {
  return (list || [])
    .slice(0, limit)
    .map((x) => `${x.name}(${x[valKey]})`)
    .join('、');
}

function buildCampaignMessages(payload, data) {
  const { store = {}, goal = '', historySummary = '' } = payload;
  const { menuItems, dashboardStats } = data;

  // 店铺自有菜单（人工维护，供 AI 组合套餐用）；带成本，供毛利约束
  const menuBrief = (menuItems && menuItems.items ? menuItems.items : [])
    .map((m) => `${m.name}(${m.category},售价${m.price}元,成本${m.cost}元)`)
    .join('、');

  // 校园社群聚合趋势（来自数据管线 dashboard_stats，§8 指定字段）
  const ds = dashboardStats || {};
  const meta = ds.meta || {};
  const keywordBrief = rankBrief(ds.keyword_rank, 'count', 8);
  const sceneBrief = rankBrief(ds.scene_distribution, 'count', 5);
  const itemHeatBrief = rankBrief(ds.item_heat_rank, 'score', 8);
  const priceBrief = rankBrief(ds.price_distribution, 'count', 6);
  const insights = (ds.trend_insights || []).map((s) => `- ${s}`).join('\n');

  const schema = `{
  "campaigns": [
    {
      "name": "活动名(简短有记忆点)",
      "scene": "适用场景",
      "comboName": "推荐套餐名",
      "comboItems": ["套餐内菜品名(尽量用菜单内名称)", "..."],
      "comboPrice": 25,
      "priceSuggestion": "价格建议(含原价/活动价/让利逻辑)",
      "token": "优惠口令(4-6字，便于口口相传)",
      "expectedHook": "预期吸引点(一句话)",
      "risk": "风险提醒(一句话)",
      "publishTime": "发布时间建议",
      "copy": {
        "wechatGroup": "微信群话术",
        "moments": "朋友圈文案",
        "xiaohongshu": "小红书文案(可带话题标签)",
        "videoScript": "短视频脚本(分镜)",
        "customerReply": "顾客回复话术"
      }
    }
  ]
}`;

  const system = `你是面向校园小店的增长运营参谋。服务对象是大连理工大学盘锦校区及周边的小餐饮店主。
要求：方案必须适合校园小店、可落地、低门槛；让利克制，优先“加量/加饮/加价购”而非大幅直接打折。
【毛利硬约束】comboPrice 必须 ≥ 套餐内各菜品成本之和，且毛利率不低于 20%，绝不生成亏本价。
以下趋势来自校园社群样本的聚合分析，不要引用任何原始聊天内容、昵称或群名。不要声称严格因果增长。
只输出一个 JSON 对象，不要任何解释、不要 markdown 代码块。JSON 必须严格符合给定结构，且 campaigns 恰好包含 3 个方案。`;

  const user = `以下是大连理工大学盘锦校区近 ${meta.period_days || 90} 天校园社群样本的聚合分析结果。

【店铺信息】
店名：${store.name || '北门鸡排饭'}
学校：${store.school || '大连理工大学盘锦校区'}
类型：${store.type || '快餐/鸡排饭'}
客单价：${store.price || 18}元
主打菜品：${store.signature || '招牌鸡排饭'}
淡时段：${store.idleTime || '下午15:00-17:00'}
当前问题：${store.problem || '晚自习后和下午课间客流不足'}

【增长目标】${goal || '晚自习夜宵'}

【店铺菜单】${menuBrief}

【高频关键词】${keywordBrief || '（暂无）'}
【消费场景分布】${sceneBrief || '（暂无）'}
【品类热度榜】${itemHeatBrief || '（暂无）'}
【价格敏感度分布】${priceBrief || '（暂无）'}
${insights ? '【趋势结论】\n' + insights + '\n' : ''}${historySummary ? '【本店历史活动（请参考并避免重复）】' + historySummary + '\n' : ''}
请基于这些趋势、店铺菜单和商家目标，生成 3 个适合校园小店执行的活动方案。每个套餐给出 comboPrice（活动价，需满足毛利硬约束）。严格按以下 JSON 结构输出：
${schema}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function buildReportMessages(payload) {
  const { campaign = {}, feedback = {} } = payload;

  const schema = `{
  "report": {
    "summary": "活动表现总结",
    "reasons": ["表现好/不好的原因", "..."],
    "risks": ["问题与风险", "..."],
    "nextWeekSuggestions": ["下周建议", "..."],
    "shouldContinue": true,
    "continueAdvice": "是否建议继续(一句话)",
    "adjustments": ["调整点", "..."]
  }
}`;

  const system = `你是校园小店的增长复盘参谋。基于活动与核销反馈给出务实、可执行的复盘。
让利建议要克制，优先“加价购/加量”而非大幅直接打折。
只输出一个 JSON 对象，不要任何解释、不要 markdown 代码块，严格符合给定结构。`;

  const user = `【被选活动】
活动名：${campaign.name || '晚自习能量餐'}
场景：${campaign.scene || '晚自习夜宵'}
套餐：${campaign.comboName || '招牌鸡排饭+卤蛋+柠檬茶'}
价格建议：${campaign.priceSuggestion || ''}

【核销反馈】
核销数：${feedback.redeemCount ?? 23}
估算销售额：${feedback.estSales ?? 386}元
顾客反馈：${feedback.customerFeedback || '学生反馈量足、扛饿，价格能接受'}
老板评价：${feedback.ownerNote || '夜宵时段忙，利润一般'}

请生成这次活动的复盘报告，严格按以下 JSON 结构输出：
${schema}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

module.exports = { buildCampaignMessages, buildReportMessages };
