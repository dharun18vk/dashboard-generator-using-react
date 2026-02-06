export default function Sidebar({
  columns,
  selectedColumns,
  onToggleColumn,
  numericColumns,
  categoricalColumns,
  selectedNumeric,
  selectedCategorical,
  selectedDate,
  onToggleNumeric,
  onToggleCategorical,
  onSelectDate,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="eyebrow">Headers</p>
        <h2>Fields</h2>
        <p className="sidebar-subhead">
          Select headers and build charts from chosen fields.
        </p>
      </div>
      <div className="sidebar-list">
        {columns.length ? (
          columns.map((column) => (
            <label className="sidebar-item" key={column}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={() => onToggleColumn(column)}
              />
              <span>{column}</span>
            </label>
          ))
        ) : (
          <p className="sidebar-empty">Upload a CSV to see headers.</p>
        )}
      </div>
      <div className="sidebar-section">
        <h3>Metrics (Numeric)</h3>
        {numericColumns.length ? (
          numericColumns.map((column) => (
            <label className="sidebar-item" key={column}>
              <input
                type="checkbox"
                checked={selectedNumeric.includes(column)}
                onChange={() => onToggleNumeric(column)}
              />
              <span>{column}</span>
            </label>
          ))
        ) : (
          <p className="sidebar-empty">No numeric columns detected.</p>
        )}
      </div>
      <div className="sidebar-section">
        <h3>Dimensions (Categorical)</h3>
        {categoricalColumns.length ? (
          categoricalColumns.map((column) => (
            <label className="sidebar-item" key={column}>
              <input
                type="checkbox"
                checked={selectedCategorical.includes(column)}
                onChange={() => onToggleCategorical(column)}
              />
              <span>{column}</span>
            </label>
          ))
        ) : (
          <p className="sidebar-empty">No categorical columns detected.</p>
        )}
      </div>
      <div className="sidebar-section">
        <h3>Date Column</h3>
        {columns.length ? (
          <>
            <label className="sidebar-item" key="date-none">
              <input
                type="radio"
                name="date-column"
                checked={!selectedDate}
                onChange={() => onSelectDate("")}
              />
              <span>None</span>
            </label>
            {columns.map((column) => (
              <label className="sidebar-item" key={`date-${column}`}>
                <input
                  type="radio"
                  name="date-column"
                  checked={selectedDate === column}
                  onChange={() => onSelectDate(column)}
                />
                <span>{column}</span>
              </label>
            ))}
          </>
        ) : (
          <p className="sidebar-empty">Upload a CSV to set a date column.</p>
        )}
      </div>
    </aside>
  );
}
