import { Modal } from "@/components/Modal";
import {
  DCI_BATCH_LIMIT,
  DCI_NAME_LABEL,
  downloadDciBatchTemplate,
  type DciBatchRow,
} from "@/lib/dci";

type Props = {
  open: boolean;
  loading: boolean;
  fileName: string | null;
  rowCount: number;
  onClose: () => void;
  onSubmit: () => void;
  onFile: (file: File) => void;
};

export function BatchDciModal({
  open,
  loading,
  fileName,
  rowCount,
  onClose,
  onSubmit,
  onFile,
}: Props) {
  return (
    <Modal
      open={open}
      title="批量核验"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn a-btn--sm" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary a-btn--sm"
            disabled={loading || rowCount === 0}
            onClick={onSubmit}
          >
            {loading ? "提交中…" : "提交"}
          </button>
        </>
      }
    >
      <div className="a-stack">
        <div className="c-dci-batch-intro">
          <p>
            请下载模板，按列填写 <strong>DCI 核验码</strong>、<strong>著作权人</strong>、
            <strong>{DCI_NAME_LABEL}</strong> 后上传 Excel 文件。
          </p>
          <button type="button" className="a-btn a-btn--sm" onClick={downloadDciBatchTemplate}>
            下载 Excel 模板
          </button>
        </div>

        <div className="a-field a-field--stack">
          <span className="a-field__label">
            上传文件 <span style={{ color: "var(--er-500)" }}>*</span>
          </span>
          <input
            type="file"
            accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {fileName ? (
          <p className="a-field__hint">
            已选择：{fileName}
            {rowCount > 0 ? ` · 共 ${rowCount} 条待核验数据` : ""}
          </p>
        ) : null}

        <p className="a-field__hint">
          支持 CSV、XLS、XLSX · 单次上限 {DCI_BATCH_LIMIT} 条 · 同批 DCI 码自动去重
        </p>
      </div>
    </Modal>
  );
}

export type { DciBatchRow };
