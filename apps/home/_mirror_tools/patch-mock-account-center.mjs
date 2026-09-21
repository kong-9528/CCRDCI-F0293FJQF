/**
 * Mock auth + account-center service states for home mirror.
 * Users (password Abcd1234):
 *  yachang — registry none, tech none
 *  mayi    — registry approved, tech none
 *  mayi1   — registry none, tech approved
 *  mayi2   — both approved
 */
import fs from "fs";
import { execSync } from "child_process";

const ROOT = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror";
const MAIN = `${ROOT}/static/js/index-DA8BAxJb.js`;
const HEADER = `${ROOT}/static/js/index-_fJendd7.js`;
const PROFILE = `${ROOT}/static/js/index-CsmZrPeY.js`;
const USER_API = `${ROOT}/static/js/user-BAzQI6ks.js`;
const HTML = `${ROOT}/index.html`;
const MOCK_JS = `${ROOT}/static/js/dci-mock-auth.js`;

const MOCK_SRC = `/** DCI home mirror — demo auth users (offline) */
(function () {
  var PASS = "Abcd1234";
  var SMS = "123456";
  var USERS = {
    yachang: {
      userId: "mock-yachang",
      username: "yachang",
      nickName: "yachang",
      phonenumber: "13900001111",
      auditStatus: null,
      techStatus: null,
      orgName: "",
    },
    mayi: {
      userId: "mock-mayi",
      username: "mayi",
      nickName: "mayi",
      phonenumber: "13800008000",
      auditStatus: 1,
      techStatus: null,
      orgName: "太极计算机股份有限公司",
    },
    mayi1: {
      userId: "mock-mayi1",
      username: "mayi1",
      nickName: "mayi1",
      phonenumber: "13800008001",
      auditStatus: null,
      techStatus: 1,
      orgName: "太极计算机股份有限公司",
    },
    mayi2: {
      userId: "mock-mayi2",
      username: "mayi2",
      nickName: "mayi2",
      phonenumber: "13800008002",
      auditStatus: 1,
      techStatus: 1,
      orgName: "太极计算机股份有限公司",
    },
  };
  var PHONE_MAP = {};
  Object.keys(USERS).forEach(function (k) {
    PHONE_MAP[USERS[k].phonenumber] = k;
  });

  function keyFromToken(token) {
    if (!token || String(token).indexOf("mock-") !== 0) return null;
    return String(token).slice(5);
  }
  function getUser(key) {
    return key && USERS[key] ? USERS[key] : null;
  }
  function resolveLogin(username, password) {
    var k = String(username || "").trim().toLowerCase();
    if (!USERS[k]) return null;
    if (password !== PASS) return null;
    return k;
  }
  function resolveSms(phone, code) {
    var k = PHONE_MAP[String(phone || "").trim()];
    if (!k) return null;
    if (String(code) !== SMS) return null;
    return k;
  }
  function openedLabel(u) {
    var r = u.auditStatus === 1;
    var t = u.techStatus === 1;
    if (r && t) return "DCI注册中心、DCI®技术服务中心";
    if (r) return "DCI注册中心";
    if (t) return "DCI®技术服务中心";
    return "暂无";
  }
  function profilePayload(u) {
    return {
      code: 200,
      data: {
        user: {
          userId: u.userId,
          username: u.username,
          userName: u.username,
          nickName: u.nickName,
          phonenumber: u.phonenumber,
          avatar: "",
          userType: "01",
          regOrgName: u.orgName || "",
          orgName: u.orgName || "",
        },
        roleGroup: "普通角色",
        postGroup: "",
        roles: ["ROLE_DEFAULT"],
        permissions: ["*:*:*"],
        pwdChrtype: "",
      },
    };
  }
  function orgPayload(u) {
    if (u.auditStatus === null || u.auditStatus === undefined) {
      return { code: 200, data: null };
    }
    var code = "ORG-" + String(u.username || "demo").toUpperCase();
    return {
      code: 200,
      data: {
        id: u.userId,
        auditStatus: u.auditStatus,
        orgName: u.orgName,
        regOrgName: u.orgName,
        orgCode: code,
        dciRegOrgCode: code,
        accessKey: "AK" + String(u.username || "demo").toUpperCase() + "MOCK000000000001",
        accessSecret: "SK" + String(u.username || "demo").toUpperCase() + "MOCKSECRET00000001",
        dataEncrypKey: "DEK" + String(u.username || "demo").toUpperCase() + "MOCK000000001",
      },
    };
  }

  function tokenFor(k) {
    return "mock-" + k;
  }
  function setSession(k) {
    try {
      sessionStorage.setItem("dci-mock-key", k || "");
    } catch (e) {}
  }
  function clearSession() {
    try {
      sessionStorage.removeItem("dci-mock-key");
    } catch (e) {}
  }
  function currentKey() {
    try {
      var k = sessionStorage.getItem("dci-mock-key");
      if (k && USERS[k]) return k;
    } catch (e) {}
    return null;
  }
  function currentUser() {
    return getUser(currentKey());
  }

  window.__DCI_MOCK__ = {
    PASS: PASS,
    SMS: SMS,
    USERS: USERS,
    keyFromToken: keyFromToken,
    getUser: getUser,
    resolveLogin: resolveLogin,
    resolveSms: resolveSms,
    openedLabel: openedLabel,
    profilePayload: profilePayload,
    orgPayload: orgPayload,
    tokenFor: tokenFor,
    setSession: setSession,
    clearSession: clearSession,
    currentKey: currentKey,
    currentUser: currentUser,
  };
})();
`;

fs.writeFileSync(MOCK_JS, MOCK_SRC, "utf8");
console.log("OK wrote dci-mock-auth.js");

// ——— index.html: load mock before app ———
let html = fs.readFileSync(HTML, "utf8");
if (!html.includes("dci-mock-auth.js")) {
  html = html.replace(
    '<script type="module" crossorigin src="./static/js/index-DA8BAxJb.js"></script>',
    '<script src="./static/js/dci-mock-auth.js"></script>\n  <script type="module" crossorigin src="./static/js/index-DA8BAxJb.js"></script>',
  );
  fs.writeFileSync(HTML, html, "utf8");
  console.log("OK index.html inject");
} else console.log("OK index.html already");

function mustReplace(file, from, to, label) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(from)) throw new Error("MISSING " + label + "\\n" + from.slice(0, 160));
  const n = s.split(from).length - 1;
  s = s.split(from).join(to);
  fs.writeFileSync(file, s, "utf8");
  console.log("OK", label, "x" + n);
}

// ——— Pinia user store: add techStatus + mock login/getInfo/logOut ———
mustReplace(
  MAIN,
  "auditStatus:null,regOrgName:\"\",roles:[],permissions:[]",
  'auditStatus:null,techStatus:null,regOrgName:"",roles:[],permissions:[]',
  "state techStatus",
);

mustReplace(
  MAIN,
  "this.token=\"\",this.roles=[],this.permissions=[],this.auditStatus=null,!1)",
  'this.token="",this.roles=[],this.permissions=[],this.auditStatus=null,this.techStatus=null,!1)',
  "checkToken clear tech",
);

mustReplace(
  MAIN,
  "login(e){const t=e.username.trim(),n=e.password,o=e.userType,a=e.code,l=e.uuid;return new Promise((r,s)=>{zve(t,n,o,a,l).then(i=>{Qg(i.data.token),this.token=i.data.token,I2().unlockScreen(),r()}).catch(i=>{s(i)})})}",
  'login(e){const t=e.username.trim(),n=e.password,o=e.userType,a=e.code,l=e.uuid;return new Promise((r,s)=>{try{const M=window.__DCI_MOCK__;const k=M&&M.resolveLogin(t,n);if(k){const tok=M.tokenFor(k);M.setSession(k),Qg(tok),this.token=tok,I2().unlockScreen(),r();return}}catch(err){}zve(t,n,o,a,l).then(i=>{try{window.__DCI_MOCK__&&window.__DCI_MOCK__.clearSession()}catch(e2){}Qg(i.data.token),this.token=i.data.token,I2().unlockScreen(),r()}).catch(i=>{s(i)})})}',
  "login mock",
);

mustReplace(
  MAIN,
  "smsLogin(e,t){return new Promise((n,o)=>{Hve(e,t).then(a=>{Qg(a.data.token),this.token=a.data.token,I2().unlockScreen(),n()}).catch(a=>{o(a)})})}",
  'smsLogin(e,t){return new Promise((n,o)=>{try{const M=window.__DCI_MOCK__;const k=M&&M.resolveSms(e,t);if(k){const tok=M.tokenFor(k);M.setSession(k),Qg(tok),this.token=tok,I2().unlockScreen(),n();return}}catch(err){}Hve(e,t).then(a=>{try{window.__DCI_MOCK__&&window.__DCI_MOCK__.clearSession()}catch(e2){}Qg(a.data.token),this.token=a.data.token,I2().unlockScreen(),n()}).catch(a=>{o(a)})})}',
  "smsLogin mock",
);

// Replace getInfo body start — inject mock branch at beginning of Promise
mustReplace(
  MAIN,
  "getInfo(){return new Promise((e,t)=>{Bve().then(n=>{const o=n.data.user;",
  'getInfo(){return new Promise((e,t)=>{try{const M=window.__DCI_MOCK__;const mu=M&&(M.currentUser()||M.getUser(M.keyFromToken(this.token||hl())));if(mu){const n=M.profilePayload(mu);const o=n.data.user;this.roles=n.data.roles;this.permissions=n.data.permissions;this.id=o.userId;this.name=o.username;this.nickName=o.nickName;this.userType=o.userType||"";this.avatar="";this.regOrgName=mu.orgName||"";this.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus);this.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus);e(n);return}}catch(err){}Bve().then(n=>{const o=n.data.user;',
  "getInfo mock",
);

mustReplace(
  MAIN,
  "logOut(){return new Promise((e,t)=>{Dve().then(()=>{this.token=\"\",this.roles=[],this.permissions=[],this.auditStatus=null,this.regOrgName=\"\",Pve(),e()}).catch(n=>{t(n)})})}",
  'logOut(){return new Promise((e,t)=>{const finish=()=>{try{window.__DCI_MOCK__&&window.__DCI_MOCK__.clearSession()}catch(e2){}this.token="",this.roles=[],this.permissions=[],this.auditStatus=null,this.techStatus=null,this.regOrgName="",Pve(),e()};try{const M=window.__DCI_MOCK__;if(M&&(M.currentUser()||M.keyFromToken(this.token||hl()))){finish();return}}catch(err){}Dve().then(()=>finish()).catch(n=>{t(n)})})}',
  "logOut mock",
);

// SS org by userId — mock
mustReplace(
  MAIN,
  "function SS(e){return fn({url:`/dci/regorg/infoByUserId/${e}`,method:\"get\"})}",
  'function SS(e){try{const M=window.__DCI_MOCK__;const mu=M&&(M.currentUser()||(e&&String(e).indexOf("mock-")===0&&M.getUser(String(e).slice(5))));if(mu)return Promise.resolve(M.orgPayload(mu))}catch(err){}return fn({url:`/dci/regorg/infoByUserId/${e}`,method:"get"})}',
  "SS org mock",
);

// ——— user profile API get ———
mustReplace(
  USER_API,
  'function n(){return t({url:"/system/user/profile",method:"get"})}',
  'function n(){try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu)return Promise.resolve(M.profilePayload(mu))}catch(e){}return t({url:"/system/user/profile",method:"get"})}',
  "profile get mock",
);

// ——— Header: techStatus menu ———
mustReplace(
  HEADER,
  "q=A(()=>a.auditStatus===1),I=A(()=>a.regOrgName||\"\"),V=A(()=>!v.path.startsWith(\"/user\")&&v.path.startsWith(\"/dashboard\"))",
  'q=A(()=>a.auditStatus===1),tt=A(()=>a.techStatus===1),I=A(()=>a.regOrgName||""),V=A(()=>!v.path.startsWith("/user")&&v.path.startsWith("/dashboard"))',
  "header tech computed",
);

mustReplace(
  HEADER,
  'case"applyTech":window.open("https://www.ccopyright.com.cn/","_blank");break;case"logout":_();break}',
  'case"applyTech":s.push("/user/profile?tab=open");break;case"techWorkbench":window.__DCI_MOCK__&&window.__DCI_MOCK__.openTechWorkbench?window.__DCI_MOCK__.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank");break;case"logout":_();break}',
  "header tech command → customer",
);

// Menu: after workbench item, show tech workbench OR applyTech
// Current: q.value?D("",!0):(applyTech)
// New: tt.value ? techWorkbench : (!q.value ? applyTech : empty)
mustReplace(
  HEADER,
  'q.value?D("",!0):(g(),j(k,{key:0,command:"applyTech",class:"portal-menu-item"},{default:d(()=>[...t[14]||(t[14]=[e("span",null,"申请接入技术服务中心",-1)])]),_:1}))',
  'tt.value?(g(),j(k,{key:0,command:"techWorkbench",class:"portal-menu-item"},{default:d(()=>[...t[20]||(t[20]=[e("span",null,"技术服务中心工作台",-1)])]),_:1})):q.value?D("",!0):(g(),j(k,{key:1,command:"applyTech",class:"portal-menu-item"},{default:d(()=>[...t[14]||(t[14]=[e("span",null,"申请接入技术服务中心",-1)])]),_:1}))',
  "header menu tech/apply",
);

// ——— Profile: opened services label + tech card ———
mustReplace(
  PROFILE,
  "j=F(()=>b.value===1||m.auditStatus===1),ae=F(()=>b.value===0||m.auditStatus===0),le=F(()=>b.value===2||m.auditStatus===2),te=F(()=>b.value===3||m.auditStatus===3)",
  'j=F(()=>b.value===1||m.auditStatus===1),ae=F(()=>b.value===0||m.auditStatus===0),le=F(()=>b.value===2||m.auditStatus===2),te=F(()=>b.value===3||m.auditStatus===3),jt=F(()=>m.techStatus===1),ot=F(()=>{const r=j.value,t2=jt.value;return r&&t2?"DCI注册中心、DCI®技术服务中心":r?"DCI注册中心":t2?"DCI®技术服务中心":"暂无"})',
  "profile opened + tech flags",
);

mustReplace(
  PROFILE,
  'a("div",ma,k(j.value?"DCI注册中心":"暂无"),1)',
  'a("div",ma,k(ot.value),1)',
  "profile opened label",
);

// Replace static tech card with dynamic (approved / coming soon)
const techStatic = `e[42]||(e[42]=qe('<div class="service-card" data-v-96ef2aa1><div class="card-top flex-row justify-between align-center" data-v-96ef2aa1><div class="card-title-group flex-row align-center" data-v-96ef2aa1><span class="card-title" data-v-96ef2aa1>DCI®技术服务中心</span></div></div><div class="card-desc" data-v-96ef2aa1> 基于DCI国家标准和全球版权数据中心的可信版权数据，面向机构提供版权核验标准化服务。 </div><div class="card-bottom" data-v-96ef2aa1><div class="action-link disabled flex-row align-center" data-v-96ef2aa1><span data-v-96ef2aa1>敬请期待</span></div></div><div class="card-glow-blur" data-v-96ef2aa1></div></div>',1))`;

const techDynamic = `a("div",{class:"service-card"},[a("div",{class:"card-top flex-row justify-between align-center"},[a("div",{class:"card-title-group flex-row align-center"},[e[50]||(e[50]=a("span",{class:"card-title"},"DCI®技术服务中心",-1)),jt.value?(u(),G(p,{key:0,class:"verified-icon"},{default:o(()=>[t(w(je))]),_:1})):N("",!0)]),jt.value?(u(),c("div",{key:0,class:"status-badge-wrap"},[a("span",{class:"status-tag approved"},"已通过")])):N("",!0)]),e[51]||(e[51]=a("div",{class:"card-desc"}," 基于DCI国家标准和全球版权数据中心的可信版权数据，面向机构提供版权核验标准化服务。 ",-1)),a("div",{class:"card-bottom"},[jt.value?(u(),c("div",{key:0,class:"action-link cursor-pointer flex-row align-center",onClick:e[52]||(e[52]=s=>{var M=window.__DCI_MOCK__;M&&M.openTechWorkbench?M.openTechWorkbench():window.open((window.__DCI_CUSTOMER_URL__||"http://localhost:3002").replace(/\\/$/,"")+"/desk","_blank")})},[e[53]||(e[53]=a("span",null,"进入工作台",-1)),e[54]||(e[54]=a("span",{class:"arrow"},"→",-1))])):(u(),c("div",{key:1,class:"action-link disabled flex-row align-center"},[e[55]||(e[55]=a("span",null,"敬请期待",-1))]))]),e[56]||(e[56]=a("div",{class:"card-glow-blur"},null,-1))])`;

mustReplace(PROFILE, techStatic, techDynamic, "tech card dynamic");

// CSS: status-passed reuse if needed — check existing
const cssPath = `${ROOT}/static/css/index-CgFL8VU8.css`;
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(".status-passed")) {
  // find status badge class used for 已通过
  const passCls = css.includes("status-tag") ? "ok" : "add";
  css += `\n.service-card .status-passed[data-v-96ef2aa1],.card-status .status-passed[data-v-96ef2aa1]{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;line-height:20px;color:#5b8def;background:#e8f0fe}\n`;
  fs.writeFileSync(cssPath, css, "utf8");
  console.log("OK css status-passed", passCls);
}

// syntax check patched modules (user-api + header + profile are small enough)
for (const f of [HEADER, PROFILE, USER_API, MOCK_JS]) {
  execSync(`node --check "${f}"`, { stdio: "pipe" });
  console.log("SYNTAX OK", f.split("/").pop());
}

console.log("DONE mock auth patches");

// Keep customer workbench URL wiring in sync (idempotent)
try {
  execSync(
    'node "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/wire-customer-workbench.mjs"',
    { stdio: "inherit" },
  );
} catch (e) {
  console.warn("wire-customer-workbench skipped", e && e.message);
}
