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

## 腾讯云 / 云开发静态托管（必做）

本项目是 History 路由 SPA。直接打开 `/dashboard/index`、`/user/profile` 等子路径时，托管会去找同名对象；找不到就返回 `NoSuchKey` 404。

请在静态网站托管里配置：

1. **索引文档**：`index.html`
2. **错误文档**：`index.html`（相对键名，不要填 URL）
3. **错误文档响应码**：`200`
4. 用静态网站 / webapps 访问域名打开子路径

若报错里还有 `An Error Occured While Attempting to Retrieve a Custom Error Document` / `Key: index.html`：

- 确认你部署的根目录（例如 `ccrdci-home/`）下确实有 `index.html`
- 错误文档填 `index.html`，并确认它相对的是**该应用根**，不是桶里别的前缀
- 对象键不要出现双斜杠（例如 `ccrdci-home//dashboard/index`）

### 深链接常见故障

| 现象 | 原因 | 处理 |
|------|------|------|
| 打开 `/dashboard/index` 会**下载**一个 `index.html` | 桶里有无扩展名对象 `dashboard/index`，MIME 被当成二进制 | **不要**上传无扩展名的 `…/index`；删掉已有对象后全量重传 `dist/` |
| `/user/profile` 一直「正在加载系统资源」 | HTML 已返回，但 `./static/…` 相对当前路径解析成 `/user/profile/static/…` 404 | `index.html` 使用 `<base href="/">` 与绝对路径 `/static/…`（`pnpm build` 已保证） |
| 首页 `/` 正常、子路径异常 | 同上；错误文档未配好时深链拿不到 SPA 壳 | 配好错误文档 200，并全量上传含 `user/profile/index.html` 等兜底文件的 `dist/` |

`pnpm build`（`prepare-dist`）会：把资源改成根路径绝对引用、把 `index.html` 复制到常见路由的 `…/index.html`（**不会**再写无扩展名键），并删除会触发下载的根目录 `index` 文件。重新 build 后请**全量上传** `dist/`（并删除桶里旧的无扩展名 `dashboard/index` 等对象）。

## 重新拉取远端

```bash
pnpm --filter @ctp/home mirror:fetch
```
