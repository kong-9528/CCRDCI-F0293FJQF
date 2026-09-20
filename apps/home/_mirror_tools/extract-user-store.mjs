import fs from "fs";

const profile =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-CsmZrPeY.js";
const t = fs.readFileSync(profile, "utf8");
const setup = t.indexOf("setup(");
console.log("setup at", setup);
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-setup.txt",
  t.slice(setup, setup + 4000),
);
const open = t.indexOf('"已通过"');
fs.writeFileSync(
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_profile-cards.txt",
  t.slice(open - 500, open + 2000),
);

const main =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-DA8BAxJb.js";
const m = fs.readFileSync(main, "utf8");

// Find pinia user store definition
for (const needle of [
  "auditStatus:null",
  "auditStatus:",
  'id:"user"',
  "getInfo()",
  "getInfo:async",
  "login:async",
  "smsLogin",
  "regOrgName",
  "nickName",
]) {
  const i = m.indexOf(needle);
  console.log(needle, i);
  if (i >= 0) {
    fs.writeFileSync(
      `c:/WORKING_PLACE/CODE_R/sampleA/apps/home/_mirror_tools/_main-${needle.replace(/[^a-zA-Z]/g, "").slice(0, 20)}.txt`,
      m.slice(Math.max(0, i - 100), i + 800),
    );
  }
}

// Find axios interceptor or login API
const loginApi = m.indexOf('url:"/login"');
console.log("login api", loginApi, m.slice(loginApi - 50, loginApi + 200));
const getInfoApi = m.indexOf('url:"/getInfo"');
console.log("getInfo api", getInfoApi, m.slice(getInfoApi - 50, getInfoApi + 200));
