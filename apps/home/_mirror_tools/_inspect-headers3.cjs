const fs = require("fs");
const id = fs.readFileSync("apps/home/mirror/static/js/identity-sRS0ISv8.js", "utf8");
const i = id.indexOf("header-icon");
console.log(JSON.stringify(id.slice(Math.max(0, i - 80), i + 350)));
const j = id.indexOf("from\"@element-plus");
console.log("imports", id.slice(0, 400));

// What is default button height for el-button default size?
// Element Plus default button height is typically 32px
// history-btn is height:34px
// apporg 新增 is default size (no size prop) = 32px typically

const ov = fs.readFileSync("apps/home/mirror/overrides.css", "utf8");
console.log("\napporg header-right", ov.slice(ov.indexOf(".info-management-container .apporg-page .card-header .header-right"), ov.indexOf(".info-management-container .apporg-page .card-header .header-right") + 200));

// Check if apporg button has custom height in overrides
const m = ov.match(/apporg[\s\S]{0,80}el-button[\s\S]{0,120}/g);
console.log(m && m.slice(0, 5));
