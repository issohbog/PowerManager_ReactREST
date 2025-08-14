import { useCallback, useEffect, useState } from "react";
import { getDashboard } from '../../apis/dashboard';
import SalesSummaryCard from "../../components/Admin/UseDashboard/SalesSummaryCard";
import Section from "../../components/Admin/UseDashboard/Section";
import RankBarList from "../../components/Admin/UseDashboard/RankBarList";
import SalesTrendChart from "../../components/Admin/UseDashboard/SalesTrendChart";

const UseDashboardContainer = () => {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("day");
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [top, setTop] = useState([]);
  const [worst, setWorst] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboard({ range });
      setSummary(data.summary);
      setTrend(data.trend);
      setTop(data.topProducts);
      setWorst(data.worstProducts);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  // 색상 배열을 만들고, top/worst 데이터에 색상을 입혀서 RankBarList에 전달
  const colorList = ["#fbbf24", "#60a5fa", "#34d399"]; // 노랑, 파랑, 초록

  const coloredTop = top.map((it, idx) => ({
    ...it,
    color: colorList[idx] || "#d1d5db",
  }));
  const coloredWorst = worst.map((it, idx) => ({
    ...it,
    color: colorList[idx] || "#d1d5db",
  }));

  return (
    <div className="dashboard-content">
      <div className="dashboard-bg">
          <div className="dashboard-group">
            <div className="dashboard-summary">
              <SalesSummaryCard summary={summary} range={range} onChangeRange={setRange} />
            </div>
            <div className="dashboard-trend">
              <Section title="매출 추이">
                <SalesTrendChart trend={trend} />
              </Section>
            </div>
          </div>
          <div className="dashboard-top">
            <Section title="메뉴 판매량 TOP 3">
              <RankBarList items={coloredTop} crown />
            </Section>
          </div>
          <div className="dashboard-worst">
            <Section title="메뉴 판매량 WORST 3">
              <RankBarList items={coloredWorst} />
            </Section>
          </div>
      </div>
    </div>
  );
}
export default UseDashboardContainer;