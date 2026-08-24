import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PERIOD_STATUS_LABEL,
  derivePeriodStatus,
  sortContractsByStartDesc,
  type ContractFile,
  type CustomerContract,
} from "@/lib/catalog";
import { useCustomerStore, type ContractInput } from "@/lib/customersStore";
import { getCurrentUserPermissions } from "@/lib/usersStore";

type FormState = {
  contractNo: string;
  startDate: string;
  endDate: string;
  amount: string;
  files: ContractFile[];
};

const EMPTY_FORM: FormState = {
  contractNo: "",
  startDate: "",
  endDate: "",
  amount: "",
  files: [],
};

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function hasPerm(userPerms: string[], id: string) {
  return userPerms.includes(id) || userPerms.includes("customers");
}

export function CustomerContractsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getById, addContract, updateContract } = useCustomerStore();
  const customer = getById(id);
  const userPerms = getCurrentUserPermissions();
  const canCreate = hasPerm(userPerms, "customers.contracts.create");
  const canEdit = hasPerm(userPerms, "customers.contracts.edit");

  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CustomerContract | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () => (customer ? sortContractsByStartDesc(customer.contracts) : []),
    [customer],
  );

  useEffect(() => {
    if (!dialog) return;
    setError(null);
  }, [dialog]);

  if (!customer) {
    return (
      <div className="a-card">
        <div className="a-card__head">合同管理</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该客户账号</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => navigate("/customers")}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: CustomerContract) => {
    setEditing(row);
    setForm({
      contractNo: row.contractNo,
      startDate: row.startDate,
      endDate: row.endDate,
      amount: row.amount == null ? "" : String(row.amount),
      files: [...row.files],
    });
    setError(null);
    setDialog("edit");
  };

  const onFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const added = Array.from(fileList).map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
    }));
    setForm((p) => ({ ...p, files: [...p.files, ...added] }));
  };

  const toInput = (): ContractInput | null => {
    const amount = form.amount.trim() ? Number(form.amount) : null;
    if (form.amount.trim() && (!Number.isFinite(amount) || (amount as number) < 0)) {
      setError("合同总金额须为非负数字");
      return null;
    }
    return {
      contractNo: form.contractNo,
      startDate: form.startDate,
      endDate: form.endDate,
      amount,
      files: form.files,
    };
  };

  const submit = () => {
    const input = toInput();
    if (!input) return;
    const err =
      dialog === "create"
        ? addContract(customer.id, input)
        : editing
          ? updateContract(customer.id, editing.id, input)
          : "无效操作";
    if (err) {
      setError(err);
      return;
    }
    setDialog(null);
  };

  return (
    <>
      <div className="a-stack">
        <div className="a-card">
          <div className="a-card__head">
            合同管理
            <div className="a-card__extra">
              <button
                type="button"
                className="a-btn a-btn--sm"
                onClick={() => navigate("/customers")}
              >
                返回列表
              </button>
            </div>
          </div>
          <div className="a-card__body a-stack">
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">账号</span>
                <span className="a-desc__value">
                  <code>{customer.account}</code>
                </span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">公司全称</span>
                <span className="a-desc__value">{customer.companyName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">统一社会信用代码</span>
                <span className="a-desc__value">{customer.creditCode}</span>
              </div>
            </div>
            <div className="a-field__hint" style={{ margin: 0 }}>
              合同按开始日期倒序排列。每次签约 / 续约请新增一条合同记录；开通后不可删除。
            </div>
          </div>
        </div>

        <div className="a-card">
          <div className="a-toolbar">
            {canCreate ? (
              <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
                新增合同
              </button>
            ) : null}
            <div className="a-field__hint" style={{ margin: 0 }}>
              共 <b>{rows.length}</b> 条合同记录
            </div>
          </div>

          <div className="a-card__body a-card__body--flush">
            {rows.length === 0 ? (
              <div className="a-empty">暂无合同记录，请新增首份合同</div>
            ) : (
              <div className="a-contract-list">
                {rows.map((row) => {
                  const status = derivePeriodStatus(row.startDate, row.endDate);
                  return (
                    <article key={row.id} className="a-contract-card">
                      <div className="a-contract-card__head">
                        <div>
                          <div className="a-contract-card__no">{row.contractNo}</div>
                          <div className="a-field__hint" style={{ margin: "4px 0 0" }}>
                            更新于 {row.updatedAt}
                          </div>
                        </div>
                        <div className="a-inline-actions">
                          <span
                            className={`a-tag ${
                              status === "active"
                                ? "a-tag--ok"
                                : status === "pending"
                                  ? "a-tag--wn"
                                  : "a-tag--muted"
                            }`}
                          >
                            {PERIOD_STATUS_LABEL[status]}
                          </span>
                          {canEdit ? (
                            <button
                              type="button"
                              className="a-btn a-btn--sm"
                              onClick={() => openEdit(row)}
                            >
                              修改
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="a-desc">
                        <div className="a-desc__item">
                          <span className="a-desc__label">合作起止</span>
                          <span className="a-desc__value">
                            {row.startDate} ~ {row.endDate}
                          </span>
                        </div>
                        <div className="a-desc__item">
                          <span className="a-desc__label">合同总金额</span>
                          <span className="a-desc__value">
                            {row.amount == null
                              ? "—"
                              : `${row.amount.toLocaleString()} 元`}
                          </span>
                        </div>
                        <div className="a-desc__item a-desc__item--wide">
                          <span className="a-desc__label">合同附件</span>
                          <span className="a-desc__value">
                            {row.files.length === 0 ? (
                              "—"
                            ) : (
                              <ul className="a-file-list" style={{ margin: 0 }}>
                                {row.files.map((f) => (
                                  <li key={f.id}>
                                    <span>
                                      {f.name}
                                      <span className="a-field__hint">
                                        （{formatSize(f.size)}）
                                      </span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {dialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setDialog(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create" ? "新增合同" : "修改合同"}
            </h3>
            <p className="a-modal__desc">
              字段与新增客户账号时的合作信息一致：合同编号、合作起止、金额与附件。
            </p>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  合同编号 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  maxLength={200}
                  placeholder="请输入合同编号"
                  value={form.contractNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contractNo: e.target.value.slice(0, 200) }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  合作起止日期 <span className="a-req">*</span>
                </span>
                <div className="a-date-range">
                  <input
                    type="date"
                    className="a-input"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  />
                  <span>至</span>
                  <input
                    type="date"
                    className="a-input"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">合同总金额（元）</span>
                <input
                  className="a-input"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">合同文件</span>
                <div className="a-upload-list">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.zip"
                    onChange={(e) => {
                      onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {form.files.length ? (
                    <ul className="a-file-list">
                      {form.files.map((f) => (
                        <li key={f.id}>
                          <span>{f.name}</span>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                files: p.files.filter((x) => x.id !== f.id),
                              }))
                            }
                          >
                            移除
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="a-field__hint">支持多文件（图片 / PDF 等）</span>
                  )}
                </div>
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
