# 03 前端规范

## 三个应用

| 包 | 技术 | 场景 | 样式 |
|----|------|------|------|
| `apps/portal` | Next.js App Router | 登录前门户、SEO | `p-` / `portal.css` |
| `apps/customer` | Vite + React | 企业登录后平台 | `a-` + `theme-customer` |
| `apps/ops` | Vite + React | 运营管理 | `a-` + `theme-ops` |

客户平台与运营后台共享 `packages/ui` 的后台骨架（侧栏、顶栏、表格、分页、状态标签），用 theme class 区分，不复制两套布局。

## 样式落地规则

1. 色值与字号来自 Design Tokens / `tokens.css`，禁止在业务 CSS 里写新的品牌色。
2. 门户组件 class 以 `p-` 开头；后台以 `a-` 开头。
3. 运营后台根节点必须带 `theme-ops`；客户平台必须带 `theme-customer`。
4. 需要新组件时：先复用 `admin.css` / `portal.css` 已有块；仍不够再在 `packages/ui` 增加**组合**，而不是改规范源文件。
5. 门户保持大留白与 Display 标题；后台保持 13px 基准、4px 栅格、高密度表格。不要把门户风格带进后台，反之亦然。

规范源路径（只读）：

- `docs/specifications/color_scheme/Design Tokens.json`
- `docs/specifications/css_specification/portal.css`
- `docs/specifications/css_specification/admin.css`

`packages/styles` 可以复制或构建生成 `tokens.css`，生成物可进仓库，但**手改必须以规范文件为准的逆向修改规范文件**不被允许。

## 页面最小集（闭环）

### 门户

- 首页（产品价值、6 个产品入口介绍）
- 登录页（仅登录，无注册）
- 可选：产品介绍静态页

### 客户平台（须登录，且账号由运营开通）

- 概览：剩余额度、近期调用
- 产品列表（仅已开通）
- WebUI 页 × 3：表单提交，等待同步响应，展示结果或错误
- API 文档（登录可见）
- API Key：创建、吊销、查看前缀（完整密钥仅创建时显示一次）
- 调用流水 / 用量查询

不可出现：自助开通产品、充值、支付。额度不足时展示联系运营/合同续期说明。

### 运营后台

- 租户列表与开通
- 为企业创建/重置成员账号
- 产品授权、单价、加额度/调账
- 全站或按租户的调用流水、账本
- 产品上下架、文档版本
- 审计日志

## 数据请求

统一使用 `packages/api-client`。禁止在三个应用里手写分叉的 URL 与类型。OpenAPI 变更后重新生成客户端再改页面。

## 路由与权限

- 客户应用路由全部要求企业 JWT；无租户上下文则回登录。
- 运营应用独立域名或独立 path（如 `ops.xxx` / `/ops`），只用运营 JWT。
- 前端不做「产品是否开通」的最终裁决，按钮可隐藏，接口必须再校验。
