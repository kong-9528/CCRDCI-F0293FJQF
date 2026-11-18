/**
 * Replace bizConsult mock rows with friendly portal /dci/contact submissions.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "mirror/static/js/ops-mock-store.json");
const jsPath = path.join(root, "mirror/static/js/ops-mock-store.js");

const now = "2026-11-18T10:40:00.000Z";

/** @type {Array<Record<string, unknown>>} */
const rows = [
  {
    id: "101",
    orgName: "深圳市雅昌艺术网股份有限公司",
    contactPerson: "王敏",
    phoneNumber: "13800138001",
    consultType: "1",
    description:
      "您好，我们是艺术内容平台，希望申请成为 DCI 注册中心。想了解申请材料、审核周期，以及测试环境开通方式，请协助对接。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-17 10:22:18",
    updatedAt: "2026-11-17 10:22:18",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "102",
    orgName: "杭州青禾数字传媒有限公司",
    contactPerson: "陈思远",
    phoneNumber: "13912345678",
    consultType: "2",
    description:
      "在门户「联系我们」提交后想补充说明：技术服务中心申请上传营业执照时提示「文件类型不支持」。已试 PDF、JPG，均小于 5MB，请问支持哪些格式？",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-16 16:05:41",
    updatedAt: "2026-11-16 16:05:41",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "103",
    orgName: "上海阅文信息技术有限公司",
    contactPerson: "韩立",
    phoneNumber: "13687654321",
    consultType: "1",
    description:
      "我司文学平台计划为网文作品批量确权并申领 DCI 码。想咨询：适合自建注册中心还是接入现有注册中心？接口能力与内容合规有哪些要求？",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-16 09:18:27",
    updatedAt: "2026-11-16 09:18:27",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "104",
    orgName: "成都星澜影音文化工作室",
    contactPerson: "林婉清",
    phoneNumber: "13700001122",
    consultType: "1",
    description:
      "我们是独立音乐厂牌，希望在发行链路嵌入 DCI 码做确权与分发追踪。请问是否有音频类作品对接说明或样例文档？方便发到我邮箱。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-15 14:33:05",
    updatedAt: "2026-11-15 14:33:05",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "105",
    orgName: "北京知信版权科技有限公司",
    contactPerson: "赵明哲",
    phoneNumber: "15010203040",
    consultType: "2",
    description:
      "测试环境调用发码接口返回「AccessKey 无效」。密钥已按邮件配置，环境变量也核对过。请帮忙确认账号是否已开通、密钥是否过期。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-15 11:07:52",
    updatedAt: "2026-11-15 11:07:52",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "106",
    orgName: "广州南湾短视频科技有限公司",
    contactPerson: "吴佳宁",
    phoneNumber: "18611112222",
    consultType: "1",
    description:
      "希望就短视频 / 直播内容的 DCI 标识合作沟通：注册中心能力、可开放接口，以及后续运营支持方式。期待安排一次线上会议。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-14 18:26:11",
    updatedAt: "2026-11-14 18:26:11",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "107",
    orgName: "中国音像著作权集体管理协会",
    contactPerson: "孙启明",
    phoneNumber: "15801020304",
    consultType: "1",
    description:
      "作为集体管理组织，想了解 DCI 体系如何与现有著作权集体管理业务协同，以及成员单位接入注册中心的可行路径与材料要求。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-13 10:01:44",
    updatedAt: "2026-11-13 10:01:44",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "108",
    orgName: "南京云图教育科技有限公司",
    contactPerson: "何雨桐",
    phoneNumber: "13122334455",
    consultType: "2",
    description:
      "门户账号已完成实名，但在「我的申请」里看不到注册中心进度。请问手机号、主体名称是否必须与营业执照完全一致？如何自查卡在哪一步？",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-12 20:14:03",
    updatedAt: "2026-11-12 20:14:03",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "109",
    orgName: "深圳拾光影像有限公司",
    contactPerson: "郑凯",
    phoneNumber: "18800009988",
    consultType: "2",
    description:
      "咨询一下：作品已有版权登记证书，是否还需要单独申领 DCI 码？对外展示时登记号与 DCI 码分别怎么引用比较合适？",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-11 09:45:30",
    updatedAt: "2026-11-11 09:45:30",
    createStartTime: null,
    createEndTime: null,
  },
  {
    id: "110",
    orgName: "北京中文在线数字出版股份有限公司",
    contactPerson: "许清扬",
    phoneNumber: "13566778899",
    consultType: "1",
    description:
      "数字出版业务希望对接 DCI 唯一标识，用于电子书发行与渠道分发。请告知合作准入条件、接口文档申请方式，以及商务对接人联系方式。",
    smsCode: null,
    status: "0",
    replyContent: null,
    deleted: 0,
    createdAt: "2026-11-10 15:28:19",
    updatedAt: "2026-11-10 15:28:19",
    createStartTime: null,
    createEndTime: null,
  },
];

function page(list) {
  return {
    code: 1000000,
    msg: "成功",
    rows: list,
    total: list.length,
    success: true,
    traceId: "",
    timestamp: now,
  };
}

function detail(row) {
  return {
    code: 1000000,
    msg: "成功",
    data: row,
    success: true,
    traceId: "",
    timestamp: now,
  };
}

function phone(p) {
  return {
    code: 1000000,
    msg: "成功",
    data: p,
    success: true,
    traceId: "",
    timestamp: now,
  };
}

const store = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// drop old bizConsult keys
for (const k of Object.keys(store)) {
  if (k.includes("/dci/bizConsult")) delete store[k];
}

store["GET /api/v1/dciManage/dci/bizConsult/list"] = page(rows);
store["GET /api/v1/dciManage/dci/bizConsult/list?pageNum=1&pageSize=10"] =
  page(rows);

for (const row of rows) {
  store[`GET /api/v1/dciManage/dci/bizConsult/${row.id}`] = detail(row);
  store[`GET /api/v1/dciManage/dci/bizConsult/getRealPhone/${row.id}`] = phone(
    row.phoneNumber,
  );
}

fs.writeFileSync(jsonPath, JSON.stringify(store));
fs.writeFileSync(
  jsPath,
  "window.__OPS_MOCK_STORE__ = " + JSON.stringify(store) + ";\n",
);

console.log("patched bizConsult rows:", rows.length);
console.log(
  rows
    .map(
      (r) =>
        `${r.id} | ${r.orgName} | ${r.contactPerson} | type=${r.consultType}`,
    )
    .join("\n"),
);
