import { useMemo } from "react";

function getNumericStats(rows, column) {
  let count = 0;
  let sum = 0;
  let min = null;
  let max = null;

  rows.forEach((row) => {
    const value = row[column];
    if (typeof value !== "number" || Number.isNaN(value)) return;
    count += 1;
    sum += value;
    if (min === null || value < min) min = value;
    if (max === null || value > max) max = value;
  });

  return {
    column,
    count,
    sum,
    avg: count > 0 ? sum / count : 0,
    min,
    max,
  };
}

function getCategoryCounts(rows, column) {
  const map = new Map();
  rows.forEach((row) => {
    const value = row[column];
    if (value === null || value === undefined || value === "") return;
    const key = String(value);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getDateStats(rows, column) {
  let min = null;
  let max = null;
  let count = 0;

  rows.forEach((row) => {
    const value = row[column];
    if (!value) return;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    count += 1;
    if (!min || date < min) min = date;
    if (!max || date > max) max = date;
  });

  return {
    count,
    min: min ? min.toISOString().slice(0, 10) : "-",
    max: max ? max.toISOString().slice(0, 10) : "-",
  };
}

export default function AutoTables({
  rows,
  numericColumns,
  categoricalColumns,
  dateColumn,
}) {
  const numericStats = useMemo(
    () => numericColumns.map((col) => getNumericStats(rows, col)),
    [rows, numericColumns]
  );

  const categoricalStats = useMemo(
    () =>
      categoricalColumns.map((col) => ({
        column: col,
        values: getCategoryCounts(rows, col),
      })),
    [rows, categoricalColumns]
  );

  const dateStats = useMemo(
    () => (dateColumn ? getDateStats(rows, dateColumn) : null),
    [rows, dateColumn]
  );

  if (!rows.length) {
    return (
      <div className="table-card">
        <h3>Column Tables</h3>
        <p className="chart-empty">Upload a CSV to generate column tables.</p>
      </div>
    );
  }

  return (
    <div className="auto-grid">
      {dateColumn ? (
        <div className="table-card">
          <h3>Date Summary ({dateColumn})</h3>
          <table>
            <thead>
              <tr>
                <th>Count</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{dateStats?.count ?? 0}</td>
                <td>{dateStats?.min ?? "-"}</td>
                <td>{dateStats?.max ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {numericStats.map((stats) => (
        <div className="table-card" key={stats.column}>
          <h3>Numeric Summary ({stats.column})</h3>
          <table className="numeric-table">
            <thead>
              <tr>
                <th>Count</th>
                <th>Sum</th>
                <th>Avg</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stats.count.toLocaleString()}</td>
                <td>{stats.sum.toLocaleString()}</td>
                <td>{stats.avg.toLocaleString()}</td>
                <td>{stats.min ?? "-"}</td>
                <td>{stats.max ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {categoricalStats.map((group) => (
        <div className="table-card" key={group.column}>
          <h3>Top Values ({group.column})</h3>
          {group.values.length ? (
            <table>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {group.values.map((item) => (
                  <tr key={item.value}>
                    <td>{item.value}</td>
                    <td>{item.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="chart-empty">No values found.</p>
          )}
        </div>
      ))}
    </div>
  );
}
