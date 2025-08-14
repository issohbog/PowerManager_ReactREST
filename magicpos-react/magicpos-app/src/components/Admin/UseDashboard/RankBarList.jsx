const RankBarList = ({ items = [], crown = false }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="rank-list">
      {items.map((it, idx) => {
        const mainW = `${(it.value / max) * 100}%`;
        const subW = it.subValue ? `${(it.subValue / max) * 100}%` : null;
        return (
          <div key={it.name} className="rank-item">
            <div className="rank-index">
              {crown && idx === 0
                ? <span className="rank-crown">👑</span>
                : idx + 1}
            </div>
            <span className="rank-name">{it.name}</span>
            <div className="rank-bar-area">
              <div className="rank-bar-bg">
                {subW && <div className="rank-bar-sub" style={{ width: subW }} />}
                <div className="rank-bar-main" style={{ width: mainW, backgroundColor: it.color || "#fbbf24" }} />
              </div>
              <span className="rank-bar-number" style={{ color: it.color || "#fbbf24" }}>
                {it.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RankBarList;
