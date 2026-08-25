import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import type { CertOcrDraft, CertRecognition } from "@/lib/verifyCert";

type Props = {
  open: boolean;
  loading: boolean;
  draft: CertOcrDraft | null;
  onClose: () => void;
  onConfirm: (draft: CertOcrDraft) => void;
};

const FIELDS: { key: keyof CertRecognition; label: string }[] = [
  { key: "certTitleNo", label: "证书号" },
  { key: "workName", label: "软件名称" },
  { key: "owner", label: "著作权人" },
  { key: "acquireMethod", label: "权利取得方式" },
  { key: "rightScope", label: "权利范围" },
  { key: "registerDate", label: "登记日期" },
  { key: "registerNo", label: "登记号" },
];

export function CertConfirmModal({ open, loading, draft, onClose, onConfirm }: Props) {
  const [form, setForm] = useState<CertRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && draft) {
      setForm({ ...draft.recognition });
      setError(null);
    }
  }, [open, draft]);

  if (!open || !draft || !form) return null;

  const setField = (key: keyof CertRecognition, value: string) => {
    setForm((p) => (p ? { ...p, [key]: value } : p));
  };

  const submit = () => {
    if (!form.certTitleNo.trim()) {
      setError("请填写证书号");
      return;
    }
    if (!form.workName.trim()) {
      setError("请填写软件名称");
      return;
    }
    if (!form.owner.trim()) {
      setError("请填写著作权人");
      return;
    }
    if (!form.registerNo.trim()) {
      setError("请填写登记号");
      return;
    }
    setError(null);
    onConfirm({
      ...draft,
      recognition: {
        ...form,
        certTitleNo: form.certTitleNo.trim(),
        workName: form.workName.trim(),
        owner: form.owner.trim(),
        acquireMethod: form.acquireMethod.trim() || "原始取得",
        rightScope: form.rightScope.trim() || "全部权利",
        registerDate: form.registerDate.trim(),
        registerNo: form.registerNo.trim(),
      },
    });
  };

  return (
    <Modal
      open={open}
      title="识别结果确认"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn" disabled={loading} onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            disabled={loading}
            onClick={submit}
          >
            {loading ? "核验中…" : "确认"}
          </button>
        </>
      }
    >
      <div className="c-cert-confirm">
        <div className="c-cert-confirm__tip" role="status">
          <span className="c-cert-confirm__tip-icon" aria-hidden>
            i
          </span>
          <span>请确认证书识别结果，核验将根据确认后的信息进行比对。</span>
        </div>

        <div className="c-cert-confirm__form">
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="c-cert-confirm__row">
              <span className="c-cert-confirm__label">{label}：</span>
              <input
                className="a-input"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                disabled={loading}
              />
            </label>
          ))}
        </div>

        {error ? <div className="a-field__error">{error}</div> : null}
      </div>
    </Modal>
  );
}
