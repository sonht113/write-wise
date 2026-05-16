import useChartDraft from '../../hooks/useChartDraft'

export default function TableView({ prompt, onUpdate }) {
  const sync = (data) => onUpdate({ ...prompt, tableData: data })
  const { editing, toggle, draft, setDraft, inputData } = useChartDraft(prompt.tableData, sync)
  const years = Object.keys(inputData[0]).filter((k) => k !== 'country')

  const setCell = (i, key, val) => setDraft(
    draft.map((r, j) => j === i ? { ...r, [key]: Number(val) || 0 } : r)
  )

  const addCountry = () => {
    const entry = { country: 'Country ' + (inputData.length + 1) }
    years.forEach((y) => { entry[y] = 0 })
    const next = [...inputData, entry]
    onUpdate({ ...prompt, tableData: next })
    if (draft) setDraft(next)
  }

  const removeCountry = (idx) => {
    const next = inputData.filter((_, i) => i !== idx)
    onUpdate({ ...prompt, tableData: next })
    if (draft) setDraft(next)
  }

  const addYear = () => {
    const label = String(Number(years[years.length - 1] || 2015) + 2)
    const next = inputData.map((r) => ({ ...r, [label]: 0 }))
    onUpdate({ ...prompt, tableData: next })
    if (draft) setDraft(next)
  }

  const removeYear = (yr) => {
    const next = inputData.map((r) => { const n = { ...r }; delete n[yr]; return n })
    onUpdate({ ...prompt, tableData: next })
    if (draft) setDraft(next)
  }

  return (
    <div>
      <div className="overflow-x-auto py-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Country</th>
              {years.map((year) => (
                <th key={year} className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">
                  {editing ? (
                    <span className="inline-flex items-center gap-1">
                      <input value={year} onChange={(e) => {
                        if (!draft) return
                        setDraft(draft.map((r) => {
                          const nr = { ...r }
                          nr[e.target.value] = nr[year]
                          if (e.target.value !== year) delete nr[year]
                          return nr
                        }))
                      }} className="w-12 border-b border-gray-300 text-center outline-0 text-xs" />
                      <button onClick={() => removeYear(year)} className="text-red-500 hover:text-red-700 text-xs cursor-pointer">&times;</button>
                    </span>
                  ) : year}
                </th>
              ))}
              {editing && <th className="border border-gray-300 px-2 py-2 w-8" />}
            </tr>
          </thead>
          <tbody>
            {inputData.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800">
                  {editing ? (
                    <input value={row.country} onChange={(e) => setDraft(draft.map((r, j) => j === i ? { ...r, country: e.target.value } : r))} className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs outline-0 focus:border-indigo-500" />
                  ) : row.country}
                </td>
                {years.map((year) => (
                  <td key={year} className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                    {editing ? (
                      <input type="number" step="1" value={row[year]} onChange={(e) => setCell(i, year, e.target.value)} className="w-full text-right border border-gray-300 rounded px-1 py-0.5 text-xs outline-0 focus:border-indigo-500" />
                    ) : row[year].toLocaleString()}
                  </td>
                ))}
                {editing && (
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <button onClick={() => removeCountry(i)} className="text-red-500 hover:text-red-700 text-xs cursor-pointer">&times;</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-1">Values in thousands of students</p>
      </div>
      <button onClick={toggle} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
        {editing ? 'Done editing' : 'Edit data'}
      </button>
      {editing && (
        <div className="mt-2 flex gap-2">
          <button onClick={addCountry} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer">+ Add country</button>
          <button onClick={addYear} className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded px-2 py-1 cursor-pointer">+ Add year</button>
        </div>
      )}
    </div>
  )
}
