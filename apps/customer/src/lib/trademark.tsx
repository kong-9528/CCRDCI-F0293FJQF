import { Fragment, type ReactNode } from "react";

/** 将字符串中的 ® 渲染为上标（页面展示用） */
export function TrademarkText({ text }: { text: string }): ReactNode {
  if (!text.includes("®")) return text;
  const parts = text.split("®");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <sup className="a-tm">®</sup> : null}
    </Fragment>
  ));
}

/** HTML 字符串中的 ® → `<sup class="a-tm">®</sup>`（勿对已包过的重复处理） */
export function trademarkHtml(html: string): string {
  return html.replace(/®/g, '<sup class="a-tm">®</sup>');
}
