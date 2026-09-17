# 02 后端模块规范

应用：`apps/api`，NestJS + TypeScript。每个领域一个 Nest Module，对外只暴露 Service / Facade，禁止 `import` 其他模块的 Prisma 模型操作或 Repository。

## 模块职责

| 模块 | 职责 | 不负责 |
|------|------|--------|
| `Identity` | 运营账号；企业租户；企业成员；登录、改密、首次登录强制改密 | 产品开通、额度 |
| `Catalog` | 6 个产品元数据、是否 WebUI、文档版本、上下架 | 某租户是否可用 |
| `Entitlement` | 租户-产品开通、单价、额度调整入口（写账本） | 真正扣次（交给 Billing） |
| `Billing` | 账本、剩余次数、扣次/回滚、调用是否计费的裁决 | 调上游 |
| `Access` | API Key 生成/哈希/吊销、限流、可选 IP 白名单 | 用户登录 |
| `Fulfillment` | 按 `productCode` 同步适配器，超时与错误映射 | 鉴权、扣费策略 |
| `Audit` | 开通、改额度、调账、Key 变更等管理操作审计 | 每次 API 调用明细（在流水表） |

跨模块协作通过模块 Public Service，例如 `Fulfillment` 只调用 `Billing.chargeOrReject` 与 `Entitlement.assertActive`。

## 产品适配器

```
FulfillmentModule
  ├── ProductInvoker (统一入口：authContext + payload → result)
  ├── adapters/product-a.adapter.ts
  ├── adapters/product-b.adapter.ts
  └── ...
```

新增产品：Catalog 登记 + 一个 Adapter + OpenAPI 片段。禁止在 Controller 里写上游 HTTP。

WebUI 与开放 API 必须调用同一个 `ProductInvoker`。

## 计费与执行的事务边界

推荐顺序（同步）：

1. 校验开通与限流（Redis，非事务）。
2. 开启 MySQL 事务：按 `idempotency_key` 查重；无则预扣次数并写账本（pending/posted 由实现选定一种并全局统一）。
3. 事务外或同一请求内调用上游（上游不可放在长事务里太久）。更稳妥的首期做法：
   - **先执行上游，成功后再扣次**，并用唯一 `idempotency_key` 防止重试双扣；若「先扣后补」必须保证失败回滚。
   - 团队选定一种后写入实现注释，全产品一致。

默认推荐：**成功计费**（上游 2xx 且业务成功才扣次）；校验失败、未开通、额度不足、上游超时/5xx **不计成功次数**。

## 身份上下文

请求进入后注入：

- 管理面：`{ kind: 'user', tenantId?, userId, role }` 或 `{ kind: 'ops', opsUserId, role }`
- 开放面：`{ kind: 'apiKey', tenantId, apiKeyId, productScope[] }`

运营身份不得调用 `/open/*`；企业身份不得访问 `/api/v1/ops/*`。

## 配置与密钥

上游地址、超时、内部密钥仅来自环境变量或密钥服务。Adapter 内禁止硬编码生产地址。
