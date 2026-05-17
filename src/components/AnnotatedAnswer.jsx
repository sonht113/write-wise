import { useMemo } from 'react'

function buildSegments(text, annotations) {
  if (!annotations?.length) return [{ text, type: 'plain' }]

  const sorted = [...annotations].sort((a, b) => {
    const ia = text.indexOf(a.original)
    const ib = text.indexOf(b.original)
    return ia - ib
  })

  const segments = []
  let cursor = 0

  for (const ann of sorted) {
    const idx = text.indexOf(ann.original, cursor)
    if (idx === -1) continue

    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), type: 'plain' })
    }

    segments.push({
      text: ann.original,
      type: ann.type,
      suggestion: ann.improved,
      explanation_vi: ann.explanation_vi,
    })

    cursor = idx + ann.original.length
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), type: 'plain' })
  }

  return segments
}

const BG = {
  correct: 'bg-green-100 border-green-400',
  improvement: 'bg-amber-100 border-amber-400',
  incorrect: 'bg-red-100 border-red-400',
}

const TXT = {
  correct: 'text-green-800',
  improvement: 'text-amber-800',
  incorrect: 'text-red-800',
}

export default function AnnotatedAnswer({ text, annotations }) {
  const segments = useMemo(() => buildSegments(text, annotations), [text, annotations])

  return (
    <div className="leading-relaxed text-sm text-gray-800 whitespace-pre-wrap break-words">
      {segments.map((seg, i) => {
        if (seg.type === 'plain') {
          return <span key={i}>{seg.text}</span>
        }

        const showSuggestion = seg.type !== 'correct' && seg.suggestion

        return (
          <span
            key={i}
            className={`inline-group relative cursor-help ${BG[seg.type]} ${TXT[seg.type]} border-b-2 rounded-sm px-0.5`}
            title={seg.explanation_vi}
          >
            {seg.type === 'incorrect' ? <s>{seg.text}</s> : seg.text}
            {showSuggestion && (
              <span className="not-italic font-normal text-gray-500 mx-0.5">
                ({seg.suggestion})
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
