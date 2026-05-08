import {
  collection, doc, getDoc, getDocs,
  onSnapshot, query, orderBy, where,
} from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'

// ── Real-time collection listener ───────────────────────────────────────────
export function subscribeCollection(collectionName, callback, options = {}) {
  let q = collection(db, collectionName)

  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy, options.direction ?? 'asc'))
  }

  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const visible = options.filterVisible ? docs.filter((d) => d.visible !== false) : docs
    callback(visible, null)
  }, (err) => callback([], err))
}

// ── Real-time single-document listener ──────────────────────────────────────
export function subscribeDoc(collectionName, docId, callback) {
  const ref = doc(db, collectionName, docId)
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() }, null)
    else callback(null, null)
  }, (err) => callback(null, err))
}

// ── One-time fetches (used where real-time isn't needed) ─────────────────────
export async function fetchDoc(collectionName, docId) {
  const snap = await getDoc(doc(db, collectionName, docId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function fetchCollection(collectionName) {
  const snap = await getDocs(collection(db, collectionName))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ── Storage helpers ──────────────────────────────────────────────────────────
export async function getStorageUrl(path) {
  try {
    return await getDownloadURL(ref(storage, path))
  } catch {
    return null
  }
}
