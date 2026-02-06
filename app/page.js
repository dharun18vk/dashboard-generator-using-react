"use client";

import { useMemo, useState } from "react";
import KPI from "../components/KPI";
import Charts from "../components/Charts";
import DataTable from "../components/DataTable";
import AutoTables from "../components/AutoTables";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";

const MAX_TABLE_ROWS = 200;

function inferColumnTypes(rows, columns) {
  const stats = columns.map((col) => ({ col, numeric: 0, total: 0 }));
  rows.forEach((row) => {
    stats.forEach((s) => {
      const value = row[s.col];
      if (value === null || value === undefined || value === "") return;
      s.total += 1;
      if (typeof value === "number" && !Number.isNaN(value)) s.numeric += 1;
    });
  });
  const numericColumns = stats
    .filter((s) => s.total > 0 && s.numeric / s.total >= 0.7)
    .map((s) => s.col);
  const categoricalColumns = columns.filter((c) => !numericColumns.includes(c));
  return { numericColumns, categoricalColumns };
}

function inferDateColumn(rows, columns) {
  const nameHint = columns.find((c) => c.toLowerCase().includes("date"));
  if (nameHint) return nameHint;
  for (const col of columns) {
    let parseable = 0;
    let total = 0;
    for (const row of rows.slice(0, 50)) {
      const value = row[col];
      if (!value) continue;
      total += 1;
      const time = Date.parse(value);
      if (!Number.isNaN(time)) parseable += 1;
    }
    if (total > 0 && parseable / total >= 0.7) return col;
  }
  return null;
}

function computeKPIs(rows, numericColumns, categoricalColumns) {
  const primaryNumeric = numericColumns[0];
  const primaryCategory = categoricalColumns[0];
  let sum = 0;
  let count = 0;
  rows.forEach((row) => {
    const value = primaryNumeric ? row[primaryNumeric] : null;
    if (typeof value === "number" && !Number.isNaN(value)) {
      sum += value;
      count += 1;
    }
  });
  const avg = count > 0 ? sum / count : 0;
  const distinct = new Set();
  if (primaryCategory) {
    rows.forEach((row) => {
      const value = row[primaryCategory];
      if (value !== null && value !== undefined && value !== "") distinct.add(value);
    });
  }
  return {
    rowCount: rows.length,
    sum,
    avg,
    distinctCount: distinct.size,
    primaryNumeric,
    primaryCategory,
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataset, setDataset] = useState({ columns: [], rows: [] });
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedNumeric, setSelectedNumeric] = useState([]);
  const [selectedCategorical, setSelectedCategorical] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const { numericColumns, categoricalColumns, dateColumn, kpis } = useMemo(() => {
    const columns = dataset.columns || [];
    const rows = dataset.rows || [];
    const types = inferColumnTypes(rows, columns);
    const date = inferDateColumn(rows, columns);
    const kpiValues = computeKPIs(rows, types.numericColumns, types.categoricalColumns);
    return {
      numericColumns: types.numericColumns,
      categoricalColumns: types.categoricalColumns,
      dateColumn: date,
      kpis: kpiValues,
    };
  }, [dataset]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Upload failed");
      }
      setDataset({ columns: payload.columns, rows: payload.rows });
      setSelectedColumns(payload.columns);
      setSelectedNumeric(typesafeNumeric(payload.rows, payload.columns));
      setSelectedCategorical(typesafeCategorical(payload.rows, payload.columns));
      setSelectedDate(typesafeDate(payload.rows, payload.columns));
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  function typesafeNumeric(rows, columns) {
    return inferColumnTypes(rows, columns).numericColumns;
  }

  function typesafeCategorical(rows, columns) {
    return inferColumnTypes(rows, columns).categoricalColumns;
  }

  function typesafeDate(rows, columns) {
    return inferDateColumn(rows, columns) || "";
  }

  const handleToggleColumn = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((item) => item !== column)
        : [...prev, column]
    );
  };

  const handleToggleNumeric = (column) => {
    setSelectedNumeric((prev) =>
      prev.includes(column)
        ? prev.filter((item) => item !== column)
        : [...prev, column]
    );
  };

  const handleToggleCategorical = (column) => {
    setSelectedCategorical((prev) =>
      prev.includes(column)
        ? prev.filter((item) => item !== column)
        : [...prev, column]
    );
  };

  const handleSelectDate = (column) => {
    setSelectedDate(column);
  };

  const selectedRows = useMemo(() => {
    if (!selectedColumns.length) return [];
    return dataset.rows.map((row) => {
      const next = {};
      selectedColumns.forEach((col) => {
        next[col] = row[col];
      });
      return next;
    });
  }, [dataset.rows, selectedColumns]);

  return (
    <main className="dashboard">
      <Sidebar
        columns={dataset.columns}
        selectedColumns={selectedColumns}
        onToggleColumn={handleToggleColumn}
        numericColumns={numericColumns}
        categoricalColumns={categoricalColumns}
        selectedNumeric={selectedNumeric}
        selectedCategorical={selectedCategorical}
        selectedDate={selectedDate}
        onToggleNumeric={handleToggleNumeric}
        onToggleCategorical={handleToggleCategorical}
        onSelectDate={handleSelectDate}
      />
      <div className="main-content">
        <section className="hero">
          <div>
            <p className="eyebrow">CSV Analytics Pipeline</p>
            <h1>Power BI-style dashboard in Next.js</h1>
            <p className="subhead">
              Upload a CSV and get KPIs, charts, and a searchable table through a
              clean API pipeline.
            </p>
          </div>
          <div className="upload-card">
            <label className="upload-label" htmlFor="csv-upload">
              {loading ? "Processing..." : "Upload CSV"}
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleUpload}
              disabled={loading}
            />
            <p className="upload-hint">CSV with headers required.</p>
            {error ? <p className="error">{error}</p> : null}
          </div>
        </section>

        <section className="kpi-grid">
          <KPI label="Rows" value={kpis.rowCount} />
          <KPI
            label={`Sum${kpis.primaryNumeric ? ` (${kpis.primaryNumeric})` : ""}`}
            value={kpis.primaryNumeric ? kpis.sum : "-"}
          />
          <KPI
            label={`Average${kpis.primaryNumeric ? ` (${kpis.primaryNumeric})` : ""}`}
            value={kpis.primaryNumeric ? kpis.avg : "-"}
          />
          <KPI
            label={`Distinct${kpis.primaryCategory ? ` (${kpis.primaryCategory})` : ""}`}
            value={kpis.primaryCategory ? kpis.distinctCount : "-"}
          />
        </section>

        <section className="charts-section">
          <Charts
            rows={dataset.rows}
            numericColumns={selectedNumeric}
            categoricalColumns={selectedCategorical}
            dateColumn={selectedDate}
            fallbackDate={dateColumn}
          />
        </section>

        <section className="table-section">
          <div className="table-card">
            <h3>Selected Columns Table</h3>
            <DataTable
              columns={selectedColumns}
              rows={selectedRows.slice(0, MAX_TABLE_ROWS)}
            />
          </div>
          <AutoTables
            rows={dataset.rows}
            numericColumns={numericColumns}
            categoricalColumns={categoricalColumns}
            dateColumn={dateColumn}
          />
          <div className="table-card">
            <h3>Full Dataset</h3>
            <DataTable
              columns={dataset.columns}
              rows={dataset.rows.slice(0, MAX_TABLE_ROWS)}
            />
            {dataset.rows.length > MAX_TABLE_ROWS ? (
              <p className="table-footnote">
                Showing first {MAX_TABLE_ROWS} rows for performance.
              </p>
            ) : null}
          </div>
        </section>
      </div>
      <Chatbot rows={dataset.rows} columns={dataset.columns} />
    </main>
  );
}

