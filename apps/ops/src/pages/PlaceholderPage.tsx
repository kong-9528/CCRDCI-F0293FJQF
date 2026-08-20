type Props = {
  title: string;
};

export function PlaceholderPage({ title }: Props) {
  return (
    <div className="a-card">
      <div className="a-card__head">{title}</div>
      <div className="a-placeholder">页面框架已就绪，本模块将按需求文档逐步接入。</div>
    </div>
  );
}
