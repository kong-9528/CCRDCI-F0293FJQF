# 01 总体架构

## 形态

**模块化单体**：一个 NestJS 进程承载管理 API 与开放 API；前端三个应用，共享包。单仓库、单后端部署，按目录与 Nest 模块隔离领域，禁止跨模块直接访问对方表。

```
                    ┌─────────────┐  ┌──────────────┐  ┌──────────┐
  访客 / SEO        │   portal    │  │   customer   │  │   ops    │
                    │  (Next.js)  │  │ (Vite+React) │  │(Vite+React)│
                    └──────┬──────┘  └──────┬───────┘  └─────┬────┘
                           │ JWT 仅登录后      │ JWT 企业      │ JWT 运营
                           ▼                  ▼              ▼
                    ┌─────────────────────────────────────────────┐
                    │              apps/api  NestJS                 │
                    │  /api/v1/* 管理面     /open/v1/{product}/*   │
                    │  Identity Catalog Entitlement Billing         │
                    │  Access Fulfillment Audit                     │
                    └───────────────┬───────────────┬──────────────┘
                                    │               │
                              MySQL 8 真相    Redis 限流/JWT 黑名单
```

## 仓库结构（目标）

```
apps/
  portal/          # 门户
  customer/        # 企业客户平台
  ops/             # 运营后台
  api/             # NestJS
packages/
  styles/          # 从 docs 规范派生或原样引用 tokens.css / portal.css / admin.css
  ui/              # 基于已有类名的薄封装，不另起主题
  api-client/      # OpenAPI 生成的 TS SDK
docs/
  specifications/  # 视觉规范（只读）+ 本技术规范
```

## 两个 HTTP 入口

| 前缀 | 调用方 | 鉴权 |
|------|--------|------|
| `/api/v1` | 门户登录、客户平台、运营后台 | 用户 JWT；企业与运营分 issuer/audience |
| `/open/v1/{productCode}` | 客户系统对接 | API Key |

门户除登录相关接口外，以静态/SSR 内容为主。

## 同步调用链（产品执行，唯一路径）

```
鉴权 → 租户是否开通该产品 → 限流 → 幂等键
    → 事务内预扣次数 → Fulfillment 同步调用上游
    → 成功确认计费并记流水 / 失败回滚扣次
    → 返回结果
```

WebUI：浏览器带企业 JWT 调 `/api/v1/products/{code}/invoke`（或等价路径），服务端转入同一 Fulfillment。  
开放 API：客户端带 Key 调 `/open/v1/{code}/...`，同样转入 Fulfillment。

建议网关/应用层明确同步超时（如 30–60s）。超时视为失败，不得记成功计费。

## 与视觉规范的对应

| 应用 | body / 根类 | CSS |
|------|-------------|-----|
| portal | `p-portal` | `portal.css` |
| customer | `a-admin theme-customer` | `admin.css` |
| ops | `a-admin theme-ops` | `admin.css` |

共享 `packages/ui` 只封装布局、表格、按钮等，class 必须来自上述规范。
