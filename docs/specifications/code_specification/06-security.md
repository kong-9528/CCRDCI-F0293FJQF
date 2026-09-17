# 06 安全与权限

## 账号模型

- **运营账号**与**企业账号**分表、分登录入口、分 JWT `aud`/`iss`。
- 企业账号只能由运营创建；支持重置密码、停用。
- 门户无注册接口；即使误暴露也必须关闭。

## JWT

- 短期 Access Token（建议 ≤ 2h）+ 可选 Refresh；登出或重置密码将 `jti` 写入 Redis 黑名单。
- Payload 最小：`sub`、`kind`（`ops` | `tenant_user`）、`tenantId`（仅企业）、`role`。
- 客户 Token 调 `/api/v1/ops/**` 必须 403；运营 Token 调客户业务与开放 API 必须 403。

## API Key

- 随机串，存储 **HMAC/SHA-256 哈希**，库中可留 `prefix` 便于识别。
- 权限不超过该租户 `tenant_products`。
- 吊销立即生效（校验时查 `revoked_at`）。
- 传输仅 HTTPS。

## 授权检查顺序（开放调用）

1. Key 存在且未吊销  
2. 租户 active  
3. 产品已开通且 active  
4. 限流  
5. 额度  

任何一步失败不得调用上游。

## 审计必记

| 动作 | 记录 |
|------|------|
| 创建/停用租户、用户 | 是 |
| 开通/撤销产品 | 是 |
| 加额度、调账 | 是（并写账本） |
| 创建/吊销 API Key | 是（禁止记明文 Key） |
| 产品上下架 | 是 |

普通成功 API 调用记 `api_call_logs`，不强制进 `audit_logs`。

## 数据与日志

- 日志默认不打请求体全量；需要时打字段白名单。
- 证件号、手机、密码、API Key 明文禁止出现在日志、审计 payload、错误信息中。
- 管理面写操作 CSRF：同源 Cookie 方案需 CSRF Token；若纯 Bearer 头则不依赖 Cookie。

## 限流

- 开放 API：按 Key 与按租户双层（配置可运营调，首期写配置文件即可）。
- 登录接口：按 IP + 账号防爆破。

## 密钥

`.env` 不入库。生产密钥与 JWT 私钥、上游凭证分环境注入。
