const fs = require("fs");
const p = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(p, "utf8");

// default type ZYFW
if (s.includes('regOrgType:"03"')) {
  s = s.replace('regOrgType:"03"', 'regOrgType:"ZYFW"');
  console.log("default type ZYFW");
}

// After successful change submit, switch demo to reviewing
const oldSuccess =
  'U.success(S.value?"机构信息变更申请已提交，请等待管理员审核！":_.id?"注册中心申请已重新提交，请等待审核！":"注册中心申请已成功提交，请等待审核！"),ee()';
const newSuccess =
  'U.success(S.value?"机构信息变更申请已提交，请等待管理员审核！":_.id?"注册中心申请已重新提交，请等待审核！":"注册中心申请已成功提交，请等待审核！");try{if(S.value&&xe.value&&window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.setModeId==="function")window.__DCI_ORGINFO_DEMO__.setModeId("reviewing")}catch(_s){}ee()';
if (!s.includes(oldSuccess)) {
  console.error("success msg missing");
  process.exit(1);
}
s = s.replace(oldSuccess, newSuccess);

// After successful change withdraw, switch demo to idle
const oldWithdraw =
  'U.success(e?"信息变更申请已成功撤回！":"申请撤回成功！已为您恢复可编辑状态。"),M.value=!1,e||(k.value=3),ee()';
const newWithdraw =
  'U.success(e?"信息变更申请已成功撤回！":"申请撤回成功！已为您恢复可编辑状态。"),M.value=!1,e||(k.value=3);try{if(e&&xe.value&&window.__DCI_ORGINFO_DEMO__&&typeof window.__DCI_ORGINFO_DEMO__.setModeId==="function")window.__DCI_ORGINFO_DEMO__.setModeId("idle")}catch(_w){}ee()';
if (!s.includes(oldWithdraw)) {
  console.error("withdraw success missing");
  process.exit(1);
}
s = s.replace(oldWithdraw, newWithdraw);

// Verify ternary is valid
if (s.includes(':x("",!0):')) {
  console.error("still broken ternary");
  process.exit(1);
}

fs.writeFileSync(p, s);
console.log("submit/withdraw demo sync ok");
