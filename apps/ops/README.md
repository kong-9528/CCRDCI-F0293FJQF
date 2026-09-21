# @ctp/ops — DCI管理中心运营后台

## 入口（经 SSO）

本应用**不提供独立登录页**。请从 SSO 启动器进入：

1. 启动 `pnpm dev:sso`（默认 http://localhost:3003）
2. 登录后打开「DCI®技术服务中心运营后台」
3. 跳转到 http://localhost:3001/?sso_ticket=…

未携带 ticket 且无会话时，会自动跳回 SSO 登录。

## 域名（环境变量，不提交 git）

本地写在 `.env.local`；部署时在平台上配置同名变量后重新构建。

| 变量 | 作用 | 本地默认 |
|------|------|----------|
| `VITE_PUBLIC_URL` | 本应用对外地址 | `http://localhost:3001` |
| `VITE_SSO_URL` | 统一认证门户 | `http://localhost:3003` |

未配置时回退到默认值。页面跳转仍是站内相对路径；该地址会写到文档根节点的 `data-public-origin`。

## 开发

```bash
pnpm --filter @ctp/ops dev
```

默认 http://localhost:3001/

## 腾讯云 COS 部署（SPA）

History 路由刷新子路径（如 `/desk`、`/stats/verify/account-products`）会 404，除非：

1. 静态网站 **索引文档** + **错误文档** 均为 `index.html`
2. **错误文档响应码** 设为 `200`
3. 使用静态网站域名（或绑到静态网站的自定义域名）

`pnpm build` 会额外生成常见路由下的 `index.html` 兜底。动态段（如 `/customers/:id`）仍依赖错误文档回退。
