const DEFAULT_RETURN = "http://localhost:3000/";

/** 登录/注册成功后回跳业务方；仅允许 http(s) 绝对地址，防 open redirect。 */
export function resolveReturnUrl(search: string): string {
  const params = new URLSearchParams(search);
  const raw = params.get("returnUrl") || params.get("redirect") || "";
  if (!raw) return DEFAULT_RETURN;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_RETURN;
    return url.toString();
  } catch {
    return DEFAULT_RETURN;
  }
}

export function withReturnUrl(path: string, search: string): string {
  const params = new URLSearchParams(search);
  const ret = params.get("returnUrl") || params.get("redirect");
  if (!ret) return path;
  const next = new URLSearchParams();
  next.set("returnUrl", ret);
  return `${path}?${next.toString()}`;
}
