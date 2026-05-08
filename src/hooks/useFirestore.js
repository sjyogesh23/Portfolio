import { useState, useEffect } from 'react'
import { subscribeCollection, subscribeDoc } from '@/firebase/services'

// ── Subscribe to an entire collection ───────────────────────────────────────
export function useCollection(collectionName, options = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!collectionName) return
    const unsub = subscribeCollection(
      collectionName,
      (docs, err) => {
        if (err) setError(err)
        else setData(docs)
        setLoading(false)
      },
      options
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName])

  return { data, loading, error }
}

// ── Subscribe to a single document ──────────────────────────────────────────
export function useDocument(collectionName, docId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!collectionName || !docId) return
    const unsub = subscribeDoc(collectionName, docId, (doc, err) => {
      if (err) setError(err)
      else setData(doc)
      setLoading(false)
    })
    return unsub
  }, [collectionName, docId])

  return { data, loading, error }
}
