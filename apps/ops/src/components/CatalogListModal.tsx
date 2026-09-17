import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEnable, IconPlus, IconTrash } from "@/components/icons/UiIcons";
import {
  countEndpointsInCatalog,
  createApiDocCatalog,
  deleteApiDocCatalog,
  listApiDocCatalogs,
  subscribeApiCatalog,
  updateApiDocCatalog,
  type ApiDocCatalog,
} from "@/lib/apiServicesStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

type DraftRow = {
  id: string;
  name: string;
  sort: string;
};

export function CatalogListModal({ open, onClose }: Props) {
  const [tick, setTick] = useState(0);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiDocCatalog | null>(null);

  useEffect(() => subscribeApiCatalog(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setConfirmDelete(null);
    setRows(
      listApiDocCatalogs().map((c) => ({
        id: c.id,
        name: c.name,
        sort: String(c.sort),
      })),
    );
  }, [open, tick]);

  if (!open) return null;

  const catalogs = listApiDocCatalogs();

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const addRow = () => {
    try {
      createApiDocCatalog({ name: "新目录" });
      showToast("已新增目录");
    } catch (e) {
      setError(e instanceof Error ? e.message : "新增失败");
    }
  };

  const saveRow = (row: DraftRow) => {
    setError(null);
    const name = row.name.trim();
    if (!name) {
      setError("目录名称不能为空");
      return;
    }
    const sort = Number(row.sort);
    if (!Number.isFinite(sort)) {
      setError("排序须为数字");
      return;
    }
    try {
      updateApiDocCatalog(row.id, { name, sort });
      showToast("已保存");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const remove = (cat: ApiDocCatalog) => {
    try {
      deleteApiDocCatalog(cat.id);
      setConfirmDelete(null);
      showToast("已删除目录");
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <>
      <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
        <div
          className="a-modal a-modal--lg a-catalog-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-list-title"
          onClick={(e) => e.stopPropagation()}
        >
          {toast ? <div className="a-toast">{toast}</div> : null}

          <div className="a-modal__head">
            <h3 id="catalog-list-title" className="a-modal__title">
              目录列表
            </h3>
            <button type="button" className="a-modal__close" aria-label="关闭" onClick={onClose}>
              ×
            </button>
          </div>

          <p className="a-modal__desc a-catalog-modal__desc">
            仅维护目录名称与排序；客户台「文档」左侧按此展示。
          </p>

          <div className="a-toolbar a-toolbar--secondary a-catalog-modal__toolbar">
            <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={addRow}>
              <IconPlus size={14} />
              新增目录
            </button>
          </div>

          <div className="a-catalog-modal__table-wrap">
            <table className="a-table a-table--accounts a-table--compact">
              <thead>
                <tr>
                  <th className="num" style={{ width: 56 }}>
                    序号
                  </th>
                  <th>目录名称</th>
                  <th style={{ width: 96 }}>排序</th>
                  <th style={{ width: 104 }}>关联接口</th>
                  <th className="a-table__col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="a-empty">暂无目录，请点击「新增目录」</div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const count = countEndpointsInCatalog(row.id);
                    return (
                      <tr key={row.id}>
                        <td className="num">{index + 1}</td>
                        <td>
                          <input
                            className="a-input a-input--sm"
                            value={row.name}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, name: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="请输入目录名称"
                          />
                        </td>
                        <td>
                          <input
                            className="a-input a-input--sm a-catalog-modal__sort"
                            value={row.sort}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, sort: e.target.value } : r,
                                ),
                              )
                            }
                            inputMode="numeric"
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <span className={`a-tag${count > 0 ? " a-tag--cyan" : " a-tag--muted"}`}>
                            {count} 个
                          </span>
                        </td>
                        <td>
                          <div className="a-actions a-actions--nowrap">
                            <TableAction icon={<IconEnable />} onClick={() => saveRow(row)}>
                              保存
                            </TableAction>
                            <TableAction
                              icon={<IconTrash />}
                              danger
                              onClick={() => {
                                const cat = catalogs.find((c) => c.id === row.id);
                                if (cat) setConfirmDelete(cat);
                              }}
                            >
                              删除
                            </TableAction>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="a-list-footer a-catalog-modal__footer">
            <div className="a-summary">
              共 <b>{rows.length}</b> 个目录
            </div>
          </div>

          {error ? <div className="epf-error a-catalog-modal__error">{error}</div> : null}

          <div className="a-modal__actions">
            <button type="button" className="a-btn a-btn--primary" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除目录"
        description={
          confirmDelete
            ? `确定删除目录「${confirmDelete.name}」吗？已关联的接口将移除该目录；若无剩余目录会回退到产品默认目录。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) remove(confirmDelete);
        }}
      />
    </>
  );
}
