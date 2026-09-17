# ADR 005：三前端应用绑定既有视觉规范

## 状态

已采纳

## 上下文

门户与后台信息密度、配色场景已在 Design Tokens 与 CSS 中锁定。

## 决策

- 门户：Next.js + `portal.css`（`p-`）
- 客户 / 运营：Vite + React，共用 `admin.css`，`theme-customer` / `theme-ops`
- 规范源文件只读；业务不得另起品牌色

## 后果

SEO 与营销页独立演进；两后台共享骨架降低重复。主题切换成本仅为 class，不维护两套组件视觉。
