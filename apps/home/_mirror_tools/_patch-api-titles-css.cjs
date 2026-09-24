const fs = require("fs");
const p = "apps/home/mirror/static/css/statistics-CVvKH6ah.css";
let s = fs.readFileSync(p, "utf8");

const old =
  ".header-area[data-v-1167125f]{margin-bottom:0}.header-area .title-row[data-v-1167125f]{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;margin-bottom:6px}.header-area .title-row .title[data-v-1167125f]{font-size:20px;font-weight:600;color:#1d2129;margin:0}";

const neu =
  ".header-area[data-v-1167125f]{margin-bottom:15px}.header-area .title-row[data-v-1167125f]{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;margin-bottom:6px}.header-area .title-row .header-left[data-v-1167125f]{display:flex;align-items:center;min-width:0}.header-area .title-row .header-icon-wrapper[data-v-1167125f]{width:32px;height:32px;background:#e6f1fc;border-radius:8px;color:#1449b2;margin-right:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center}.header-area .title-row .header-icon-wrapper .el-icon[data-v-1167125f]{font-size:18px}.header-area .title-row .header-title[data-v-1167125f]{font-size:16px;font-weight:600;color:#303133;white-space:nowrap;margin:0}.header-area .subtitle[data-v-1167125f]{margin-left:44px}";

if (!s.includes(old)) {
  console.error("stats css old not found");
  const i = s.indexOf(".header-area[data-v-1167125f]");
  console.error(s.slice(i, i + 350));
  process.exit(1);
}
// The subtitle rule already exists separately - careful not to duplicate margin-left into wrong place
// Actually old string ends before .org-tag rule - and subtitle has its own rule later.
// My neu embeds margin-left into a NEW .subtitle rule that might conflict with existing one.
// Better: only replace title part, and patch subtitle separately.

const old2 =
  ".header-area[data-v-1167125f]{margin-bottom:0}.header-area .title-row[data-v-1167125f]{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;margin-bottom:6px}.header-area .title-row .title[data-v-1167125f]{font-size:20px;font-weight:600;color:#1d2129;margin:0}.header-area .title-row .org-tag[data-v-1167125f]";

const neu2 =
  ".header-area[data-v-1167125f]{margin-bottom:15px}.header-area .title-row[data-v-1167125f]{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;margin-bottom:6px}.header-area .title-row .header-left[data-v-1167125f]{display:flex;align-items:center;min-width:0}.header-area .title-row .header-icon-wrapper[data-v-1167125f]{width:32px;height:32px;background:#e6f1fc;border-radius:8px;color:#1449b2;margin-right:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center}.header-area .title-row .header-icon-wrapper .el-icon[data-v-1167125f]{font-size:18px}.header-area .title-row .header-title[data-v-1167125f]{font-size:16px;font-weight:600;color:#303133;white-space:nowrap;margin:0}.header-area .title-row .org-tag[data-v-1167125f]";

if (!s.includes(old2)) {
  console.error("old2 not found");
  process.exit(1);
}
s = s.replace(old2, neu2);

const subOld =
  ".header-area .subtitle[data-v-1167125f]{font-size:13px;color:#86909c;margin:0;line-height:1.5}";
const subNew =
  ".header-area .subtitle[data-v-1167125f]{font-size:13px;color:#86909c;margin:0 0 0 44px;line-height:1.5}";
if (!s.includes(subOld)) {
  console.error("subtitle not found");
  process.exit(1);
}
s = s.replace(subOld, subNew);

fs.writeFileSync(p, s);
console.log("stats css ok");
