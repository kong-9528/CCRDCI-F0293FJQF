/**
 * Home DCI 查询页 mock 样例（统一 DCI 结果卡格式）
 *
 * 约定：每条记录必有 DCI 码；登记号可选。
 * 覆盖作品 / 软件 / 数据 × 四种状态：
 *  1) 仅 DCI，正常
 *  2) 仅 DCI，撤销（含 DCI撤销日期）
 *  3) DCI + 登记号，正常（含 登记号、登记日期）
 *  4) DCI + 登记号，撤销（含 登记号、登记日期、登记撤销日期）
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

  function dciFields(opts) {
    var nameLabel = opts.nameLabel;
    var typeLabel = opts.typeLabel;
    var typeValue = opts.typeValue;
    var name = opts.name;
    var owner = opts.owner;
    var org = opts.org;
    var applyDate = opts.applyDate;
    var rows = [
      { label: nameLabel, value: name, full: true },
      { label: typeLabel, value: typeValue },
      { label: "DCI分配日期", value: applyDate },
      { label: "著作权人", value: owner },
      { label: "DCI注册中心", value: org },
    ];
    if (opts.regNo) {
      rows.push({ label: "登记号", value: opts.regNo });
      rows.push({ label: "登记日期", value: opts.regDate });
    }
    if (opts.revoked) {
      rows.push({ label: "DCI撤销日期", value: opts.dciRevokeDate });
      if (opts.regNo) {
        rows.push({ label: "登记撤销日期", value: opts.regRevokeDate });
      }
    }
    return rows;
  }

  var ORG = "蚂蚁科技集团股份有限公司";

  var CATALOG = [
    // ========== 经典示例（页面提示文案） ==========
    item({
      id: "mock-dci11-1",
      assetType: "work",
      dciCode: "DCI:RQZ010ANT.156.202607012098976446",
      dciApplyTime: "2026-07-01",
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
      fields: dciFields({
        nameLabel: "作品名称",
        typeLabel: "作品类型",
        typeValue: "文字",
        name: "《数字版权保护技术规范》",
        owner: "中国版权保护中心",
        org: "中国版权保护中心",
        applyDate: "2026-07-01",
      }),
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
      fields: dciFields({
        nameLabel: "作品名称",
        typeLabel: "作品类型",
        typeValue: "美术",
        name: "春日写生",
        owner: "林晓",
        org: ORG,
        applyDate: "2026-01-08",
      }),
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
      fields: dciFields({
        nameLabel: "作品名称",
        typeLabel: "作品类型",
        typeValue: "美术",
        name: "旧海报设计",
        owner: "周启",
        org: ORG,
        applyDate: "2025-03-12",
        revoked: true,
        dciRevokeDate: "2026-02-18",
      }),
    }),
    item({
      id: "mock-work-reg-ok",
      assetType: "work",
      dciCode: "DCI:RQZPHOANT.156.20260120C3E5G7I9K1",
      relatedRegNo: "国作登字-2026-F-10000001",
      dciApplyTime: "2026-01-20",
      regDate: "2026-01-15",
      caseName: "海风摄影集",
      caseCategoryCode: "10",
      caseCategoryLabel: "摄影",
      registerName: "陈默",
      regOrgName: ORG,
      keywords: ["海风摄影集", "陈默"],
      fields: dciFields({
        nameLabel: "作品名称",
        typeLabel: "作品类型",
        typeValue: "摄影",
        name: "海风摄影集",
        owner: "陈默",
        org: ORG,
        applyDate: "2026-01-20",
        regNo: "国作登字-2026-F-10000001",
        regDate: "2026-01-15",
      }),
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
      fields: dciFields({
        nameLabel: "作品名称",
        typeLabel: "作品类型",
        typeValue: "美术",
        name: "城市速写本",
        owner: "苏晚",
        org: ORG,
        applyDate: "2025-06-01",
        regNo: "国作登字-2026-F-10000002",
        regDate: "2025-05-28",
        revoked: true,
        dciRevokeDate: "2026-03-01",
        regRevokeDate: "2026-02-25",
      }),
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
      fields: dciFields({
        nameLabel: "软件名称",
        typeLabel: "软件分类",
        typeValue: "应用软件",
        name: "云端任务调度系统",
        owner: "星河软件有限公司",
        org: ORG,
        applyDate: "2026-01-10",
      }),
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
      fields: dciFields({
        nameLabel: "软件名称",
        typeLabel: "软件分类",
        typeValue: "应用软件",
        name: "旧版报税辅助工具",
        owner: "财税通软件有限公司",
        org: ORG,
        applyDate: "2024-08-16",
        revoked: true,
        dciRevokeDate: "2026-01-22",
      }),
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
      fields: dciFields({
        nameLabel: "软件名称",
        typeLabel: "软件分类",
        typeValue: "嵌入式软件",
        name: "工业视觉检测软件",
        owner: "智造联科技股份有限公司",
        org: ORG,
        applyDate: "2026-02-01",
        regNo: "2026SR10000013",
        regDate: "2026-01-28",
      }),
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
      fields: dciFields({
        nameLabel: "软件名称",
        typeLabel: "软件分类",
        typeValue: "应用软件",
        name: "跨境电商库存同步软件",
        owner: "海纳互联科技有限公司",
        org: ORG,
        applyDate: "2025-04-10",
        regNo: "2025SR10000014",
        regDate: "2025-04-02",
        revoked: true,
        dciRevokeDate: "2026-03-08",
        regRevokeDate: "2026-03-05",
      }),
    }),

    // ========== 数据 ==========
    item({
      id: "mock-data-dci-ok",
      assetType: "data",
      dciCode: "DCI:RQZDS0ANT.156.20260118I9K1M3P5R7",
      dciApplyTime: "2026-01-18",
      caseName: "东方纹样素材库",
      caseCategoryLabel: "美术作品汇编",
      registerName: "纹样数据实验室",
      regOrgName: ORG,
      keywords: ["东方纹样素材库", "纹样数据实验室"],
      fields: dciFields({
        nameLabel: "数据名称",
        typeLabel: "数据类型",
        typeValue: "美术作品汇编",
        name: "东方纹样素材库",
        owner: "纹样数据实验室",
        org: ORG,
        applyDate: "2026-01-18",
      }),
    }),
    item({
      id: "mock-data-dci-rev",
      assetType: "data",
      dciCode: "DCI:RQZDS1ANT.156.20250220J0L2N4Q6S8",
      dciStatus: "2",
      dciApplyTime: "2025-02-20",
      dciRevokeDate: "2026-02-10",
      caseName: "旧版插画合集数据包",
      caseCategoryLabel: "美术作品汇编",
      registerName: "青禾数字内容中心",
      regOrgName: ORG,
      keywords: ["旧版插画合集数据包", "青禾数字内容中心"],
      fields: dciFields({
        nameLabel: "数据名称",
        typeLabel: "数据类型",
        typeValue: "美术作品汇编",
        name: "旧版插画合集数据包",
        owner: "青禾数字内容中心",
        org: ORG,
        applyDate: "2025-02-20",
        revoked: true,
        dciRevokeDate: "2026-02-10",
      }),
    }),
    item({
      id: "mock-data-reg-ok",
      assetType: "data",
      dciCode: "DCI:RQZDS2ANT.156.20260212K1M3P5R7T9",
      relatedRegNo: "国作登字-2026-G-20000023",
      dciApplyTime: "2026-02-12",
      regDate: "2026-02-08",
      caseName: "非遗彩绘图样数据集",
      caseCategoryLabel: "美术作品汇编",
      registerName: "文博数据研究院",
      regOrgName: ORG,
      keywords: ["非遗彩绘图样数据集", "文博数据研究院"],
      fields: dciFields({
        nameLabel: "数据名称",
        typeLabel: "数据类型",
        typeValue: "美术作品汇编",
        name: "非遗彩绘图样数据集",
        owner: "文博数据研究院",
        org: ORG,
        applyDate: "2026-02-12",
        regNo: "国作登字-2026-G-20000023",
        regDate: "2026-02-08",
      }),
    }),
    item({
      id: "mock-data-reg-rev",
      assetType: "data",
      dciCode: "DCI:RQZDS3ANT.156.20250715L2N4Q6S8U0",
      relatedRegNo: "国作登字-2025-G-20000024",
      dciStatus: "2",
      dciApplyTime: "2025-07-15",
      dciRevokeDate: "2026-03-12",
      regDate: "2025-07-10",
      regRevokeDate: "2026-03-09",
      caseName: "近代海报图样汇编包",
      caseCategoryLabel: "美术作品汇编",
      registerName: "时代视觉档案馆",
      regOrgName: ORG,
      keywords: ["近代海报图样汇编包", "时代视觉档案馆"],
      fields: dciFields({
        nameLabel: "数据名称",
        typeLabel: "数据类型",
        typeValue: "美术作品汇编",
        name: "近代海报图样汇编包",
        owner: "时代视觉档案馆",
        org: ORG,
        applyDate: "2025-07-15",
        regNo: "国作登字-2025-G-20000024",
        regDate: "2025-07-10",
        revoked: true,
        dciRevokeDate: "2026-03-12",
        regRevokeDate: "2026-03-09",
      }),
    }),
  ];

  global.__DCI_QUERY_MOCK_CATALOG__ = CATALOG;
})(typeof window !== "undefined" ? window : globalThis);
