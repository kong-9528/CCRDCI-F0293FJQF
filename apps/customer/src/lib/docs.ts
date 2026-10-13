/** 文档页 mock：对齐 home 文档模块「版本动态 / 文档介绍」结构 */

export type DocsTabKey = "version" | "overview" | "interfaces";

export type DocsVersionItem = {
  version: string;
  date: string;
  content: string;
};

export const DOCS_TABS: { key: DocsTabKey; name: string }[] = [
  { key: "version", name: "版本动态" },
  { key: "overview", name: "文档介绍" },
  { key: "interfaces", name: "接口列表" },
];

/** 版本动态 mock（格式同 home：version / date / content） */
export const DOCS_VERSIONS: DocsVersionItem[] = [
  {
    version: "V1.0",
    date: "2026-08-31",
    content:
      "DCI核验接口、版权登记信息核验接口、版权登记证书核验接口及作品智能辅助审核接口正式上线。",
  },
];

/** 文档介绍 mock（结构同 home：导语 + 核心能力列表） */
export const DOCS_OVERVIEW = {
  summary: "面向接入机构，提供版权核验与作品智能审核开放接口，支持业务系统对接调用。",
  capabilitiesTitle: "核心能力：",
  capabilities: [
    "DCI码及相关信息核验；",
    "版权登记信息核验；",
    "版权登记证书核验；",
    "作品智能辅助审核。",
  ],
} as const;

export function resolveDocsTab(raw: string | null): DocsTabKey {
  if (raw === "overview" || raw === "interfaces" || raw === "version") return raw;
  if (raw === "documents") return "interfaces";
  return "version";
}

/** 客户文档侧栏隐藏的目录（如通用接口） */
export const DOCS_HIDDEN_CATALOG_IDS = new Set(["cat_general"]);

export type DocsCallLang = {
  id: string;
  label: string;
};

/** 调用示例多语言页签（演示主流开发语言） */
export const DOCS_CALL_LANGS: DocsCallLang[] = [
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "go", label: "Go" },
];

type CallExampleInput = {
  method: string;
  path: string;
  exampleRequest?: string;
};

function sampleBaseUrl() {
  return "https://api.example.com";
}

function parseRequestBody(raw: string | undefined): string {
  const t = (raw || "").trim();
  if (!t) return "";
  try {
    return JSON.stringify(JSON.parse(t), null, 2);
  } catch {
    return t;
  }
}

/** 按语言生成调用示例 mock（基于接口 method/path/请求体） */
export function buildDocsCallExamples(input: CallExampleInput): Record<string, string> {
  const method = (input.method || "GET").toUpperCase();
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = `${sampleBaseUrl()}${path}`;
  const body = parseRequestBody(input.exampleRequest);
  const hasBody = method !== "GET" && method !== "HEAD" && Boolean(body);

  const curlBody = hasBody
    ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${body.replace(/'/g, "'\\''")}'`
    : "";

  const jsBody = hasBody
    ? `,\n  headers: {\n    Authorization: "Bearer <token>",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(${body}),`
    : `,\n  headers: {\n    Authorization: "Bearer <token>",\n  },`;

  const pyBody = hasBody
    ? `\nheaders = {\n    "Authorization": "Bearer <token>",\n    "Content-Type": "application/json",\n}\npayload = ${body}\nresp = requests.request("${method}", url, headers=headers, json=payload)`
    : `\nheaders = {\n    "Authorization": "Bearer <token>",\n}\nresp = requests.request("${method}", url, headers=headers)`;

  const javaBody = hasBody
    ? `String body = """\n${body}\n""";\n\nHttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create(url))\n    .header("Authorization", "Bearer <token>")\n    .header("Content-Type", "application/json")\n    .method("${method}", HttpRequest.BodyPublishers.ofString(body))\n    .build();`
    : `HttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create(url))\n    .header("Authorization", "Bearer <token>")\n    .method("${method}", HttpRequest.BodyPublishers.noBody())\n    .build();`;

  const goBody = hasBody
    ? `body := strings.NewReader(\`${body}\`)\nreq, err := http.NewRequest("${method}", url, body)\nif err != nil {\n    log.Fatal(err)\n}\nreq.Header.Set("Authorization", "Bearer <token>")\nreq.Header.Set("Content-Type", "application/json")`
    : `req, err := http.NewRequest("${method}", url, nil)\nif err != nil {\n    log.Fatal(err)\n}\nreq.Header.Set("Authorization", "Bearer <token>")`;

  return {
    curl: `curl -X ${method} "${url}" \\\n  -H "Authorization: Bearer <token>"${curlBody}`,
    javascript: `const url = "${url}";\n\nconst res = await fetch(url, {\n  method: "${method}"${jsBody}\n});\n\nconst data = await res.json();\nconsole.log(data);`,
    python: `import requests\n\nurl = "${url}"${pyBody}\nprint(resp.status_code)\nprint(resp.json())`,
    java: `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\nString url = "${url}";\n${javaBody}\n\nHttpResponse<String> response = HttpClient.newHttpClient()\n    .send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.body());`,
    go: `package main\n\nimport (\n    "fmt"\n    "io"\n    "log"\n    "net/http"${hasBody ? `\n    "strings"` : ""}\n)\n\nfunc main() {\n    url := "${url}"\n    ${goBody}\n\n    resp, err := http.DefaultClient.Do(req)\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer resp.Body.Close()\n    b, _ := io.ReadAll(resp.Body)\n    fmt.Println(string(b))\n}`,
  };
}
