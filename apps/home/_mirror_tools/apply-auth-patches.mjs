import fs from "fs";
import path from "path";

const jsDir = "c:/WORKING_PLACE/CODE_R/sampleA/apps/home/mirror/static/js";

function patch(file, replacements) {
  const p = path.join(jsDir, file);
  let t = fs.readFileSync(p, "utf8");
  const before = t;
  for (const [from, to, label] of replacements) {
    if (!t.includes(from)) {
      console.log(`SKIP ${file}: missing [${label}]`);
      continue;
    }
    const count = t.split(from).length - 1;
    t = t.split(from).join(to);
    console.log(`OK ${file}: ${label} x${count}`);
  }
  if (t !== before) fs.writeFileSync(p, t);
}

// 1) Auth dialog: shrink width; "去注册" → /register page
patch("index-BiQimQRe.js", [
  ['width:"780px"', 'width:"700px"', "dialog width"],
  [
    'onClick:e[9]||(e[9]=r=>q("register"))',
    'onClick:e[9]||(e[9]=r=>{de();re.push("/register")})',
    "go-register link",
  ],
]);

// 2) Header 注册 button → /register
patch("index-_fJendd7.js", [
  [
    'onClick:t[11]||(t[11]=i=>R("register"))',
    'onClick:t[11]||(t[11]=i=>s.push("/register"))',
    "header register btn",
  ],
]);

// 3) Home page openAuth("register") → navigate
patch("index-LZ7b_aDw.js", [
  [
    'function R(i="login"){w.value=i,c.value=!0}',
    'function R(i="login"){i==="register"?u.push("/register"):(w.value=i,c.value=!0)}',
    "openAuth handler",
  ],
  [
    '(w.value="register",c.value=!0)',
    'u.push("/register")',
    "S() register open",
  ],
]);

// 4) Other pages that open register via same pattern
const pages = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));
for (const f of pages) {
  if (f === "index-LZ7b_aDw.js" || f === "index-BiQimQRe.js" || f === "index-_fJendd7.js") continue;
  const p = path.join(jsDir, f);
  let t = fs.readFileSync(p, "utf8");
  let changed = false;

  // Common: (w.value="register",c.value=!0) or (b.value="register",d.value=!0)
  const patterns = [
    [
      '(w.value="register",c.value=!0)',
      null, // need router var — skip generic
    ],
  ];

  if (t.includes('b.value="register",d.value=!0')) {
    // portal-CGcjgAeB style: uses V as router
    if (t.includes("V.push(") || t.includes("const V=")) {
      t = t.split('b.value="register",d.value=!0').join('V.push("/register")');
      changed = true;
      console.log(`OK ${f}: portal register open → push`);
    }
  }

  // Generic openAuth handlers that set mode to register via emit only — handled by header change
  if (changed) fs.writeFileSync(p, t);
}

console.log("done");
