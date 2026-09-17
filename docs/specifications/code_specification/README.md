# 技术架构与开发规范

本目录是后续按模块开发的**唯一技术参考**。配色与视觉规范不在此维护，见：

- [`../color_scheme/Design Tokens.json`](../color_scheme/Design%20Tokens.json)
- [`../css_specification/portal.css`](../css_specification/portal.css)
- [`../css_specification/admin.css`](../css_specification/admin.css)
- [`../css_specification/使用方法.txt`](../css_specification/使用方法.txt)

**禁止修改**上述视觉规范源文件。前端只消费、按类名落地。

## 阅读顺序

| 顺序 | 文档 | 用途 |
|------|------|------|
| 1 | [00-overview.md](./00-overview.md) | 业务边界、闭环、明确不做的事 |
| 2 | [01-architecture.md](./01-architecture.md) | 总体形态、仓库拆分、调用链 |
| 3 | [02-backend.md](./02-backend.md) | NestJS 模块、职责、调用链细节 |
| 4 | [03-frontend.md](./03-frontend.md) | 三端应用、页面最小集、样式绑定 |
| 5 | [04-database.md](./04-database.md) | MySQL / Redis、核心表、账本规则 |
| 6 | [05-api-conventions.md](./05-api-conventions.md) | 路径、响应体、错误码、幂等 |
| 7 | [06-security.md](./06-security.md) | 鉴权隔离、API Key、审计 |
| 8 | [07-engineering.md](./07-engineering.md) | 工具链、环境、观测、协作约定 |
| — | [adr/](./adr/) | 关键决策记录（为何这样选） |

## 已锁定的技术选型

| 层级 | 选型 |
|------|------|
| 形态 | 模块化单体，pnpm + Turborepo 单体仓 |
| 后端 | NestJS + TypeScript |
| 门户 | Next.js（App Router） |
| 客户平台 / 运营后台 | Vite + React |
| 主库 | MySQL 8（InnoDB，utf8mb4） |
| 缓存 / 限流 | Redis |
| ORM | Prisma |
| 执行模型 | 全部同步请求-响应；WebUI 与开放 API 共用执行器 |

签约与加额度均在线下完成，由运营后台开通；系统内无自助注册、无在线支付。
