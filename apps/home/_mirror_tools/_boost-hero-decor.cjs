/**
 * Strengthen hero-decor SVG stroke opacities for better cross-display visibility.
 */
const fs = require("fs");
const p = "apps/home/mirror/static/js/index-D_FAjFVe.js";
let s = fs.readFileSync(p, "utf8");

if (!s.includes("hero-decor")) {
  console.error("hero-decor missing");
  process.exit(1);
}

// Bump inline SVG opacity attributes inside hero-decor innerHTML
const start = s.indexOf('class:"hero-decor"');
const htmlStart = s.indexOf('innerHTML:"', start);
if (htmlStart < 0) {
  console.error("innerHTML not found");
  process.exit(1);
}
const q0 = htmlStart + 'innerHTML:"'.length;
let i = q0;
let out = "";
while (i < s.length) {
  const ch = s[i];
  if (ch === "\\" && s[i + 1] === '"') {
    out += '\\"';
    i += 2;
    continue;
  }
  if (ch === '"') break;
  out += ch;
  i++;
}
const end = i; // index of closing quote

let html = JSON.parse('"' + s.slice(q0, end) + '"');

// Raise stroke/fill opacities in SVG
html = html
  .replace(/opacity="\.55"/g, 'opacity=".9"')
  .replace(/opacity="\.5"/g, 'opacity=".85"')
  .replace(/opacity="\.45"/g, 'opacity=".8"')
  .replace(/opacity="\.42"/g, 'opacity=".78"')
  .replace(/opacity="\.4"/g, 'opacity=".75"')
  .replace(/opacity="\.38"/g, 'opacity=".72"')
  .replace(/opacity="\.36"/g, 'opacity=".7"')
  .replace(/opacity="\.35"/g, 'opacity=".68"')
  .replace(/opacity="\.34"/g, 'opacity=".66"')
  .replace(/opacity="\.32"/g, 'opacity=".64"')
  .replace(/opacity="\.3"/g, 'opacity=".6"')
  .replace(/opacity="\.28"/g, 'opacity=".58"')
  .replace(/opacity="\.26"/g, 'opacity=".55"')
  .replace(/opacity="\.25"/g, 'opacity=".52"')
  .replace(/opacity="\.24"/g, 'opacity=".5"')
  .replace(/opacity="\.22"/g, 'opacity=".48"')
  // Slightly thicker strokes for visibility
  .replace(/stroke-width="1\.2"/g, 'stroke-width="1.6"')
  .replace(/stroke-width="1\.4"/g, 'stroke-width="1.8"')
  .replace(/stroke-width="1\.1"/g, 'stroke-width="1.5"')
  .replace(/stroke-width="1"/g, 'stroke-width="1.35"')
  .replace(/stroke-width="\.9"/g, 'stroke-width="1.25"')
  .replace(/stroke-width="\.8"/g, 'stroke-width="1.15"')
  .replace(/stroke-width="\.7"/g, 'stroke-width="1.05"')
  .replace(/r="3\.5"/g, 'r="4.2"')
  .replace(/r="3\.2"/g, 'r="3.8"')
  .replace(/r="2\.8"/g, 'r="3.4"')
  .replace(/r="2\.5"/g, 'r="3.1"')
  .replace(/r="2\.4"/g, 'r="3"');

const neu = JSON.stringify(html).slice(1, -1); // without surrounding quotes
s = s.slice(0, q0) + neu + s.slice(end);
fs.writeFileSync(p, s);
console.log("svg opacities strengthened");
