import fs from "fs";

const p =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-CLvhJbpp.css";
let t = fs.readFileSync(p, "utf8");

const reps = [
  // inactive tab 22 → 20
  [
    ".auth-card-body.is-login-mode .tab-switcher-track .tab-btn[data-v-8c430319]{flex:1!important;justify-content:center!important;height:auto!important;background:none!important;box-shadow:none!important;border-radius:0!important;padding:0!important;font-size:22px!important;color:#606369!important;font-weight:400!important;line-height:30px!important}",
    ".auth-card-body.is-login-mode .tab-switcher-track .tab-btn[data-v-8c430319]{flex:1!important;justify-content:center!important;height:auto!important;background:none!important;box-shadow:none!important;border-radius:0!important;padding:0!important;font-size:20px!important;color:#606369!important;font-weight:400!important;line-height:28px!important}",
    "tab inactive",
  ],
  // active tab 24 → 20
  [
    ".auth-card-body.is-login-mode .tab-switcher-track .tab-btn.active[data-v-8c430319]{font-size:24px!important;color:#1345a5!important;font-weight:600!important;line-height:32px!important;background:none!important;box-shadow:none!important}",
    ".auth-card-body.is-login-mode .tab-switcher-track .tab-btn.active[data-v-8c430319]{font-size:20px!important;color:#1345a5!important;font-weight:600!important;line-height:28px!important;background:none!important;box-shadow:none!important}",
    "tab active",
  ],
  // card min-height
  ["min-height:520px!important", "min-height:460px!important", "min-height"],
  // left banner width
  [
    "width:330px!important;background-color:#0d3f9a!important",
    "width:300px!important;background-color:#0d3f9a!important",
    "banner width",
  ],
  // right form offset
  [
    "margin-left:330px!important",
    "margin-left:300px!important",
    "right form margin",
  ],
];

for (const [from, to, label] of reps) {
  if (!t.includes(from)) {
    console.log("MISSING", label);
    continue;
  }
  const n = t.split(from).length - 1;
  t = t.split(from).join(to);
  console.log("OK", label, "x" + n);
}

fs.writeFileSync(p, t);
console.log("saved");
