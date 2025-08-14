import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SalesTrendChart = ({ trend }) => {
  if (!trend) return null; // trend가 없으면 렌더링하지 않음

  const data = {
    labels: trend.labels,
    datasets: [
      {
        label: "제품 매출",
        data: trend.product,
        backgroundColor: "#60a5fa",
        borderRadius: 6,
        barThickness: 10,
      },
      {
        label: "이용권 매출",
        data: trend.ticket,
        backgroundColor: "#22d3ee",
        borderRadius: 6,
        barThickness: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#cbd5e1" } },
      tooltip: { mode: "index", intersect: false },
    },
  };

  return (
    <div className="dashboard-chart">
      <Bar data={data} options={options} />
    </div>
  );
}

export default SalesTrendChart;