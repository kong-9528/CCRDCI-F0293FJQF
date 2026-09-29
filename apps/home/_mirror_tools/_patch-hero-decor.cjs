/**
 * Inject elegant hero-banner decor matching DCI copy
 * (国家标准 / 可信基础设施 / 唯一标识 / 数字身份证)
 */
const fs = require("fs");
const p = "apps/home/mirror/static/js/index-D_FAjFVe.js";
let s = fs.readFileSync(p, "utf8");

if (s.includes("hero-decor")) {
  console.log("already has hero-decor");
  process.exit(0);
}

const old =
  'a("div",V,[a("div",$,[a("div",E,[a("img",{class:"hero-dci-mark"';

const inner =
  // Soft national-standard seal (可信 / 国家标准)
  '<svg class="hero-decor__seal" viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
  '<circle cx="60" cy="60" r="52" stroke="currentColor" stroke-width="1.2" opacity=".55"/>' +
  '<circle cx="60" cy="60" r="44" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 4" opacity=".45"/>' +
  '<circle cx="60" cy="60" r="28" stroke="currentColor" stroke-width="1" opacity=".4"/>' +
  '<path d="M60 38v44M38 60h44" stroke="currentColor" stroke-width="1" opacity=".32"/>' +
  "</svg>" +
  // Verifiable digital ID card (数字身份证)
  '<svg class="hero-decor__idcard" viewBox="0 0 160 100" fill="none" aria-hidden="true">' +
  '<rect x="8" y="10" width="144" height="80" rx="8" stroke="currentColor" stroke-width="1.2" opacity=".5"/>' +
  '<rect x="22" y="26" width="36" height="36" rx="4" stroke="currentColor" stroke-width="1" opacity=".42"/>' +
  '<path d="M70 32h56M70 44h44M70 56h36" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".38"/>' +
  '<circle cx="40" cy="40" r="8" stroke="currentColor" stroke-width=".9" opacity=".38"/>' +
  '<path d="M28 54c4-8 20-8 24 0" stroke="currentColor" stroke-width=".9" opacity=".32"/>' +
  "</svg>" +
  // Unique-ID fingerprint arcs (唯一标识符)
  '<svg class="hero-decor__fingerprint" viewBox="0 0 80 100" fill="none" aria-hidden="true">' +
  '<path d="M40 18c14 0 26 12 26 28 0 22-10 36-26 48" stroke="currentColor" stroke-width="1.1" opacity=".42"/>' +
  '<path d="M40 26c9 0 17 8 17 20 0 16-7 26-17 36" stroke="currentColor" stroke-width="1.1" opacity=".36"/>' +
  '<path d="M40 34c5 0 9 5 9 12 0 10-4 16-9 22" stroke="currentColor" stroke-width="1.1" opacity=".32"/>' +
  '<path d="M28 42c0-8 5-14 12-14" stroke="currentColor" stroke-width="1.1" opacity=".3"/>' +
  '<path d="M24 50c0-14 8-24 16-24" stroke="currentColor" stroke-width="1" opacity=".26"/>' +
  "</svg>" +
  // Infrastructure network (数智基础设施)
  '<svg class="hero-decor__network" viewBox="0 0 200 140" fill="none" aria-hidden="true">' +
  '<circle cx="30" cy="40" r="3.5" fill="currentColor" opacity=".38"/>' +
  '<circle cx="90" cy="28" r="2.5" fill="currentColor" opacity=".32"/>' +
  '<circle cx="150" cy="48" r="3" fill="currentColor" opacity=".34"/>' +
  '<circle cx="70" cy="90" r="2.8" fill="currentColor" opacity=".3"/>' +
  '<circle cx="130" cy="100" r="3.2" fill="currentColor" opacity=".32"/>' +
  '<circle cx="180" cy="80" r="2.4" fill="currentColor" opacity=".28"/>' +
  '<path d="M30 40L90 28L150 48M90 28L70 90L130 100L180 80M150 48L130 100" stroke="currentColor" stroke-width=".8" opacity=".24"/>' +
  "</svg>" +
  // Soft shield (保护创作者权益)
  '<svg class="hero-decor__shield" viewBox="0 0 72 88" fill="none" aria-hidden="true">' +
  '<path d="M36 8L64 20v28c0 18-12 32-28 40C20 80 8 66 8 48V20L36 8z" stroke="currentColor" stroke-width="1.2" opacity=".42"/>' +
  '<path d="M26 44l8 8 14-16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".38"/>' +
  "</svg>" +
  '<span class="hero-decor__orb hero-decor__orb--a"></span>' +
  '<span class="hero-decor__orb hero-decor__orb--b"></span>' +
  '<span class="hero-decor__orb hero-decor__orb--c"></span>';

const neu =
  'a("div",V,[a("div",{class:"hero-decor","aria-hidden":"true",innerHTML:' +
  JSON.stringify(inner) +
  '}),a("div",$,[a("div",E,[a("img",{class:"hero-dci-mark"';

if (!s.includes(old)) {
  console.error("anchor not found");
  const i = s.indexOf('a("div",V,[a("div",$');
  console.log(s.slice(i, i + 160));
  process.exit(1);
}

s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("hero-decor injected, bytes", inner.length);
