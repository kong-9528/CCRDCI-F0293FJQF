import fs from "fs";

const cssPath =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/index-CLvhJbpp.css";
const jsPath =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/index-BiQimQRe.js";
const ovPath = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/overrides.css";

let css = fs.readFileSync(cssPath, "utf8");
let js = fs.readFileSync(jsPath, "utf8");
let ov = fs.readFileSync(ovPath, "utf8");

console.log("js 780", js.includes("780px"), "700", js.includes('"700px"'), js.includes("700px"));
const widths = js.match(/width:"?\d+px"?/g);
console.log("js width matches", widths);

// Current layout: left absolute 300, right margin-left 300, dialog ~700 via overrides
// Goal: left +50 → 350, right stays 400, dialog → 750
// Must patch CLvhJbpp because it loads AFTER overrides and resets left to 300

const leftOld = "auth-left-banner[data-v-8c430319]{position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:300px!important";
const leftNew = "auth-left-banner[data-v-8c430319]{position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:350px!important";

if (!css.includes("width:300px!important") || !css.includes("auth-left-banner")) {
  console.log("left snippet:", css.slice(css.indexOf("auth-left-banner"), css.indexOf("auth-left-banner") + 200));
}

if (css.includes(leftOld)) {
  css = css.split(leftOld).join(leftNew);
  console.log("OK css left 300→350");
} else {
  // fallback replace first width:300px after auth-left-banner
  const i = css.indexOf("auth-left-banner[data-v-8c430319]");
  const slice = css.slice(i, i + 220);
  if (slice.includes("width:300px")) {
    css =
      css.slice(0, i) +
      slice.replace("width:300px", "width:350px") +
      css.slice(i + 220);
    console.log("OK css left via slice");
  } else {
    console.error("FAIL left", slice);
    process.exit(1);
  }
}

// right margin-left must match left width so right pane doesn't shrink/grow wrongly
// auth-right-form margin-left:300px → 350px
const mlCount = css.split("margin-left:300px!important").length - 1;
console.log("margin-left:300 count", mlCount);
css = css.replaceAll(
  ".auth-right-form[data-v-8c430319]{margin-left:300px!important",
  ".auth-right-form[data-v-8c430319]{margin-left:350px!important",
);
// also generic if any
if (css.includes("auth-right-form[data-v-8c430319]{margin-left:300px")) {
  css = css.replaceAll(
    "auth-right-form[data-v-8c430319]{margin-left:300px",
    "auth-right-form[data-v-8c430319]{margin-left:350px",
  );
}
console.log("after ml350", css.includes("margin-left:350px!important"));

fs.writeFileSync(cssPath, css);

// Dialog total width: keep right = 400 → dialog = 350 + 400 = 750
// Patch overrides
ov = ov.replace(
  /\/\* —— 1\. Login modal[\s\S]*?\.auth-card-body\.is-login-mode \.auth-right-form\[data-v-8c430319\] \{[\s\S]*?\n\}/,
  `/* —— 1. Login modal: widen LEFT banner only; right width & height unchanged —— */
.el-dialog.auth-dialog-pixel-perfect {
  width: 750px !important;
  max-width: calc(100vw - 32px) !important;
}

.auth-card-body[data-v-8c430319],
.auth-card-body.is-login-mode[data-v-8c430319] {
  min-height: 460px !important;
}

.auth-left-banner[data-v-8c430319] {
  width: 350px !important;
  padding: 32px 28px !important;
}

.auth-right-form[data-v-8c430319] {
  margin-left: 350px !important;
  width: 400px !important;
  max-width: 400px !important;
  box-sizing: border-box !important;
  min-height: 460px !important;
}

.auth-card-body.is-login-mode .auth-right-form[data-v-8c430319] {
  padding: 52px 32px 24px !important;
  width: 400px !important;
  max-width: 400px !important;
}`,
);

// If regex failed, do simple replacements
if (!ov.includes("width: 750px")) {
  ov = ov.replace("width: 700px !important;", "width: 750px !important;");
  ov = ov.replaceAll(
    ".auth-left-banner[data-v-8c430319] {\n  width: 300px !important;",
    ".auth-left-banner[data-v-8c430319] {\n  width: 350px !important;",
  );
  ov = ov.replaceAll(
    "margin-left: 300px !important;",
    "margin-left: 350px !important;",
  );
}

// Ensure right form fixed width in overrides even if block replace worked
if (!ov.includes("width: 400px !important")) {
  ov = ov.replace(
    ".auth-right-form[data-v-8c430319] {\n  margin-left: 350px !important;\n  min-height: 460px !important;\n}",
    `.auth-right-form[data-v-8c430319] {
  margin-left: 350px !important;
  width: 400px !important;
  max-width: 400px !important;
  box-sizing: border-box !important;
  min-height: 460px !important;
}`,
  );
}

fs.writeFileSync(ovPath, ov);

// Also set dialog width in JS if present (wins as inline style)
if (js.includes('width:"700px"')) {
  js = js.replaceAll('width:"700px"', 'width:"750px"');
  fs.writeFileSync(jsPath, js);
  console.log("OK js 700→750");
} else if (js.includes('width:"780px"')) {
  js = js.replaceAll('width:"780px"', 'width:"750px"');
  fs.writeFileSync(jsPath, js);
  console.log("OK js 780→750");
} else {
  console.log("js dialog width not found as string; check", widths);
}

console.log("DONE");
console.log("css left350", css.includes("auth-left-banner[data-v-8c430319]") && css.slice(css.indexOf("auth-left-banner[data-v-8c430319]"), css.indexOf("auth-left-banner[data-v-8c430319]") + 180).includes("350px"));
console.log("ov 750", ov.includes("750px"), "left350", ov.includes("width: 350px"), "right400", ov.includes("width: 400px"));
