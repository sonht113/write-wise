import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useChartDraft from '../../hooks/useChartDraft'

const COLORS = ['#4f46e5', '#dc2626', '#16a34a', '#f97316', '#eab308', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']
let colorIdx = 0
const nextColor = () => COLORS[colorIdx++ % COLORS.length]
const resetColor = () => { colorIdx = 0 }

export default function PieChartView({ prompt, onUpdate }) {
  const sync = (data) => onUpdate({ ...prompt, pieData: data })
  const { editing, toggle, draft, setDraft, inputData } = useChartDraft(prompt.pieData, sync)

  const setPieValue = (gi, ii, val) => setDraft(
    draft.map((g, i) => i !== gi ? g : { ...g, data: g.data.map((d, j) => j !== ii ? d : { ...d, value: Number(val) || 0 }) })
  )

  const setPieName = (gi, ii, val) => setDraft(
    draft.map((g, i) => i !== gi ? g : { ...g, data: g.data.map((d, j) => j !== ii ? d : { ...d, name: val }) })
  )

  const addSegment = (gi) => {
    const next = inputData.map((g, i) => i !== gi ? g : { ...g, data: [...g.data, { name: 'New', value: 0, color: nextColor() }] })
    onUpdate({ ...prompt, pieData: next })
    if (draft) setDraft(next)
  }

  const removeSegment = (gi, ii) => {
    const next = inputData.map((g, i) => i !== gi ? g : { ...g, data: g.data.filter((_, j) => j !== ii) })
    onUpdate({ ...prompt, pieData: next })
    if (draft) setDraft(next)
  }

  const addYear = () => {
    const last = inputData[inputData.length - 1]
    const next = [...inputData, { year: String(Number(last ? last.year : 2010) + 5), data: last ? last.data.map((d) => ({ ...d })) : [] }]
    onUpdate({ ...prompt, pieData: next })
    if (draft) setDraft(next)
  }

  const removeYear = (gi) => {
    if (inputData.length < 2) return
    const next = inputData.filter((_, i) => i !== gi)
    onUpdate({ ...prompt, pieData: next })
    if (draft) setDraft(next)
  }

  const count = prompt.pieData.length
  // Tính số cột: ≤2 → 2 cột, 3 → 3 cột, ≥4 → 2 cột trên mobile / 4 cột trên desktop
  const gridClass =
    count <= 2 ? 'grid grid-cols-2' :
    count === 3 ? 'grid grid-cols-3' :
    'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4'

  return (
    <div>
      <div className={`${gridClass} gap-4 py-4`}>
        {prompt.pieData.map((group) => (
          <div key={group.year} className="flex flex-col items-center min-w-0">
            <div className="text-sm font-semibold text-gray-700 mb-2">{group.year}</div>
            <div className="w-full aspect-square max-w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={group.data} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={2} dataKey="value">
                    {group.data.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-2 w-full">
              {group.data.map((e, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  {e.name} {e.value}%
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => { toggle(); resetColor() }} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
        {editing ? 'Done editing' : 'Edit data'}
      </button>
      {editing && draft && (
        <div className="mt-3 space-y-4">
          {draft.map((group, gi) => (
            <div key={group.year} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">
                  Year: <input value={group.year} onChange={(e) => setDraft(draft.map((g, i) => i === gi ? { ...g, year: e.target.value } : g))} className="ml-1 w-14 border-b border-gray-300 text-center outline-0 text-xs" />
                </span>
                <button onClick={() => removeYear(gi)} className="text-red-500 hover:text-red-700 text-xs cursor-pointer disabled:opacity-30" disabled={inputData.length < 2}>&times; Remove</button>
              </div>
              {group.data.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2 mb-1">
                  <input value={item.name} onChange={(e) => setPieName(gi, ii, e.target.value)} className="w-20 text-xs border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500" />
                  <input type="number" step="0.1" min="0" max="100" value={item.value} onChange={(e) => setPieValue(gi, ii, e.target.value)} className="w-16 text-xs border border-gray-300 rounded px-1 py-0.5 outline-0 focus:border-indigo-500 text-right" />%
                  <button onClick={() => removeSegment(gi, ii)} className="text-red-500 hover:text-red-700 text-xs cursor-pointer">&times;</button>
                </div>
              ))}
              <button onClick={() => addSegment(gi)} className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer">+ Add segment</button>
            </div>
          ))}
          <button onClick={addYear} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer">+ Add year</button>
        </div>
      )}
    </div>
  )
}
