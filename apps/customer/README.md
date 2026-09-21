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

## 腾讯云 COS 部署（必做）

本项目是 History 路由 SPA。访问 `/desk` 等子路径时，COS 会去找同名对象；找不到就返回 `NoSuchKey` 404。

请在对应存储桶开启 **静态网站**，并配置：

1. **索引文档**：`index.html`
2. **错误文档**：`index.html`
3. **错误文档响应码**：`200`（否则页面能开但状态仍是 404）
4. 用 **静态网站访问域名**（或绑到该静态网站的自定义域名），不要用普通 COS 下载域名硬刷子路径

若报错里还有 `An Error Occured While Attempting to Retrieve a Custom Error Document` / `Key: index.html`：

- 确认桶根目录（或你绑定的前缀根）下确实有上传后的 `index.html`
- 错误文档填相对键名 `index.html`，不要写成绝对 URL
- 避免对象键出现双斜杠（例如 `prefix//desk`）

`pnpm build` 还会把 `index.html` 复制到常见路由目录（如 `desk/index.html`），作为 COS 未配好错误文档时的兜底。