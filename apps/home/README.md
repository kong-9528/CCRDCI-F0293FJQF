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

### 本地 Mock（默认全量离线）

`mirror/static/js/dci-mock-api.js` 会拦截所有发往 `/api/v1/dciManage` 的 XHR/fetch，**不再请求真实后端**。演示账号与会话仍由 `dci-mock-auth.js` 提供（密码 `Abcd1234`，短信码 `123456`）。

重新 `mirror:fetch` 后请确认 `index.html` 仍加载 `dci-mock-auth.js` 与 `dci-mock-api.js`。

### 技术服务中心工作台（@ctp/customer）

「技术服务中心工作台」打开 `VITE_CUSTOMER_URL` 下的 `/desk`。

本地需同时启动：

```bash
pnpm --filter @ctp/home dev
pnpm --filter @ctp/customer dev
```

演示账号（密码均为 `Abcd1234`）：

| 账号 | 注册中心工作台 | 技术服务工作台 |
|------|----------------|----------------|
| `yachang` | 无 | 无 |
| `mayi` | 有 | 无 |
| `mayi1` | 无 | 有（菜单与开通管理可进入 customer） |
| `mayi2` | 有 | 有（菜单与开通管理可进入 customer） |

门户顶栏与**注册中心工作台**右上角菜单均按上表动态显示入口；未开通的平台不展示对应项（也不再出现「申请接入技术服务中心」硬编码项）。

### 标识管理 · DCI码权限演示

路径 `/dci/info-management/index`（`tab=identity` / `tab=apporg`）左下角有悬浮切换，用于演示当前用户 DCI 码权限的不同状态；两个 tab 共用同一选择（`sessionStorage`）。

## 重新拉取远端

```bash
pnpm --filter @ctp/home mirror:fetch
```
