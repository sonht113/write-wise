import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import useChartDraft from "../../hooks/useChartDraft";

const COLORS = [
  "#4f46e5",
  "#dc2626",
  "#16a34a",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];
let colorIdx = 0;
const nextColor = () => COLORS[colorIdx++ % COLORS.length];
const resetColor = () => {
  colorIdx = 0;
};

export default function LineChartView({ prompt, onUpdate }) {
  const sync = (data) => onUpdate({ ...prompt, data });
  const { editing, toggle, draft, setDraft, inputData } = useChartDraft(
    prompt.data,
    sync,
  );
  const lines = prompt.lines;
  const [renameText, setRenameText] = useState({});

  const setCell = (i, key, val) =>
    setDraft(
      draft.map((r, j) => (j === i ? { ...r, [key]: Number(val) || 0 } : r)),
    );

  const changeXLabel = (i, val) =>
    setDraft(
      draft.map((r, j) => (j === i ? { ...r, [prompt.xAxisKey]: val } : r)),
    );

  const commitRename = (idx, text) => {
    const oldKey = lines[idx].dataKey;
    const newKey = text.trim();
    if (!newKey || oldKey === newKey || !draft) return;
    const nextLines = lines.map((l) =>
      l.dataKey === oldKey ? { ...l, dataKey: newKey } : l,
    );
    const nextData = draft.map((r) => {
      const n = { ...r, [newKey]: r[oldKey] };
      delete n[oldKey];
      return n;
    });
    setDraft(nextData);
    onUpdate({ ...prompt, lines: nextLines, data: nextData });
  };

  const addLine = () => {
    const key = "Series " + (lines.length + 1);
    const nextLines = [...lines, { dataKey: key, color: nextColor() }];
    const nextData = inputData.map((r) => ({ ...r, [key]: 0 }));
    onUpdate({ ...prompt, lines: nextLines, data: nextData });
    if (draft) setDraft(nextData);
  };

  const removeLine = (dataKey) => {
    const nextLines = lines.filter((l) => l.dataKey !== dataKey);
    const nextData = inputData.map((r) => {
      const n = { ...r };
      delete n[dataKey];
      return n;
    });
    onUpdate({ ...prompt, lines: nextLines, data: nextData });
    if (draft) setDraft(nextData);
  };

  const addPoint = () => {
    const entry = { [prompt.xAxisKey]: String(inputData.length + 1) };
    lines.forEach((l) => {
      entry[l.dataKey] = 0;
    });
    const next = [...inputData, entry];
    onUpdate({ ...prompt, data: next });
    if (draft) setDraft(next);
  };

  const removePoint = (idx) => {
    const next = inputData.filter((_, i) => i !== idx);
    onUpdate({ ...prompt, data: next });
    if (draft) setDraft(next);
  };

  return (
    <div>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <LineChart
            data={prompt.data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={prompt.xAxisKey}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {lines.map((l) => (
              <Line
                key={l.dataKey}
                type="monotone"
                dataKey={l.dataKey}
                stroke={l.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button
        onClick={() => {
          toggle();
          resetColor();
        }}
        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
      >
        {editing ? "Done editing" : "Edit data"}
      </button>
      {editing && draft && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {lines.map((l, i) => (
              <span
                key={l.dataKey}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-1"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <input
                  value={renameText[i] ?? l.dataKey}
                  onChange={(e) =>
                    setRenameText((p) => ({ ...p, [i]: e.target.value }))
                  }
                  onBlur={() => {
                    if (renameText[i] !== undefined)
                      commitRename(i, renameText[i]);
                    setRenameText((p) => {
                      const n = { ...p };
                      delete n[i];
                      return n;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                  }}
                  className="w-16 bg-transparent border-b border-gray-300 text-center outline-0"
                />
                <button
                  onClick={() => removeLine(l.dataKey)}
                  className="text-red-500 hover:text-red-700 ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
            <button
              onClick={addLine}
              className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-full px-2 py-1 cursor-pointer"
            >
              + Add series
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">
                    {prompt.xAxisKey}
                  </th>
                  {lines.map((l) => (
                    <th key={l.dataKey} className="border px-2 py-1 text-right">
                      {l.dataKey}
                    </th>
                  ))}
                  <th className="border px-2 py-1 w-8" />
                </tr>
              </thead>
              <tbody>
                {draft.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-2 py-1">
                      <input
                        value={row[prompt.xAxisKey]}
                        onChange={(e) => changeXLabel(i, e.target.value)}
                        className="w-full border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500"
                      />
                    </td>
                    {lines.map((l) => (
                      <td key={l.dataKey} className="border px-2 py-1">
                        <input
                          type="number"
                          step="0.1"
                          value={row[l.dataKey]}
                          onChange={(e) =>
                            setCell(i, l.dataKey, e.target.value)
                          }
                          className="w-full text-right border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500"
                        />
                      </td>
                    ))}
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => removePoint(i)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addPoint}
            className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer"
          >
            + Add {prompt.xAxisKey}
          </button>
        </div>
      )}
    </div>
  );
}
