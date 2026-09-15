import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(dir, "index.js"), "utf8");

function extractBetween(startNeedle, endNeedle) {
  const s = js.indexOf(startNeedle);
  if (s < 0) return null;
  const e = js.indexOf(endNeedle, s);
  return e < 0 ? js.slice(s, s + 5000) : js.slice(s, e);
}

const homeSlides = extractBetween("DCI DIGITAL COPYRIGHT IDENTIFIER", "DCI SYSTEMATIC INTEGRATED SOLUTION");
fs.writeFileSync(path.join(dir, "home-slides.txt"), homeSlides || "none", "utf8");

const hist = extractBetween("DCI体系1.0", "DCI管理中心是数字版权");
fs.writeFileSync(path.join(dir, "history.txt"), hist || "none", "utf8");

const labDirs = extractBetween("科研主攻方向深耕细作", "版权智能能力研发");
fs.writeFileSync(path.join(dir, "lab-dirs.txt"), extractBetween("DCI版权基础设施建设", "攻关版权登记智能辅助审核能力") || "none", "utf8");

const industry = extractBetween("行业标准", "DCI贯标应用");
fs.writeFileSync(path.join(dir, "industry.txt"), industry || "none", "utf8");

const scenes = extractBetween("终端创作场景", "DCI管理中心");
fs.writeFileSync(path.join(dir, "scenes.txt"), scenes || "none", "utf8");

console.log("done");
