import { Modal } from "@/components/Modal";
import type { CertFileKind } from "@/lib/verifyCert";

type Props = {
  open: boolean;
  fileName: string;
  fileUrl: string;
  fileKind: CertFileKind;
  onClose: () => void;
};

/** 查看用户上传的证书原文件（大图 / PDF），与核验详情抽屉独立 */
export function CertFilePreviewModal({ open, fileName, fileUrl, fileKind, onClose }: Props) {
  return (
    <Modal
      open={open}
      title="查看证书"
      size="lg"
      onClose={onClose}
      footer={
        <button type="button" className="a-btn a-btn--sm" onClick={onClose}>
          关闭
        </button>
      }
    >
      <div className="c-cert-preview">
        {fileKind === "pdf" ? (
          <iframe
            className="c-cert-preview__pdf"
            src={fileUrl}
            title={fileName}
          />
        ) : (
          <img src={fileUrl} alt={fileName} />
        )}
        <p className="c-cert-preview__meta">{fileName}</p>
        {fileKind === "pdf" ? (
          <a className="a-btn a-btn--text a-btn--sm" href={fileUrl} target="_blank" rel="noreferrer">
            在新窗口打开
          </a>
        ) : null}
      </div>
    </Modal>
  );
}
