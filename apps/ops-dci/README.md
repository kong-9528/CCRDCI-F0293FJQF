# @ctp/ops-dci

DCI 管理中心运营管理平台本地镜像（静态 Vue + 全量 mock，无真实后端）。

## 入口（经 SSO）

本应用**不提供独立登录页**。请从 SSO 启动器进入：

1. 启动 `pnpm dev:sso`（默认 http://localhost:3003）
2. 登录后打开「DCI管理中心运营后台」
3. 跳转到 http://localhost:3030/?sso_ticket=…

未携带 ticket 且无会话时，会自动跳回 SSO 登录（`return_url` 回跳）。

可选环境变量：`VITE_SSO_URL`（默认 `http://localhost:3003`）。

## 开发

```bash
pnpm --filter @ctp/ops-dci dev
# 或
pnpm dev:ops-dci
```

侧栏已隐藏「用户管理」「角色管理」。

## 数据来源

登录远端 `http://8.145.60.215:9020/dci-manage` 后抓取的页面接口响应，固化为：

- `mirror/static/js/ops-mock-store.js`
- `mirror/static/js/ops-mock-api.js`（XHR/fetch 拦截）

## 常用脚本

```bash
pnpm --filter @ctp/ops-dci mirror:fetch   # 重新下载远端静态资源并 rewrite base
node apps/ops-dci/_mirror_tools/capture-remote.mjs  # 登录爬菜单并抓 API（需验证码）
node apps/ops-dci/_mirror_tools/build-mock-store.mjs # 从 capture 重建 mock store
node apps/ops-dci/_mirror_tools/fix-mock-failures.mjs
```
