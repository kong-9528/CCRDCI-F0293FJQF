/**
 * Update interfaces page O fallback + subscribe demo reload.
 */
const fs = require("fs");
const p = "apps/home/mirror/static/js/index-DTpd2dgU.js";
let s = fs.readFileSync(p, "utf8");

const pairs = [
  [
    'name:"实名信息同步接口",method:"POST",addr:"/api/v1/dciManage/realName/verify",desc:"用于同步著作权人的实名认证信息数据，包含著作权人名称、证件类型、证件号码、手机号、区域及证件正面路径等。"',
    'name:"实名信息接口",method:"POST",addr:"/api/v1/dciManage/realName/verify",desc:"该接口用于同步著作权人的实名信息数据。"',
  ],
  [
    'name:"实名同步修改接口",method:"PUT",addr:"/api/v1/dciManage/realName/modify",desc:"用于修改著作权人的实名认证信息，包含认证ID、著作权人名称、证件有效期限、手机号及证件图片等。"',
    'name:"实名信息修改接口",method:"PUT",addr:"/api/v1/dciManage/realName/modify",desc:"该接口用于修改著作权人的实名认证信息，包含著作权人ID、著作权人名称、证件有效起始期、证件有效终止期、联系人、手机号、证件名称、证件格式、证件正面照文件路径、证件反面照文件路径。"',
  ],
  [
    'name:"DCI申领数据同步接口",method:"POST",addr:"/api/v1/dciManage/apply/applyInfo",desc:"向DCI管理中心提交DCI申领业务数据信息（包括DCI码信息、作品基本信息、样本信息、著作权人信息、权利状况及数字版权链信息）。"',
    'name:"DCI申领数据同步接口",method:"POST",addr:"/api/v1/dciManage/apply/applyInfo",desc:"该接口用于向DCI管理中心提交DCI申领业务数据信息，包括：DCI码基本信息、作品基本信息、作品样本信息、著作权人信息、关联登记信息、数字版权链信息。"',
  ],
  [
    'name:"DCI撤销数据同步接口",method:"POST",addr:"/api/v1/dciManage/apply/revokeInfo",desc:"向DCI管理中心同步DCI撤销的信息（包括流水号、DCI码、撤销申请主体、撤销原因及撤销时间）。"',
    'name:"DCI撤销数据同步接口",method:"POST",addr:"/api/v1/dciManage/apply/revokeInfo2",desc:"该接口用于向DCI管理中心同步DCI撤销的信息。"',
  ],
];

for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.error("MISSING:", a.slice(0, 100));
    process.exit(1);
  }
  s = s.replace(a, b);
  console.log("ok", b.slice(14, 40));
}

// Align O ids with business interface ids
const idPairs = [
  ['O=[{id:1,name:"实名信息接口"', 'O=[{id:"2080587923100037121",name:"实名信息接口"'],
  [',{id:2,name:"实名信息修改接口"', ',{id:"2080588010370920449",name:"实名信息修改接口"'],
  [',{id:3,name:"DCI申领数据同步接口"', ',{id:"2070330053367017473",name:"DCI申领数据同步接口"'],
  [',{id:4,name:"DCI撤销数据同步接口"', ',{id:"2055556104074723330",name:"DCI撤销数据同步接口"'],
];
for (const [a, b] of idPairs) {
  if (!s.includes(a)) {
    console.error("id missing", a);
    process.exit(1);
  }
  s = s.replace(a, b);
}

const oldMount = "return G(()=>{V()}),";
const newMount =
  'return G(()=>{V();try{if(window.__DCI_RCX_DEMO__&&typeof window.__DCI_RCX_DEMO__.subscribe==="function"){window.__DCI_RCX_DEMO__.subscribe(function(){V()})}}catch(_e){}}),';
if (!s.includes(oldMount)) {
  console.error("mount missing");
  process.exit(1);
}
s = s.replace(oldMount, newMount);

fs.writeFileSync(p, s);
console.log("page patched");
