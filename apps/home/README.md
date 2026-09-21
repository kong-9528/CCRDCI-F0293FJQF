# apps/home — DCI管理中心门户（静态镜像）

本目录为 `http://8.145.60.215:9020/dci-manage-reg/` 的完整前端静态资源镜像，
资源已下载到 `mirror/`，并将绝对路径 `/dci-manage-reg/` 改写为根路径 `/`，便于本地直接打开。

## 开发

```bash
pnpm --filter @ctp/home install
pnpm --filter @ctp/home dev
```

浏览器访问：http://localhost:3020/

### 跨应用域名（环境变量，不提交 git）

本地写在 gitignore 的 `.env.local`；部署时在平台上配置同名变量后重新构建。

| 变量 | 作用 | 本地默认 |
|------|------|----------|
| `VITE_CUSTOMER_URL` | 技术服务中心地址 | `http://localhost:3002` |

未配置时回退到上表默认值。`pnpm dev` / `pnpm build` 会写入 `window.__DCI_CUSTOMER_URL__`。

### 技术服务中心工作台（@ctp/customer）

「技术服务中心工作台」打开 `VITE_CUSTOMER_URL` 下的 `/desk`。

本地需同时启动：

```bash
pnpm --filter @ctp/home dev
pnpm --filter @ctp/customer dev
```

演示账号（密码均为 `Abcd1234`）：

| 账号 | 技术服务工作台 |
|------|----------------|
| `yachang` / `mayi` | 无入口（未开通） |
| `mayi1` / `mayi2` | 菜单与开通管理可进入 customer |

## 重新拉取远端

```bash
pnpm --filter @ctp/home mirror:fetch
```
