> **语言:** [🇺🇸 English](CONTRIBUTING.md) • [🇷🇺 Русский](CONTRIBUTING.ru.md) • [🇨🇳 中文](CONTRIBUTING.zh.md)



# 贡献于人类-人工智能监测器

感谢您对该项目的兴趣！我们欢迎任何形式的贡献——从修正拼写错误到添加新的数据源。

## 如何帮助

### 1. 报告错误

打开一个包含以下内容的issue：
- 发生了什么
- 期望的结果是什么
- 复现步骤
- 环境信息（操作系统、Node.js、pnpm）

### 2. 提出改进建议

打开一个带有enhancement标签的issue：
- 您想添加什么
- 为什么需要这个功能
- 如何与项目使命契合

### 3. 添加数据源

编辑config/sources_ai.yaml或config/sources_human.yaml：

    rss:
      - name: "源名称"
        url: "https://example.com/rss.xml"
        lang: "en"
        tier: 1

### 4. 改进分类器

LLM的提示信息位于src/config/prompts.ts：
- CLASSIFY_PROMPT — 所有12个轴线（7个AI + 6个人类）的统一提示
- 模型：Qwen 3（通过Cloudflare Workers AI）

### 5. 编写代码

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor/human-ai-monitor-collector
    pnpm install
    pnpm test
    pnpm dev
    pnpm deploy

技术栈：
- 运行时：Cloudflare Workers（TypeScript）
- 数据库：Cloudflare D1（SQLite）
- 测试：Vitest
- AI：Cloudflare Workers AI（Qwen 3）
- 包管理器：pnpm

风格：
- TypeScript：严格模式（tsconfig.json）
- 格式化：Prettier（可选）
- 提交：conventional commits（feat, fix, docs, refactor, chore）

流程：
1. Fork -> 分支（git checkout -b feature/amazing-idea）
2. 提交（git commit -m "feat: 添加惊人功能"）
3. 推送（git push origin feature/amazing-idea）
4. 拉取请求

---

## 项目结构

    human-ai-monitor-collector/
    ├── src/
    │   ├── index.ts                    # 主worker
    │   ├── services/
    │   │   └── gap-computation.ts      # 差距指数计算
    │   └── config/
    │       ├── axes.ts                 # 12个轴线列表
    │       ├── prompts.ts              # LLM提示
    │       └── generated/              # YAML生成的类型
    ├── config/
    │   ├── axes_ai.yaml                # 7个AI轴线
    │   ├── axes_human.yaml             # 6个人类轴线
    │   ├── sources_ai.yaml             # 21个AI源（20个活跃）
    │   └── sources_human.yaml          # 15个人类源（11个活跃）
    ├── migrations/
    │   ├── 0001_initial_schema.sql
    │   ├── 0002_add_content_column.sql
    │   └── 0003_update_smd_level.sql
    ├── test/
    │   ├── cheat-detector.spec.ts      # 7个测试：作弊检测器
    │   ├── classifier.spec.ts          # 15个测试：分类器
    │   ├── index.spec.ts               # 8个测试：API端点
    │   └── parser.spec.ts               # 14个测试：解析器
    └── wrangler.jsonc

---

## 伦理准则

参见CODE_OF_CONDUCT.md。

---

## 我们不接受的内容

- 付费集成 — 项目原则性地保持免费
- 隐蔽数据 — 所有源和提示都是公开的
- 广告 — 没有任何商业行为
- 政治 — 项目保持中立

---

## 链接

- README.md — 项目描述（英文）
- README.ru.md — 项目描述（俄文）
- CHANGELOG.md — 变更日志
- MANIFESTO.md — 项目宣言

---

**我们在一起 - 就很强大！只有行走者才能征服道路。**