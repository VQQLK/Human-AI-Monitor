# 安全政策

> **Language:** [🇺🇸 English](SECURITY.md) • [🇷🇺 Русский](SECURITY.ru.md) • [🇨🇳 中文](SECURITY.zh.md)

## 支持的版本

| 版本    | 支持状态            |
|---------|---------------------|
| 1.0.x   | ✅ 积极支持          |
| < 1.0   | ❌ 已停止支持         |

仅最新次版本会收到安全更新。

## 报告漏洞

**请勿为安全漏洞创建公开的 GitHub Issue。**

提供两个报告渠道：

1. **首选 — GitHub Private Vulnerability Reporting**
   [报告漏洞](https://github.com/VQQLK/Human-AI-Monitor/security/advisories/new) — 私密、可追踪、可与维护者讨论。

2. **备用 — Email**
   [REDACTED@example.invalid](mailto:REDACTED@example.invalid)，主题 `[SECURITY] Human-AI Monitor`。

### 需要包含的内容

- 受影响版本 / 提交
- 复现步骤（curl 命令、脚本、截图）
- 影响评估（严重程度、可利用性）
- 您的姓名 / 昵称（用于致谢，可选）

### 预期响应时间

| 阶段               | 时间线                                  |
|--------------------|-----------------------------------------|
| 确认收到           | ≤ 48 小时                                |
| 初步评估           | ≤ 7 天                                   |
| 修复 / 缓解        | ≤ 30 天（严重）、≤ 90 天（非严重）        |
| 公开披露           | 协商，默认修复后 90 天                   |

## 范围

### 在范围内

- **边缘运行时** — Cloudflare Worker (`src/index.ts`, `src/services/`, `src/auth.ts`)
- **HTTP API** — 公共端点、认证、输入验证
- **HTML 视图** — `/protocols/*/view` 路由（XSS、注入）
- **D1 查询** — SQL 注入、授权绕过
- **密钥处理** — 轮换、泄漏、时序攻击
- **CI/CD** — `.github/workflows/` 中的 GitHub Actions

### 不在范围内

- **开发依赖** — `wrangler`、`miniflare`、`vitest`、`undici`（不影响运行时）
- **Cloudflare 平台** — 直接报告给 [Cloudflare](https://www.cloudflare.com/security/)
- **社会工程** — 针对维护者的钓鱼、欺骗
- **免费层 DoS** — Cloudflare 在边缘应用速率限制
- **文档错别字** — 请创建普通 Issue

## 安全实践

- **认证**：Bearer 令牌通过 `timingSafeEqual`（恒定时间）比较
- **双密钥轮换**：`ADMIN_SECRET_CURRENT` + `ADMIN_SECRET_PREVIOUS`（24 小时宽限期）
- **HTTP 方法防护**：仅允许 `GET`、`HEAD`、`OPTIONS` 和 `POST /translate-document`
- **安全响应头**：`X-Content-Type-Options`、`X-Frame-Options`、`HSTS`、`Referrer-Policy`、`Permissions-Policy`
- **CORS**：通配符 `*`（有意为之 — 只读公共 API，无凭据）
- **D1**：通过 `.bind()` 使用参数化查询，无字符串拼接
- **HTML 渲染**：对用户来源内容完全转义
- **2FA**：在 GitHub 和 Cloudflare 上启用

## 密钥轮换

| 密钥                                   | 频率           | 脚本                                |
|----------------------------------------|----------------|-------------------------------------|
| `ADMIN_SECRET_CURRENT` / `PREVIOUS`    | 每 90 天       | `scripts/rotate_admin_secret.sh`    |
| `GITHUB_PAT`                           | 每 90–180 天   | 手动（细粒度 PAT）                   |
| `CLOUDFLARE_API_TOKEN`                 | 每 12 个月     | Cloudflare 控制面板                 |

完整流程：[`scripts/rotate_admin_secret.sh`](scripts/rotate_admin_secret.sh)

## 依赖管理

- `npm audit` 是发布检查清单的一部分
- 每次发布时 0 个高危/严重漏洞
- 生产依赖：仅 `js-yaml`
- 开发依赖随 `wrangler` 次要版本更新

## 披露政策

- **协调披露**，默认在修复发布后 90 天
- 在 `CHANGELOG.md` 中致谢（经您许可）
- 如适用将申请 **CVE**

## 归属

本政策遵循通用开源实践。参见 [GitHub 协调披露指南](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)。

---

**团结就是力量。路是人走出来的。**
