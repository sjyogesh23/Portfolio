import { useState, useEffect } from 'react'
import { subscribeDoc } from '@/firebase/services'

export default function useConfig() {
  const [config, setConfig]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeDoc('config', 'site', (doc) => {
      setConfig(doc)
      setLoading(false)
    })
    return unsub
  }, [])

  return { config, loading }
}
