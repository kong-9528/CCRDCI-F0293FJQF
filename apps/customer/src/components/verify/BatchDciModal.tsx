import { Modal } from "@/components/Modal";
import { DCI_BATCH_LIMIT, DCI_DAILY_LIMIT, parseDciInputList } from "@/lib/dci";

type Props = {
  open: boolean;
  loading: boolean;
  text: string;
  onTextChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onFile: (file: File) => void;
};

export function BatchDciModal({
  open,
  loading,
  text,
  onTextChange,
  onClose,
  onSubmit,
  onFile,
}: Props) {
  const count = parseDciInputList(text).length;

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
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "提交中…" : "提交"}
          </button>
        </>
      }
    >
      <div className="a-stack">
        <div className="a-field a-field--stack">
          <label className="a-field__label" htmlFor="batch-dci">
            输入 DCI 码 <span style={{ color: "var(--er-500)" }}>*</span>
          </label>
          <textarea
            id="batch-dci"
            className="a-textarea"
            placeholder="每行一个 DCI 码，或从 Excel 粘贴"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
        <div className="a-field a-field--stack">
          <span className="a-field__label">或上传文件</span>
          <input
            type="file"
            accept=".txt,.csv,.xlsx,.xls"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <p className="a-field__hint">
          单次上限 {DCI_BATCH_LIMIT} 条，每日上限 {DCI_DAILY_LIMIT} 条，自动去重
          {count > 0 ? ` · 当前 ${count} 行` : ""}
        </p>
      </div>
    </Modal>
  );
}
