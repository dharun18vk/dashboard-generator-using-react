import { useMemo, useState } from "react";

function summarizeDataset(rows, columns) {
  const preview = rows.slice(0, 5);
  return {
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    preview,
  };
}

function columnStats(rows, column) {
  let numericCount = 0;
  let sum = 0;
  let min = null;
  let max = null;
  const freq = new Map();

  rows.forEach((row) => {
    const value = row[column];
    if (typeof value === "number" && !Number.isNaN(value)) {
      numericCount += 1;
      sum += value;
      if (min === null || value < min) min = value;
      if (max === null || value > max) max = value;
    }
    if (value !== null && value !== undefined && value !== "") {
      const key = String(value);
      freq.set(key, (freq.get(key) || 0) + 1);
    }
  });

  const topValues = Array.from(freq.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    numericCount,
    sum,
    avg: numericCount ? sum / numericCount : null,
    min,
    max,
    topValues,
  };
}

function detectQuestionType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("summary") || lower.includes("overview")) return "summary";
  if (lower.includes("columns") || lower.includes("headers")) return "columns";
  if (lower.includes("rows") || lower.includes("count")) return "rowCount";
  if (lower.includes("top") || lower.includes("most common")) return "topValues";
  if (lower.includes("average") || lower.includes("mean")) return "average";
  if (lower.includes("min") || lower.includes("max")) return "minmax";
  if (lower.includes("preview") || lower.includes("sample")) return "preview";
  return "column";
}

function findColumn(text, columns) {
  const lower = text.toLowerCase();
  return columns.find((col) => lower.includes(col.toLowerCase()));
}

export default function Chatbot({ rows, columns }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about the CSV. Try: summary, list columns, top values for <column>, average of <column>.",
    },
  ]);
  const [input, setInput] = useState("");

  const datasetSummary = useMemo(
    () => summarizeDataset(rows, columns),
    [rows, columns]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    const nextMessages = [...messages, { role: "user", content: question }];

    if (!rows.length) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Upload a CSV first so I can answer questions.",
        },
      ]);
      return;
    }

    const type = detectQuestionType(question);
    const column = findColumn(question, columns);
    let response = "";

    if (type === "summary") {
      response = `Summary: ${datasetSummary.rowCount} rows, ${datasetSummary.columnCount} columns.`;
    } else if (type === "columns") {
      response = `Columns: ${columns.join(", ")}.`;
    } else if (type === "rowCount") {
      response = `Row count: ${rows.length.toLocaleString()}.`;
    } else if (type === "preview") {
      response = `Preview (first 5 rows): ${JSON.stringify(datasetSummary.preview)}`;
    } else if (!column) {
      response =
        "I couldn't find that column in the headers. Try referencing a column name exactly.";
    } else {
      const stats = columnStats(rows, column);
      if (type === "average") {
        response =
          stats.avg === null
            ? `${column} has no numeric values to average.`
            : `Average of ${column}: ${stats.avg.toLocaleString()}.`;
      } else if (type === "minmax") {
        response =
          stats.min === null
            ? `${column} has no numeric min/max.`
            : `Min ${column}: ${stats.min}, Max ${column}: ${stats.max}.`;
      } else if (type === "topValues") {
        response = `Top values for ${column}: ${stats.topValues
          .map((item) => `${item.value} (${item.count})`)
          .join(", ")}.`;
      } else {
        response = `Stats for ${column}: ${stats.numericCount} numeric values, avg ${
          stats.avg === null ? "-" : stats.avg.toLocaleString()
        }, min ${stats.min ?? "-"}, max ${stats.max ?? "-"}. Top values: ${stats.topValues
          .map((item) => `${item.value} (${item.count})`)
          .join(", ")}.`;
      }
    }

    setMessages([...nextMessages, { role: "assistant", content: response }]);
  };

  return (
    <aside className="chatbot">
      <div className="chatbot-header">
        <h3>CSV Assistant</h3>
        <p>Ask questions about your data.</p>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatbot-message chatbot-${message.role}`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about rows, columns, stats..."
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
}
