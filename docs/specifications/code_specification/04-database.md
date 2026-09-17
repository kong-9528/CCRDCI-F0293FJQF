# 04 数据存储规范

## 选型

| 存储 | 用途 |
|------|------|
| MySQL 8 InnoDB，`utf8mb4` | 全部业务真相：租户、账号、开通、额度、Key、流水、账本、审计 |
| Redis | 限流计数、JWT 失效名单、短 TTL 缓存；**不以 Redis 为余额真相** |

时区：库内时间戳用 UTC（`DATETIME(3)` 或 `TIMESTAMP`），API 输出 ISO-8601。

字符集：库/表 `utf8mb4`，排序规则建议 `utf8mb4_0900_ai_ci`。

## 核心实体（逻辑模型）

命名用蛇形复数表名。以下为必有概念，实现时可拆表，但关系不能缺。

### 身份

- `ops_users`：运营账号（与企业用户分表）
- `tenants`：企业租户，由运营创建，`status` = active / suspended
- `users`：企业成员，`tenant_id` 非空，无公开注册产生的行

### 目录与开通

- `products`：`code` 唯一（开放 URL 用）、名称、是否 `has_web_ui`、上下架
- `tenant_products`：租户开通记录，单价（次）、状态 active / revoked

### 计费

- `balances`：每租户（或租户+产品，二选一，全站统一）剩余次数。首期建议 **租户级总次数** 或 **按产品分次数** 与合同一致；选定后写进迁移注释。
- `ledger_entries`：账本，不可物理删除。字段至少：`tenant_id`、`type`（grant / debit / adjust / refund）、`amount`（次数，有符号或与 type 配合）、`balance_after`、`ref_type`+`ref_id`、`operator_id`（运营加额时）、`created_at`
- `api_call_logs`：每次开放/WebUI 调用一行：`request_id`、`idempotency_key`（唯一）、`tenant_id`、`api_key_id` 可空、`user_id` 可空、`product_code`、`http_status`、`biz_success`、`billed`、`latency_ms`、`created_at`

禁止只 `UPDATE balances` 不写 `ledger_entries`。

### 访问

- `api_keys`：`key_prefix` 可展示，`key_hash` 存储；`tenant_id`；可选产品范围；`revoked_at`

### 审计

- `audit_logs`：`actor_type`（ops/user）、`actor_id`、`action`、`target_type`、`target_id`、`payload`（脱敏 JSON）、`ip`、`created_at`

### 不建的表（首期）

- 订单、支付单、购物车、异步 `jobs` / `job_results`

调用请求/响应体若需排查，可放 `api_call_logs` 摘要或旁表 `call_payloads`，必须脱敏、限制体积、设保留期。

## 索引与约束

- `api_call_logs.idempotency_key` **UNIQUE**
- `api_call_logs (tenant_id, created_at)`、`(api_key_id, created_at)`、`(product_code, created_at)`
- `ledger_entries (tenant_id, created_at)`
- `users (tenant_id, email)` 唯一（email 在租户内唯一即可）
- `products.code` 唯一
- `api_keys.key_hash` 唯一

流水按月分表可后期再做；上线单表 + 索引。

## Redis Key 约定

```
rl:open:{apiKeyId}:{window}     # 开放 API 限流
rl:user:{userId}:{window}       # 管理面限流
jwt:block:{jti}                 # 登出/重置后的 JWT 黑名单，TTL = 剩余有效期
```

余额不放 Redis 或仅作只读缓存，扣减以 MySQL 事务为准。

## Prisma

- 所有表结构变更走 `prisma migrate`
- 禁止生产环境 `db push` 作为发布手段
- 扣费、加额度用交互式事务或存储过程二选一，优先应用层事务 + 行锁（`SELECT ... FOR UPDATE` 余额行）
