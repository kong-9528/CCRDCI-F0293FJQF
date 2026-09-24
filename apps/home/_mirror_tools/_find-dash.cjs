const fs = require("fs");
const dir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const s = fs.readFileSync(dir + f, "utf8");
  if (
    s.includes("navbar") ||
    s.includes("Navbar") ||
    s.includes("侧边") ||
    s.includes("hamburger") ||
    s.includes("tags-view") ||
    s.includes("sidebar-container")
  ) {
    if (s.includes("logo") && (s.includes("DCI") || s.includes("sidebar"))) {
      console.log(f);
    }
  }
}
// also search for logo text in layout
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const s = fs.readFileSync(dir + f, "utf8");
  if (s.includes("sidebar-logo") || s.includes("Logo") && s.includes("title")) {
    console.log("hit", f);
  }
}
