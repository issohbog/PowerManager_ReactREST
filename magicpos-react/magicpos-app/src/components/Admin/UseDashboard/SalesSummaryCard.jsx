const SalesSummaryCard = ({ summary, range, onChangeRange }) => {
  if (!summary) return null; // summary가 없으면 아무것도 렌더링하지 않음

  const { total, diffText, ticketSales, productSales } = summary;

  const getDiffLabel = (range) => {
    if (range === "day") {
      // 오늘 요일 구하기
      const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const today = new Date();
      return `지난주 ${days[today.getDay()]}보다`;
    }
    if (range === "week") return "지난주보다";
    if (range === "month") return "지난달보다";
    return "";
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-range-btns">
        {["day", "week", "month"].map((t) => (
          <button
            key={t}
            onClick={() => onChangeRange(t)}
            className={`dashboard-range-btn${range === t ? " active" : ""}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div>
        <div className="dashboard-subtitle">매출 현황</div>
        <div className="dashboard-total">{total.toLocaleString()}원</div>
        <div className="dashboard-diff">
          {getDiffLabel(range)} {diffText}
        </div>
      </div>
      <div className="dashboard-legend mt-auto">
        <LegendItem colorClass="bg-cyan" label="이용권 매출" value={ticketSales} />
        <LegendItem colorClass="bg-sky" label="제품 매출" value={productSales} />
      </div>
    </div>
  );
}

function LegendItem({ colorClass, label, value }) {
  return (
    <div className="dashboard-legend-item">
      <span className={`dashboard-legend-color ${colorClass}`} />
      <span>{label}</span>
      <span>{value.toLocaleString()}원</span>
    </div>
  );
}
export default SalesSummaryCard;