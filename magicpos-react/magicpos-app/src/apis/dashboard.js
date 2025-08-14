import axios from "axios";

export async function getDashboard({ range } = {}) {
  // 기간 계산 (예시: day/week/month)
  const { start, end } = getDateRange(range);

  // 여러 API를 병렬로 호출
  const [orderRes, ticketRes, topRes, worstRes] = await Promise.all([
    axios.get("/admin/sales/orders", { params: { start, end } }),
    axios.get("/admin/sales/tickets", { params: { start, end } }),
    axios.get("/admin/sales/top-products", { params: { start, end } }),
    axios.get("/admin/sales/worst-products", { params: { start, end } }),
  ]);

  // 지난 기간의 매출 데이터도 추가로 불러와서 diff 계산
  // 예시: 지난주, 지난달 등
  const prevRange = getPrevDateRange(range);
  const [prevOrderRes, prevTicketRes] = await Promise.all([
    axios.get("/admin/sales/orders", { params: { start: prevRange.start, end: prevRange.end } }),
    axios.get("/admin/sales/tickets", { params: { start: prevRange.start, end: prevRange.end } }),
  ]);
  const prevTotal =
    (prevOrderRes.data.reduce((a, b) => a + (b.productSales || 0), 0) +
      prevTicketRes.data.reduce((a, b) => a + (b.ticketSales || 0), 0));

  // diff 계산
  const total =
    (orderRes.data.reduce((a, b) => a + (b.productSales || 0), 0) +
      ticketRes.data.reduce((a, b) => a + (b.ticketSales || 0), 0));
  const diff = total - prevTotal;
  const diffText = (diff >= 0 ? "+" : "") + diff.toLocaleString() + "원";

  // 데이터 가공 (프론트 구조에 맞게)
  return {
    summary: {
      total,
      diffText,
      ticketSales: ticketRes.data.reduce((a, b) => a + (b.ticketSales || 0), 0),
      productSales: orderRes.data.reduce((a, b) => a + (b.productSales || 0), 0),
    },
    trend: {
      labels: orderRes.data.map((d) => d.date),
      product: orderRes.data.map((d) => d.productSales),
      ticket: ticketRes.data.map((d) => d.ticketSales),
    },
    topProducts: topRes.data,
    worstProducts: worstRes.data,
  };
}

function formatYmdKST(d) {
  // KST 기준 YYYY-MM-DD (간단 구현: 오프셋 9시간)
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// 기간 계산 함수 예시
function getDateRange(range = "day") {
  const now = new Date(); // 원본 보존
  let start, end;

  if (range === "day") {
    start = end = formatYmdKST(now);
  } else if (range === "week") {
    const dow = (now.getDay() + 6) % 7; // 월=0
    const first = new Date(now);
    first.setDate(now.getDate() - dow);
    start = formatYmdKST(first);
    end = formatYmdKST(now);
  } else if (range === "month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    start = formatYmdKST(first);
    end = formatYmdKST(now);
  } else {
    // fallback
    start = end = formatYmdKST(now);
  }
  return { start, end };
}

// 지난 기간 계산 함수 예시
function getPrevDateRange(range = "day") {
  const now = new Date();
  let start, end;
  if (range === "day") {
    // 지난주 오늘
    const prev = new Date(now);
    prev.setDate(now.getDate() - 7);
    start = end = formatYmdKST(prev);
  } else if (range === "week") {
    // 지난주 (7일 전 ~ 1일 전)
    const prevStart = new Date(now);
    prevStart.setDate(now.getDate() - 13); // 지난주 시작
    const prevEnd = new Date(now);
    prevEnd.setDate(now.getDate() - 7); // 지난주 끝
    start = formatYmdKST(prevStart);
    end = formatYmdKST(prevEnd);
  } else if (range === "month") {
    // 지난달
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    start = formatYmdKST(prevMonth);
    end = formatYmdKST(prevMonthEnd);
  } else {
    start = end = formatYmdKST(now);
  }
  return { start, end };
}

