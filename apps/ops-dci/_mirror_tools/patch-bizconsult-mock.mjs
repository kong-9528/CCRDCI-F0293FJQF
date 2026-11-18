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
    contactPerson: "刘晓雯",
    phoneNumber: "13800138001",
    consultType: "1",
    description:
      "我们这边想申请开通 DCI 注册中心，主要服务书画、影像类作品确权。想先确认一下：需要准备哪些材料、大概多久能审完，测试环境什么时候能开？麻烦帮忙对接一下。",
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
    orgName: "杭州网易云音乐有限公司",
    contactPerson: "周俊杰",
    phoneNumber: "13912345678",
    consultType: "2",
    description:
      "申请技术服务中心时上传营业执照一直提示「文件类型不支持」。我试了 PDF 和 JPG，都不到 2MB，还是不行。请问现在支持哪些格式、大小上限是多少？",
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
    contactPerson: "张丽华",
    phoneNumber: "13687654321",
    consultType: "1",
    description:
      "我们网文业务量比较大，想给作品批量确权、申领 DCI 码。不清楚该自己建注册中心，还是对接你们现有的注册中心更合适？另外接口侧对内容合规有没有硬性要求？",
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
    orgName: "成都索拓文化传播有限公司",
    contactPerson: "陈鹏",
    phoneNumber: "13700001122",
    consultType: "1",
    description:
      "我们是音乐厂牌，发行侧想嵌入 DCI 码做确权和分发追踪。有没有音频作品的对接文档或样例？方便的话发到我这个手机号绑定的邮箱。",
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
    orgName: "北京版权保护中心有限公司",
    contactPerson: "王志强",
    phoneNumber: "15010203040",
    consultType: "2",
    description:
      "测试环境调发码接口一直报 AccessKey 无效。密钥是按开通邮件配的，本地环境变量也核对过两遍了。能不能帮看下账号开通过没有、密钥是不是过期了？",
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
    orgName: "北京快手科技有限公司",
    contactPerson: "黄婷",
    phoneNumber: "18611112222",
    consultType: "1",
    description:
      "短视频、直播内容这边想接 DCI 标识，想先了解注册中心能提供哪些能力、能开哪些接口，后面运营支持怎么做。方便约个线上会细聊吗？",
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
    contactPerson: "李建国",
    phoneNumber: "15801020304",
    consultType: "1",
    description:
      "我们是集体管理组织，想了解 DCI 和现有音著集体管理业务怎么协同。成员单位如果要接入注册中心，路径大概怎么走、材料要交哪些？",
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
    orgName: "江苏凤凰数字科技有限公司",
    contactPerson: "徐敏",
    phoneNumber: "13122334455",
    consultType: "2",
    description:
      "门户实名已经过了，但「我的申请」里看不到注册中心进度。手机号、公司名是不是必须和执照一字不差？有没有办法自己查卡在哪一步？",
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
    orgName: "深圳市腾讯计算机系统有限公司",
    contactPerson: "马晓东",
    phoneNumber: "18800009988",
    consultType: "2",
    description:
      "作品已经拿过版权登记证书了，还需要再单独申领 DCI 码吗？对外展示的时候登记号和 DCI 码一般怎么一起用比较规范？",
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
    contactPerson: "赵雪梅",
    phoneNumber: "13566778899",
    consultType: "1",
    description:
      "电子书发行和渠道分发想对接 DCI 唯一标识。请问合作准入条件是什么、接口文档怎么申请，以及商务对接人怎么联系？",
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
