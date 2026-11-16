/**
 * Home DCI 查询页 mock 样例（统一 DCI 结果卡格式）
 * 与 docsss/documents/DCI查询页-统一结果卡mock样例_新.md 保持同步。
 *
 * 约定：每条记录必有 DCI 码；登记号可选。
 * 查询需同时命中「第一框码」与「第二框关键词」。
 */
(function (global) {
  function item(cfg) {
    var fields = (cfg.fields || []).map(function (f) {
      return {
        label: f.label,
        value: f.value,
        full: !!f.full,
        link: !!f.link,
      };
    });
    var dciCode = String(cfg.dciCode || "").trim();
    var relatedRegNo = String(cfg.relatedRegNo || "").trim();
    var matchCodes = cfg.matchCodes || [dciCode, relatedRegNo].filter(Boolean);
    var seen = {};
    matchCodes = matchCodes.filter(function (c) {
      var k = String(c).replace(/[\s\u3000]+/g, "").toUpperCase();
      if (!k || seen[k]) return false;
      seen[k] = true;
      return true;
    });
    return {
      id: cfg.id,
      kind: "dci",
      assetType: cfg.assetType || "work",
      bizLine: cfg.bizLine || "",
      noticeType: "",
      noticeTypeLabel: "",
      titleLabel: "DCI编码",
      titleNo: dciCode,
      showTitleNo: false,
      statusLabel: "",
      eventDate: cfg.eventDate || cfg.dciApplyTime || "",
      dciCode: dciCode,
      dciStatus: cfg.dciStatus || "",
      dciRevokeDate: cfg.dciRevokeDate || "",
      relatedRegNo: relatedRegNo,
      regDate: cfg.regDate || "",
      regRevokeDate: cfg.regRevokeDate || "",
      caseName: cfg.caseName || "",
      caseCategoryCode: cfg.caseCategoryCode || "",
      caseCategoryLabel: cfg.caseCategoryLabel || "",
      dciApplyTime: cfg.dciApplyTime || "",
      registerName: cfg.registerName || "",
      ownerName: cfg.ownerName || cfg.registerName || "",
      regOrgName: cfg.regOrgName || "",
      applyOrgName: cfg.applyOrgName || cfg.regOrgName || "",
      fields: fields,
      matchCodes: matchCodes,
      matchKeywords: cfg.keywords || [],
    };
  }

  function rows(list) {
    return list.map(function (f) {
      return {
        label: f.label,
        value: f.value,
        full: !!f.full,
        link: !!f.link,
      };
    });
  }

  var ORG = "蚂蚁科技集团股份有限公司";

  var CATALOG = [
    // ========== 经典示例（页面提示文案） ==========
    item({
      id: "mock-dci11-1",
      assetType: "work",
      dciCode: "DCI:RBQDJZCPC.156.202607012098976446",
      relatedRegNo: "国作登字-2026-F-10000123",
      dciApplyTime: "2026-07-01",
      regDate: "2026-01-15",
      caseName: "《数字版权保护技术规范》",
      caseCategoryCode: "01",
      caseCategoryLabel: "文字",
      registerName: "中国版权保护中心",
      regOrgName: "中国版权保护中心",
      keywords: [
        "《数字版权保护技术规范》",
        "数字版权保护技术规范",
        "中国版权保护中心",
      ],
      fields: rows([
        { label: "作品名称", value: "《数字版权保护技术规范》", full: true },
        { label: "作品类型", value: "文字" },
        { label: "DCI分配日期", value: "2026-07-01" },
        { label: "著作权人", value: "中国版权保护中心" },
        { label: "DCI注册中心", value: "中国版权保护中心" },
        { label: "登记号", value: "国作登字-2026-F-10000123" },
        { label: "登记日期", value: "2026-01-15" },
      ]),
    }),

    // ========== 作品 ==========
    item({
      id: "mock-work-dci-ok",
      assetType: "work",
      dciCode: "DCI:RQZ010ANT.156.20260108A1C3E5G7I9",
      dciApplyTime: "2026-01-08",
      caseName: "春日写生",
      caseCategoryCode: "08",
      caseCategoryLabel: "美术",
      registerName: "林晓",
      regOrgName: ORG,
      keywords: ["春日写生", "林晓"],
      fields: rows([
        { label: "作品名称", value: "春日写生", full: true },
        { label: "作品类型", value: "美术" },
        { label: "DCI分配日期", value: "2026-01-08" },
        { label: "著作权人", value: "林晓" },
        { label: "DCI注册中心", value: ORG },
      ]),
    }),
    item({
      id: "mock-work-dci-rev",
      assetType: "work",
      dciCode: "DCI:RQZWK1ANT.156.20250312B2D4F6H8J0",
      dciStatus: "2",
      dciApplyTime: "2025-03-12",
      dciRevokeDate: "2026-02-18",
      caseName: "旧海报设计",
      caseCategoryCode: "08",
      caseCategoryLabel: "美术",
      registerName: "周启",
      regOrgName: ORG,
      keywords: ["旧海报设计", "周启"],
      fields: rows([
        { label: "作品名称", value: "旧海报设计", full: true },
        { label: "DCI撤销日期", value: "2026-02-18" },
      ]),
    }),
    item({
      id: "mock-work-reg-ok",
      assetType: "work",
      dciCode: "DCI:RQZPHOANT.156.20260120C3E5G7I9K1",
      relatedRegNo: "国作登字-2026-F-10000001",
      dciApplyTime: "2026-01-20",
      regDate: "2026-01-25",
      caseName: "海风摄影集",
      caseCategoryCode: "10",
      caseCategoryLabel: "摄影",
      registerName: "陈默",
      regOrgName: ORG,
      keywords: ["海风摄影集", "陈默"],
      fields: rows([
        { label: "作品名称", value: "海风摄影集", full: true },
        { label: "作品类型", value: "摄影" },
        { label: "DCI分配日期", value: "2026-01-20" },
        { label: "著作权人", value: "陈默" },
        { label: "DCI注册中心", value: ORG },
        { label: "登记号", value: "国作登字-2026-F-10000001" },
        { label: "登记日期", value: "2026-01-25" },
      ]),
    }),
    item({
      id: "mock-work-reg-rev",
      assetType: "work",
      dciCode: "DCI:RQZARTANT.156.20250601D4F6H8J0L2",
      relatedRegNo: "国作登字-2026-F-10000002",
      dciStatus: "2",
      dciApplyTime: "2025-06-01",
      dciRevokeDate: "2026-03-01",
      regDate: "2025-05-28",
      regRevokeDate: "2026-02-25",
      caseName: "城市速写本",
      caseCategoryCode: "08",
      caseCategoryLabel: "美术",
      registerName: "苏晚",
      regOrgName: ORG,
      keywords: ["城市速写本", "苏晚"],
      fields: rows([
        { label: "作品名称", value: "城市速写本", full: true },
        { label: "DCI撤销日期", value: "2026-03-01" },
        { label: "登记号", value: "国作登字-2026-F-10000002" },
        { label: "登记撤销日期", value: "2026-02-25" },
      ]),
    }),

    // ========== 软件 ==========
    item({
      id: "mock-soft-dci-ok",
      assetType: "software",
      dciCode: "DCI:RQZSW0ANT.156.20260110E5G7I9K1M3",
      dciApplyTime: "2026-01-10",
      caseName: "云端任务调度系统",
      caseCategoryLabel: "应用软件",
      registerName: "星河软件有限公司",
      regOrgName: ORG,
      keywords: ["云端任务调度系统", "星河软件有限公司"],
      fields: rows([
        { label: "软件名称", value: "云端任务调度系统", full: true },
        { label: "DCI分配日期", value: "2026-01-10" },
        { label: "DCI注册中心", value: ORG },
      ]),
    }),
    item({
      id: "mock-soft-dci-rev",
      assetType: "software",
      dciCode: "DCI:RQZSW1ANT.156.20240816F6H8J0L2N4",
      dciStatus: "2",
      dciApplyTime: "2024-08-16",
      dciRevokeDate: "2026-01-22",
      caseName: "旧版报税辅助工具",
      caseCategoryLabel: "应用软件",
      registerName: "财税通软件有限公司",
      regOrgName: ORG,
      keywords: ["旧版报税辅助工具", "财税通软件有限公司"],
      fields: rows([
        { label: "软件名称", value: "旧版报税辅助工具", full: true },
        { label: "DCI撤销日期", value: "2026-01-22" },
      ]),
    }),
    item({
      id: "mock-soft-reg-ok",
      assetType: "software",
      dciCode: "DCI:RQZSW2ANT.156.20260201G7I9K1M3P5",
      relatedRegNo: "2026SR10000013",
      dciApplyTime: "2026-02-01",
      regDate: "2026-01-28",
      caseName: "工业视觉检测软件",
      caseCategoryLabel: "嵌入式软件",
      registerName: "智造联科技股份有限公司",
      regOrgName: ORG,
      keywords: ["工业视觉检测软件", "智造联科技股份有限公司"],
      fields: rows([
        { label: "软件名称", value: "工业视觉检测软件", full: true },
        { label: "DCI分配日期", value: "2026-02-01" },
        { label: "DCI注册中心", value: ORG },
        { label: "登记号", value: "2026SR10000013" },
        { label: "登记日期", value: "2026-01-28" },
      ]),
    }),
    item({
      id: "mock-soft-reg-rev",
      assetType: "software",
      dciCode: "DCI:RQZSW3ANT.156.20250410H8J0L2N4Q6",
      relatedRegNo: "2025SR10000014",
      dciStatus: "2",
      dciApplyTime: "2025-04-10",
      dciRevokeDate: "2026-03-08",
      regDate: "2025-04-02",
      regRevokeDate: "2026-03-05",
      caseName: "跨境电商库存同步软件",
      caseCategoryLabel: "应用软件",
      registerName: "海纳互联科技有限公司",
      regOrgName: ORG,
      keywords: ["跨境电商库存同步软件", "海纳互联科技有限公司"],
      fields: rows([
        { label: "软件名称", value: "跨境电商库存同步软件", full: true },
        { label: "DCI撤销日期", value: "2026-03-08" },
        { label: "登记号", value: "2025SR10000014" },
        { label: "登记撤销日期", value: "2026-03-05" },
      ]),
    }),

    // ========== 数据 ==========
    item({
      id: "mock-data-dci-ok",
      assetType: "data",
      dciCode: "DCI:RTDK11TJI.156.20260118I9K1M3P5R7",
      dciApplyTime: "2026-01-18",
      caseName: "2025年全国媒体行业用户情感分析数据",
      caseCategoryLabel: "符合作品特征的其他智力成果",
      registerName: "太极计算机股份有限公司",
      regOrgName: "太极计算机股份有限公司",
      keywords: [
        "2025年全国媒体行业用户情感分析数据",
        "太极计算机股份有限公司",
      ],
      fields: rows([
        {
          label: "数据名称",
          value: "2025年全国媒体行业用户情感分析数据",
          full: true,
        },
        { label: "作品类别", value: "符合作品特征的其他智力成果" },
        { label: "DCI分配日期", value: "2026-01-18" },
        { label: "权利人", value: "太极计算机股份有限公司" },
        { label: "DCI注册中心", value: "太极计算机股份有限公司" },
      ]),
    }),
    item({
      id: "mock-data-dci-rev",
      assetType: "data",
      dciCode: "DCI:RQZDS1ANT.156.20260220J0L2N4Q6S8",
      dciStatus: "2",
      dciApplyTime: "2026-02-20",
      dciRevokeDate: "2026-03-10",
      caseName: "旧版插画合集数据包",
      caseCategoryLabel: "符合作品特征的其他智力成果",
      registerName: "青禾数字内容中心",
      regOrgName: ORG,
      keywords: ["旧版插画合集数据包", "青禾数字内容中心"],
      fields: rows([
        { label: "数据名称", value: "旧版插画合集数据包", full: true },
        { label: "DCI撤销日期", value: "2026-03-10" },
      ]),
    }),
    item({
      id: "mock-data-reg-ok",
      assetType: "data",
      dciCode: "DCI:RQZDS2ANT.156.20260212K1M3P5R7T9",
      relatedRegNo: "HBD-2026-2000023",
      dciApplyTime: "2026-02-12",
      regDate: "2026-02-08",
      caseName: "非遗彩绘图样数据集",
      caseCategoryLabel: "符合作品特征的其他智力成果",
      registerName: "文博数据研究院",
      regOrgName: ORG,
      keywords: ["非遗彩绘图样数据集", "文博数据研究院"],
      fields: rows([
        { label: "数据名称", value: "非遗彩绘图样数据集", full: true },
        { label: "作品类别", value: "符合作品特征的其他智力成果" },
        { label: "DCI分配日期", value: "2026-02-12" },
        { label: "权利人", value: "文博数据研究院" },
        { label: "DCI注册中心", value: ORG },
        { label: "登记号", value: "HBD-2026-2000023" },
        { label: "登记日期", value: "2026-02-08" },
      ]),
    }),
    item({
      id: "mock-data-reg-rev",
      assetType: "data",
      dciCode: "DCI:RQZDS3ANT.156.20250715L2N4Q6S8U0",
      relatedRegNo: "HBD-2026-2000024",
      dciStatus: "2",
      dciApplyTime: "2025-07-15",
      dciRevokeDate: "2026-03-12",
      regDate: "2025-07-10",
      regRevokeDate: "2026-03-09",
      caseName: "近代海报图样汇编包",
      caseCategoryLabel: "符合作品特征的其他智力成果",
      registerName: "时代视觉档案馆",
      regOrgName: ORG,
      keywords: ["近代海报图样汇编包", "时代视觉档案馆"],
      fields: rows([
        { label: "数据名称", value: "近代海报图样汇编包", full: true },
        { label: "DCI撤销日期", value: "2026-03-12" },
        { label: "登记号", value: "HBD-2026-2000024" },
        { label: "登记撤销日期", value: "2026-03-09" },
      ]),
    }),
  ];

  global.__DCI_QUERY_MOCK_CATALOG__ = CATALOG;
})(typeof window !== "undefined" ? window : globalThis);
