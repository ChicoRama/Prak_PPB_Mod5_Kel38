const cacheStore = new Map()

export const getCache = (key) => {
  const item = cacheStore.get(key)
  if (!item) return null
  if (Date.now() > item.expiry) {
    cacheStore.delete(key)
    return null
  }
  return item.data
}

export const setCache = (key, data, ttlMs = 5 * 60 * 1000) => {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  })
}

export const clearCache = (key) => {
  if (key) cacheStore.delete(key)
  else cacheStore.clear()
}