# @ctp/ops — DCI管理中心运营后台

## 域名（环境变量，不提交 git）

本地写在 `.env.local`；部署时在平台上配置同名变量后重新构建。

| 变量 | 作用 | 本地默认 |
|------|------|----------|
| `VITE_PUBLIC_URL` | 本应用对外地址 | `http://localhost:3001` |

未配置时回退到默认值。页面跳转仍是站内相对路径；该地址会写到文档根节点的 `data-public-origin`。

## 开发

```bash
pnpm --filter @ctp/ops dev
```

默认 http://localhost:3001/
