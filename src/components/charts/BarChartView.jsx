import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import useChartDraft from '../../hooks/useChartDraft'

const COLORS = ['#4f46e5', '#dc2626', '#16a34a', '#f97316', '#eab308', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']
let colorIdx = 0
const nextColor = () => COLORS[colorIdx++ % COLORS.length]
const resetColor = () => { colorIdx = 0 }

export default function BarChartView({ prompt, onUpdate }) {
  const sync = (data) => onUpdate({ ...prompt, data })
  const { editing, toggle, draft, setDraft, inputData } = useChartDraft(prompt.data, sync)
  const bars = prompt.bars
  const [renameText, setRenameText] = useState({})

  const setCell = (i, key, val) => setDraft(
    draft.map((r, j) => j === i ? { ...r, [key]: Number(val) || 0 } : r)
  )

  const changeXLabel = (i, val) => setDraft(
    draft.map((r, j) => j === i ? { ...r, [prompt.xAxisKey]: val } : r)
  )

  const addBar = () => {
    const keys = Object.keys(prompt.data[0]).filter((k) => k !== prompt.xAxisKey)
    const key = String(Math.max(...keys.map(Number), 0) + 1)
    const nextBars = [...bars, { dataKey: key, color: nextColor(), name: key }]
    const nextData = inputData.map((r) => ({ ...r, [key]: 0 }))
    onUpdate({ ...prompt, bars: nextBars, data: nextData })
    if (draft) setDraft(nextData)
  }

  const removeBar = (dataKey) => {
    const nextBars = bars.filter((b) => b.dataKey !== dataKey)
    const nextData = inputData.map((r) => { const n = { ...r }; delete n[dataKey]; return n })
    onUpdate({ ...prompt, bars: nextBars, data: nextData })
    if (draft) setDraft(nextData)
  }

  const addItem = () => {
    const entry = { [prompt.xAxisKey]: String.fromCharCode(65 + inputData.length) }
    bars.forEach((b) => { entry[b.dataKey] = 0 })
    const next = [...inputData, entry]
    onUpdate({ ...prompt, data: next })
    if (draft) setDraft(next)
  }

  const removeItem = (idx) => {
    const next = inputData.filter((_, i) => i !== idx)
    onUpdate({ ...prompt, data: next })
    if (draft) setDraft(next)
  }

  return (
    <div>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <BarChart data={prompt.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={prompt.xAxisKey} tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {bars.map((b) => (
              <Bar key={b.dataKey} dataKey={b.dataKey} name={b.name} fill={b.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button onClick={() => { toggle(); resetColor() }} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
        {editing ? 'Done editing' : 'Edit data'}
      </button>
      {editing && draft && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {bars.map((b, i) => (
              <span key={b.dataKey} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                <input value={renameText[i] ?? b.name} onChange={(e) => setRenameText(p => ({...p, [i]: e.target.value}))} onBlur={() => { const text = renameText[i]; if (text !== undefined && text.trim() && text !== b.name) onUpdate({ ...prompt, bars: bars.map((x, j) => j === i ? { ...x, name: text.trim() } : x) }); setRenameText(p => { const n = {...p}; delete n[i]; return n }) }} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} className="w-12 border-b border-gray-300 bg-transparent text-center outline-0" />
                <button onClick={() => removeBar(b.dataKey)} className="text-red-500 hover:text-red-700 ml-1 cursor-pointer">&times;</button>
              </span>
            ))}
            <button onClick={addBar} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-full px-2 py-1 cursor-pointer">+ Add group</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">{prompt.xAxisKey}</th>
                  {bars.map((b) => <th key={b.dataKey} className="border px-2 py-1 text-right">{b.name}</th>)}
                  <th className="border px-2 py-1 w-8" />
                </tr>
              </thead>
              <tbody>
                {draft.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 py-1">
                      <input value={row[prompt.xAxisKey]} onChange={(e) => changeXLabel(i, e.target.value)} className="w-full border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500" />
                    </td>
                    {bars.map((b) => (
                      <td key={b.dataKey} className="border px-2 py-1">
                        <input type="number" step="0.1" value={row[b.dataKey]} onChange={(e) => setCell(i, b.dataKey, e.target.value)} className="w-full text-right border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500" />
                      </td>
                    ))}
                    <td className="border px-2 py-1 text-center">
                      <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs cursor-pointer">&times;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addItem} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer">+ Add {prompt.xAxisKey}</button>
        </div>
      )}
    </div>
  )
}
