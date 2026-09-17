# 07 工程与协作规范

## 工具链

| 项 | 约定 |
|----|------|
| 包管理 | pnpm workspaces |
| 构建编排 | Turborepo |
| 语言 | TypeScript `strict` |
| 风格 | ESLint + Prettier，CI 拦截 |
| Git | Conventional Commits：`feat` `fix` `docs` `refactor` `test` `chore` |
| API 契约 | OpenAPI 3，变更先合入 spec 再实现/生成客户端 |
| ORM | Prisma migrate |

## 环境

| 环境 | 用途 |
|------|------|
| `dev` | 本地，上游可用 mock adapter |
| `staging` | 联调与运营验收 |
| `prod` | 生产 |

同一套模块边界，用 Adapter 切换真实上游 / mock，避免 `if (prod)` 散落业务代码。

环境变量前缀建议：`APP_`、`MYSQL_`、`REDIS_`、`JWT_`、`UPSTREAM_`。

## 观测

- 每请求 `requestId`（ULID/UUIDv7）写入响应头 `X-Request-Id` 与日志。
- 结构化 JSON 日志：`level, requestId, tenantId, productCode, latencyMs, billed`。
- 指标最低集：开放 API QPS、延迟分位、4xx/5xx、额度不足次数、扣费失败次数。
- 健康检查：`GET /health`（进程）与 `GET /ready`（MySQL + Redis）。

## 测试要求（按模块合并时）

- Billing：额度不足、幂等重放、失败不计费、运营加额账本一致。
- Access：吊销 Key、跨租户 Key 拒绝。
- Fulfillment：超时不计费；WebUI 与 open 路径计费标记一致。
- 鉴权：企业 Token 打运营路由 403。

## 前端协作

- 视觉争议以 `docs/specifications/css_specification` 与 Design Tokens 为准。
- 禁止为「赶工」在页面内联一套新色板。
- 客户/运营表格、筛选、分页优先复用 `a-` 组件。

## 开发顺序建议（供排期，非本文件强制）

1. 单体仓脚手架、规范 CSS 接入、登录壳  
2. Identity + 运营开通租户/账号  
3. Catalog + Entitlement + Billing 账本  
4. Access + Fulfillment mock + 开放 API + 流水  
5. 客户平台 WebUI 三页与文档  
6. 运营查询与审计  
7. 替换真实上游 Adapter  

每步都应能在 staging 用运营开通的测试租户走通「登录 → 调用 → 扣次」。

## 文档维护

本目录随架构变更更新。已决事项写入 [`adr/`](./adr/)，不要只改聊天记录。视觉规范文件不在本目录、也不在此流程中修改。
