import { useMemo, useState } from "react";

export default function DataTable({ columns, rows }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return rows;
    const lower = query.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const value = row[col];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lower);
      })
    );
  }, [query, rows, columns]);

  if (!columns.length) {
    return (
      <div className="table-empty">
        <p>Upload a CSV to populate the data table.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-header">
        <div>
          <h3>Data Table</h3>
          <p className="table-meta">{filtered.length.toLocaleString()} rows</p>
        </div>
        <input
          className="table-search"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col}>{row[col]?.toString() || ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
