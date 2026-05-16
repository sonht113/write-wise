import { useState, useRef, useEffect } from 'react'
import useDebounce from './useDebounce'

export default function useChartDraft(sourceData, onSync, delay = 1000) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const debouncedDraft = useDebounce(draft, delay)
  const prevSync = useRef(null)

  useEffect(() => {
    if (!editing || !debouncedDraft) return
    if (prevSync.current === debouncedDraft) return
    prevSync.current = debouncedDraft
    onSync(debouncedDraft)
  }, [debouncedDraft, editing, onSync])

  const startEditing = () => {
    prevSync.current = null
    setDraft(structuredClone(sourceData))
    setEditing(true)
  }

  const stopEditing = () => {
    setDraft(null)
    setEditing(false)
  }

  return {
    editing,
    draft,
    setDraft,
    inputData: editing && draft ? draft : sourceData,
    startEditing,
    stopEditing,
    toggle: editing ? stopEditing : startEditing,
  }
}
