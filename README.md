# 校园小店 AI 增长参谋（微信小程序 Demo）

面向大连理工大学盘锦校区及周边小餐饮店主的增长参谋。完整闭环：
**店铺建档 → 选增长目标 → 看校园趋势 → AI 生成 3 个活动方案 → 选活动看物料 → 录核销反馈 → AI 生成复盘报告。**

- 前端：微信小程序（原生，无需 AppID，用测试号/游客模式）
- 后端：本地 Node.js（Express），代理 AI（DeepSeek / OpenAI 兼容），密钥只在后端
- 数据：人工整理的盘锦校区趋势样本（非爬虫），见 `data/processed/`
- 稳定性：AI 未配置 / 超时 / 失败 → 后端返回预置演示样例；后端完全连不上 → 前端本地兜底。**录屏不会断。**

---

## 一、目录结构

```
campus-growth-mp/
├── backend/                 # 本地 Node.js 后端
│   ├── server.js            # /api/generate-campaigns、/api/generate-report、/api/data、/api/health
│   ├── ai.js                # OpenAI 兼容调用（DeepSeek）+ 超时 + JSON 容错
│   ├── prompts.js           # 两个 AI 调用的 prompt
│   ├── fallback.js          # 预置演示样例（录屏兜底）
│   ├── data.js              # 读取 data/processed/*.json
│   └── .env.example         # 复制为 .env 填密钥
├── data/processed/          # 人工整理样本（后端读取，权威源）
│   ├── campus_samples.json  # 24 条校园趋势样本
│   ├── menu_items.json      # 菜品与热度
│   └── dashboard_stats.json # 趋势页可视化聚合
├── miniprogram/             # 小程序前端
│   ├── app.js/json/wxss     # 全局状态 + 设计系统
│   ├── data/processed.js    # 上面 JSON 的同源离线副本（前端 require）
│   ├── utils/               # request / store / demo-data / local-fallback
│   └── pages/               # 8 个页面
└── tools/gen-miniprogram-data.js  # 由 data/processed 重新生成前端副本
```

---

## 二、启动后端

> 需要 Node 18+（已用 Node 24 验证）。

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
# 编辑 .env，填入 DeepSeek 密钥：
#   OPENAI_API_KEY=sk-xxx
#   OPENAI_BASE_URL=https://api.deepseek.com/v1
#   OPENAI_MODEL=deepseek-chat
npm start
```

看到 `后端已启动: http://127.0.0.1:3000` 即可。
**不填密钥也能跑** —— 会自动走 fallback 演示样例，照样能录屏。

自检：
```bash
curl http://127.0.0.1:3000/api/health
```

---

## 三、打开小程序

1. 微信开发者工具 → 导入项目 → 选择 `miniprogram/` 目录。
2. AppID 选「测试号」（或直接用项目内置的游客模式）。
3. 右上角「详情 → 本地设置」→ 勾选 **不校验合法域名、web-view、TLS 版本以及 HTTPS 证书**（这样才能请求本地 `http://127.0.0.1:3000`）。
4. 编译预览。

> 若后端不在 3000 端口，改 `miniprogram/app.js` 里的 `baseUrl`。

---

## 四、录屏演示路径（3-5 分钟）

1. **首页**：介绍店铺「北门鸡排饭 / 盘锦校区」与增长闭环 → 点「开始生成方案」。
2. **店铺建档**：已预填演示数据，口播字段，点「下一步」。
3. **增长目标**：默认选中「晚自习夜宵」→ 点「生成校园增长方案」。
4. **校园趋势洞察**：展示数字卡片 + 关键词/场景/菜品热度/价格带条形图 + 来源（强调“数据驱动、真实整理样本”）→ 点「基于趋势生成活动」。
5. **活动方案**：AI 实时生成 3 个方案（顶部显示「✓ 由 AI 实时生成」；失败则「已使用演示样例」）→ 点「晚自习能量餐」。
6. **执行物料**：展示套餐/口令/发布时间 + 微信群/朋友圈/小红书/短视频/顾客回复文案 → 演示「复制文案」→ 点「去记录核销」。
7. **核销反馈**：已预填 核销 23 / 销售额 386 → 点「生成复盘报告」。
8. **复盘报告**：数字卡片 + 活动表现条形图 + AI 复盘（总结/原因/风险/下周建议/是否继续/调整点）。结论示例：建议继续，但把直接折扣改为加价购饮品。

一键重置：首页「↻ 重置演示数据」，可重复录屏。

---

## 五、AI 接口

| 接口 | 说明 |
| --- | --- |
| `POST /api/generate-campaigns` | 输入店铺信息+目标+趋势，输出 3 个活动方案（含各渠道文案、口令、发布时间） |
| `POST /api/generate-report` | 输入被选活动+核销反馈，输出复盘报告 JSON |
| `GET /api/data` | 返回人工整理的趋势样本 |
| `GET /api/health` | 健康检查（含 AI 是否已配置） |

返回 `source` 字段：`ai`=真实 AI 生成，`fallback`=演示样例。

---

## 五点五、校园趋势数据管线（WSL）

趋势页的数据**不再是手写 mock**，而是来自真实数据管线（项目在 WSL：`/home/wuwai/campus-ai-growth-data`）。

流程：
```
QQ 群 txt 导出
  → prepare（解析+关键词预筛 → candidate_messages.json）
  → label（DeepSeek deepseek-v4-flash 分批打标，断点续跑，失败入 data/failed_batches/）
  → aggregate（聚合 → dashboard_stats.json + campus_samples.json）
  → 同步到本项目 data/processed/ → 重建 miniprogram/data/processed.js
```

跑管线（在 WSL 内）：
```bash
cd /home/wuwai/campus-ai-growth-data
export DEEPSEEK_API_KEY=...      # 或 source ~/.deepseek_env
export DEEPSEEK_MODEL=deepseek-v4-flash
python3 scripts/run_pipeline.py prepare  --raw data/raw/qq_group_90d.txt --out data/processed --limit 10000 --context 5
python3 scripts/run_pipeline.py label    --candidates data/processed/candidate_messages.json --batches data/processed/batches --failed data/failed_batches --batch-size 40 --max-items 10000
python3 scripts/run_pipeline.py aggregate --batches data/processed/batches --out data/processed --campus 大连理工大学盘锦校区 --period-days 90 --target 10000
```

同步到小程序（Windows git-bash 或 WSL）：
```bash
bash tools/sync-from-pipeline.sh
```

- `dashboard_stats.json` 是唯一进趋势页 UI 的聚合文件（schema 见 handoff §6）。
- 小程序**只展示聚合图表**，绝不展示原始聊天 / 昵称 / 群名 / QQ 号。
- `messages_raw.json`、`candidate_messages.json`、`labeled_samples.json` 仅离线分析用，不进小程序、不展示。
- `menu_items.json` 是店铺自有菜单（人工维护），不被管线覆盖。
- 后端生成活动方案时按 handoff §8 读取 `keyword_rank/scene_distribution/item_heat_rank/price_distribution/trend_insights` 作为趋势上下文，prompt 明确「不引用原始聊天、不声称严格因果」。

## 六、边界（按 PRD）

- 不接登录、支付、数据库、POS、微信券、上线审核。
- 不写爬虫；QQ 群/频道数据由人工导出、清洗、脱敏后放入 `data/processed/`。
- 趋势/菜品热度/核销为演示数据，趋势样本为真实人工整理。
- 后续 P1：CSV/JSON 导入 + 关键词提取/场景标签/热度统计；P2 才考虑多源合规采集。
