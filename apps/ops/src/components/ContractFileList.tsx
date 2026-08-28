import type { ContractFile } from "@/lib/catalog";
import { downloadContractFile, formatFileSize } from "@/lib/contractFiles";

type Props = {
  files: ContractFile[];
  canDownload?: boolean;
};

export function ContractFileList({ files, canDownload = false }: Props) {
  if (files.length === 0) return <>—</>;

  return (
    <ul className="a-file-list" style={{ margin: 0 }}>
      {files.map((file) => (
        <li key={file.id}>
          {canDownload ? (
            <button
              type="button"
              className="a-btn a-btn--text a-btn--sm a-file-list__link"
              onClick={() => downloadContractFile(file)}
            >
              {file.name}
              <span className="a-field__hint">（{formatFileSize(file.size)}）</span>
            </button>
          ) : (
            <span>
              {file.name}
              <span className="a-field__hint">（{formatFileSize(file.size)}）</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
