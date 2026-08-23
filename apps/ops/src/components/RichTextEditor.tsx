import { useCallback, useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type Cmd = {
  label: string;
  title: string;
  command: string;
  arg?: string;
};

const TOOLBAR: Cmd[] = [
  { label: "B", title: "加粗", command: "bold" },
  { label: "I", title: "斜体", command: "italic" },
  { label: "U", title: "下划线", command: "underline" },
  { label: "H2", title: "二级标题", command: "formatBlock", arg: "h2" },
  { label: "H3", title: "三级标题", command: "formatBlock", arg: "h3" },
  { label: "•", title: "无序列表", command: "insertUnorderedList" },
  { label: "1.", title: "有序列表", command: "insertOrderedList" },
  { label: "链", title: "插入链接", command: "createLink" },
  { label: "清", title: "清除格式", command: "removeFormat" },
];

export function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(value);

  const syncFromDom = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    if (html !== lastHtml.current) {
      lastHtml.current = html;
      onChange(html);
    }
  }, [onChange]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastHtml.current && value !== el.innerHTML) {
      el.innerHTML = value || "";
      lastHtml.current = value;
    }
  }, [value]);

  const run = (cmd: Cmd) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    if (cmd.command === "createLink") {
      const url = window.prompt("请输入链接地址", "https://");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else if (cmd.arg) {
      document.execCommand(cmd.command, false, cmd.arg);
    } else {
      document.execCommand(cmd.command, false);
    }
    syncFromDom();
  };

  return (
    <div className="a-richtext">
      <div className="a-richtext__toolbar" role="toolbar" aria-label="富文本工具栏">
        {TOOLBAR.map((cmd) => (
          <button
            key={cmd.command + (cmd.arg ?? "")}
            type="button"
            className="a-richtext__btn"
            title={cmd.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(cmd)}
          >
            {cmd.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="a-richtext__body"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={syncFromDom}
        onBlur={syncFromDom}
        suppressContentEditableWarning
      />
    </div>
  );
}
