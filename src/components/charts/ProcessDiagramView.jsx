import useChartDraft from '../../hooks/useChartDraft'

const PAD_X = 12
const PAD_Y = 10
const STAGE_W = 18 // percentage width of each stage box (used for centering offset)

function getGridPositions(n) {
  if (n <= 0) return []
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const usableW = 100 - 2 * PAD_X
  const usableH = 100 - 2 * PAD_Y
  const cellW = usableW / cols
  const cellH = usableH / rows
  return Array.from({ length: n }, (_, i) => ({
    x: PAD_X + cellW * (i % cols) + cellW / 2,
    y: PAD_Y + cellH * Math.floor(i / cols) + cellH / 2,
  }))
}

function getContainerHeight(n) {
  const rows = Math.ceil(Math.sqrt(n))
  if (rows <= 1) return 'h-48'
  if (rows === 2) return 'h-64'
  if (rows === 3) return 'h-96'
  return 'h-[32rem]'
}

function repositionStages(stages) {
  const positions = getGridPositions(stages.length)
  return stages.map((s, i) => ({ ...s, x: positions[i].x, y: positions[i].y }))
}

export default function ProcessDiagramView({ prompt, onUpdate }) {
  const sync = (data) => onUpdate({ ...prompt, stages: data })
  const { editing, toggle, draft, setDraft, inputData } = useChartDraft(prompt.stages, sync)

  const displayStages = repositionStages(prompt.stages)

  const addStage = () => {
    const id = Math.max(...inputData.map((s) => s.id), 0) + 1
    const next = repositionStages([...inputData, { id, label: 'New Stage', desc: 'Description', x: 0, y: 0 }])
    onUpdate({ ...prompt, stages: next })
    if (draft) setDraft(next)
  }

  const removeStage = (idx) => {
    const filtered = inputData.filter((_, i) => i !== idx)
    const next = repositionStages(filtered)
    onUpdate({ ...prompt, stages: next })
    if (draft) setDraft(next)
  }

  return (
    <div>
      <div className={`relative w-full ${getContainerHeight(prompt.stages.length)} bg-blue-50/50 rounded-lg border border-blue-200 overflow-hidden`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#4f46e5" />
            </marker>
          </defs>
          {displayStages.map((s, i) => {
            const next = displayStages[(i + 1) % displayStages.length]
            return <line key={s.id} x1={s.x} y1={s.y} x2={next.x} y2={next.y} stroke="#4f46e5" strokeWidth="1.2" markerEnd="url(#arrowBlue)" strokeDasharray="3 2" />
          })}
        </svg>
        {displayStages.map((stage) => (
          <div key={stage.id} className="absolute bg-white border-2 border-indigo-500 rounded-lg px-2 py-1 shadow-sm text-center"
            style={{ left: `${stage.x - STAGE_W / 2}%`, top: `${stage.y - 4}%`, width: `${STAGE_W}%` }}>
            <div className="text-xs font-bold text-indigo-700">{stage.label}</div>
            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{stage.desc}</div>
          </div>
        ))}
        <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 italic">Process Diagram</div>
      </div>
      <button onClick={toggle} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
        {editing ? 'Done editing' : 'Edit data'}
      </button>
      {editing && draft && (
        <div className="mt-3 space-y-2">
          {draft.map((stage, i) => (
            <div key={stage.id} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 border">
              <div className="flex-1 space-y-1">
                <input value={stage.label} onChange={(e) => setDraft(draft.map((s, j) => j === i ? { ...s, label: e.target.value } : s))} className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-0 focus:border-indigo-500" placeholder="Label" />
                <input value={stage.desc} onChange={(e) => setDraft(draft.map((s, j) => j === i ? { ...s, desc: e.target.value } : s))} className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-0 focus:border-indigo-500" placeholder="Description" />
              </div>
              <button onClick={() => removeStage(i)} className="text-red-500 hover:text-red-700 text-xs mt-1 cursor-pointer">&times;</button>
            </div>
          ))}
          <button onClick={addStage} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer">+ Add stage</button>
        </div>
      )}
    </div>
  )
}
