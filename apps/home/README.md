# apps/home — DCI管理中心门户（静态镜像）

本目录为 `http://8.145.60.215:9020/dci-manage-reg/` 的完整前端静态资源镜像，
资源已下载到 `mirror/`，并将绝对路径 `/dci-manage-reg/` 改写为根路径 `/`，便于本地直接打开。

## 开发

```bash
pnpm --filter @ctp/home install
pnpm --filter @ctp/home dev
```

浏览器访问：http://localhost:3020/

## 重新拉取远端

```bash
pnpm --filter @ctp/home mirror:fetch
```
