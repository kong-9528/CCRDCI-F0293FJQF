import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { DCI_NAME_LABEL, type DciOcrDraft, type DciRecognition } from "@/lib/dci";

type Props = {
  open: boolean;
  loading: boolean;
  draft: DciOcrDraft | null;
  onClose: () => void;
  onConfirm: (draft: DciOcrDraft) => void;
};

const FIELDS: { key: keyof DciRecognition; label: string }[] = [
  { key: "dciCode", label: "DCI 核验码" },
  { key: "owner", label: "著作权人" },
  { key: "name", label: DCI_NAME_LABEL },
];

export function DciConfirmModal({ open, loading, draft, onClose, onConfirm }: Props) {
  const [form, setForm] = useState<DciRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && draft) {
      setForm({ ...draft.recognition });
      setError(null);
    }
  }, [open, draft]);

  if (!open || !draft || !form) return null;

  const setField = (key: keyof DciRecognition, value: string) => {
    setForm((p) => (p ? { ...p, [key]: value } : p));
  };

  const submit = () => {
    if (!form.dciCode.trim()) {
      setError("请填写 DCI 核验码");
      return;
    }
    if (!form.owner.trim()) {
      setError("请填写著作权人");
      return;
    }
    if (!form.name.trim()) {
      setError(`请填写${DCI_NAME_LABEL}`);
      return;
    }
    setError(null);
    onConfirm({
      ...draft,
      recognition: {
        dciCode: form.dciCode.trim(),
        owner: form.owner.trim(),
        name: form.name.trim(),
      },
    });
  };

  return (
    <Modal
      open={open}
      title="识别结果确认"
      size="md"
      onClose={onClose}
      closeOnBackdrop={false}
      showClose={false}
      footer={
        <button
          type="button"
          className="a-btn a-btn--primary"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "核验中…" : "确认"}
        </button>
      }
    >
      <div className="c-cert-confirm">
        <div className="c-cert-confirm__alert" role="note">
          <span className="c-cert-confirm__alert-icon" aria-hidden>
            !
          </span>
          <span>请确认文件识别结果，核验将根据确认后的信息进行比对。</span>
        </div>

        <div className="c-cert-confirm__fields">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="c-cert-confirm__row">
              <span className="c-cert-confirm__label">{label}</span>
              <input
                className="a-input c-cert-confirm__input"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                disabled={loading}
              />
            </div>
          ))}
        </div>

        {error ? <div className="a-field__error">{error}</div> : null}
      </div>
    </Modal>
  );
}
