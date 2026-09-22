/**
 * Harden registry/tech menu entitlements against org API overwrites.
 * - Dashboard navbar in index-DA8BAxJb.js: always prefer mock user flags
 * - Profile se() in index-CsmZrPeY.js: keep store flags from mock user
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../mirror/static/js");

function patch(file, oldStr, newStr, label) {
  const abs = path.join(root, file);
  let t = fs.readFileSync(abs, "utf8");
  if (!t.includes(oldStr)) {
    if (t.includes(newStr.slice(0, Math.min(80, newStr.length)))) {
      console.log(label + ": already patched");
      return;
    }
    console.error(label + ": OLD NOT FOUND");
    process.exitCode = 1;
    return;
  }
  fs.writeFileSync(abs, t.replace(oldStr, newStr));
  console.log(label + ": ok");
}

const dashOld =
  'st(()=>{try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu){(l.auditStatus===null||l.auditStatus===void 0)&&(l.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus));(l.techStatus===null||l.techStatus===void 0)&&(l.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus));!l.regOrgName&&mu.orgName&&(l.regOrgName=mu.orgName)}}catch(err){}l.id&&(!l.regOrgName||l.auditStatus===null)&&SS(l.id).then(_=>{if(_&&_.data){_.data.auditStatus!==void 0&&_.data.auditStatus!==null&&(l.auditStatus=Number(_.data.auditStatus));const w=_.data.orgName||_.data.regOrgName;w&&(l.regOrgName=w)}}).catch(()=>{})});';

const dashNew =
  'st(()=>{try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu){l.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus);l.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus);!l.regOrgName&&mu.orgName&&(l.regOrgName=mu.orgName)}}catch(err){}l.id&&(!l.regOrgName||l.auditStatus===null)&&SS(l.id).then(_=>{if(_&&_.data){const w=_.data.orgName||_.data.regOrgName;w&&(l.regOrgName=w)}try{const M2=window.__DCI_MOCK__;const mu2=M2&&M2.currentUser();if(mu2){l.auditStatus=mu2.auditStatus===null||mu2.auditStatus===void 0?null:Number(mu2.auditStatus);l.techStatus=mu2.techStatus===null||mu2.techStatus===void 0?null:Number(mu2.techStatus)}}catch(e2){}}).catch(()=>{})});';

patch("index-DA8BAxJb.js", dashOld, dashNew, "dashboard-header");

const seOld =
  "function se(){const l=m.id;l?Ae(l).then(e=>{e&&e.data&&e.data.auditStatus!==void 0&&e.data.auditStatus!==null?(b.value=Number(e.data.auditStatus),m.auditStatus=b.value):b.value=null}).catch(()=>{b.value=m.auditStatus}):b.value=m.auditStatus}";

const seNew =
  'function se(){const l=m.id;l?Ae(l).then(e=>{e&&e.data&&e.data.auditStatus!==void 0&&e.data.auditStatus!==null?b.value=Number(e.data.auditStatus):b.value=null;try{const M=window.__DCI_MOCK__;const mu=M&&M.currentUser();if(mu){m.auditStatus=mu.auditStatus===null||mu.auditStatus===void 0?null:Number(mu.auditStatus);m.techStatus=mu.techStatus===null||mu.techStatus===void 0?null:Number(mu.techStatus);if(b.value===null&&m.auditStatus!==null)b.value=m.auditStatus}else if(b.value!==null)m.auditStatus=b.value}catch(err){if(b.value!==null)m.auditStatus=b.value}}).catch(()=>{b.value=m.auditStatus}):b.value=m.auditStatus}';

patch("index-CsmZrPeY.js", seOld, seNew, "profile-se");
