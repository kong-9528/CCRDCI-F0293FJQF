/**
 * Inject mockApplyDocDetail into ops-mock-api.js for opus/soft/dataset *Info APIs.
 */
import fs from "node:fs";

const f = "apps/ops-dci/mirror/static/js/ops-mock-api.js";
let s = fs.readFileSync(f, "utf8");

if (s.includes("function mockApplyDocDetail")) {
  console.log("mock already present");
  process.exit(0);
}

const mockFn = `
  function mockOwner(i, id) {
    var n = Number(id) || 12;
    return {
      ownerName: "著作权人" + n + (i > 0 ? "-" + i : ""),
      ccpcOwnerId: "AUTH" + String(n).padStart(8, "0") + "00",
      rightOwnerTypeDesc: i % 2 ? "法人" : "自然人",
      rightOwnerRegion: "中国-北京市-北京市",
      cardTypeDesc: i % 2 ? "营业执照" : "居民身份证",
      cardNumber: i % 2 ? "911******0" + n + "X" : "110******123" + (n % 10),
      cardValidStartDate: "2016-01-01",
      cardValidEndDate: "2036-12-31",
      contactPerson: "联系人" + n + "-" + (i || 1),
      phone: "1380013" + String(100 + (n % 90) + i),
      email: "owner" + n + "_" + (i || 1) + "@example.com",
      cardFrontName: "证件正面照_" + n + "_1.jpg",
      cardBackName: "证件反面照_" + n + "_1.jpg",
      publicCardFrontUrl: "/static/favicon.ico",
      publicCardBackUrl: "/static/favicon.ico",
    };
  }

  function mockLinks(n, prefix) {
    return [1, 2, 3].map(function (i) {
      return {
        dciCode: "DCI:" + prefix + String(n).padStart(3, "0") + "0" + i + ".156.2025010" + i + "00000157" + i,
        ownerName: "著作权人" + i,
        dciApplyTime: "2025-0" + i + "-14 09:00:00",
        applyStatus: i === 3 ? "撤销" : "申领",
      };
    });
  }

  function mockApplyDocDetail(path) {
    var m = path.match(/\\/dci\\/applyDoc\\/(opus|soft|dataset)\\/(r|c|x)Info\\/([^/]+)/i);
    if (!m) return null;
    var entity = m[1].toLowerCase();
    var code = m[2].toUpperCase();
    var id = decodeURIComponent(m[3]);
    var n = Number(id) || 12;
    var typeName =
      entity === "opus"
        ? code === "C"
          ? "授权分配"
          : code === "X"
            ? "其他"
            : "原始分配"
        : code === "C"
          ? "C码"
          : code === "X"
            ? "其他"
            : "R码";
    var prefix = code === "C" ? "C" : code === "X" ? "X" : "R";
    var entLetter = entity === "soft" ? "S" : entity === "dataset" ? "D" : "O";
    var dciCode =
      "DCI:" +
      prefix +
      String(n).padStart(3, "0") +
      entLetter +
      n +
      ".156.202610010000DEMO" +
      String(n).padStart(2, "0");

    var base = {
      dciCode: dciCode,
      originDciCode: code === "C" ? "DCI:R" + String(n).padStart(3, "0") + "ABC.156.20250101000000174" : "",
      dciApplyTime: "2026-09-22 10:50:03",
      dciCodeType: code,
      dciCodeTypeName: typeName,
      registerName: "中国版权保护中心",
      applyOrgName: "DCI申领平台" + ((n % 3) + 1),
      dciRegisterSyncTime: "2026-09-27 09:00:00",
    };

    var owners = [mockOwner(1, id)];
    var chain = {
      sDatahash: "0x" + (n * 7919).toString(16) + "a1b2c3d4e5f6",
      blockTime: "2026-09-27 09:00:00",
    };
    var register = {
      registerNo: "DJ2025" + String(n).padStart(3, "0"),
      registerDate: "2026-11-21",
      registerOrgName: "中华人民共和国国家版权局",
    };
    var rights = {
      methodAcquiringRights: "原始取得",
      methodOwnershipRights: "个人所有",
      rightsScope: "全部财产权利",
      registeredDesc: "是",
      originRegisterNo: register.registerNo,
      registerDate: register.registerDate,
      registerOrgName: register.registerOrgName,
      changedDesc: "是",
      isRegistered: "是",
      softRegisterNo: register.registerNo,
      hasChange: "是",
    };

    var data = {
      dciLinkInfoVO: mockLinks(n, prefix),
    };

    if (entity === "opus") {
      data.dciCodeOpusBaseRinfo = base;
      data.dciOpusBaseRinfo = {
        opusName: "作品名称" + n,
        opusCategoryName: code === "C" ? "曲艺作品" : code === "X" ? "音乐作品" : "戏剧作品",
        opusCreationNature: code === "C" ? "改编" : code === "X" ? "汇编" : "原创",
        completeDate: "2026-10-22",
        completeAddress: "中国-广东省深圳市",
        publishStatusDesc: code === "R" ? "已发表" : "未发表",
        firstPublishDate: code === "R" ? "2026-10-02" : "-",
        firstAddress: code === "R" ? "中国-广东省深圳市" : "-",
        authorNames: "作者" + n,
        authorSignatures: code === "R" ? "署名" + n : "-",
        preRegistrationTrueWillDesc: "密码或确认短信",
        mattersEntrusted: "委托创作",
        preRegUserApplyConfirmTime: "2026-09-22 10:50:03",
      };
      data.dciOpusSampleRinfos = [
        {
          attachmentName: "作品样本 - 作品名称" + n + ".pdf",
          sampleSummary:
            "作品样本摘要：由著作权人" + n + "创作完成，内容涉及 DCI 数字版权相关主题。",
          publicAttachmentUrl: "/static/favicon.ico",
        },
        {
          attachmentName: "作品样本附图 - 作品名称" + n + ".zip",
          sampleSummary: "补充样本，含关键插图与附录页，便于核验作品独创性内容。",
          publicAttachmentUrl: "/static/favicon.ico",
        },
      ];
      data.dciOpusRightOwnerRinfos = owners;
      data.dciOpusRightRinfo = rights;
      data.dciOpusRegisterRinfo = register;
      data.dciOpusBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "许可合同",
          applyType: "许可",
          effectDate: "2026-10-14",
          attachmentName: "合同附件_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "发行权",
          sublicensePermit: "不允许",
          authStartDate: "2026-10-09",
          authEndDate: "2027-09-19",
          regionScope: "全球",
          otherLimit: "仅限中国大陆地区使用",
        };
      }
    } else if (entity === "soft") {
      data.dciCodeSoftBaseRinfo = base;
      data.dciSoftBaseRinfo = {
        softFullName: "软件全称" + n,
        softShortName: "简称" + n,
        version: "V" + ((n % 5) + 1) + ".2.0",
        softCategoryName: code === "C" ? "嵌入式软件" : "应用软件",
        creationNature: "修改（含翻译软件、合成软件）",
        needAuthDesc: "是",
        modifyDesc:
          code === "C"
            ? "合成多个模块形成新软件"
            : "在原软件基础上进行功能修改与界面优化",
        developMode: "单独开发",
        completeDate: "2026-11-03",
        publishStatusDesc: code === "R" ? "已发表" : "未发表",
        firstPublishDate: code === "R" ? "2026-10-14" : "-",
        firstPublishAddress: code === "R" ? "中国-北京市" : "-",
        preRegistrationTrueWillDesc: "密码或确认短信",
        mattersEntrusted: "委托开发",
        preRegUserApplyConfirmTime: "2026-10-04 10:51:03",
        devHardwareEnv: "Intel Core i7 / 16GB RAM",
        runHardwareEnv: "Intel Core i5 / 8GB RAM",
        devOs: "Windows 10",
        devTools: "Visual Studio 2022",
        runOs: "Linux",
        runSupport: "Java 17",
        programLanguage: "C++",
        sourceLines: "16000 行",
        developPurpose: "开发目的" + n + "：为用户提供高效便捷的数字版权管理工具",
        industry: "教育",
        mainFunction: "主要功能" + n + "：支持 DCI 码申领、查询、撤销及状态变更等核心业务",
        techFeature: "技术特点" + n + "：采用微服务架构，支持高并发、分布式部署",
      };
      data.dciSoftFeatureRinfo = data.dciSoftBaseRinfo;
      data.dciSoftSampleRinfo = {
        sourceName: "程序源代码.zip",
        docName: "软件说明文档.pdf",
        publicSourceUrl: "/static/favicon.ico",
        publicDocUrl: "/static/favicon.ico",
      };
      data.dciSoftRightOwnerRinfos = owners;
      data.dciSoftRightRinfo = rights;
      data.dciSoftRegisterRinfo = register;
      data.dciSoftBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "专有许可合同",
          softRegisteredDesc: "否",
          softRegisterNo: "软著登字第2025011号",
          changeCertNo: "无",
          attachmentName: "软件授权合同_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "信息网络传播权",
          regionScope: "亚太地区",
          contractEffectDate: "2026-11-05",
          licenseStartDate: "2024-01-01",
          licenseEndDate: "2029-12-31",
        };
      }
    } else {
      data.dciCodeDatasetBaseRinfo = base;
      data.dciDatasetBaseRinfo = {
        datasetName: "数据集名称" + n,
        dataScale: n * 32 + " 万条数据",
        dataLevel: "一级：科技 / 二级：人工智能",
        structureType: "非结构化数据",
        dataFormat: "图片 / 文本",
        datasetType: "商业数据集",
        authorNames: "作者" + n,
        opusCategoryName: "数据集",
        opusCreationNature: "改编",
        completeDate: "2026-04-11",
        completeAddress: "中国-北京市",
        publishStatusDesc: "已发表",
        firstPublishDate: "2026-04-11",
        firstPublishAddress: "中国-北京市",
        publishChannel: "科研数据共享平台",
      };
      data.dciDatasetSampleRinfo = {
        attachmentName: "数据集样本.zip",
        sampleSummary:
          "该数据集样本包含部分代表性数据条目及字段说明文档，用于版权登记审核与数据确权。",
        publicAttachmentUrl: "/static/favicon.ico",
      };
      data.dciDatasetRightOwnerRinfos = owners;
      data.dciDatasetRightRinfo = Object.assign({}, rights, {
        methodOwnershipRights: "职务作品",
        rightsScope: "人身权利及财产权利",
      });
      data.dciDatasetRegisterRinfo = register;
      data.dciDatasetBlockchainRinfo = chain;
      if (code === "C") {
        data.dciAuthContractRinfo = {
          contractType: "许可合同",
          applyType: "许可",
          effectDate: "2026-10-14",
          attachmentName: "合同附件_" + n + ".pdf",
          publicAttachmentUrl: "/static/favicon.ico",
        };
        data.transferorList = [Object.assign(mockOwner(1, id), { ownerName: "转让方" + n + "-1" })];
        data.transfereeList = [Object.assign(mockOwner(2, id), { ownerName: "受让方" + n + "-1" })];
        data.dciAuthScopeRinfo = {
          methodAcquiringRights: "原始取得",
          authRightsScope: "复制权",
          sublicensePermit: "不允许",
          authStartDate: "2026-01-01",
          authEndDate: "2028-12-31",
          regionScope: "中国",
          otherLimit: "-",
        };
      }
    }
    return ok100(data);
  }
`;

// Insert mock fn before mockRequest's applyDoc listByDci handler or before "var hit = lookup"
const anchor = "    // DCI 码查询：按码/关键词从 cursorList mock 过滤";
if (!s.includes(anchor)) {
  console.error("anchor not found");
  process.exit(1);
}

// Place function definitions near other helpers (before mockRequest). Find "function respondXhr" or after ok100 helpers.
const insertAt = s.indexOf("  function respondXhr");
if (insertAt < 0) {
  console.error("respondXhr not found");
  process.exit(1);
}
s = s.slice(0, insertAt) + mockFn + "\n" + s.slice(insertAt);

// Call mock in handler before lookup
const callAnchor = "    var hit = lookup(m, rawUrl);";
if (!s.includes(callAnchor)) {
  console.error("lookup anchor not found");
  process.exit(1);
}
s = s.replace(
  callAnchor,
  `    var applyDetail = mockApplyDocDetail(path);
    if (applyDetail) return applyDetail;

` + callAnchor,
);

fs.writeFileSync(f, s, "utf8");
console.log("injected mockApplyDocDetail");
