type Props = {
  title: string;
  note?: string;
};

export function PlaceholderPage({ title, note }: Props) {
  return (
    <div className="a-card">
      <div className="a-card__head">{title}</div>
      <div className="a-card__body">
        <div className="a-placeholder">
          {note ?? "模块框架已预留，后续按需求文档接入。"}
        </div>
      </div>
    </div>
  );
}
