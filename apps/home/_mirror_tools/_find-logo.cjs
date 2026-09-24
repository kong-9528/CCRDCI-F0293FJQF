const fs = require("fs");
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const s = fs.readFileSync(dir + f, "utf8");
  if (s.includes("portal-logo")) console.log("js", f, "portal-logo");
  if (s.includes("logo-title")) console.log("js", f, "logo-title");
  if (s.includes("SidebarLogo")) console.log("js", f, "SidebarLogo");
}
const cssDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/css/";
for (const f of fs.readdirSync(cssDir)) {
  const s = fs.readFileSync(cssDir + f, "utf8");
  if (s.includes("portal-logo") || s.includes("nav-left")) console.log("css", f);
}
