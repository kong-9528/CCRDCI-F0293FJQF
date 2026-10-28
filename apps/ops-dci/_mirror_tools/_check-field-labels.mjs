import fs from "node:fs";

const files = {
  softRq: "softRqDetails-BDJ8U7Pp.js",
  softCq: "softCqDetails-BMu5mxU4.js",
  softXq: "softXqDetails-eE5fF6ZG.js",
  datasetRq: "datasetRqDetails-Dn-1pgff.js",
  datasetCq: "datasetCqDetails-CYMzTush.js",
  datasetXq: "datasetXqDetails-CJi-3Zer.js",
  opusRq: "opusRqDetails-BLreSPNk.js",
  opusCq: "opusCqDetails-DXwflxip.js",
  opusXq: "opusXqDetails-XGcK_qWf.js",
  softR: "softRdetails-C7nosZyJ.js",
  OpusInfo: "OpusInfoTemplate-C6SUGu0T.js",
};

const needles = [
  "软件全称",
  "软件简称",
  "数据集名称",
  "数据规模",
  "作品名称",
  "开发目的",
  "程序源代码",
  "授权合同",
  "原始DCI码",
  "DCI码：",
  "info-item",
];

for (const [k, f] of Object.entries(files)) {
  const s = fs.readFileSync(`apps/ops-dci/mirror/static/js/${f}`, "utf8");
  const hits = needles.filter((n) => s.includes(n));
  console.log(k, hits.join(", ") || "(none)");
}
