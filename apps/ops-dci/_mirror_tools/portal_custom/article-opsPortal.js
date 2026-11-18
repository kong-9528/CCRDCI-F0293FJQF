(() => {
  try {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = new URL("../css/article-opsPortal.css", import.meta.url).href;
    document.head.appendChild(l);
  } catch {}
})();
import {
  C as createElementVNode,
  D as createVNode,
  E as createTextVNode,
  O as defineComponent,
  Q as resolveDirective,
  S as createCommentVNode,
  W as onMounted,
  Z as resolveComponent,
  _t as reactive,
  an as toDisplayString,
  b as createBaseVNode,
  ct as withDirectives,
  d as withKeys,
  q as openBlock,
  st as withCtx,
  u as vShow,
  x as createBlock,
  yt as ref,
} from "./vue-runtime-ops-shim.js";
import { t as ElMessage } from "./portal-message-shim.js";
import { R as ElMessageBox } from "./portal-msgbox-shim.js";
import { t as _export_sfc } from "./_plugin-vue_export-helper-BDNMzG2s.js";
import {
  d as saveArticle,
  r as delArticle,
  s as listArticle,
  t as auditArticle,
} from "./portal-api-ops.js";

function stripHtml(html) {
  if (html == null || html === "") return "";
  const d = document.createElement("div");
  d.innerHTML = String(html);
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

const _hoisted_app = { class: "app-container" };
const _hoisted_title = { style: { "font-weight": "600", color: "#1d2129" } };
const _hoisted_plain = { style: { color: "#4e5969" } };
const _hoisted_sub = { key: 1, class: "subpage-view" };
const _hoisted_header = { class: "subpage-header-bar" };
const _hoisted_divider = { class: "header-divider" };
const _hoisted_subTitle = { class: "subpage-title" };
const _hoisted_content = { class: "subpage-content" };
const _hoisted_card = { class: "card-section" };
const _hoisted_footer = { class: "subpage-footer-bar" };

const Component = defineComponent({
  __name: "index",
  setup() {
    const showSearch = ref(true);
    const loading = ref(false);
    const submitting = ref(false);
    const rows = ref([]);
    const total = ref(0);
    const viewMode = ref("list");
    const pageTitle = ref("");
    const formRef = ref();
    const query = reactive({
      pageNum: 1,
      pageSize: 10,
      category: "FAQ",
      title: "",
      status: "",
      auditStatus: "",
    });
    const form = reactive({
      id: undefined,
      category: "FAQ",
      title: "",
      content: "",
      sortOrder: 1,
      status: "DRAFT",
      auditStatus: "PENDING",
    });
    const rules = {
      category: [{ required: true, message: "请选择内容类别", trigger: "change" }],
      title: [{ required: true, message: "请输入提问标题", trigger: "blur" }],
      content: [
        {
          required: true,
          validator: (_r, v, cb) => {
            if (!stripHtml(v)) cb(new Error("请输入解答内容"));
            else cb();
          },
          trigger: "blur",
        },
      ],
      sortOrder: [{ required: true, message: "请输入排序序号", trigger: "blur" }],
    };

    function getList() {
      loading.value = true;
      listArticle(query)
        .then((res) => {
          rows.value = res.rows || [];
          total.value = res.total || 0;
        })
        .finally(() => {
          loading.value = false;
        });
    }
    function handleQuery() {
      query.pageNum = 1;
      getList();
    }
    function resetQuery() {
      query.title = "";
      query.status = "";
      query.auditStatus = "";
      handleQuery();
    }
    function resetForm() {
      form.id = undefined;
      form.category = "FAQ";
      form.title = "";
      form.content = "";
      form.sortOrder = 1;
      form.status = "DRAFT";
      form.auditStatus = "PENDING";
      formRef.value && formRef.value.resetFields();
    }
    function openAdd() {
      resetForm();
      pageTitle.value = "新增问答 / 文章";
      viewMode.value = "form";
    }
    function openEdit(row) {
      resetForm();
      pageTitle.value = "修改问答 / 文章";
      Object.assign(form, row);
      viewMode.value = "form";
    }
    function backToList() {
      viewMode.value = "list";
      resetForm();
    }
    function submitForm() {
      formRef.value &&
        formRef.value.validate((ok) => {
          if (!ok) return;
          submitting.value = true;
          saveArticle(form)
            .then(() => {
              ElMessage.success("保存成功");
              viewMode.value = "list";
              getList();
            })
            .finally(() => {
              submitting.value = false;
            });
        });
    }
    function handleAudit(row, status) {
      const tip =
        status === "PUBLISHED" ? "审核通过并立即发布" : "执行下线";
      ElMessageBox.confirm(`确定要对问答【${row.title}】${tip}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: status === "PUBLISHED" ? "success" : "warning",
      }).then(() => {
        auditArticle(row.id, status).then(() => {
          ElMessage.success(`${tip}成功`);
          getList();
        });
      });
    }
    function handleDelete(row) {
      ElMessageBox.confirm(`确定要删除问答【${row.title}】吗？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        delArticle(row.id).then(() => {
          ElMessage.success("删除成功");
          getList();
        });
      });
    }

    onMounted(() => {
      getList();
    });

    return (_ctx, _cache) => {
      const ElOption = resolveComponent("el-option");
      const ElSelect = resolveComponent("el-select");
      const ElFormItem = resolveComponent("el-form-item");
      const ElInput = resolveComponent("el-input");
      const ElButton = resolveComponent("el-button");
      const ElForm = resolveComponent("el-form");
      const ElCol = resolveComponent("el-col");
      const ElRow = resolveComponent("el-row");
      const ElTableColumn = resolveComponent("el-table-column");
      const ElTag = resolveComponent("el-tag");
      const ElTable = resolveComponent("el-table");
      const Pagination = resolveComponent("pagination");
      const ElInputNumber = resolveComponent("el-input-number");
      const ElAlert = resolveComponent("el-alert");
      const Editor = resolveComponent("Editor");
      const hasPermi = resolveDirective("hasPermi");
      const loadingDir = resolveDirective("loading");

      return (
        openBlock(),
        createBaseVNode("div", _hoisted_app, [
          viewMode.value === "list"
            ? (openBlock(),
              createBaseVNode(
                "div",
                { key: 0 },
                [
                  withDirectives(
                    createVNode(
                      ElForm,
                      {
                        model: query,
                        ref: "queryRef",
                        inline: true,
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ElFormItem,
                            { label: "内容类别", prop: "category" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElSelect,
                                  {
                                    modelValue: query.category,
                                    "onUpdate:modelValue":
                                      _cache[0] ||
                                      (_cache[0] = (v) => (query.category = v)),
                                    placeholder: "全部类别",
                                    style: { width: "160px" },
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(ElOption, {
                                        label: "常见问题 (FAQ)",
                                        value: "FAQ",
                                      }),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "标题/提问", prop: "title" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElInput,
                                  {
                                    modelValue: query.title,
                                    "onUpdate:modelValue":
                                      _cache[1] ||
                                      (_cache[1] = (v) => (query.title = v)),
                                    placeholder: "请输入问答标题或关键词",
                                    clearable: "",
                                    style: { width: "220px" },
                                    onKeyup: withKeys(handleQuery, ["enter"]),
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "发布状态", prop: "status" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElSelect,
                                  {
                                    modelValue: query.status,
                                    "onUpdate:modelValue":
                                      _cache[2] ||
                                      (_cache[2] = (v) => (query.status = v)),
                                    placeholder: "全部状态",
                                    clearable: "",
                                    style: { width: "140px" },
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(ElOption, {
                                        label: "已发布",
                                        value: "PUBLISHED",
                                      }),
                                      createVNode(ElOption, {
                                        label: "草稿",
                                        value: "DRAFT",
                                      }),
                                      createVNode(ElOption, {
                                        label: "已下线",
                                        value: "OFFLINE",
                                      }),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "审批状态", prop: "auditStatus" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElSelect,
                                  {
                                    modelValue: query.auditStatus,
                                    "onUpdate:modelValue":
                                      _cache[3] ||
                                      (_cache[3] = (v) =>
                                        (query.auditStatus = v)),
                                    placeholder: "全部审批状态",
                                    clearable: "",
                                    style: { width: "140px" },
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(ElOption, {
                                        label: "审批通过",
                                        value: "PASS",
                                      }),
                                      createVNode(ElOption, {
                                        label: "待审批",
                                        value: "PENDING",
                                      }),
                                      createVNode(ElOption, {
                                        label: "已驳回",
                                        value: "REJECT",
                                      }),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            null,
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElButton,
                                  {
                                    type: "primary",
                                    icon: "Search",
                                    onClick: handleQuery,
                                  },
                                  {
                                    default: withCtx(
                                      () =>
                                        _cache[12] ||
                                        (_cache[12] = [
                                          createTextVNode("搜索", -1),
                                        ]),
                                    ),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  ElButton,
                                  { icon: "Refresh", onClick: resetQuery },
                                  {
                                    default: withCtx(
                                      () =>
                                        _cache[13] ||
                                        (_cache[13] = [
                                          createTextVNode("重置", -1),
                                        ]),
                                    ),
                                    _: 1,
                                  },
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["model"],
                    ),
                    [[vShow, showSearch.value]],
                  ),
                  createVNode(
                    ElRow,
                    { gutter: 10, class: "mb8" },
                    {
                      default: withCtx(() => [
                        createVNode(
                          ElCol,
                          { span: 1.5 },
                          {
                            default: withCtx(() => [
                              withDirectives(
                                (openBlock(),
                                createBlock(
                                  ElButton,
                                  {
                                    type: "primary",
                                    plain: "",
                                    icon: "Plus",
                                    onClick: openAdd,
                                  },
                                  {
                                    default: withCtx(
                                      () =>
                                        _cache[14] ||
                                        (_cache[14] = [
                                          createTextVNode("新增文章/问答", -1),
                                        ]),
                                    ),
                                    _: 1,
                                  },
                                )),
                                [[hasPermi, ["dci:portal:article:edit"]]],
                              ),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    },
                  ),
                  withDirectives(
                    (openBlock(),
                    createBlock(
                      ElTable,
                      { data: rows.value, border: "" },
                      {
                        default: withCtx(() => [
                          createVNode(ElTableColumn, {
                            label: "排序",
                            prop: "sortOrder",
                            width: "70",
                            align: "center",
                          }),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "内容类别",
                              width: "130",
                              align: "center",
                            },
                            {
                              default: withCtx(({ row }) => [
                                row.category === "FAQ"
                                  ? (openBlock(),
                                    createBlock(
                                      ElTag,
                                      { key: 0, type: "info" },
                                      {
                                        default: withCtx(
                                          () =>
                                            _cache[15] ||
                                            (_cache[15] = [
                                              createTextVNode("常见问题", -1),
                                            ]),
                                        ),
                                        _: 1,
                                      },
                                    ))
                                  : (openBlock(),
                                    createBlock(
                                      ElTag,
                                      { key: 1 },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(
                                            toDisplayString(row.category),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    )),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "标题 / 提问 (Q)",
                              prop: "title",
                              "min-width": "200",
                              "show-overflow-tooltip": true,
                            },
                            {
                              default: withCtx(({ row }) => [
                                createElementVNode(
                                  "span",
                                  _hoisted_title,
                                  toDisplayString(row.title),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "内容 / 解答 (A)",
                              prop: "content",
                              "min-width": "320",
                              "show-overflow-tooltip": true,
                            },
                            {
                              default: withCtx(({ row }) => [
                                createElementVNode(
                                  "span",
                                  _hoisted_plain,
                                  toDisplayString(stripHtml(row.content)),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "审批状态",
                              width: "110",
                              align: "center",
                            },
                            {
                              default: withCtx(({ row }) => [
                                row.auditStatus === "PASS"
                                  ? (openBlock(),
                                    createBlock(
                                      ElTag,
                                      { key: 0, type: "success" },
                                      {
                                        default: withCtx(
                                          () =>
                                            _cache[16] ||
                                            (_cache[16] = [
                                              createTextVNode("审批通过", -1),
                                            ]),
                                        ),
                                        _: 1,
                                      },
                                    ))
                                  : row.auditStatus === "PENDING"
                                    ? (openBlock(),
                                      createBlock(
                                        ElTag,
                                        { key: 1, type: "warning" },
                                        {
                                          default: withCtx(
                                            () =>
                                              _cache[17] ||
                                              (_cache[17] = [
                                                createTextVNode("待审批", -1),
                                              ]),
                                          ),
                                          _: 1,
                                        },
                                      ))
                                    : row.auditStatus === "REJECT"
                                      ? (openBlock(),
                                        createBlock(
                                          ElTag,
                                          { key: 2, type: "danger" },
                                          {
                                            default: withCtx(
                                              () =>
                                                _cache[18] ||
                                                (_cache[18] = [
                                                  createTextVNode("已驳回", -1),
                                                ]),
                                            ),
                                            _: 1,
                                          },
                                        ))
                                      : (openBlock(),
                                        createBaseVNode(
                                          "span",
                                          { key: 3 },
                                          toDisplayString(row.auditStatus),
                                          1,
                                        )),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "发布状态",
                              width: "110",
                              align: "center",
                            },
                            {
                              default: withCtx(({ row }) => [
                                row.status === "PUBLISHED"
                                  ? (openBlock(),
                                    createBlock(
                                      ElTag,
                                      {
                                        key: 0,
                                        type: "success",
                                        effect: "dark",
                                      },
                                      {
                                        default: withCtx(
                                          () =>
                                            _cache[19] ||
                                            (_cache[19] = [
                                              createTextVNode("已发布", -1),
                                            ]),
                                        ),
                                        _: 1,
                                      },
                                    ))
                                  : row.status === "DRAFT"
                                    ? (openBlock(),
                                      createBlock(
                                        ElTag,
                                        { key: 1, type: "info" },
                                        {
                                          default: withCtx(
                                            () =>
                                              _cache[20] ||
                                              (_cache[20] = [
                                                createTextVNode("草稿", -1),
                                              ]),
                                          ),
                                          _: 1,
                                        },
                                      ))
                                    : row.status === "OFFLINE"
                                      ? (openBlock(),
                                        createBlock(
                                          ElTag,
                                          { key: 2, type: "danger" },
                                          {
                                            default: withCtx(
                                              () =>
                                                _cache[21] ||
                                                (_cache[21] = [
                                                  createTextVNode("已下线", -1),
                                                ]),
                                            ),
                                            _: 1,
                                          },
                                        ))
                                      : (openBlock(),
                                        createBaseVNode(
                                          "span",
                                          { key: 3 },
                                          toDisplayString(row.status),
                                          1,
                                        )),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElTableColumn,
                            {
                              label: "操作",
                              width: "220",
                              align: "center",
                              fixed: "right",
                            },
                            {
                              default: withCtx(({ row }) => [
                                withDirectives(
                                  (openBlock(),
                                  createBlock(
                                    ElButton,
                                    {
                                      link: "",
                                      type: "primary",
                                      icon: "Edit",
                                      onClick: () => openEdit(row),
                                    },
                                    {
                                      default: withCtx(
                                        () =>
                                          _cache[22] ||
                                          (_cache[22] = [
                                            createTextVNode("修改", -1),
                                          ]),
                                      ),
                                      _: 1,
                                    },
                                    8,
                                    ["onClick"],
                                  )),
                                  [[hasPermi, ["dci:portal:article:edit"]]],
                                ),
                                row.status !== "PUBLISHED" ||
                                row.auditStatus !== "PASS"
                                  ? withDirectives(
                                      (openBlock(),
                                      createBlock(
                                        ElButton,
                                        {
                                          key: 0,
                                          link: "",
                                          type: "success",
                                          icon: "Check",
                                          onClick: () =>
                                            handleAudit(row, "PUBLISHED"),
                                        },
                                        {
                                          default: withCtx(
                                            () =>
                                              _cache[23] ||
                                              (_cache[23] = [
                                                createTextVNode("审核发布", -1),
                                              ]),
                                          ),
                                          _: 1,
                                        },
                                        8,
                                        ["onClick"],
                                      )),
                                      [[hasPermi, ["dci:portal:article:audit"]]],
                                    )
                                  : createCommentVNode("", true),
                                row.status === "PUBLISHED"
                                  ? withDirectives(
                                      (openBlock(),
                                      createBlock(
                                        ElButton,
                                        {
                                          key: 1,
                                          link: "",
                                          type: "warning",
                                          icon: "Close",
                                          onClick: () =>
                                            handleAudit(row, "OFFLINE"),
                                        },
                                        {
                                          default: withCtx(
                                            () =>
                                              _cache[24] ||
                                              (_cache[24] = [
                                                createTextVNode("下线", -1),
                                              ]),
                                          ),
                                          _: 1,
                                        },
                                        8,
                                        ["onClick"],
                                      )),
                                      [[hasPermi, ["dci:portal:article:audit"]]],
                                    )
                                  : createCommentVNode("", true),
                                withDirectives(
                                  (openBlock(),
                                  createBlock(
                                    ElButton,
                                    {
                                      link: "",
                                      type: "danger",
                                      icon: "Delete",
                                      onClick: () => handleDelete(row),
                                    },
                                    {
                                      default: withCtx(
                                        () =>
                                          _cache[25] ||
                                          (_cache[25] = [
                                            createTextVNode("删除", -1),
                                          ]),
                                      ),
                                      _: 1,
                                    },
                                    8,
                                    ["onClick"],
                                  )),
                                  [[hasPermi, ["dci:portal:article:remove"]]],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["data"],
                    )),
                    [[loadingDir, loading.value]],
                  ),
                  withDirectives(
                    createVNode(
                      Pagination,
                      {
                        total: total.value,
                        page: query.pageNum,
                        "onUpdate:page":
                          _cache[4] ||
                          (_cache[4] = (v) => (query.pageNum = v)),
                        limit: query.pageSize,
                        "onUpdate:limit":
                          _cache[5] ||
                          (_cache[5] = (v) => (query.pageSize = v)),
                        onPagination: getList,
                      },
                      null,
                      8,
                      ["total", "page", "limit"],
                    ),
                    [[vShow, total.value > 0]],
                  ),
                ],
              ))
            : (openBlock(),
              createBaseVNode("div", _hoisted_sub, [
                createElementVNode("div", _hoisted_header, [
                  createVNode(
                    ElButton,
                    {
                      class: "back-btn",
                      link: "",
                      type: "primary",
                      icon: "ArrowLeft",
                      onClick: backToList,
                    },
                    {
                      default: withCtx(
                        () =>
                          _cache[28] ||
                          (_cache[28] = [createTextVNode("返回", -1)]),
                      ),
                      _: 1,
                    },
                  ),
                  createElementVNode("span", _hoisted_divider),
                  createElementVNode(
                    "span",
                    _hoisted_subTitle,
                    toDisplayString(pageTitle.value),
                    1,
                  ),
                ]),
                createElementVNode("div", _hoisted_content, [
                  createElementVNode("div", _hoisted_card, [
                    createVNode(
                      ElForm,
                      {
                        ref_key: "formRef",
                        ref: formRef,
                        model: form,
                        rules,
                        "label-width": "100px",
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ElFormItem,
                            { label: "所属类别", prop: "category" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElSelect,
                                  {
                                    modelValue: form.category,
                                    "onUpdate:modelValue":
                                      _cache[6] ||
                                      (_cache[6] = (v) =>
                                        (form.category = v)),
                                    style: { width: "100%" },
                                    disabled: "",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(ElOption, {
                                        label: "常见问题 (FAQ)",
                                        value: "FAQ",
                                      }),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "标题/提问", prop: "title" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElInput,
                                  {
                                    modelValue: form.title,
                                    "onUpdate:modelValue":
                                      _cache[7] ||
                                      (_cache[7] = (v) => (form.title = v)),
                                    placeholder:
                                      "请输入问题标题（如：什么是 DCI 数字版权唯一标识符？）",
                                    maxlength: "200",
                                    "show-word-limit": "",
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "内容/解答", prop: "content" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Editor,
                                  {
                                    modelValue: form.content,
                                    "onUpdate:modelValue":
                                      _cache[8] ||
                                      (_cache[8] = (v) => (form.content = v)),
                                    minHeight: 280,
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ElFormItem,
                            { label: "排序序号", prop: "sortOrder" },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ElInputNumber,
                                  {
                                    modelValue: form.sortOrder,
                                    "onUpdate:modelValue":
                                      _cache[9] ||
                                      (_cache[9] = (v) =>
                                        (form.sortOrder = v)),
                                    min: 1,
                                    max: 999,
                                    style: { width: "200px" },
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(ElAlert, {
                            title:
                              "提示：新增或修改的内容默认进入待审批状态，需具备审批权限的人员点击【审核发布】后才会在门户前台展示。",
                            type: "info",
                            closable: false,
                            "show-icon": "",
                          }),
                        ]),
                        _: 1,
                      },
                      8,
                      ["model", "rules"],
                    ),
                    createElementVNode("div", _hoisted_footer, [
                      createVNode(
                        ElButton,
                        {
                          type: "primary",
                          loading: submitting.value,
                          onClick: submitForm,
                        },
                        {
                          default: withCtx(
                            () =>
                              _cache[26] ||
                              (_cache[26] = [createTextVNode("提 交", -1)]),
                          ),
                          _: 1,
                        },
                        8,
                        ["loading"],
                      ),
                      createVNode(
                        ElButton,
                        { onClick: backToList },
                        {
                          default: withCtx(
                            () =>
                              _cache[27] ||
                              (_cache[27] = [createTextVNode("取 消", -1)]),
                          ),
                          _: 1,
                        },
                      ),
                    ]),
                  ]),
                ]),
              ])),
        ])
      );
    };
  },
});

const P = _export_sfc(Component, [["__scopeId", "data-v-94d78f39"]]);
export { P as default };
