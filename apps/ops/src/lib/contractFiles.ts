import type { ContractFile } from "@/lib/catalog";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 演示环境：生成占位文件供下载；生产环境应替换为真实文件流 */
export function downloadContractFile(file: ContractFile) {
  const content = [
    `演示合同附件：${file.name}`,
    `大小：${formatFileSize(file.size)}`,
    "",
    "（实际环境此处为合同附件二进制内容）",
  ].join("\n");
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(url);
}
