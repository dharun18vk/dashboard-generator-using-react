export default function KPI({ label, value }) {
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
