# @ctp/customer — DCI®技术服务中心

## 域名（环境变量，不提交 git）

本地写在 `.env.local`；部署时在平台上配置同名变量后重新构建。

| 变量 | 作用 | 本地默认 |
|------|------|----------|
| `VITE_DCI_URL` | 门户 home 地址 | `http://localhost:3020` |

未配置时回退到默认值，注入为 `import.meta.env.VITE_DCI_URL`。

## 开发

```bash
pnpm --filter @ctp/customer dev
```

默认 http://localhost:3002/
