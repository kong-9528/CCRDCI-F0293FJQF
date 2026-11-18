import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const p = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../mirror/static/js/nav-opsPortal.js",
);
let s = fs.readFileSync(p, "utf8");
const marker = "快捷选择系统预设";
const i = s.indexOf(marker);
if (i < 0) throw new Error("marker not found");

const start = s.lastIndexOf("!X.value.id&&ke.value.length>0?", i);
if (start < 0) throw new Error("ternary start not found");

console.log("around marker:", JSON.stringify(s.slice(i - 100, i + 220)));

let end = -1;
for (let j = i; j < s.length - 12; j++) {
  if (s.startsWith(":o(", j)) {
    const slice = s.slice(j, j + 16);
    if (slice.includes("!0)")) {
      end = j + slice.indexOf("!0)") + 3;
      console.log("end slice", JSON.stringify(slice));
      break;
    }
  }
}
if (end < 0) throw new Error("ternary end not found");

const emptyComment = "o(" + "``" + ",!0)"; // o(``,!0) with empty template literal
const old = s.slice(start, end);
console.log("OLD_LEN", old.length, "OLD_HEAD", JSON.stringify(old.slice(0, 100)));
s = s.slice(0, start) + emptyComment + s.slice(end);
fs.writeFileSync(p, s);
console.log("still has marker?", s.includes(marker));
console.log("replacement present?", s.includes(emptyComment));
