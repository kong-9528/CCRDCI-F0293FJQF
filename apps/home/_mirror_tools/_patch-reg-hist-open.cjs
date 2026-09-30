const fs = require("fs");
const file = "apps/home/mirror/static/js/info-0k0-BfNc.js";
let s = fs.readFileSync(file, "utf8");

const old =
  '}else M.value=!0})},{default:t(()=>[...e[19]||(e[19]=[s("历史申请记录",-1)])]),_:1})';
const neu =
  '}else{try{var _hid=a.value.id;if(!_hid){var _Mu=window.__DCI_MOCK__,_cu=_Mu&&_Mu.currentUser&&_Mu.currentUser();_hid=(_cu&&_cu.userId)||"mock-history"}Le(_hid)}catch(_he){}M.value=!0}})},{default:t(()=>[...e[19]||(e[19]=[s("历史申请记录",-1)])]),_:1})';

if (s.includes("Le(_hid)")) {
  console.log("SKIP already patched history open");
} else if (!s.includes(old)) {
  console.error("NOT FOUND");
  const i = s.indexOf("历史申请记录");
  console.log(s.slice(i - 180, i + 80));
  process.exit(1);
} else {
  s = s.replace(old, neu);
  fs.writeFileSync(file, s);
  console.log("OK RegOrgInfo history open fetch");
}

// Also when history opens from org-info path catch that sets M.value=!0
const old2 =
  "catch(_h){M.value=!0}}else M.value=!0})},{default:t(()=>[...e[19]||(e[19]=[s(\"历史申请记录\",-1)])]),_:1})";
// already replaced the else branch; the catch path still only sets M
const oldCatch = "catch(_h){M.value=!0}";
const neuCatch =
  'catch(_h){try{var _hid2=a.value.id;if(!_hid2){var _Mu2=window.__DCI_MOCK__,_cu2=_Mu2&&_Mu2.currentUser&&_Mu2.currentUser();_hid2=(_cu2&&_cu2.userId)||"mock-history"}Le(_hid2)}catch(_he2){}M.value=!0}';
if (s.includes(oldCatch) && !s.includes("_hid2")) {
  // only first occurrence near history is enough; replaceAll might be too broad
  const count = s.split(oldCatch).length - 1;
  console.log("catch M.value count", count);
  if (count === 1) {
    s = s.replace(oldCatch, neuCatch);
    fs.writeFileSync(file, s);
    console.log("OK catch history fetch");
  }
}
