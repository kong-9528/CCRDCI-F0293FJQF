# 操作日志 Mock 示例

> 依据仓库当前实现整理：运营后台「系统管理 → 操作日志」页（`apps/ops/src/lib/opLogsStore.ts`、`OpLogsPage`），以及客户详情中的门户操作日志片段。  
> 机器可读完整数组见同目录 [`操作日志-Mock数据.json`](./操作日志-Mock数据.json)（与 `opLogsStore.LOGS` 同步）。  
> 两个业务端对应关系：
>
> | 文档称呼 | 代码 `scope` | 产品端 | 页面 Tab 文案 |
> |----------|--------------|--------|----------------|
> | 客户控制台 /customer | `portal` | `apps/customer` | DCI®技术服务中心 |
> | 运营后台 /ops | `ops` | `apps/ops` | 运营后台 |

数据字段与运行时类型一致：

```ts
type OpLog = {
  id: string;
  scope: "portal" | "ops";
  customerId?: string; // 仅 portal：关联 MOCK_CUSTOMERS.id
  actionType: string;
  content: string;
  operator: string;
  operatedAt: string; // YYYY-MM-DD HH:mm:ss
};
```

**编号约定（与业务库一致）：**

| 类型 | 示例 |
|------|------|
| 客户 ID | `"1"` 艾克米 / `"2"` 北方出版 / `"3"` 像素实验室 / `"4"` 瀚海音乐 … |
| DCI 码 | `DCI-SW20240001` |
| 核验编码（DCI/证书） | `R` + 13 位数字，如 `R1138840000985` |
| 核验编码（信息核验） | `I` + 13 位数字，如 `I2145500000108` |
| 登记号 | `2024SR001234` |
| API Key | `ak_live_` + 16 hex；记录 id `key_` + 8 hex |
| 开通申请 | `app-1`、`app-local-{ts}` |
| 合同号 | `HT-2026-0318`、`HT000101` |

---

## 1. 客户控制台（`scope: portal`）操作类型

| value | label | 说明 |
|-------|-------|------|
| `login` | 登录 | Header / 会话建立 |
| `logout` | 退出登录 | 主动退出 |
| `change_password` | 修改密码 | `/account/password`，可含踢会话 |
| `account_profile_edit` | 编辑机构联系人 | `/account` |
| `onboarding_submit` | 提交入驻申请 | `/apply` |
| `onboarding_withdraw` | 撤回入驻申请 | `/apply` |
| `verify_single` | 单次核验 | DCI / 信息 / 证书 |
| `verify_batch` | 批量核验 | DCI / 信息 |
| `view_result` | 查看结果 | 核验或审核结果详情 |
| `download_cert` | 下载证书文件 | 证书核验页 |
| `audit_submit` | 提交智能审核 | 内容安全 / 查重 / 侵权（多为 API 通道） |
| `apikey_create` | 创建 API Key | `/keys` |
| `apikey_enable` | 启用 API Key | |
| `apikey_disable` | 禁用 API Key | |
| `apikey_reset` | 重置 API Key | |
| `apikey_delete` | 删除 API Key | |

---

## 2. 运营后台（`scope: ops`）操作类型

| value | label | 说明 |
|-------|-------|------|
| `login` | 登录 | |
| `logout` | 退出登录 | |
| `application_approve` | 审核通过开通申请 | `/accounts/:id/review` |
| `application_reject` | 拒绝开通申请 | |
| `customer_create` | 新增客户 | `/customers/new` |
| `customer_edit` | 编辑客户 | `/customers/:id/edit` |
| `customer_status` | 启用/停用客户 | 列表/详情 |
| `customer_password_reset` | 重置客户密码 | |
| `contract_create` | 新增客户合同 | `/customers/:id/contracts` |
| `contract_edit` | 编辑客户合同 | |
| `service_edit` | 编辑产品服务 | 额度/周期等 |
| `service_stop` | 停止客户产品服务 | |
| `service_resume` | 恢复客户产品服务 | |
| `product_shelf` | 产品上架/下架 | `/products/verify` `/products/audit` |
| `capability_shelf` | 审核子能力上架/下架 | 安全/查重/侵权 |
| `api_create` | 新增接口 | `/system/api-services` |
| `api_edit` | 编辑接口 | |
| `api_status` | 接口上线/下线 | |
| `portal_home_publish` | 发布门户内容 | `/content/home` |
| `portal_home_withdraw` | 撤回门户内容 | |
| `portal_theme_visibility` | 门户主题显示/隐藏 | `/content/portal` |
| `guide_catalog_create` | 新增指南目录 | `/content/guide` |
| `guide_article_visibility` | 指南文章显示/隐藏 | |
| `console_help_edit` | 编辑控制台帮助文章 | `/content/console-help` |
| `console_help_visibility` | 控制台帮助显示/隐藏 | |
| `faq_visibility` | FAQ 显示/隐藏 | `/content/faqs` |
| `role_perms` | 配置角色权限 | `/system/roles` |
| `user_create` | 新增运营用户 | `/system/users` |
| `user_status` | 启用/停用运营用户 | |

---

## 3. Mock 明细：客户控制台（/customer）

以下样例可直接落入 `opLogsStore` 的 `LOGS`（`scope: "portal"`）。按时间倒序展示时与页面一致。

| id | customerId | 客户账号 | actionType | operator | operatedAt | content |
|----|------------|----------|------------|----------|------------|---------|
| p01 | 1 | acme_corp | login | acme_admin | 2026-08-29 09:12:03 | 登录客户控制台 |
| p02 | 1 | acme_corp | verify_single | acme_admin | 2026-08-29 09:18:41 | 提交 DCI核验（软件），核验编码 R1138840000985，DCI码 DCI-SW20240001，通道 WebUI |
| p03 | 1 | acme_corp | view_result | acme_admin | 2026-08-29 09:19:06 | 查看核验结果详情，核验编码 R1138840000985 |
| p04 | 1 | acme_corp | verify_batch | acme_ops | 2026-08-28 16:42:10 | 批量核验上传 120 条（去重后 118 条），产品：版权登记信息核验 |
| p05 | 1 | acme_corp | download_cert | acme_admin | 2026-08-28 11:05:22 | 下载核验证书文件，核验编码 R1187530000885，文件 certificate-demo-001.pdf |
| p06 | 1 | acme_corp | verify_single | acme_admin | 2026-08-27 10:22:15 | 提交版权登记证书核验，核验编码 R1187530000888，文件 certificate-001.jpg，通道 WebUI |
| p07 | 1 | acme_corp | apikey_create | acme_admin | 2026-08-27 14:08:33 | 创建 API Key，AccessKey ID ak_live_a1b2c3d4e5f60718，备注：生产环境主密钥 |
| p08 | 1 | acme_corp | apikey_reset | acme_admin | 2026-08-26 15:40:11 | 重置 API Key，旧密钥已失效，新 AccessKey ID ak_live_9f8e7d6c5b4a3210 |
| p09 | 1 | acme_corp | apikey_disable | acme_ops | 2026-08-26 16:02:44 | 禁用 API Key ak_live_1122334455667788 |
| p10 | 1 | acme_corp | audit_submit | acme_ops | 2026-08-25 13:20:08 | API 提交内容安全审核，产品：作品智能辅助审核 · 内容安全审核，请求 id rs202608251320 |
| p11 | 1 | acme_corp | view_result | acme_ops | 2026-08-25 13:21:40 | 查看内容安全审核调用记录，记录 id rs202608251320 |
| p12 | 1 | acme_corp | account_profile_edit | acme_admin | 2026-08-24 11:15:00 | 更新机构联系人：王敏 / 138****1111 / wangmin@acme.example |
| p13 | 1 | acme_corp | change_password | acme_admin | 2026-08-23 18:33:55 | 修改登录密码，并注销其他 2 个会话 |
| p14 | 1 | acme_corp | logout | acme_admin | 2026-08-29 12:01:00 | 主动退出登录 |
| p15 | 2 | north_press | login | north_admin | 2026-08-29 08:40:18 | 登录客户控制台 |
| p16 | 2 | north_press | verify_batch | north_admin | 2026-08-29 09:05:33 | 批量核验上传 56 条（去重后 54 条），产品：DCI核验 |
| p17 | 2 | north_press | verify_single | north_editor | 2026-08-28 14:18:09 | 提交版权登记信息核验，核验编码 I2145500000108，登记号 2024SR001234，通道 WebUI |
| p18 | 2 | north_press | audit_submit | north_editor | 2026-08-28 15:02:44 | API 提交作品登记查重，产品：作品智能辅助审核 · 作品登记查重，请求 id rd202608281502 |
| p19 | 2 | north_press | view_result | north_editor | 2026-08-28 15:10:12 | 查看作品登记查重结果，记录 id rd202608281502 |
| p20 | 2 | north_press | apikey_create | north_admin | 2026-08-27 10:00:00 | 创建 API Key，AccessKey ID ak_live_north001122334455，备注：编辑部只读调用 |
| p21 | 2 | north_press | apikey_enable | north_admin | 2026-08-27 10:05:20 | 启用 API Key ak_live_north001122334455 |
| p22 | 2 | north_press | logout | north_admin | 2026-08-29 17:30:00 | 主动退出登录 |
| p23 | 3 | pixel_lab | login | pixel_admin | 2026-08-18 09:30:00 | 登录客户控制台 |
| p24 | 3 | pixel_lab | audit_submit | pixel_admin | 2026-08-18 11:20:08 | API 提交疑似侵权审核，产品：作品智能辅助审核 · 疑似侵权审核，请求 id ri202608181120 |
| p25 | 3 | pixel_lab | view_result | pixel_admin | 2026-08-18 15:40:22 | 查看疑似侵权审核结果，记录 id ri202608181120 |
| p26 | 3 | pixel_lab | change_password | pixel_admin | 2026-08-17 14:33:55 | 修改登录密码 |
| p27 | 3 | pixel_lab | logout | pixel_admin | 2026-08-18 16:00:00 | 主动退出登录 |
| p28 | 4 | ocean_music | onboarding_submit | ocean_contact | 2026-08-09 16:20:00 | 提交入驻申请，公司：瀚海音乐文化有限公司，合同编号 HT-2026-0809 |
| p29 | 4 | ocean_music | onboarding_withdraw | ocean_contact | 2026-08-09 17:05:11 | 撤回入驻申请（草稿保留） |
| p30 | 4 | ocean_music | onboarding_submit | ocean_contact | 2026-08-10 09:12:00 | 重新提交入驻申请，公司：瀚海音乐文化有限公司，合同编号 HT-2026-0810 |
| p31 | 4 | ocean_music | login | ocean_admin | 2026-08-22 10:00:00 | 登录客户控制台（开通后首次） |
| p32 | 4 | ocean_music | apikey_create | ocean_admin | 2026-08-22 10:15:33 | 创建 API Key，AccessKey ID ak_live_ocean998877665544，备注：默认密钥 |
| p33 | 6 | stream_box | login | stream_ops | 2026-08-26 09:00:12 | 登录客户控制台 |
| p34 | 6 | stream_box | verify_single | stream_ops | 2026-08-26 09:22:40 | 提交 DCI核验（美术），核验编码 R1199000001234，DCI码 DCI-ART20260801，通道 API |
| p35 | 6 | stream_box | apikey_delete | stream_admin | 2026-08-25 18:40:00 | 删除 API Key ak_live_streamdeadbeef01（已确认二次校验） |

### JSON（portal 节选，完整集见代码 `LOGS`）

```json
[
  {
    "id": "p02",
    "scope": "portal",
    "customerId": "1",
    "actionType": "verify_single",
    "content": "提交 DCI核验（软件），核验编码 R1138840000985，DCI码 DCI-SW20240001，通道 WebUI",
    "operator": "acme_admin",
    "operatedAt": "2026-08-29 09:18:41"
  },
  {
    "id": "p07",
    "scope": "portal",
    "customerId": "1",
    "actionType": "apikey_create",
    "content": "创建 API Key，AccessKey ID ak_live_a1b2c3d4e5f60718，备注：生产环境主密钥",
    "operator": "acme_admin",
    "operatedAt": "2026-08-27 14:08:33"
  },
  {
    "id": "p28",
    "scope": "portal",
    "customerId": "4",
    "actionType": "onboarding_submit",
    "content": "提交入驻申请，公司：瀚海音乐文化有限公司，合同编号 HT-2026-0809",
    "operator": "ocean_contact",
    "operatedAt": "2026-08-09 16:20:00"
  }
]
```

---

## 4. Mock 明细：运营后台（/ops）

| id | actionType | operator | operatedAt | content |
|----|------------|----------|------------|---------|
| o01 | login | 运营管理员 | 2026-08-29 08:55:12 | 运营账号运营管理员登录成功 |
| o02 | application_approve | 运营管理员 | 2026-08-10 10:05:40 | 通过开通申请 app-ocean-01，公司：瀚海音乐文化有限公司，账号 ocean_music，开通 版权登记信息核验、版权登记证书核验 |
| o03 | application_reject | 王编辑 | 2026-08-08 15:28:17 | 拒绝开通申请 app-2，公司：某某影业，原因：合同附件不完整 |
| o04 | customer_create | 运营管理员 | 2026-08-21 11:25:00 | 新增客户账号 zhilian_sz，公司：智联数字版权有限公司 |
| o05 | customer_edit | 王编辑 | 2026-08-20 15:28:17 | 编辑客户 north_press：更新联系人邮箱 liqiang@north.example |
| o06 | customer_status | 运营管理员 | 2026-08-19 18:02:44 | 停用客户账号 pixel_lab |
| o07 | customer_status | 运营管理员 | 2026-08-01 09:10:00 | 启用客户账号 legacy_art（合同续签后） |
| o08 | customer_password_reset | 李运营 | 2026-08-18 09:40:11 | 重置客户 acme_corp 登录密码 |
| o09 | contract_create | 李运营 | 2026-08-12 14:20:00 | 为客户 acme_corp 新增合同 HT000218，2026-09-01~2027-08-31，金额 320000 |
| o10 | contract_edit | 李运营 | 2026-08-12 14:35:22 | 编辑客户 acme_corp 合同 HT000218：更新附件「艾克米-续签页.pdf」 |
| o11 | service_edit | 李运营 | 2026-08-18 09:40:11 | 调整客户 acme_corp 产品「DCI核验」额度：30000 → 50000 |
| o12 | service_stop | 运营管理员 | 2026-05-28 16:40:00 | 停止客户 pixel_lab 产品「作品智能辅助审核」 |
| o13 | service_resume | 运营管理员 | 2026-08-15 10:00:00 | 恢复客户 stream_box 产品「DCI核验」 |
| o14 | product_shelf | 运营管理员 | 2026-08-18 13:16:09 | 产品「疑似侵权审核」下架 |
| o15 | product_shelf | 运营管理员 | 2026-08-20 09:00:00 | 产品「DCI核验」保持上线（核对货架状态） |
| o16 | capability_shelf | 王编辑 | 2026-08-19 11:12:00 | 作品智能辅助审核子能力「内容安全审核」上架 |
| o17 | api_create | 李运营 | 2026-08-16 10:00:00 | 新增接口 info.verify.batch（POST /v1/info/verify/batch），归属产品：版权登记信息核验 |
| o18 | api_edit | 李运营 | 2026-08-16 10:22:18 | 编辑接口 dci.verify.single：更新错误码说明与示例 |
| o19 | api_status | 李运营 | 2026-08-16 11:08:27 | 接口「版权登记证书核验 - 批量调用」下线 |
| o20 | api_status | 李运营 | 2026-08-22 09:30:00 | 接口「DCI核验 - 单次调用」上线 |
| o21 | portal_home_publish | 王编辑 | 2026-08-17 16:50:33 | 发布门户内容配置 home-hero-v3（首页焦点区） |
| o22 | portal_home_withdraw | 王编辑 | 2026-08-14 11:20:00 | 撤回门户内容配置 home-hero-v2 |
| o23 | portal_theme_visibility | 王编辑 | 2026-08-13 09:45:00 | 门户主题「版权核验场景」设为显示 |
| o24 | guide_catalog_create | 王编辑 | 2026-08-12 10:10:00 | 新增指南目录「API 接入」，上级：产品使用，权重 10 |
| o25 | guide_article_visibility | 王编辑 | 2026-08-17 16:50:33 | 指南文章「API Key 管理」设为显示 |
| o26 | console_help_edit | 王编辑 | 2026-08-21 14:00:00 | 编辑控制台帮助文章「快速开始」(ch-quickstart) |
| o27 | console_help_visibility | 王编辑 | 2026-08-21 14:05:00 | 控制台帮助文章「常见问题」设为隐藏 |
| o28 | faq_visibility | 王编辑 | 2026-08-11 16:00:00 | FAQ「额度不足怎么办？」设为显示 |
| o29 | role_perms | 运营管理员 | 2026-08-10 11:30:00 | 更新角色「运营编辑」权限节点 12 项（含内容管理、产品货架） |
| o30 | user_create | 运营管理员 | 2026-08-09 09:00:00 | 新增运营用户「李运营」(li_ops)，角色：运营专员 |
| o31 | user_status | 运营管理员 | 2026-08-08 17:40:00 | 停用运营用户「试用账号」(trial_ops) |
| o32 | logout | 运营管理员 | 2026-08-29 19:00:00 | 运营管理员退出登录 |

### JSON（ops 节选）

```json
[
  {
    "id": "o02",
    "scope": "ops",
    "actionType": "application_approve",
    "content": "通过开通申请 app-ocean-01，公司：瀚海音乐文化有限公司，账号 ocean_music，开通 版权登记信息核验、版权登记证书核验",
    "operator": "运营管理员",
    "operatedAt": "2026-08-10 10:05:40"
  },
  {
    "id": "o11",
    "scope": "ops",
    "actionType": "service_edit",
    "content": "调整客户 acme_corp 产品「DCI核验」额度：30000 → 50000",
    "operator": "李运营",
    "operatedAt": "2026-08-18 09:40:11"
  },
  {
    "id": "o26",
    "scope": "ops",
    "actionType": "console_help_edit",
    "content": "编辑控制台帮助文章「快速开始」(ch-quickstart)",
    "operator": "王编辑",
    "operatedAt": "2026-08-21 14:00:00"
  }
]
```

---

## 5. 客户详情内变更日志（补充，非双端 Tab）

客户详情「操作日志」Tab 另有一套字段差分日志 `CustomerOpLog`（`apps/ops/src/lib/catalog.ts` → `MOCK_OP_LOGS`），与全局 `OpLog` 并存：

```ts
type CustomerOpLog = {
  id: string;
  customerId: string;
  action: "create" | "edit" | "service" | "enable" | "disable";
  summary: string;
  changes: { field: string; before: string; after: string }[];
  operator: string;
  at: string;
};
```

示例：

| id | customerId | action | summary | changes | operator | at |
|----|------------|--------|---------|---------|----------|-----|
| log-1 | 1 | create | 创建客户账号 | 账号 — → acme_corp；公司全称 — → 艾克米文化传媒有限公司 | 运营管理员 | 2026-01-02 10:00:00 |
| log-2 | 1 | service | 调整产品服务配置 | DCI核验·额度 总量 30000 → 总量 50000 | 运营管理员 | 2026-03-15 11:20:00 |
| log-3 | 1 | edit | 编辑客户联系信息 | 联系人电话 13800000000 → 13800001111 | 运营管理员 | 2026-08-01 14:20:00 |
| log-4 | 3 | disable | 停用账号 | 状态 已启用 → 已停用 | 运营管理员 | 2026-06-01 09:00:00 |
| log-5 | 3 | service | 停止产品服务 | 内容安全审核 生效中 → 已停止 | 运营管理员 | 2026-05-28 16:40:00 |
| log-6 | 4 | create | 审核开通创建客户 | 账号 — → ocean_music；公司全称 — → 瀚海音乐文化有限公司 | 运营管理员 | 2026-08-10 10:05:40 |
| log-7 | 2 | service | 调整产品服务配置 | 作品智能辅助审核·额度 总量 30000 → 总量 50000 | 李运营 | 2026-08-19 11:05:00 |
| log-8 | 1 | edit | 重置登录密码 | 密码 — → （已重置） | 李运营 | 2026-08-18 09:40:11 |

客户详情中「门户使用」类流水仍来自 `getCustomerPortalLogs(customerId)`，即第 3 节 `scope: portal` 且 `customerId` 匹配的记录。

---

## 6. 维护说明

1. **权威运行时数据**：`apps/ops/src/lib/opLogsStore.ts` 中的 `PORTAL_ACTION_TYPES` / `OPS_ACTION_TYPES` / `LOGS`。本文档与之同步；改 mock 时两边一起改。  
2. **不建议记日志**：工作台只读浏览、统计页筛选、API 文档复制、帮助中心阅读、操作日志页自身筛选。  
3. **审核 WebUI**：当前控制台审核页以调用记录查询为主；`audit_submit` 以 **API 通道** 样例为主，便于以后接 Web 提交。  
4. **筛选行为**：`filterOpLogs(scope, { actionType, operator, from, to })`，结果按 `operatedAt` 倒序。
