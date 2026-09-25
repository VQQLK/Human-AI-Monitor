> **语言:** [🇺🇸 English](CHANGELOG.md) • [🇷🇺 Русский](CHANGELOG.ru.md) • [🇨🇳 中文](CHANGELOG.zh.md)



# 变更日志

所有对Human-AI Monitor的重要更改都将记录在此文件中。

格式基于[保持变更日志](https://keepachangelog.com/en/1.1.0/)，并且本项目遵循[语义化版本控制](https://semver.org/spec/v2.0.0.html)。

## [未发布]
### 更改
- **版本单一来源**：`/` 端点元数据现在从 `package.json` 读取版本（构建时导入），而不是硬编码字面量；repo_audit 检查 package.json = CITATION.cff 以及发布日期一致性
## [1.0.0] - 2026-09-24
### 新增
- **Architecture v2：中期/最终协议拆分**
  - 周五 13:45 UTC 为当前周生成草稿协议（`is_interim=1`）
  - 周一 13:45 UTC 为上一周生成最终协议（`is_interim=0`）
  - 只有最终协议会更新 `gap_history` 和 `index_history` 表
  - 草稿协议提供早期可见性，而不影响差距指数计算

- **翻译支持（EN → RU/ZH）**
  - `/protocols/current/ru` 和 `/protocols/current/zh` 端点
  - `/protocols/{week}/content/ru` 和 `/protocols/{week}/content/zh` 端点
  - `/translate-document` 端点用于手动翻译
  - `/translate/{week}` 端点用于每周翻译
  - 数据库迁移0006：向 `protocols` 表添加 `content_ru` 和 `content_zh` 列
  - GitHub Actions 工作流 `translate-protocols.yml`（协议生成后运行）

- **双同步工作流**
  - `.github/workflows/sync-protocols.yml` 将最新的2个协议同步到 collector 仓库
  - 归档仓库（human-ai-monitor-archive）存储所有历史协议
  - collector 仓库（human-ai-monitor-collector）仅保留最新的2个协议
  - 为每个协议下载 EN/RU/ZH，使用安全的临时文件处理

- **AI Now Institute**（https://ainowinstitute.org/feed）作为 tier 1 AI 来源
  - 专注：AI治理、公平性、人类自主性
  - 轴线：h1_agency、h4_equity、h6_democracy
  - 替换 Stanford HAI（RSS不可用——所有URL返回HTML而非RSS）

- **迁移0005**：从 `index_history` 中删除重复条目
  - 修复了周命名方案变更导致重复记录的问题
  - `index_history` 从65行减少到26行
  - 在 `generateAndSaveProtocol()` 中添加防护，防止写入尚未结束的周

- **声音部分扩展**
  - 特朗普"AI力量"公告（2026-09-19）已添加到 README.md 和 README.ru.md 的"声音"部分

### 更改
- **Architecture v2：Cron 计划扩展**
  - 旧：4个批次，06:00/06:15/06:30/06:45 UTC（每周一）
  - 新：每日5个批次，13:00/13:15/13:30/13:45/23:00 UTC
  - 日间批次（13:00–13:45）：每个8个来源，maxPerSource=3
  - 晚间批次（23:00）：9个来源，maxPerSource=2
  - 覆盖5个批次中的所有41个启用来源

- **来源管理**
  - 从 `sources_human.yaml` 中移除 Meduza（meduza.io）
  - 来源数量：41个启用（25 AI + 16 人类），共47个已配置
  - 6个来源已禁用（Nature 303、Lancet 403、Benton 404、ILO 404、V-Dem 404、VentureBeat 429）

- **CITATION.cff 元数据**
  - 版本 0.6.0 → 1.0.0
  - 发布日期 2026-09-18 → 2026-09-21

### 修复
- **协议周命名**（来自工程师评审的发现 #1）
  - `getWeekRange()` 现在返回周一作为 `start`（协议标识符）
  - 协议 "2026-09-22" = 9月22-28日的周（周一至周日）
  - 添加了 `filterStart` 和 `filterEnd` 字段用于SQL WHERE子句
  - `/gap` 和 markdown 生成现在按 `recorded_at DESC` 排序（配套修复）

- **重新分类浪费**（来自工程师评审的发现 #2）
  - 哈希/存在性检查现在在 `env.AI.run()` 之前运行（而不是之后）
  - 现有条目从数据库行读取轴线/相关性/变化，而不是重新分类
  - 消除条目被不必要重新分类的"闪烁"现象

- **静默跳过错误**（来自工程师评审的发现 #3）
  - 在确切的丢弃点添加了 `items_skipped_no_title` 计数器
  - 解决了收集统计中无法解释的24对22的差距

- **差距指数计算**（来自2026-09-20报告的关键发现F6）
  - 创建了 `src/services/gap-computation.ts` 并包含 `computeGapIndex()` 函数
  - `generateAndSaveProtocol()` 现在调用 `computeGapIndex()` 而不是复制最后一行
  - 结果保存到 `gap_history` 和 `index_history` 表中
  - 验证：具有不同项目数量的周现在产生不同的差距指数分数
  - 生产部署：版本ID 9b676bd3 → dc501a70 → e3de304

- **数据库迁移**
  - 迁移0003：将SMD级别从0.30更新到0.45
    - 原因：Anthropic达到AL4（26% AI主导任务，>90% AL3协作）
    - 第一个具有持续L4的系统；阈值保持为"≥2系统"
    - 同时更新了远程D1数据库和 `migrations/0001_initial_schema.sql` 中的种子数据
    - 参考：Anthropic Research Automation Index（2026年9月）
  - 迁移0004：向 `protocols` 表添加 `recorded_at` 列
  - 迁移0007：向 `protocols` 表添加 `is_interim` 列
  - 迁移0008：添加 `content_ru` 和 `content_zh` 列（可为空）

### 移除
- 遗留的 `wrangler.toml`（仅包含 `[site]` 部分，未使用）
- Stanford HAI 来源（所有RSS URL返回HTML而非XML）

### 计划中
- **强制重新分类参数**（`?reclassify=true` 用于 `/collect`）
  - 允许在提示词更改时手动重新分类现有条目
  - 哈希检查（sha256Hex + 数据库查找）目前阻止重复处理
  - 需要绕过选项：当 force=true 时跳过 `if (existing)` 检查
  - 验证报告中引用为优先事项（尚未实现）

- **Workers AI 配额指标仪表板**
  - 跟踪 `ai_calls_today`、`ai_calls_saved`（通过哈希检查）、`quota_usage_percent`
  - 添加到 `/health` 端点用于监控
  - 当前：仅存在 `items_classified` 计数器，无配额跟踪
  - 验证报告中引用为优先事项（尚未实现）

- **分类结果的R2缓存**
  - 将解析的AI响应缓存在Cloudflare R2中以减少token使用
  - 基于哈希的键（title+summary 的 sha256）→ 缓存的JSON响应
  - 缓存未命中时回退到 Workers AI
  - 验证报告中引用为中期事项（尚未实现）

- 重构：将单体 src/index.ts 拆分为模块
- 非RSS源的HTML解析
- HTML解析源的HTML实体解码（`&#39;` → `'`）
- Android APK（PWA + Capacitor）
- 网络界面（Cloudflare Pages）

## [0.9.9] - 2026-09-19

### 新增
- 为解析器（decodeEntities, cleanTitle, extractTag, parseRSS）添加了14个单元测试
- 为分类器（parseAIResponse, validateParsed）添加了15个单元测试
- 为作弊检测器（harness + task categories）添加了7个单元测试
- 从 `src/index.ts` 导出的8个纯函数用于测试

### 修复
- 修复 `sha256Hex` 修饰符顺序（`async export` → `export async`）

### 更改
- 总测试数：8 → 44（API + 单元测试）
- 测试覆盖率：~40% → ~60%
- 工作器版本 0.9.8 → 0.9.9

## [0.9.8] - 2026-09-19

### 新增
- `src/utils/fetch-with-retry.ts` — 429/503错误时使用指数退避的fetch
- 每次fetch的10秒超时（AbortController）
- 3次尝试，每次间隔2秒/4秒（无8秒等待：第三次尝试为最终尝试）
- 4个Cron批次：06:00 / 06:15 / 06:30 / 06:45 UTC
- `items_existing` 计数器用于区分新项目和现有项目

### 修复
- `stats.sample` 在重复运行时为空
- `items_saved` 对现有项目进行了错误计数
- `sample` 现在仅包含非空轴的项目
- Hugging Face博客：HTTP 429 — 现在会重试
- Edelman信任指数：HTTP 503 — 现在会重试

### 更改
- 所有 `fetch()` 调用替换为 `fetchWithRetry()`（2次调用）
- 工作器版本 0.9.5 → 0.9.8

## [0.9.5] - 2026-09-19

### 修复
- 在 `/` 响应的端点列表中添加了 `/verify` 端点
- 在 `config/axes_ai.yaml` 中将 SMD `level` 设置为 0.45

### 更改
- 端点数量：9 → 10
- 工作器版本 0.9.4 → 0.9.5

## [0.9.4] - 2026-09-19

### 新增
- `/verify` 端点，使用CheatBench启发式方法检测奖励黑客：
  - `harness` 类别：隐藏测试、评分文件、git日志利用（CheatBench中有683个痕迹）
  - `task` 类别：评估/执行、猴子补丁、操作符重载（CheatBench中有136个痕迹）
- `src/cheat-detector.ts` — 独立模块，包含15+正则表达式模式
- 根据Anthropic研发自动化指数（2026年9月）更新SMD阈值：
  - Anthropic达到26% AL4（AI主导任务）和>90% AL3（协作）
  - 第一个具有持续L4的系统；阈值保持为“≥2系统”
  - 当前SMD级别：0.30 → 0.45

### 更改
- 工作器版本 0.9.3 → 0.9.4
- 端点数量：9 → 10
- `config/axes_ai.yaml` 更新了Anthropic AL4数据

## [0.9.3] - 2026-09-18

### 更改
- 所有函数中将 `env: any` 替换为 `env: Env`（类型安全）
- `fetch` 签名：`(request: Request, env: Env, ctx: ExecutionContext)`
- `scheduled` 签名：`(event: ScheduledEvent, env: Env, ctx: ExecutionContext)`
- 工作器版本 0.9.1 → 0.9.3

## [0.9.2] - 2026-09-18

### 修复
- Cron触发器拆分为2个批次以避免Cloudflare 50次子请求限制：
  - 批次1（06:00 UTC）：12个源 × 3个项目 = 48次子请求
  - 批次2（06:30 UTC）：9个源 × 3个项目 = 36次子请求

### 更改
- `scheduled` 处理程序通过 `event.cron` 区分批次
- 协议生成仅在批次2运行（所有源收集后）
- Cron计划：`0 6 * * 1`（批次1） + `30 6 * * 1`（批次2）
- 工作器版本 0.9.1 → 0.9.2

## [0.9.1] - 2026-09-18

### 修复
- Anthropic研究RSS标题中的日期和类别前缀（`Sep 17, 2026ScienceHow Claude...` → `How Claude...`）

### 更改
- `cleanTitle()` 现在处理三种前缀格式：日期优先、类别优先、日期+类别
- 工作器版本 0.9.0 → 0.9.1

## [0.9.0] - 2026-09-18

### 新增
- Anthropic新闻源（通过0xSMW/rss-feeds代理）
- Anthropic工程源（通过Olshansk/rss-feeds）
- Anthropic研究源（通过Olshansk/rss-feeds）
- Anthropic红队源（通过Olshansk/rss-feeds）

### 更改
- 源数量：17 → 21
- 工作器版本 0.8.1 → 0.9.0

### 已知问题
- Pew Internet间歇性返回HTTP 403（来自他们自身的速率限制）
- 建议使用批次：`?limit=12&offset=0` 和 `?limit=9&offset=12`

## [0.9.0] - 2026-09-18

### 新增
- Anthropic新闻源（通过0xSMW/rss-feeds代理）
- Anthropic工程源（通过Olshansk/rss-feeds）
- Anthropic研究源（通过Olshansk/rss-feeds）
- Anthropic红队源（通过Olshansk/rss-feeds）

### 更改
- 源数量：17 → 21
- 工作器版本 0.8.1 → 0.9.0

### 已知问题
- Anthropic研究源标题有日期前缀（v0.9.1中修复）
- Pew Internet间歇性返回HTTP 403

## [0.8.1] - 2026-09-18

### 新增
- `/collect` 端点添加了 `offset` 参数用于分批收集
- 浏览器User-Agent以绕过机器人检测（修复Pew Internet 403）

### 修复
- RSS标题中的CDATA部分解码（OpenAI博客、The Verge、AI对齐论坛）
- 所有17个源现在成功收集

### 已知问题
- Cloudflare Workers 50次子请求限制：使用批次进行每周完整收集

### 更改
- 工作器版本 0.8.0 → 0.8.1

## [0.8.0] - 2026-09-18

### 新增
- Cohere Labs社区博客（HTML源通过 `a.post-title` 选择器）
- BAIR博客（RSS源：https://bair.berkeley.edu/blog/feed.xml）
- HTMLRewriter现在支持两种标题提取模式：`aria-label` 和文本内容
- HTML解析源的HTML实体解码

### 更改
- 源数量：15 → 17
- User-Agent 更新为 v0.8

## [0.7.0] - 2026-09-18

### 新增
- 通过Cloudflare `HTMLRewriter` 支持HTML解析
- 首个HTML源：EleutherAI博客（`a.entry-link` 选择器）
- SOURCES中的 `type` 字段：`rss`（默认）或 `html` 与 `htmlSelector`
- `fetchFromHtml()` 函数用于静态HTML网站

### 更改
- 工作器版本 0.6.0 → 0.7.0
- 源数量：14 → 15

## [0.6.0] - 2026-09-18

### 新增
- 速率限制参数验证（文本长度 ≤ 1000字符）
- CITATION.cff 用于学术引用
- DATA_LICENSE（CC-BY 4.0）用于项目数据
- GitHub Actions CI工作流

### 更改
- README：添加了“声音”部分（15条AI领袖的引言）
- README：与实际代码库状态对齐
- Meta AI博客和Mistral AI RSS源更新为有效URL

### 移除
- 速率限制绑定（免费版Cloudflare不支持）

## [0.5.0] - 2026-09-18

### 新增
- 自动生成每周协议（Markdown）
- 协议内容存储在D1（content列）
- /generate 端点用于手动生成协议
- /protocols/{week}/content 端点用于Markdown输出

## [0.4.0] - 2026-09-17

### 新增
- RSS收集器，包含14个源
- 通过Cloudflare Workers AI（Qwen 3）进行AI分类
- 12个轴的分类提示（AI + 人类）
- /collect 端点用于手动RSS收集
- /classify 端点用于文本分类

### 更改
- 分类提示：每个项目1-3个轴，方向规则
- 提示规则：仅在经验确认后才设置shift=yes

## [0.3.0] - 2026-09-17

### 新增
- 公共API，包含6个端点
- D1数据库集成（4张表）
- Workers AI绑定
- Cron触发器（周一06:00 UTC）

## [0.2.0] - 2026-09-17

### 新增
- 数据库模式（items, protocols, gap_history, index_history）
- D1的迁移
- 配置文件（axes_ai.yaml, axes_human.yaml）
- 源配置（sources_ai.yaml, sources_human.yaml）

## [0.1.0] - 2026-09-17

### 新增
- 初始提交：概念、研究计划、第一份协议
- README、MANIFESTO、LICENSE、CONTRIBUTING、CODE_OF_CONDUCT
- 完整研究论文（5部分，俄语）
- docs/（方法论、架构、math_brief、新闻稿）