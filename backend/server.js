require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { getData } = require('./data');
const { buildCampaignMessages, buildReportMessages } = require('./prompts');
const { callAI, isConfigured, MODEL } = require('./ai');
const { fallbackCampaigns, fallbackReport } = require('./fallback');
const { normalizeCampaign } = require('./normalize');

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
  try {
    const messages = buildCampaignMessages(req.body || {}, data);
    const result = await callAI(messages);
    const campaigns = Array.isArray(result.campaigns) ? result.campaigns : [];
    if (campaigns.length < 1) throw new Error('AI returned no campaigns');
    const normalized = campaigns.slice(0, 3).map((c, i) => normalizeCampaign(c, i));
    res.json({ source: 'ai', campaigns: normalized });
  } catch (err) {
    console.warn('generate-campaigns fallback:', err.message);
    res.json(fallbackCampaigns);
  }
});

// 调用二：生成活动复盘报告
app.post('/api/generate-report', async (req, res) => {
  try {
    const messages = buildReportMessages(req.body || {});
    const result = await callAI(messages);
    if (!result.report) throw new Error('AI returned no report');
    res.json({ source: 'ai', report: result.report });
  } catch (err) {
    console.warn('generate-report fallback:', err.message);
    res.json(fallbackReport);
  }
});

app.listen(PORT, () => {
  console.log(`\n校园小店 AI 增长参谋 后端已启动: http://127.0.0.1:${PORT}`);
  console.log(`AI 配置: ${isConfigured() ? '已配置 (' + MODEL + ')' : '未配置 -> 将使用 fallback 演示样例'}\n`);
});
