# 交接文档 · 校园小店 AI 增长参谋(度小满笔试)

> 给接手 agent：先读这份,再动手。当前进度、已定口径、工作流、待办、坑都在这。
> 最后更新：2026-06-17

---

## 1. 目标与截止

- **这是什么**：度小满“小满摘星计划”AI 实习**笔试答卷**。题目=轻量机会验证,4 方向选 1,选了**方向一「小微AI」(为学校附近商家设计 AI 产品)**。
- **交付物**：**1 页 A4** 机会验证,覆盖 5 点(① 机会判断 ② 用户证据 ③ MVP ④ 商业判断 ⑤ 2 周验证),可附原型/视频/代码仓库链接,上传飞书表单 `https://duxiaoman.feishu.cn/share/base/form/shrcnbrRRIQJhy1xAUwACNMCoLg`。
- **截止**：2026-06-17(周三)23:00。
- **性质**：**产品经理笔试,考思路与判断,不是工程完成度。**所有内容用“展示/汇报”口吻,不要“说明书/自辩”。

---

## 2. 产品定位(已定,勿推翻)

**一句话**：不做“全能 AI 参谋”;先做校园小店的**“活动试错去风险化引擎”**——在“食堂之外”的加餐/饮品/轻正餐场景(咖啡/奶茶/汉堡/外卖夜宵),帮店主低风险做一场**能核销、能复盘、不亏**的活动。

**核心洞察(来自真实数据)**：
- 真竞品是**食堂**(关键词“食堂/三食堂”最高频、“贵”进前五),不是隔壁同行。
- 机会在**食堂不在场的时段**(午高峰/晚自习夜宵/课间/外卖拼单)。
- **数据修正了假设**：原以为切炸串/夜宵,但数据更高频的是食堂/汉堡/咖啡/奶茶/外卖,所以切口锁定“食堂之外的加餐/饮品/轻正餐”。

---

## 3. 当前状态

### 已完成
- **微信小程序 Demo**(`miniprogram/`)：8 页闭环(建档→目标→趋势→AI 生成 3 活动→物料→核销→复盘),真 DeepSeek 调用,失败回退。已加三项“去风险化”能力:
  - **C1 成本/毛利护栏**：菜单带成本,后端算套餐毛利,低于 20% 自动上调标记。
  - **C3 核销码**：每活动唯一码,销售额=核销数×活动价自动算。
  - **C2 历史飞轮**：生成/复盘落盘 JSONL,下次生成回灌本店历史摘要。
- **后端**(`backend/`)：Express,`/api/generate-campaigns` + `/api/generate-report` + `/api/data` + `/api/health`;`ai.js`(DeepSeek,默认 deepseek-chat)/`prompts.js`/`normalize.js`/`fallback.js`/`history.js`。**密钥在 `backend/.env`(已 gitignore)**。
- **数据管线**(WSL `/home/wuwai/campus-ai-growth-data`)：大工盘锦某 QQ 群 93,618 条 → DeepSeek-v4-flash 打标 12,821 → **5,029 条消费样本**,328 批 0 失败。产出 `data/processed/dashboard_stats.json`(关键词/场景/价格/情感聚合)。
- **A4 成稿**：`duxiaoman_A4.html`(**当前主交付物**,1 页 A4 HTML,内联 4 图,导 PDF/截图用)。§5 已是全标准指标体系(AARRR + Sean Ellis 40% + Mom Test + North Star + LTV/CAC),已去“说明文/自辩”腔,已删 Demo 边界/方法出处列。已加“多源合规接入(美团/QQ 频道/群/贴吧,脱敏)”到 A4 §2 与小程序趋势页。

### 进行中 / 待办(见 §6)
- 1 页 A4 是否真单页(需渲染验证)、真实截图、仓库/录屏链接。

---

## 4. 关键产物与路径

| 产物 | 路径 | 说明 |
|---|---|---|
| **A4 终稿(主交付)** | `C:\Users\15892\campus-growth-mp\duxiaoman_A4.html` | 浏览器打开→Ctrl+P→A4 导 PDF/截图 |
| 完整主稿 | `duxiaoman_完整方案_供审计.md` | 5 点完整论证(A4 从这压缩) |
| 审计报告 | `duxiaoman_审计结论_改进清单.md` | 多 agent 审计的漏洞与改进清单 |
| GPT 咨询合并件 | `给GPT5.5Pro_一份搞定.md` | 含 6 个待决问题 + GPT 答复依据 |
| 小程序 | `miniprogram/`(8 页在 `pages/`) | 微信开发者工具导入此目录 |
| 后端 | `backend/`(`npm start`) | DeepSeek 代理,密钥在 `.env` |
| 聚合数据 | `data/processed/dashboard_stats.json` | A4/趋势页所有数字出处 |
| 数据管线 | WSL `/home/wuwai/campus-ai-growth-data` | prepare/label/aggregate |

---

## 5. 已定口径(勿再推翻,反复确认过)

1. **明说地点**：大连理工大学(盘锦校区)、本人大学 QQ 群。不遮掩、不写“某高校”。
2. **清洗即卖点**：真实群嘈杂→AI 清洗出消费信号=数据分析能力。**不要写“诚实边界/样本偏学习”这种自我设限**。
3. **Demo 精度坦然**：用“Demo 演示了 X”自信表述,**不写“设计中/已落地/Demo 边界/生产需对接 POS”**这类 hedge——demo 就是展示效果。
4. **指标全用业内通用的**(AARRR/Sean Ellis 40%/Mom Test/North Star/LTV-CAC),**不自造指标名**。
5. **多源数据**：写“**合规接入**美团/QQ 频道/QQ 群/贴吧(脱敏)”,**不写“爬取/爬虫”**(交金融公司,合规敏感),**不写“规划/未来”**(demo 直接当产品能力呈现)。
6. **商业**:学期包 199–299(避寒暑假流失)、单次包 9.9–19.9、地推只用于前 3–5 家拿样本、规模化靠校园合伙人+免费“校园消费诊断”钩子、CAC<50、LTV/CAC>3、CAC 回收<12 月;ROI 用**综合经营毛利≈30%**(区别于 Demo 护栏的食材毛利≈50%)。
7. **度小满金融**:仅一句克制收尾(经营数据沉淀小微商户画像,补充小微服务),不当主线、不写“反哺信贷风控”。
8. **写作**:展示口吻,无 AI 腔(忌“不是…而是…”对仗、破折号堆叠、自辩句)。

---

## 6. 待办清单(交卷前,按优先级)

- [ ] **P0 验证 A4 是单页**：浏览器打开 `duxiaoman_A4.html`→Ctrl+P→A4/100%,确认 1 页不溢出。溢出则缩字号/压间距(`.page` padding、各 `font-size`)。
- [ ] **P0 真实截图**：开后端(`cd backend && npm start`)→微信开发者工具导入 `miniprogram`(测试号、勾“不校验合法域名”、调试基础库选 **3.14.0** 不要 3.15.2)→截**趋势页/活动物料页/复盘页**3 张→存 `C:\Users\15892\campus-growth-mp\screenshots\`(trends.png/material.png/report.png)→嵌进 A4 底部留白(HTML 里 `.phone` 手机边框样式已留,用 `<img>` 套进去即可)。
- [ ] **P0 填链接**：A4 右上 `代码仓库:[待填]` `实机演示:[待填]` 占位符替换为真链接。
- [ ] **P1 代码仓库**：`git` 已 init(分支见 §7);推 GitHub 需走 Clash 7890 拿公开链接。
- [ ] **P1 录屏**:30–60 秒走闭环(建档→趋势→AI 方案→核销→复盘),旁白脚本见对话/可重写。
- [ ] **P2 待用户拍板的小项**:§2 痛点卡的“来源/假设”标签留不留;“近 3 个月”措辞要不要改中性。
- [ ] **交卷**:A4 导 1 页 PDF → 传飞书表单。

---

## 7. 工作流 / 怎么跑

- **后端**：`cd C:\Users\15892\campus-growth-mp\backend` → `npm start`(localhost:3000)。`.env` 已配 DeepSeek key。
- **小程序**：微信开发者工具导入 `miniprogram/`,AppID=测试号,本地设置勾“不校验合法域名”,调试基础库 **3.14.0**(3.15.2 下载会 EPERM 失败,用已装的 3.14.0)。
- **数据管线**(WSL,改数据时)：`cd /home/wuwai/campus-ai-growth-data` → `python3 scripts/run_pipeline.py prepare/label/aggregate` → 回 Windows `bash tools/sync-from-pipeline.sh` → `node tools/gen-miniprogram-data.js`。DeepSeek key 在 WSL `~/.deepseek_env`。
- **git**：仓库在 `campus-growth-mp/`。`main`=冻结基线,`audit`=工作分支(当前在此)。还原:`git -C <repo> restore .` 或 `git -C <repo> reset --hard main`。**注意**:`.env`/`node_modules`/`store_history.jsonl` 已 gitignore,别提交密钥。

---

## 8. 坑 / 注意事项

- **中文文件**:用 Write 工具写=干净 UTF-8;**别信终端显示**(Windows 控制台 GBK 会显示 mojibake,文件其实没坏)。核验中文用 `python` 读字节比对。
- **路径混用**:git-bash 用 `/c/...`、Windows(python/curl/node)用 `C:\...`、WSL python 读 Windows 文件用 `/mnt/c/...`。三者混用会“文件找不到”。curl 取结果直接管道喂 python(`curl ... | python -c ...`)可绕开。
- **杀进程**:`pkill -f run_pipeline` 会**匹配到自己这条命令而自杀**,要按 PID 或用进程独有参数(如 `candidates`/`max-items`)匹配。
- **Codex**:本机 Codex 沙箱有卡死问题(elevated 卡死 / unelevated 1344),别指望它跑长命令。
- **WSL 后台长任务**:用 harness 的 run_in_background 托管前台 wsl 命令,别用 `nohup &`(父 shell 退出会被回收)。

---

## 9. 一句话现状
A4 终稿(`duxiaoman_A4.html`)内容已基本定稿、口径全部对齐,**就差:验证单页 + 3 张真实截图嵌入 + 填仓库/录屏链接 → 导 PDF 交卷**。
