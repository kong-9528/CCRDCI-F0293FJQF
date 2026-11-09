/**
 * Home DCI 查询页 — 各业务类型公告查询 mock 样例
 * 字段对齐：docsss/documents/业务梳理-版权各业务线字段.xlsx 第一个 sheet「公告信息查询」
 *
 * 多记录展示（重点）：
 * - Z 字头全类型：国作登字-2026-G-00000004 + 鲍朵朵 / 汇编之美
 * - R 字头全类型：2021SR1109203 + 南京沁恒微电子股份有限公司 / 软件名
 * - 不含对照表 #18 DCI11、#19 全国作品（二者仍为单条独立样例）
 */
(function (global) {
  function inventNoticeDci(seed) {
    var s = String(seed || "0").replace(/[^0-9A-Za-z\u4e00-\u9fff]/g, "");
    var n = "";
    for (var i = 0; i < s.length; i++) n += String(s.charCodeAt(i) % 10);
    while (n.length < 18) n += "0";
    return "DCI:RQZ010ANT.156." + n.slice(0, 18);
  }
  function noticeLabel(typeName) {
    var s = String(typeName || "");
    if (!s) return "";
    if (/公告$/.test(s) || s === "DCI编码") return s;
    return s + "公告";
  }

  function item(cfg) {
    var fields = (cfg.fields || []).map(function (f) {
      return {
        label: f.label,
        value: f.value,
        full: !!f.full,
        link: !!f.link,
      };
    });
    var keywords = cfg.keywords || [];
    var relatedRegNo = cfg.relatedRegNo || (cfg.kind === "dci" ? "" : cfg.titleNo || "");
    var titleNo = cfg.titleNo == null ? "" : cfg.titleNo;
    var showTitleNo = Object.prototype.hasOwnProperty.call(cfg, "showTitleNo")
      ? !!cfg.showTitleNo
      : !!String(titleNo).trim();
    var dciCode = Object.prototype.hasOwnProperty.call(cfg, "dciCode")
      ? String(cfg.dciCode || "")
      : cfg.kind === "dci"
        ? ""
        : inventNoticeDci(titleNo || relatedRegNo || cfg.id);
    var matchCodes = cfg.matchCodes || [titleNo, relatedRegNo, dciCode].filter(Boolean);
    // 去重，避免同一登记号在 matchCodes 里出现两次
    var seen = {};
    matchCodes = matchCodes.filter(function (c) {
      var k = String(c).replace(/[\s\u3000]+/g, "").toUpperCase();
      if (!k || seen[k]) return false;
      seen[k] = true;
      return true;
    });
    return {
      id: cfg.id,
      kind: cfg.kind || "notice",
      bizLine: cfg.bizLine,
      noticeType: cfg.noticeType,
      noticeTypeLabel: cfg.noticeTypeLabel || noticeLabel(cfg.noticeType),
      titleLabel: cfg.titleLabel || "登记号",
      titleNo: titleNo,
      showTitleNo: showTitleNo,
      statusLabel: cfg.statusLabel || "",
      eventDate: cfg.eventDate || "",
      dciCode: dciCode,
      dciStatus: cfg.dciStatus || "",
      relatedRegNo: relatedRegNo,
      caseName: cfg.caseName || "",
      caseCategoryCode: cfg.caseCategoryCode || "",
      dciApplyTime: cfg.dciApplyTime || "",
      registerName: cfg.registerName || "",
      ownerName: cfg.ownerName || "",
      regOrgName: cfg.regOrgName || "",
      applyOrgName: cfg.applyOrgName || "",
      fields: fields,
      matchCodes: matchCodes,
      matchKeywords: keywords,
    };
  }

  var Z_REG = "国作登字-2026-G-00000004";
  var Z_DCI = "DCI:RQZ010ANT.156.2026010800000004";
  var Z_NAME = "汇编之美";
  var Z_OWNER = "鲍朵朵";
  var Z_KEYS = [Z_NAME, Z_OWNER];

  var R_REG = "2021SR1109203";
  var R_DCI = "DCI:RQZ010ANT.156.2021072711092030";
  var R_NAME = "沁恒USB以太网控制芯片驱动软件";
  var R_OWNER = "南京沁恒微电子股份有限公司";
  var R_KEYS = [R_NAME, "沁恒CH337DRV驱动软件", R_OWNER];

  var CATALOG = [
    // ========== Z 字头：同一登记号覆盖全部作品线业务类型 ==========
    item({
      id: "mock-z-all-z11",
      bizLine: "Z11",
      noticeType: "作品著作权登记",
      titleNo: Z_REG,
      dciCode: Z_DCI,
      eventDate: "2026-01-08",
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "作品类别", value: "摄影" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "登记日期", value: "2026年01月08日" },
      ],
    }),
    item({
      id: "mock-z-all-z21",
      bizLine: "Z21",
      noticeType: "著作权合同备案",
      titleNo: Z_REG,
      dciCode: "",
      eventDate: "2026-01-22",
      relatedRegNo: Z_REG,
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["华彩传媒股份有限公司"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "作品类别", value: "摄影" },
        { label: "转让(许可)方", value: Z_OWNER, link: true },
        { label: "受让(被许可)方", value: "华彩传媒股份有限公司", link: true },
        { label: "备案日期", value: "2026年01月22日" },
      ],
    }),
    item({
      id: "mock-z-all-z31",
      bizLine: "Z31",
      noticeType: "与著作权相关权利事项登记",
      titleNo: Z_REG,
      dciCode: "",
      eventDate: "2026-02-10",
      relatedRegNo: Z_REG,
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "作品类别", value: "摄影" },
        { label: "权利人", value: Z_OWNER, link: true },
        { label: "登记日期", value: "2026年02月10日" },
      ],
    }),
    item({
      id: "mock-z-all-z51",
      bizLine: "Z51",
      noticeType: "著作权质权登记",
      titleNo: "著质登字-2026-00000011",
      dciCode: "",
      eventDate: "2026-03-05",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG, "著质登字-2026-00000011"],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["东方信托有限公司"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "出质人", value: Z_OWNER, link: true },
        { label: "质权人", value: "东方信托有限公司", link: true },
        { label: "登记日期", value: "2026年03月05日" },
      ],
    }),
    item({
      id: "mock-z-all-z53",
      bizLine: "Z53",
      noticeType: "著作权质权变更登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-04-12",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG, "著质登字-2026-00000011"],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["东方信托有限公司"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "出质人", value: Z_OWNER, link: true },
        { label: "质权人", value: "东方信托有限公司", link: true },
        { label: "变更项", value: "质权担保主债权数额" },
        { label: "变更前内容", value: "人民币50万元" },
        { label: "变更后内容", value: "人民币80万元" },
        { label: "登记日期", value: "2026年04月12日" },
      ],
    }),
    item({
      id: "mock-z-all-z54",
      bizLine: "Z54",
      noticeType: "著作权质权注销撤销登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-05-18",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG, "著质登字-2026-00000011"],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["东方信托有限公司"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "出质人", value: Z_OWNER, link: true },
        { label: "质权人", value: "东方信托有限公司", link: true },
        { label: "注销/撤销编号", value: "著质注销字-2026-000088" },
        { label: "登记日期", value: "2026年05月18日" },
      ],
    }),
    item({
      id: "mock-z-all-z61",
      bizLine: "Z61",
      noticeType: "作品著作权和合同变更登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-06-20",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "原登记类型", value: "作品著作权登记" },
        { label: "变更项", value: "作品名称" },
        { label: "变更前内容", value: "汇编之美（初版）" },
        { label: "变更后内容", value: Z_NAME },
        { label: "登记日期", value: "2026年06月20日" },
      ],
    }),
    item({
      id: "mock-z-all-zqc4",
      bizLine: "ZQC（4）",
      noticeType: "司法撤销登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-07-01",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法/行政机关名称", value: "某市市场监督管理局" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "撤销依据", value: "行政处罚决定书〔2026〕12号" },
        { label: "撤销日期", value: "2026年07月01日" },
      ],
    }),
    item({
      id: "mock-z-all-z62",
      bizLine: "Z62",
      noticeType: "撤销作品著作权和合同登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-07-10",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS,
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "撤销登记申请人", value: Z_OWNER, link: true },
        { label: "原登记类型", value: "作品著作权登记" },
        { label: "撤销日期", value: "2026年07月10日" },
      ],
    }),
    item({
      id: "mock-z-all-zqc1",
      bizLine: "ZQC（1）",
      noticeType: "司法冻结/解冻登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-08-07",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["某市中级人民法院"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法机关名称", value: "某市中级人民法院" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "类型", value: "冻结" },
        { label: "冻结/解冻日期", value: "2026年08月07日" },
      ],
    }),
    item({
      id: "mock-z-all-zqc1-unfreeze",
      bizLine: "ZQC（1）",
      noticeType: "司法冻结/解冻登记",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2026-08-31",
      relatedRegNo: Z_REG,
      matchCodes: [Z_REG],
      caseName: Z_NAME,
      registerName: Z_OWNER,
      keywords: Z_KEYS.concat(["某市中级人民法院"]),
      fields: [
        { label: "作品名称", value: Z_NAME, full: true, link: true },
        { label: "司法机关名称", value: "某市中级人民法院" },
        { label: "著作权人", value: Z_OWNER, link: true },
        { label: "类型", value: "解冻" },
        { label: "冻结/解冻日期", value: "2026年08月31日" },
      ],
    }),

    // ========== R 字头：同一软件登记号覆盖全部软件线业务类型 ==========
    item({
      id: "mock-r-all-r11",
      bizLine: "R11",
      noticeType: "计算机软件著作权登记公告",
      titleNo: R_REG,
      dciCode: R_DCI,
      eventDate: "2021-07-27",
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS,
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "简称", value: "沁恒CH337DRV驱动软件" },
        { label: "著作权人", value: R_OWNER, link: true },
        { label: "版本号", value: "V1.0" },
        { label: "登记日期", value: "2021年07月27日" },
      ],
    }),
    item({
      id: "mock-r-all-r21-ar",
      bizLine: "R21",
      noticeType: "计算机软件著作权转让合同登记公告",
      titleNo: "2022AR0000888",
      dciCode: "",
      eventDate: "2022-08-15",
      relatedRegNo: R_REG,
      matchCodes: [R_REG, "2022AR0000888"],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS.concat(["云仓软件有限公司"]),
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "软件著作权登记号", value: R_REG },
        { label: "版本号", value: "V1.0" },
        { label: "转让方", value: R_OWNER, link: true },
        { label: "受让方", value: "云仓软件有限公司", link: true },
        { label: "登记日期", value: "2022年08月15日" },
      ],
    }),
    item({
      id: "mock-r-all-r21-lr",
      bizLine: "R21",
      noticeType: "计算机软件著作权专有许可合同登记公告",
      titleNo: "2023LR0000456",
      dciCode: "",
      eventDate: "2023-02-28",
      relatedRegNo: R_REG,
      matchCodes: [R_REG, "2023LR0000456"],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS.concat(["安防集成服务有限公司"]),
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "软件著作权登记号", value: R_REG },
        { label: "版本号", value: "V1.0" },
        { label: "许可方", value: R_OWNER, link: true },
        { label: "被许可方", value: "安防集成服务有限公司", link: true },
        { label: "许可期限", value: "2023-01-01 至 2027-12-31" },
        { label: "许可权利项", value: "复制权、发行权、信息网络传播权" },
        { label: "地域范围", value: "中华人民共和国境内" },
        { label: "登记日期", value: "2023年02月28日" },
      ],
    }),
    item({
      id: "mock-r-all-r31",
      bizLine: "R31",
      noticeType: "计算机软件著作权质押合同登记公告",
      titleNo: R_REG,
      dciCode: "",
      eventDate: "2023-06-01",
      relatedRegNo: R_REG,
      matchCodes: [R_REG],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS.concat(["华信银行股份有限公司"]),
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "出质人", value: R_OWNER, link: true },
        { label: "质权人", value: "华信银行股份有限公司", link: true },
        { label: "质物情况", value: "软件著作权（登记号 " + R_REG + "）全部权利" },
        { label: "登记日期", value: "2023年06月01日" },
      ],
    }),
    item({
      id: "mock-r-all-r32",
      bizLine: "R32",
      noticeType: "计算机软件著作权质押合同注销登记公告",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2024-01-15",
      relatedRegNo: R_REG,
      matchCodes: [R_REG],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS.concat(["华信银行股份有限公司"]),
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "出质人", value: R_OWNER, link: true },
        { label: "质权人", value: "华信银行股份有限公司", link: true },
        { label: "质物情况", value: "软件著作权质押已注销" },
        { label: "登记日期", value: "2024年01月15日" },
      ],
    }),
    item({
      id: "mock-r-all-r41",
      bizLine: "R41",
      noticeType: "计算机软件著作权变更补充登记公告",
      titleLabel: "编号",
      titleNo: "2024BB0000333",
      dciCode: "",
      eventDate: "2024-09-10",
      relatedRegNo: R_REG,
      matchCodes: [R_REG, "2024BB0000333"],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS,
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "软件著作权登记号", value: R_REG },
        { label: "变更或补充事项", value: "软件全称" },
        { label: "变更/补充前", value: "沁恒USB驱动软件" },
        { label: "变更/补充后", value: R_NAME },
        { label: "登记日期", value: "2024年09月10日" },
      ],
    }),
    item({
      id: "mock-r-all-r42",
      bizLine: "R42R44",
      noticeType: "计算机软件著作权登记撤销公告",
      titleNo: "",
      showTitleNo: false,
      dciCode: "",
      eventDate: "2025-06-30",
      relatedRegNo: R_REG,
      matchCodes: [R_REG],
      caseName: R_NAME,
      registerName: R_OWNER,
      keywords: R_KEYS,
      fields: [
        { label: "软件全称", value: R_NAME, full: true, link: true },
        { label: "版本号", value: "V1.0" },
        { label: "原登记者", value: R_OWNER, link: true },
        { label: "撤销日期", value: "2025年06月30日" },
      ],
    }),

    // ========== #18 DCI / #19 全国作品（单条，不参与 Z/R 全类型串） ==========
    item({
      id: "mock-dci11-1",
      kind: "dci",
      bizLine: "DCI11",
      noticeType: "DCI编码",
      titleLabel: "DCI编码",
      titleNo: "DCI:RQZ010ANT.156.202607012098976446",
      dciCode: "DCI:RQZ010ANT.156.202607012098976446",
      relatedRegNo: "",
      matchCodes: ["DCI:RQZ010ANT.156.202607012098976446"],
      caseName: "《数字版权保护技术规范》",
      caseCategoryCode: "01",
      dciApplyTime: "2026-07-01 10:28:36",
      registerName: "中国版权保护中心",
      ownerName: "中国版权保护中心",
      regOrgName: "蚂蚁科技集团股份有限公司",
      applyOrgName: "蚂蚁科技集团股份有限公司",
      keywords: ["《数字版权保护技术规范》", "数字版权保护技术规范", "中国版权保护中心"],
      fields: [
        { label: "作品名称", value: "《数字版权保护技术规范》", full: true },
        { label: "作品类型", value: "文字" },
        { label: "DCI分配日期", value: "2026-07-01" },
        { label: "著作权人", value: "中国版权保护中心" },
        { label: "DCI注册中心", value: "蚂蚁科技集团股份有限公司" },
      ],
    }),
    item({
      id: "mock-nation-1",
      bizLine: "全国作品",
      noticeType: "登记号（国作登字+地方简写）",
      noticeTypeLabel: "作品著作权登记公告",
      titleNo: "浙作登字-2024-F-0009988",
      dciCode: "DCI:RQZ010ANT.156.2024052100099880",
      eventDate: "2024-05-21",
      caseName: "西湖印象摄影作品",
      registerName: "杭州印象文化有限公司",
      keywords: ["西湖印象摄影作品", "杭州印象文化有限公司"],
      fields: [
        { label: "作品名称", value: "西湖印象摄影作品", full: true },
        { label: "作品类型", value: "摄影" },
        { label: "著作权人", value: "杭州印象文化有限公司", link: true },
        { label: "登记日期", value: "2024年05月21日" },
      ],
    }),
  ];

  global.__DCI_QUERY_MOCK_CATALOG__ = CATALOG;
})(typeof window !== "undefined" ? window : globalThis);
