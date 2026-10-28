import {
  d as defineComponent,
  r as ref,
  x as computed,
  w as watch,
  G as onMounted,
  f as resolveComponent,
  o as openBlock,
  c as createElementBlock,
  h as createElementVNode,
  i as createVNode,
  n as createCommentVNode,
  _ as _export_sfc,
} from "./index-DsYmzmNg.js";
import "../css/DciEntityDetail.css";

function pick(obj, ...keys) {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== "") return v;
  }
  return "";
}
function v(x) {
  return x == null || x === "" ? "-" : String(x);
}
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function item(label, value, full) {
  return `<div class="info-item${full ? " info-item--full" : ""}"><label>${esc(label)}</label><span>${esc(v(value))}</span></div>`;
}
function fileItem(label, name, url, full) {
  const body =
    url
      ? `<a class="file-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(name || "下载")}</a>`
      : esc(v(name));
  return `<div class="info-item${full ? " info-item--full" : ""}"><label>${esc(label)}</label><span>${body}</span></div>`;
}
function section(title, gridHtml) {
  return `<div class="section-card"><div class="section-header"><span class="section-title">${esc(title)}</span></div><div class="info-grid">${gridHtml}</div></div>`;
}
function tagClass(codeType) {
  return codeType === "C" ? "is-c" : codeType === "X" ? "is-x" : "is-r";
}
function typeLabel(entity, codeType) {
  if (entity === "opus") {
    return codeType === "C" ? "授权分配" : codeType === "X" ? "其他" : "原始分配";
  }
  if (codeType === "C") return "C码";
  if (codeType === "X") return "其他";
  return "R码";
}

function baseCode(detail) {
  return (
    detail.dciCodeOpusBaseRinfo ||
    detail.dciCodeSoftBaseRinfo ||
    detail.dciCodeDatasetBaseRinfo ||
    detail.dciCodeBaseRinfo ||
    detail.dciCodeBaseInfo ||
    {}
  );
}
function owners(detail) {
  return (
    detail.dciOpusRightOwnerRinfos ||
    detail.dciSoftRightOwnerRinfos ||
    detail.dciDatasetRightOwnerRinfos ||
    detail.rightOwnerRinfos ||
    []
  );
}
function links(detail) {
  const n = detail.dciLinkInfoVO;
  if (!n) return [];
  return Array.isArray(n) ? n : [n];
}

function renderCodeSection(detail, entity, codeType) {
  const b = baseCode(detail);
  const dci = pick(b, "dciCode");
  let grid =
    `<div class="info-item info-item--full"><label>DCI码：</label><span class="dci-code">${esc(v(dci))}</span></div>` +
    (codeType === "C"
      ? `<div class="info-item info-item--full"><label>原始DCI码：</label><span class="dci-code">${esc(v(pick(b, "originDciCode", "originalDciCode", "srcDciCode")))}</span></div>`
      : "") +
    item("DCI分配时间：", pick(b, "dciApplyTime")) +
    item("DCI码类型：", pick(b, "dciCodeTypeName", "dciCodeType") || typeLabel(entity, codeType)) +
    item("DCI注册中心：", pick(b, "registerName")) +
    item("DCI申领平台：", pick(b, "applyOrgName")) +
    item("DC注册中心同步时间：", pick(b, "dciRegisterSyncTime"));
  return section("DCI码基本信息", grid);
}

function renderOpusBase(detail) {
  const o =
    detail.dciOpusBaseRinfo || detail.dciOpusBaseInfo || detail.opusBaseInfo || {};
  return section(
    "作品基本信息",
    item("作品名称：", pick(o, "opusName", "caseName")) +
      item("作品类别：", pick(o, "opusCategoryName", "caseCategoryName")) +
      item("创作性质：", pick(o, "opusCreationNature")) +
      item("创作完成日期：", pick(o, "completeDate")) +
      item("创作完成地点：", pick(o, "completeAddress")) +
      item("发表状态：", pick(o, "publishStatusDesc", "publishStatus")) +
      item("首次发表日期：", pick(o, "firstPublishDate")) +
      item("首次发表地点：", pick(o, "firstAddress", "firstPublishAddress")) +
      item("作者名称：", pick(o, "authorNames", "authorName")) +
      item("作者署名：", pick(o, "authorSignatures", "authorSignature")) +
      item("著作权人真实意愿的确认方式：", pick(o, "preRegistrationTrueWillDesc", "preRegistrationTrueWill")) +
      item("委托事项：", pick(o, "mattersEntrusted")) +
      item("著作权人申请确认时间：", pick(o, "preRegUserApplyConfirmTime")),
  );
}

function renderOpusSamples(detail) {
  const list = detail.dciOpusSampleRinfos || (detail.dciOpusSampleRinfo ? [detail.dciOpusSampleRinfo] : []);
  if (!list.length) {
    return section("作品样本", item("样本：", "-", true) + item("作品样本摘要：", "-", true));
  }
  let html = "";
  for (const s of list) {
    html += fileItem(
      "样本：",
      pick(s, "attachmentName", "fileName") || "作品样本",
      pick(s, "publicAttachmentUrl", "attachmentUrl", "path"),
      true,
    );
  }
  // 多个附件只保留一条摘要（取第一条非空）
  let summary = "";
  for (const s of list) {
    const t = pick(s, "sampleSummary");
    if (t != null && String(t).trim() !== "") {
      summary = String(t).replace(/^作品样本摘要[:：]\s*/, "");
      break;
    }
  }
  html += item("作品样本摘要：", summary || "-", true);
  return section("作品样本", html);
}

function renderSoftBase(detail) {
  const o = detail.dciSoftBaseRinfo || detail.dciSoftBaseInfo || detail.softBaseInfo || {};
  return section(
    "软件基本信息",
    item("软件全称：", pick(o, "softFullName", "softwareFullName", "softName", "caseName")) +
      item("软件简称：", pick(o, "softShortName", "softwareShortName")) +
      item("版本号：", pick(o, "version", "softVersion")) +
      item("软件分类：", pick(o, "softCategoryName", "softwareCategory")) +
      item("原创/修改：", pick(o, "creationNature", "originalOrModify")) +
      item("是否需原权利人授权：", pick(o, "needAuthDesc", "needOriginalAuth")) +
      item("修改合成或翻译说明：", pick(o, "modifyDesc", "modifyExplain"), true) +
      item("开发方式：", pick(o, "developMode", "developWay")) +
      item("开发完成日期：", pick(o, "completeDate", "developCompleteDate")) +
      item("发表状态：", pick(o, "publishStatusDesc", "publishStatus")) +
      item("首次发表日期：", pick(o, "firstPublishDate")) +
      item("首次发表地点：", pick(o, "firstPublishAddress", "firstAddress")) +
      item("著作权人真实意愿的确认方式：", pick(o, "preRegistrationTrueWillDesc", "preRegistrationTrueWill")) +
      item("委托事项：", pick(o, "mattersEntrusted")) +
      item("著作权人申请确认时间：", pick(o, "preRegUserApplyConfirmTime")),
  );
}

function renderSoftFeatures(detail) {
  const o = detail.dciSoftFeatureRinfo || detail.dciSoftBaseRinfo || detail.softFeatureInfo || {};
  return section(
    "软件功能与特点",
    item("开发的硬件环境：", pick(o, "devHardwareEnv", "developHardware")) +
      item("运行的硬件环境：", pick(o, "runHardwareEnv", "runtimeHardware")) +
      item("开发该软件的操作系统：", pick(o, "devOs", "developOs")) +
      item("软件开发环境/开发工具：", pick(o, "devTools", "developTools")) +
      item("该软件的运行平台/操作系统：", pick(o, "runOs", "runtimeOs")) +
      item("软件运行支撑环境/支持软件：", pick(o, "runSupport", "runtimeSupport")) +
      item("编程语言：", pick(o, "programLanguage", "language")) +
      item("源程序量：", pick(o, "sourceLines", "sourceAmount")) +
      item("开发目的：", pick(o, "developPurpose"), true) +
      item("面向领域/行业：", pick(o, "industry", "domain")) +
      item("软件的主要功能：", pick(o, "mainFunction"), true) +
      item("软件的技术特点：", pick(o, "techFeature"), true),
  );
}

function renderSoftSamples(detail) {
  const o = detail.dciSoftSampleRinfo || detail.softSample || {};
  return section(
    "软件样本",
    fileItem("程序源代码：", pick(o, "sourceName", "sourceCodeName") || "程序源代码.zip", pick(o, "publicSourceUrl", "sourceUrl"), true) +
      fileItem("文档：", pick(o, "docName", "documentName") || "软件说明文档.pdf", pick(o, "publicDocUrl", "docUrl"), true),
  );
}

function renderDatasetBase(detail) {
  const o = detail.dciDatasetBaseRinfo || detail.dciDatasetBaseInfo || detail.datasetBaseInfo || {};
  return section(
    "数据集基本信息",
    item("数据集名称：", pick(o, "datasetName", "caseName")) +
      item("数据规模：", pick(o, "dataScale", "datasetScale")) +
      item("数据两级：", pick(o, "dataLevel", "dataTwoLevel")) +
      item("数据集结构类型：", pick(o, "structureType", "datasetStructureType")) +
      item("数据格式：", pick(o, "dataFormat")) +
      item("数据集类型：", pick(o, "datasetType")) +
      item("作者：", pick(o, "authorNames", "author")) +
      item("作品类别：", pick(o, "opusCategoryName", "caseCategoryName") || "数据集") +
      item("作品性质：", pick(o, "opusCreationNature", "workNature")) +
      item("创作完成日期：", pick(o, "completeDate")) +
      item("创作完成地点：", pick(o, "completeAddress")) +
      item("发表状态：", pick(o, "publishStatusDesc", "publishStatus")) +
      item("首次发表日期：", pick(o, "firstPublishDate")) +
      item("首次发表地点：", pick(o, "firstPublishAddress", "firstAddress")) +
      item("发表渠道：", pick(o, "publishChannel")),
  );
}

function renderDatasetSamples(detail) {
  const o = detail.dciDatasetSampleRinfo || detail.datasetSample || {};
  return section(
    "数据集样本",
    fileItem("数据集样本：", pick(o, "attachmentName", "sampleName") || "数据集样本.zip", pick(o, "publicAttachmentUrl", "attachmentUrl"), true) +
      item("数据集样本摘要：", pick(o, "sampleSummary"), true),
  );
}

function renderOwners(detail) {
  const list = owners(detail);
  if (!list.length) {
    return section("著作权人信息", `<div class="info-item info-item--full"><span>-</span></div>`);
  }
  let cards = '<div class="owner-list">';
  list.forEach((o, idx) => {
    cards += `<div class="owner-card"><div class="owner-title">著作权人 ${idx + 1}</div><div class="info-grid">`;
    cards +=
      item("著作权人名称：", pick(o, "ownerName")) +
      item("著作权人认证ID：", pick(o, "ccpcOwnerId", "authId")) +
      item("著作权人类型：", pick(o, "rightOwnerTypeDesc", "rightOwnerType")) +
      item("著作权人区域：", pick(o, "rightOwnerRegion")) +
      item("证件类型：", pick(o, "cardTypeDesc", "cardType")) +
      item("证件号码：", pick(o, "cardNumber")) +
      item("证件有效起始期：", pick(o, "cardValidStartDate")) +
      item("证件有效终止期：", pick(o, "cardValidEndDate")) +
      item("联系人：", pick(o, "contactPerson")) +
      (pick(o, "email") ? item("邮箱地址：", pick(o, "email")) : "") +
      item("手机号：", pick(o, "phone")) +
      fileItem("证件正面照：", pick(o, "cardFrontName") || "证件正面照", pick(o, "publicCardFrontUrl", "cardFrontUrl")) +
      fileItem("证件反面照：", pick(o, "cardBackName") || "证件反面照", pick(o, "publicCardBackUrl", "cardBackUrl"));
    cards += "</div></div>";
  });
  cards += "</div>";
  return `<div class="section-card"><div class="section-header"><span class="section-title">著作权人信息</span></div>${cards}</div>`;
}

function renderRights(detail, soft) {
  const o =
    detail.dciOpusRightRinfo ||
    detail.dciSoftRightRinfo ||
    detail.dciDatasetRightRinfo ||
    detail.dciOpusRightConditionRinfo ||
    {};
  let grid =
    item("权利取得方式：", pick(o, "methodAcquiringRights", "methodAcquiringRightsDesc")) +
    (soft
      ? item("权利范围：", pick(o, "rightsScope", "rightsScopeDesc"))
      : item("权利归属方式：", pick(o, "methodOwnershipRights", "methodOwnershipRightsDesc")) +
        item("权利范围：", pick(o, "rightsScope", "rightsScopeDesc")));
  if (soft) {
    grid +=
      item("软件是否已登记：", pick(o, "registeredDesc", "isRegistered")) +
      item("原有软件登记号：", pick(o, "originRegisterNo", "softRegisterNo")) +
      item("登记时间：", pick(o, "registerDate")) +
      item("登记机构：", pick(o, "registerOrgName")) +
      item("原登记是否做过变更或补充：", pick(o, "changedDesc", "hasChange"));
  }
  return section("权利信息", grid);
}

function renderRegister(detail) {
  const o =
    detail.dciOpusRegisterRinfo ||
    detail.dciSoftRegisterRinfo ||
    detail.dciDatasetRegisterRinfo ||
    detail.registerRinfo ||
    {};
  return section(
    "关联登记信息",
    item("登记号：", pick(o, "registerNo")) +
      item("登记时间：", pick(o, "registerDate")) +
      item("登记机构：", pick(o, "registerOrgName")),
  );
}

function renderChain(detail) {
  const o =
    detail.dciOpusBlockchainRinfo ||
    detail.dciSoftBlockchainRinfo ||
    detail.dciDatasetBlockchainRinfo ||
    detail.blockchainRinfo ||
    {};
  return section(
    "数字版权链信息",
    item("区块哈希：", pick(o, "sDatahash", "sdatahash", "blockHash"), true) +
      item("上链时间：", pick(o, "blockTime")),
  );
}

function renderContract(detail, soft) {
  const o = detail.dciAuthContractRinfo || detail.authContractInfo || detail.contractInfo || {};
  const title = soft ? "授权合同信息" : "授权合同基本信息";
  if (soft) {
    return section(
      title,
      item("合同类型：", pick(o, "contractType")) +
        item("是否做过软件著作权登记：", pick(o, "softRegisteredDesc", "hasSoftRegister")) +
        item("软件著作权登记号：", pick(o, "softRegisterNo")) +
        item("原变更/补充登记证明编号：", pick(o, "changeCertNo")) +
        fileItem("合同附件：", pick(o, "attachmentName") || "合同附件", pick(o, "publicAttachmentUrl", "attachmentUrl"), true),
    );
  }
  return section(
    title,
    item("合同类型：", pick(o, "contractType")) +
      item("申请类型：", pick(o, "applyType")) +
      item("合同生效时间：", pick(o, "effectDate", "contractEffectDate")) +
      fileItem("合同附件：", pick(o, "attachmentName") || "合同附件", pick(o, "publicAttachmentUrl", "attachmentUrl"), true),
  );
}

function renderParty(title, list) {
  const arr = !list ? [] : Array.isArray(list) ? list : [list];
  if (!arr.length) return section(title, item("著作权人名称：", "-"));
  let html = "";
  arr.forEach((o, idx) => {
    if (arr.length > 1) html += `<div class="info-item info-item--full"><span style="color:#1890ff;font-weight:500">${esc(title)} ${idx + 1}</span></div>`;
    html +=
      item("著作权人名称：", pick(o, "ownerName")) +
      item("著作权人认证ID：", pick(o, "ccpcOwnerId", "authId")) +
      item("著作权人类型：", pick(o, "rightOwnerTypeDesc")) +
      item("著作权人区域：", pick(o, "rightOwnerRegion")) +
      item("证件类型：", pick(o, "cardTypeDesc")) +
      item("证件号码：", pick(o, "cardNumber")) +
      item("证件有效起始期：", pick(o, "cardValidStartDate")) +
      item("证件有效终止期：", pick(o, "cardValidEndDate")) +
      item("联系人：", pick(o, "contactPerson")) +
      item("手机号：", pick(o, "phone")) +
      fileItem("证件正面照：", pick(o, "cardFrontName") || "证件正面照", pick(o, "publicCardFrontUrl", "cardFrontUrl")) +
      fileItem("证件反面照：", pick(o, "cardBackName") || "证件反面照", pick(o, "publicCardBackUrl", "cardBackUrl"));
  });
  return section(title, html);
}

function renderAuthScope(detail, soft) {
  const o = detail.dciAuthScopeRinfo || detail.authScopeInfo || {};
  if (soft) {
    return section(
      "授权范围",
      item("权利取得方式：", pick(o, "methodAcquiringRights")) +
        item("授权权利范围：", pick(o, "authRightsScope", "rightsScope")) +
        item("地域范围：", pick(o, "regionScope")) +
        item("合同生效日期：", pick(o, "contractEffectDate")) +
        item("许可权利期限开始日期：", pick(o, "licenseStartDate")) +
        item("许可权利期限结束日期：", pick(o, "licenseEndDate")),
    );
  }
  return section(
    "授权范围",
    item("权利取得方式：", pick(o, "methodAcquiringRights")) +
      item("授权权利范围：", pick(o, "authRightsScope", "rightsScope")) +
      item("转授权权利许可：", pick(o, "sublicensePermit")) +
      item("授权开始时间：", pick(o, "authStartDate", "licenseStartDate")) +
      item("授权终止时间：", pick(o, "authEndDate", "licenseEndDate")) +
      item("地域范围：", pick(o, "regionScope")) +
      item("其他权利限制条件：", pick(o, "otherLimit"), true),
  );
}

function renderLinks(detail) {
  const rows = links(detail);
  let body = "";
  if (!rows.length) {
    body = `<tr><td colspan="4">-</td></tr>`;
  } else {
    for (const r of rows) {
      body += `<tr><td class="dci-code">${esc(v(pick(r, "dciCode")))}</td><td>${esc(v(pick(r, "ownerName")))}</td><td>${esc(v(pick(r, "dciApplyTime")))}</td><td>${esc(v(pick(r, "applyStatus", "status")))}</td></tr>`;
    }
  }
  return `<div class="section-card"><div class="section-header"><span class="section-title">关联DCI信息</span></div><table class="link-table"><thead><tr><th>DCI码</th><th>著作权人</th><th>DCI码分配时间</th><th>状态</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function buildHtml(detail, entity, codeType, showTitle) {
  if (!detail || !Object.keys(detail).length) return "";
  const label = typeLabel(entity, codeType);
  let html = "";
  if (showTitle) {
    html += `<div class="page-title"><span class="title-text">DCI码详情</span><span class="type-tag ${tagClass(codeType)}">${esc(label)}</span></div>`;
  }
  html += renderCodeSection(detail, entity, codeType);
  if (entity === "opus") {
    html += renderOpusBase(detail) + renderOpusSamples(detail);
    if (codeType === "C") {
      html +=
        renderContract(detail, false) +
        renderParty("转让（许可）方", detail.transferorList || detail.dciTransferorList) +
        renderParty("受让（被许可）方", detail.transfereeList || detail.dciTransfereeList) +
        renderAuthScope(detail, false);
    } else {
      html += renderOwners(detail) + renderRights(detail, false) + renderRegister(detail);
    }
  } else if (entity === "soft") {
    html += renderSoftBase(detail) + renderSoftFeatures(detail) + renderSoftSamples(detail);
    if (codeType === "C") {
      html +=
        renderContract(detail, true) +
        renderParty("转让（许可）方", detail.transferorList || detail.dciTransferorList) +
        renderParty("受让（被许可）方", detail.transfereeList || detail.dciTransfereeList) +
        renderAuthScope(detail, true);
    } else {
      html += renderOwners(detail) + renderRights(detail, true);
      if (codeType !== "C") html += renderRegister(detail);
    }
  } else {
    html += renderDatasetBase(detail) + renderDatasetSamples(detail);
    if (codeType === "C") {
      html +=
        renderContract(detail, false) +
        renderParty("转让（许可）方", detail.transferorList) +
        renderParty("受让（被许可）方", detail.transfereeList) +
        renderAuthScope(detail, false);
    } else {
      html += renderOwners(detail) + renderRights(detail, false) + renderRegister(detail);
    }
  }
  html += renderChain(detail) + renderLinks(detail);
  return html;
}

const Comp = defineComponent({
  name: "DciEntityDetail",
  props: {
    detail: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    entityType: { type: String, default: "opus" },
    codeType: { type: String, default: "R" },
    showTitle: { type: Boolean, default: true },
    emptyText: { type: String, default: "未查询到详情" },
  },
  setup(props) {
    const root = ref(null);
    const html = computed(() =>
      buildHtml(props.detail || {}, props.entityType, props.codeType, props.showTitle),
    );
    function paint() {
      try {
        if (root.value) root.value.innerHTML = html.value;
      } catch (e) {}
    }
    watch(html, paint, { flush: "post" });
    onMounted(paint);
    return (ctx, cache) => {
      const ElSkeleton = resolveComponent("el-skeleton");
      const ElEmpty = resolveComponent("el-empty");
      if (props.loading) {
        return openBlock(), createVNode(ElSkeleton, { rows: 10, animated: "" });
      }
      if (!props.detail || !Object.keys(props.detail).length) {
        return openBlock(), createVNode(ElEmpty, { description: props.emptyText });
      }
      return openBlock(), createElementBlock("div", { class: "ded-page", ref: root });
    };
  },
});

export default _export_sfc(Comp, [["__file", "DciEntityDetail.js"]]);
