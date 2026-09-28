# Human–AI Monitor 架构

**版本：** 1.0.1  
**日期：** 2026年9月27日  
**状态：** 工作文档，开放审查

**Language:** [🇬🇧 English](architecture.md) | [🇷🇺 Русский](architecture.ru.md)

---

## 1. 概述

Human–AI Monitor 构建在**去中心化的 Cloudflare 基础设施**之上——一个由边缘服务器组成的全球网络，提供：

- **零冷启动** — Workers 即时启动。
- **全球分布** — 代码在靠近用户的位置运行。
- **免费套餐** — Workers 每天最多 100,000 次请求。
- **容错性** — 无单点故障。

**启动成本：** $0。

---

## 2. 组件

### 2.1. Cloudflare Workers — 系统的「大脑」

**作用：** 编排数据收集、分类和公共 API。

**单一 Worker，两个处理器：**

1. **`fetch` 处理器** — 公共 API：
   - `GET /` — 项目元数据。
   - `GET /health` — 健康检查。
   - `GET /gap` — 当前 Gap Index。
   - `GET /protocols` — 每周协议列表。
   - `GET /protocols/{week}` — 单个协议元数据。
   - `GET /protocols/{week}/content` — Markdown 内容。
   - `GET /axes/{axis}` — 特定轴的信号。
   - `GET /classify?text=...&kind=ai|human` — 对任意文本进行分类。
   - `GET /collect?limit=N&max=M` — 手动 RSS 采集。
   - `GET /generate?week=YYYY-MM-DD` — 手动生成协议。

2. **`scheduled` 处理器** — Cron Trigger：
   - 每天分 5 批运行（13:00, 13:15, 13:30, 13:45, 23:00 UTC）。
   - 每批从 8-9 个源采集新鲜新闻。
   - 通过 Workers AI 对每条进行分类。
   - 保存到 D1。
   - 周五 13:45 UTC：生成本周的中间协议。
   - 周一 13:45 UTC：生成上一周的最终协议。

**技术栈：** TypeScript, Wrangler CLI。

---

### 2.2. Cloudflare D1 — 数据库

**作用：** 存储结构化数据。

**类型：** Serverless SQL (SQLite)。

**免费套餐：**
- 5 GB 存储。
- 每天 500 万次读取。
- 每天 10 万次写入。

**表：**
- `items` — 分类后的信号（hash、title、url、axes JSON、relevance、shift、direction、reasoning）。
- `protocols` — 每周协议元数据 + Markdown 内容。
- `gap_history` — Gap Index 动态。
- `index_history` — 13 个轴 (12+1) 的时间序列值。

**Binding：** `DB`（在 `wrangler.jsonc` 中）。

### 2.3. Cloudflare Workers AI — 分类器

**作用：** 沿 13 个轴 (12+1) 对信号分类。

**模型：** `@cf/qwen/qwen3-30b-a3b-fp8`（开放权重，MoE 架构）。

**为什么选择 Workers AI：**
- **独立性** — 开放权重模型，无外部提供商。
- **免费套餐** — 每天 10,000 神经元。
- **全球边缘** — 运行在 Cloudflare 的 300+ 个位置。
- **零冷启动** — 即时推理。

**Binding：** `AI`（在 `wrangler.jsonc` 中）。

**成本：** 每次分类约 15 神经元（每天约 660 次分类免费）。

---

### 2.4. Cloudflare Cron Trigger — 调度器

**作用：** 通过批处理实现每日自动化。

**时间表：** 每天 5 批（UTC）：
- `0 13 * * *` — 第 1 批（源 0-7）
- `15 13 * * *` — 第 2 批（源 8-15）
- `30 13 * * *` — 第 3 批（源 16-23）
- `45 13 * * *` — 第 4 批（源 24-31）+ 协议生成
- `0 23 * * *` — 第 5 批（源 32-40）

**协议生成：**
- 周五 13:45 UTC：本周的中间协议
- 周一 13:45 UTC：上一周的最终协议

**执行内容：**
1. 采集新鲜 RSS 条目。
2. 通过 Workers AI 分类。
3. 保存到 D1。
4. 生成上一周的 Markdown 协议。
5. 通过 GitHub API 触发 `sync-protocols.yml` 和 `translate-protocols.yml`（仅周一/周五）。

---

## 3. 数据流

Cron Trigger（每天 5 批：13:00, 13:15, 13:30, 13:45, 23:00 UTC）
|
v
Worker.scheduled() <-- RSS, arXiv, News
|
v (items JSON)
Workers AI (Qwen 3)
|
v (已分类条目：axes、relevance、shift、reasoning)
D1 Database (4 张表)
|
v
协议生成器 (Markdown)
|
v
D1 protocols table (EN/RU/ZH)
|
v
Worker 通过 GitHub API 并行触发两个 workflow（仅周一/周五）：
  |- sync-protocols.yml       -->  GitHub (data/protocols/) -- EN/RU/ZH 文件
  '- translate-protocols.yml -->  D1（重新生成 RU/ZH 翻译）

API endpoints <-- Android app / web / external

---

## 4. 安全性

### 4.1. 密钥

存储在 **Cloudflare Secrets** 中（不在代码里）：
- `CLOUDFLARE_API_TOKEN` — 用于部署（本地 `.env`）。
- `CLOUDFLARE_ACCOUNT_ID` — 账户标识（本地 `.env`）。

**本地：** `.env` — **不提交**（在 `.gitignore` 中）。

**Git 中：** 仅 `.env.example` — 不含真实值的模板。

### 4.2. 验证

- **D1：** Wrangler 验证 token 和权限。
- **API：** 参数校验（text 长度 <= 1000 字符）。
- **无外部 AI 提供商：** 所有推理都在 Cloudflare 的开放权重模型上运行。

### 4.3. 隐私

- **Workers AI** — 数据不用于模型训练。
- **D1** — 仅存储结构化公开数据。
- **无第三方分析。**

---

## 5. 部署

### 5.1. 本地

```bash
git clone https://github.com/VQQLK/Human-AI-Monitor.git
cd Human-AI-Monitor
npm install
cp .env.example .env
# Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to .env
npx wrangler deploy --dry-run
```

### 5.2. 生产

```bash
# Apply migrations
npx wrangler d1 migrations apply human-ai-monitor-db --remote

# Deploy Worker
npx wrangler deploy
```

### 5.3. Cron Trigger

在 `wrangler.jsonc` 中配置：

```jsonc
"triggers": {
  "crons": [
    "0 13 * * *",
    "15 13 * * *",
    "30 13 * * *",
    "45 13 * * *",
    "0 23 * * *"
  ]
}
```

每天运行 5 批：13:00, 13:15, 13:30, 13:45, 23:00 UTC。

---

## 6. 协议同步

### 6.1. 生成 vs 可见性

协议生成到 D1 数据库中，但**不会立即在仓库中可见**。同步由 GitHub Actions workflow `.github/workflows/sync-protocols.yml` 处理。

### 6.2. 时间表

协议由 Cloudflare Worker 在周一/周五 13:45 UTC 生成。生成后，Worker 立即
通过 GitHub API（`workflow_dispatch`）并行触发两个 GitHub Actions workflow：

| Workflow | 触发方式 | 用途 | 可见性 |
|----------|---------|------|--------|
| `sync-protocols.yml` | Worker dispatch（周一/周五 ~13:53 UTC） | 将 EN/RU/ZH 文件同步到 git | 生成后 ~5–10 分钟 |
| `translate-protocols.yml` | Worker dispatch（周一/周五 ~13:53 UTC） | 在 D1 中重新生成 RU/ZH | 下一个 sync 周期 |

> **历史说明：**两个 workflow 仍保留 `schedule:` 触发器，但 GitHub 的
> 定时任务不可靠（延迟可达 4 小时以上、可能跳过）。Worker 的 dispatch
> 是主要且可靠的路径。

### 6.3. 翻译延迟

英语是主要语言。RU/ZH 翻译由 `translate-protocols.yml` 异步重新生成，
与 sync 并行。结果：

- **EN 文件**在生成后 ~5–10 分钟出现在 git 中。
- **RU/ZH 文件**可能滞后一个 sync 周期（最多 ~3–4 天）：`sync` 会拉取
  运行时刻 D1 中已有的翻译，而 `translate` 在并行更新 D1。

这是有意的权衡：让翻译不在关键路径上，从而避免在生成协议的 Worker 上
超出 Cloudflare Free 层级限制（subrequests、CPU time）。

### 6.4. Workflow 详情

`sync-protocols.yml`：
1. 从 D1 API 获取最近 2 个协议（`/export-weekly?weeks=2`）。
2. 写入 collector 仓库的 `data/protocols/`。
3. 将所有协议归档到 `human-ai-monitor-archive` 仓库。
4. 提交两个仓库的变更。

`translate-protocols.yml`：
1. 通过 `/protocols` 确定最新的一周。
2. 调用 `GET /translate/{week}`（Bearer 认证）以重新生成 D1 中的 RU/ZH。
3. 通过 `/protocols/{week}/content/ru` 和 `/zh` 验证翻译。

两个 workflow 由 Worker 并行触发。`sync` **不会**调用 `translate`。

### 6.5. 紧急同步（故障排查）

正常运行时，两个 workflow 都由 Worker 在协议生成后自动触发。仅在紧急
情况下才需要手动触发：自动 dispatch 失败，或部分失败后需要重新运行。

```bash
gh workflow run sync-protocols.yml
gh workflow run translate-protocols.yml
```

这些命令不属于日常运行的一部分。


## 7. 扩展

### 7.1. 按负载

| 资源 | 免费套餐 | 超额 |
|------|---------|------|
| Workers | 每天 10 万请求 | $5/月每 1000 万 |
| D1 | 5 GB, 每天 500 万读取 | $0.75/GB |
| Workers AI | 每天 1 万神经元 | $0.011 每 1000 神经元 |

启动时——一切都在免费套餐内。

### 7.2. 按地理

Cloudflare 有 300+ 个边缘位置。

Worker 在靠近用户的位置运行。

D1 有区域副本。

### 7.3. 按源

添加源——在 SOURCES 数组中加一行。

扩展采集——并行 fetch 调用。

扩展分类——Workers AI 自动处理突发流量。

---

## 8. 备选方案（对比）

| 组件 | 我们的选择 | 备选 | 为什么这样选 |
|------|-----------|------|-------------|
| 运行时 | Cloudflare Workers | AWS Lambda, Vercel | 零冷启动，全球边缘 |
| 数据库 | D1 | Postgres, MongoDB | Serverless，免费，集成 |
| LLM | Workers AI (Qwen 3) | OpenAI, Anthropic | 开放权重，免费套餐，无外部依赖 |
| 前端 | SvelteKit + Pages | Next.js, Astro | 轻量，静态导出 |
| CI/CD | GitHub Actions | CircleCI | 免费，与仓库集成 |

---

## 9. 局限性

- **无速率限制。** Cloudflare 的 rate limiting binding 是实验性的，免费套餐不可用。缓解：参数校验（text <= 1000 字符）。

- **仅 RSS 采集。** HTML 解析尚未实现。部分无 RSS 的源不可访问。

- **D1 单区域。** 目前为 EEUR。增长时——副本。

- **无自动备份。** 计划：每周将 D1 导出到 R2。

- **单体 src/index.ts。** 拆分为模块已在路线图中。

---

## 10. 路线图

- [ ] 重构：将 src/index.ts 拆分为 7 个模块。
- [ ] 真实测试覆盖（parser、classifier、protocol）。
- [ ] Android APK（PWA + Capacitor）。
- [ ] Web 界面（Cloudflare Pages）。
- [ ] 多语言支持（EN / RU / ZH）。
- [ ] 阈值变化的推送通知。
- [ ] 为非 RSS 源提供 HTML 解析。
- [ ] 与全球指数集成（V-Dem、WHR、Pew）。
- [ ] 去中心化镜像（IPFS）。
- [ ] 独立方法论审计。

---

## 11. 邀请

架构开放改进。如果你看到如何让它更好——请打开 Issue 或 Pull Request。

Together — We Are Strong. The road will be mastered by the one who walks it.

联系方式：
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
