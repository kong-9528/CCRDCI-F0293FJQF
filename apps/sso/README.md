# @ctp/sso — 用户统一认证

## 域名（环境变量，不提交 git）

本地写在 `.env.local`；部署时在平台上配置同名变量后重新构建。

| 变量 | 作用 | 本地默认 |
|------|------|----------|
| `VITE_OPS_URL` | 运营后台入口 | `http://localhost:3001` |
| `VITE_CUSTOMER_URL` | 技术服务中心入口 | `http://localhost:3002` |
| `VITE_UCENTER_URL` | C 端运营后台入口 | `http://localhost:3005` |

未配置时回退到默认值。用于子系统入口和登录回跳白名单。

## 开发

```bash
pnpm --filter @ctp/sso dev
```

默认 http://localhost:3003/login
