import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mirror = path.join(root, "mirror");
const pngDir = path.join(mirror, "static", "png");
const assetsDir =
  "C:/Users/leste/.cursor/projects/c-WORKING-PLACE-CODE-R-sampleA/assets";

function findAsset(pred) {
  const hit = fs.readdirSync(assetsDir).find(pred);
  if (!hit) throw new Error("asset not found: " + pred);
  return path.join(assetsDir, hit);
}

const sources = {
  banner1: findAsset((n) => n.includes("banner1_index-14c87039")),
  bgEco: findAsset((n) => n.includes("bg_ecosystem-c98dfe14")),
  bgLab: findAsset((n) => n.includes("bg_lab-2536bd6e")),
  country: findAsset((n) => n.includes("country_standard-e3b73483")),
  industry: findAsset((n) => n.includes("_____-43cf21d6")),
  appScenes: findAsset((n) => n.includes("DCI____-bc7b965e")),
};

const dest = {
  banner1: "banner1_index.png",
  bgEco: "bg_ecosystem.png",
  bgLab: "bg_lab.png",
  country: "country_standard.png",
  industry: "industry_standard.png",
  appScenes: "dci_app_scenes.png",
};

for (const [key, src] of Object.entries(sources)) {
  const out = path.join(pngDir, dest[key]);
  fs.copyFileSync(src, out);
  console.log("copied", path.basename(src), "→", dest[key], fs.statSync(out).size);
}

// —— homepage JS ——
const homeJsPath = path.join(mirror, "static/js/index-LZ7b_aDw.js");
let homeJs = fs.readFileSync(homeJsPath, "utf8");

homeJs = homeJs
  .replace(
    'Ae="/static/png/banner1_index-C7j2Ij3e.png"',
    'Ae="/static/png/banner1_index.png"',
  )
  .replace(
    'ue="/static/png/banner2_index-DA1XDSLD.png"',
    'ue="/static/png/banner1_index.png"',
  )
  .replace(
    'ce="/static/png/bg_ecosystem-CQIwJaWg.png"',
    'ce="/static/png/bg_ecosystem.png"',
  )
  .replace(
    'pe="/static/png/bg_lab-Cjhys0Po.png"',
    'pe="/static/png/bg_lab.png"',
  )
  .replace(
    'k=[{id:"banner",src:de},{id:"banner1_index",src:Ae},{id:"banner2_index",src:ue}]',
    'k=[{id:"banner1_index",src:Ae},{id:"banner2_index",src:ue}]',
  )
  .replace('height:"600px"', 'height:"500px"');

if (!homeJs.includes('k=[{id:"banner1_index",src:Ae},{id:"banner2_index",src:ue}]')) {
  throw new Error("home carousel items patch failed");
}
if (!homeJs.includes('height:"500px"')) {
  throw new Error("home carousel height patch failed");
}
fs.writeFileSync(homeJsPath, homeJs);
console.log("patched", path.basename(homeJsPath));

// —— homepage CSS: 600 → 500 ——
const homeCssPath = path.join(mirror, "static/css/index-C01Te3K9.css");
let homeCss = fs.readFileSync(homeCssPath, "utf8");
const homeCssNext = homeCss
  .replaceAll(
    ".group_4[data-v-e20041d5]{width:100%;height:600px;",
    ".group_4[data-v-e20041d5]{width:100%;height:500px;",
  )
  .replaceAll(
    ".el-carousel__item{height:600px}",
    ".el-carousel__item{height:500px}",
  )
  .replaceAll(
    ".banner-slide[data-v-e20041d5]{width:100%;height:600px;",
    ".banner-slide[data-v-e20041d5]{width:100%;height:500px;",
  );
if (homeCssNext === homeCss) throw new Error("home css height patch failed");
fs.writeFileSync(homeCssPath, homeCssNext);
console.log("patched", path.basename(homeCssPath));

// —— standard page JS ——
const stdJsPath = path.join(mirror, "static/js/index-DXJtz4g7.js");
let stdJs = fs.readFileSync(stdJsPath, "utf8");

stdJs = stdJs
  .replace(
    'K="/static/png/national_standard-B1Wae5Hc.png"',
    'K="/static/png/country_standard.png"',
  )
  .replace(
    'X="/static/png/industry_standard-B4eM4jGy.png"',
    'X="/static/png/industry_standard.png"',
  );

// inject app scenes image constant near industry image
if (!stdJs.includes("/static/png/dci_app_scenes.png")) {
  stdJs = stdJs.replace(
    'X="/static/png/industry_standard.png"',
    'X="/static/png/industry_standard.png",QA="/static/png/dci_app_scenes.png"',
  );
}

// Replace app-grid tags render with single image
const oldAppsRender =
  'A("div",tA,[i[7]||(i[7]=A("span",{class:"section-title"},"DCI贯标应用",-1)),A("div",oA,[(o(),n(Z,null,E(c,a=>A("div",{key:a.label,class:"app-item flex-col align-center"},[A("img",{class:"app-icon",referrerpolicy:"no-referrer",src:a.icon,alt:a.label},null,8,nA),A("span",mA,p(a.label),1)])),64))])])';
const newAppsRender =
  'A("div",tA,[i[7]||(i[7]=A("span",{class:"section-title"},"DCI贯标应用",-1)),A("img",{class:"app-scenes-img",referrerpolicy:"no-referrer",src:l(QA),alt:"DCI贯标应用"},null,8,["src"])])';

if (!stdJs.includes(oldAppsRender)) {
  throw new Error("apps render block not found");
}
stdJs = stdJs.replace(oldAppsRender, newAppsRender);

fs.writeFileSync(stdJsPath, stdJs);
console.log("patched", path.basename(stdJsPath));

// —— standard page CSS ——
const stdCssPath = path.join(mirror, "static/css/index-CSHWisZW.css");
let stdCss = fs.readFileSync(stdCssPath, "utf8");

stdCss = stdCss
  .replace(
    ".national-block[data-v-ac23daef]{align-items:flex-start;justify-content:space-between;gap:64px}",
    ".national-block[data-v-ac23daef]{align-items:center;justify-content:space-between;gap:40px}",
  )
  .replace(
    ".national-copy[data-v-ac23daef]{flex:1;min-width:0;padding-top:8px}",
    ".national-copy[data-v-ac23daef]{flex:1 1 50%;width:50%;min-width:0;padding-top:0;box-sizing:border-box}",
  )
  .replace(
    ".national-cover[data-v-ac23daef]{width:280px;max-width:32%;height:auto;flex-shrink:0;object-fit:contain;background:#f3f4f6;box-shadow:0 12px 28px #121b2c14}",
    ".national-cover[data-v-ac23daef]{flex:1 1 50%;width:50%;max-width:50%;height:auto;flex-shrink:0;object-fit:contain;background:transparent;box-shadow:none}",
  )
  .replace(
    ".industry-img[data-v-ac23daef]{display:block;width:1200px;max-width:100%;height:auto;margin-top:40px;background-color:#fff}",
    ".industry-img[data-v-ac23daef]{display:block;width:1200px;max-width:100%;height:auto;margin-top:24px;background-color:transparent}",
  )
  .replace(
    ".standard-section-alt[data-v-ac23daef]{padding-top:80px}",
    ".standard-section-alt[data-v-ac23daef]{padding-top:56px;padding-bottom:56px}",
  );

// Replace app-grid styles with single image style
const oldAppCss =
  ".app-grid[data-v-ac23daef]{display:grid;grid-template-columns:repeat(9,1fr);column-gap:11px;row-gap:16px;margin-top:41px}.app-item[data-v-ac23daef]{width:100%;height:123px;background:#fff}.app-icon[data-v-ac23daef]{width:41px;height:41px;margin-top:27px}.app-label[data-v-ac23daef]{color:#1345a5;font-size:14px;line-height:19px;margin-top:15px;text-align:center;white-space:nowrap}";
const newAppCss =
  ".app-scenes-img[data-v-ac23daef]{display:block;width:1200px;max-width:100%;height:auto;margin-top:32px}";

if (!stdCss.includes(oldAppCss)) {
  throw new Error("app-grid css not found");
}
stdCss = stdCss.replace(oldAppCss, newAppCss);

// mobile national 50/50 → stack
stdCss = stdCss.replace(
  "@media(max-width:900px){.national-block[data-v-ac23daef]{flex-direction:column;gap:32px}.national-cover[data-v-ac23daef]{width:220px;max-width:100%}}",
  "@media(max-width:900px){.national-block[data-v-ac23daef]{flex-direction:column;gap:24px}.national-copy[data-v-ac23daef],.national-cover[data-v-ac23daef]{flex:1 1 auto;width:100%;max-width:100%}}",
);

fs.writeFileSync(stdCssPath, stdCss);
console.log("patched", path.basename(stdCssPath));

// overrides safety net for banner height + standard layout
const ovPath = path.join(mirror, "overrides.css");
let ov = fs.readFileSync(ovPath, "utf8");
const marker = "/* portal-image-refresh-2026 */";
if (!ov.includes(marker)) {
  ov += `

${marker}
/* Homepage banner: 2 slides @ 500px */
.group_4[data-v-e20041d5],
.group_4 {
  height: 500px !important;
}
.home-banner-carousel[data-v-e20041d5] .el-carousel__container,
.home-banner-carousel[data-v-e20041d5] .el-carousel__item,
.home-banner-carousel .el-carousel__container,
.home-banner-carousel .el-carousel__item,
.banner-slide[data-v-e20041d5],
.banner-slide {
  height: 500px !important;
}

/* /dci/standard: national 50/50 */
.national-block[data-v-ac23daef],
.national-block {
  align-items: center !important;
  gap: 40px !important;
}
.national-copy[data-v-ac23daef],
.national-copy {
  flex: 1 1 50% !important;
  width: 50% !important;
  min-width: 0 !important;
}
.national-cover[data-v-ac23daef],
.national-cover {
  flex: 1 1 50% !important;
  width: 50% !important;
  max-width: 50% !important;
  height: auto !important;
  object-fit: contain !important;
  background: transparent !important;
  box-shadow: none !important;
}
.industry-img[data-v-ac23daef],
.industry-img {
  margin-top: 24px !important;
  height: auto !important;
  background: transparent !important;
}
.app-scenes-img[data-v-ac23daef],
.app-scenes-img {
  display: block;
  width: 1200px;
  max-width: 100%;
  height: auto;
  margin-top: 32px;
}
@media (max-width: 900px) {
  .national-copy[data-v-ac23daef],
  .national-copy,
  .national-cover[data-v-ac23daef],
  .national-cover {
    flex: 1 1 auto !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
`;
  fs.writeFileSync(ovPath, ov);
  console.log("appended overrides");
}

console.log("done");
