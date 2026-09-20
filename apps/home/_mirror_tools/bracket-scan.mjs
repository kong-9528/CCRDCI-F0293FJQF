import fs from "fs";
import { createRequire } from "module";

const path =
  "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js/register-CvP1VOMb.js";
const js = fs.readFileSync(path, "utf8");

// Find unexpected ] by scanning with string awareness
let depthParen = 0,
  depthBracket = 0,
  depthBrace = 0;
let i = 0;
let inStr = null;
let inTemplate = false;
let templateDepth = 0;

function fail(msg) {
  const start = Math.max(0, i - 80);
  console.log("FAIL", msg, "at", i);
  console.log(js.slice(start, i + 80));
  process.exit(1);
}

while (i < js.length) {
  const ch = js[i];
  const prev = js[i - 1];

  if (inStr) {
    if (ch === "\\" ) {
      i += 2;
      continue;
    }
    if (ch === inStr) inStr = null;
    i++;
    continue;
  }

  if (inTemplate) {
    if (ch === "\\" ) {
      i += 2;
      continue;
    }
    if (ch === "`") {
      inTemplate = false;
      i++;
      continue;
    }
    if (ch === "$" && js[i + 1] === "{") {
      templateDepth++;
      inTemplate = false;
      i += 2;
      depthBrace++;
      continue;
    }
    i++;
    continue;
  }

  if (ch === '"' || ch === "'") {
    inStr = ch;
    i++;
    continue;
  }
  if (ch === "`") {
    inTemplate = true;
    i++;
    continue;
  }

  if (ch === "(") depthParen++;
  else if (ch === ")") {
    depthParen--;
    if (depthParen < 0) fail("extra )");
  } else if (ch === "[") depthBracket++;
  else if (ch === "]") {
    depthBracket--;
    if (depthBracket < 0) fail("extra ]");
  } else if (ch === "{") depthBrace++;
  else if (ch === "}") {
    depthBrace--;
    if (depthBrace < 0) fail("extra }");
    // resume template if we closed ${}
    // Heuristic: if next meaningful is part of template - skip for now
  }
  i++;
}

console.log("final depths", { depthParen, depthBracket, depthBrace });
try {
  new Function(js.replace(/^import[\s\S]*?;/gm, "").replace(/export\{[^}]+\};?\s*$/, ""));
  console.log("Function parse: hard without imports");
} catch (e) {
  console.log("note", e.message);
}
