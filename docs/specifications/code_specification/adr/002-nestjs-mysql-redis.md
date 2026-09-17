# ADR 002：NestJS + MySQL 8 + Redis + Prisma

## 状态

已采纳

## 上下文

后端选定 TypeScript（方案 B）。计费与开通需要事务和关系完整性。用户倾向 MySQL。

## 决策

- API：NestJS
- 主库：MySQL 8 InnoDB utf8mb4
- 限流与 JWT 黑名单：Redis
- 迁移与模型：Prisma

不引入支付库、不引入消息队列作为产品执行通道。

## 后果

国内运维与备份路径成熟。JSON 能力弱于 PostgreSQL，产品 payload 以明确列 + JSON 摘要即可。余额不以 Redis 为准，避免对账分歧。
