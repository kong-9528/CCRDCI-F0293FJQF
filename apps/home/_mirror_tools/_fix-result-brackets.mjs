import fs from "node:fs";
import { execSync } from "node:child_process";

const pagePath = "apps/home/mirror/static/js/index-BZ7-YeMc.js";
let page = fs.readFileSync(pagePath, "utf8");

const start = page.indexOf('o(r).length?(d(),g(me,null,[t("div",{class:"result-count-tip"}');
const endMarker = ':(d(),g("div",Je,"未找到匹配的记录，请调整查询条件后重试"))';
const end = page.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("block not found " + start + " " + end);

const before = page.slice(0, start);
const after = page.slice(end); // starts with :(d(),g...

// card: (d(), g(div, [head, t(Oe,[dci,t(Pe,[t(table,[cg,tbody])])]) ]))
const card = `(d(),g("div",{key:l.id||l.dciCode||l.titleNo||idx,class:"result-card"},[__renderResultHead(l),t("div",Oe,[__renderRelatedDci(l,idx),t("div",Pe,[t("table",Re,[e[16]||(e[16]=t("colgroup",null,[t("col",{class:"col-label"}),t("col",{class:"col-value"}),t("col",{class:"col-label"}),t("col",{class:"col-value"})],-1)),t("tbody",null,__buildFieldRows(l))])])])]))`;

// ternary true: (d(), g(me, [tip, t(Be, [(d(!0), g(me, ye(...), 128))]) ]))
const fixed =
  `o(r).length?(d(),g(me,null,[t("div",{class:"result-count-tip"},"为您找到 "+k(o(r).length)+" 条符合条件的结果",1),t("div",Be,[(d(!0),g(me,null,ye(o(r),(l,idx)=>${card}),128))])]))` +
  after;

page = before + fixed;
fs.writeFileSync(pagePath, page, "utf8");

try {
  execSync("node --check apps/home/mirror/static/js/index-BZ7-YeMc.js", { stdio: "pipe" });
  console.log("syntax ok");
} catch (e) {
  console.error(String(e.stderr || e.message));
  // show the fixed block
  const p2 = fs.readFileSync(pagePath, "utf8");
  const i = p2.indexOf("result-count-tip");
  console.log(p2.slice(i - 40, i + 780));
  process.exit(1);
}
