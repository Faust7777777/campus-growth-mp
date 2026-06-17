require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { getData } = require('./data');
const { buildCampaignMessages, buildReportMessages } = require('./prompts');
const { callAI, isConfigured, MODEL } = require('./ai');
const { fallbackCampaigns, fallbackReport } = require('./fallback');
const { normalizeCampaign } = require('./normalize');
const history = require('./history');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = parseInt(process.env.PORT || '3000', 10);

// 简单请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: isConfigured(), model: MODEL });
});

// 提供人工整理的样本数据（趋势页可用；前端也内置了离线副本）
app.get('/api/data', (_req, res) => {
  res.json(getData());
});

// 调用一：生成 3 个活动方案与内容包
app.post('/api/generate-campaigns', async (req, res) => {
  const data = getData();
  const menu = data.menuItems;
  const body = req.body || {};
  const storeName = (body.store && body.store.name) || '北门鸡排饭';
  // C2 飞轮：回灌该店历史活动摘要
  const hist = history.summary(storeName);

  let out;
  try {
    const messages = buildCampaignMessages({ ...body, historySummary: hist.text }, data);
    const result = await callAI(messages);
    const campaigns = Array.isArray(result.campaigns) ? result.campaigns : [];
    if (campaigns.length < 1) throw new Error('AI returned no campaigns');
    // C1+C3：对 AI 结果统一算毛利、配核销码
    const normalized = campaigns.slice(0, 3).map((c, i) => normalizeCampaign(c, i, menu));
    out = { source: 'ai', campaigns: normalized, historyCount: hist.count };
  } catch (err) {
    console.warn('generate-campaigns fallback:', err.message);
    // fallback 也走同一套毛利/核销码处理，保持前端一致
    const normalized = fallbackCampaigns.campaigns.map((c, i) => normalizeCampaign(c, i, menu));
    out = { ...fallbackCampaigns, campaigns: normalized, historyCount: hist.count };
  }
  // C2：落盘"生成"事件
  history.append({ type: 'generate', store: storeName, goal: body.goal || '', names: out.campaigns.map((c) => c.name) });
  res.json(out);
});

// 调用二：生成活动复盘报告
app.post('/api/generate-report', async (req, res) => {
  const body = req.body || {};
  let out;
  try {
    const messages = buildReportMessages(body);
    const result = await callAI(messages);
    if (!result.report) throw new Error('AI returned no report');
    out = { source: 'ai', report: result.report };
  } catch (err) {
    console.warn('generate-report fallback:', err.message);
    out = fallbackReport;
  }
  // C2：落盘"复盘"事件（含核销码识别的核销数与销售额）
  const fb = body.feedback || {};
  const cp = body.campaign || {};
  history.append({
    type: 'report',
    store: (cp.store) || '北门鸡排饭',
    campaignName: cp.name || '',
    redeemCount: fb.redeemCount,
    estSales: fb.estSales,
    ownerNote: fb.ownerNote || '',
  });
  res.json(out);
});

app.listen(PORT, () => {
  console.log(`\n校园小店 AI 增长参谋 后端已启动: http://127.0.0.1:${PORT}`);
  console.log(`AI 配置: ${isConfigured() ? '已配置 (' + MODEL + ')' : '未配置 -> 将使用 fallback 演示样例'}\n`);
});
