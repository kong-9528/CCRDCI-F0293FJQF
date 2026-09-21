# @ctp/ops-dci

DCI 管理中心运营管理平台本地镜像（静态 Vue + 全量 mock，无真实后端）。

## 开发

```bash
pnpm --filter @ctp/ops-dci dev
# 或
pnpm dev:ops-dci
```

打开 http://localhost:3030/

演示账号：`root` / `Ccpc@123456`（密码会被页面 RSA 加密后提交；mock 仅校验用户名为 root）。

验证码在 mock 中已关闭（`captchaEnabled: false`）。

## 数据来源

登录远端 `http://8.145.60.215:9020/dci-manage` 后抓取的页面接口响应，固化为：

- `mirror/static/js/ops-mock-store.js`
- `mirror/static/js/ops-mock-api.js`（XHR/fetch 拦截）

## 常用脚本

```bash
pnpm --filter @ctp/ops-dci mirror:fetch   # 重新下载远端静态资源并 rewrite base
node apps/ops-dci/_mirror_tools/capture-remote.mjs  # 登录爬菜单并抓 API（需验证码）
node apps/ops-dci/_mirror_tools/build-mock-store.mjs # 从 capture 重建 mock store
```
