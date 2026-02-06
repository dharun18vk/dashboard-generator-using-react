import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function groupBy(rows, key, valueKey) {
  const map = new Map();
  rows.forEach((row) => {
    const group = row[key];
    const value = row[valueKey];
    if (group === null || group === undefined || group === "") return;
    if (typeof value !== "number" || Number.isNaN(value)) return;
    const current = map.get(group) || 0;
    map.set(group, current + value);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function timeSeries(rows, dateKey, valueKey) {
  const map = new Map();
  rows.forEach((row) => {
    const dateValue = row[dateKey];
    const value = row[valueKey];
    if (!dateValue || typeof value !== "number" || Number.isNaN(value)) return;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;
    const label = date.toISOString().slice(0, 10);
    const current = map.get(label) || 0;
    map.set(label, current + value);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (a.name > b.name ? 1 : -1));
}

export default function Charts({
  rows,
  numericColumns,
  categoricalColumns,
  dateColumn,
  fallbackDate,
}) {
  const primaryNumeric = numericColumns[0];
  const chartItems = [];
  const fallbackMetric = numericColumns[1] || numericColumns[0];

  if (dateColumn) {
    numericColumns.forEach((metric) => {
      chartItems.push({
        type: "line",
        title: `${metric} over time (${dateColumn})`,
        data: timeSeries(rows, dateColumn, metric),
      });
    });
  }

  if (primaryNumeric) {
    categoricalColumns.forEach((dimension) => {
      chartItems.push({
        type: "bar",
        title: `${primaryNumeric} by ${dimension}`,
        data: groupBy(rows, dimension, primaryNumeric).slice(0, 12),
      });
    });
  }

  if (primaryNumeric && fallbackMetric && primaryNumeric !== fallbackMetric) {
    chartItems.push({
      type: "compare",
      title: `${primaryNumeric} vs ${fallbackMetric}`,
      data: rows
        .filter(
          (row) =>
            typeof row[primaryNumeric] === "number" &&
            typeof row[fallbackMetric] === "number"
        )
        .slice(0, 60)
        .map((row, index) => ({
          name: index + 1,
          a: row[primaryNumeric],
          b: row[fallbackMetric],
        })),
    });
  }

  const visibleCharts = chartItems.slice(0, 8);
  const showPrompt =
    numericColumns.length === 0 && categoricalColumns.length === 0 && !dateColumn;

  return (
    <div className="charts-grid">
      {visibleCharts.length ? (
        visibleCharts.map((chart) => (
          <div className="chart-card" key={chart.title}>
            <h3>{chart.title}</h3>
            {chart.data.length ? (
              <ResponsiveContainer width="100%" height={280}>
                {chart.type === "line" ? (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2b6cb0" />
                  </LineChart>
                ) : chart.type === "compare" ? (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="a" stroke="#7c3aed" />
                    <Line type="monotone" dataKey="b" stroke="#f97316" />
                  </LineChart>
                ) : (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#319795" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <p className="chart-empty">Not enough data for this chart.</p>
            )}
          </div>
        ))
      ) : (
        <div className="chart-card">
          <h3>Charts</h3>
          {showPrompt ? (
            <p className="chart-empty">
              Select numeric metrics and dimensions in the sidebar to build charts.
            </p>
          ) : (
            <p className="chart-empty">
              Select a date column{fallbackDate ? ` (suggested: ${fallbackDate})` : ""} and at least one numeric metric.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
