import { apiClient, IS_SUPABASE } from '../config/api'
import { getCache, setCache, clearCache } from '../utils/cache'

const SOFT_DELETED_KEY = 'bore_barrel_soft_deleted_ids'

export const getSoftDeletedIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SOFT_DELETED_KEY)) || []
  } catch {
    return []
  }
}

export const setSoftDeletedIds = (ids) => {
  try {
    localStorage.setItem(SOFT_DELETED_KEY, JSON.stringify(ids))
  } catch {}
}

export const normalizeProduct = (item) => {
  if (!item) return null
  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: `spec-${idx}`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return { id: `spec-${idx}`, name: 'Specification', quantity: s.trim() }
      }
      return s
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }

  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : ['Verify firearm is completely unloaded.', 'Inspect receiver and mechanism.']

  // Multi-image parsing
  let images = []
  if (Array.isArray(item.images) && item.images.length > 0) {
    images = item.images
  } else if (typeof item.images === 'string' && item.images.trim()) {
    try {
      images = JSON.parse(item.images)
    } catch {
      images = item.images.split(',').map((s) => s.trim())
    }
  } else {
    images = [item.image_url || item.image || '/guns/pistol.svg']
  }

  const softDeleted = getSoftDeletedIds()
  const isArchived = Boolean(item.is_archived || softDeleted.includes(String(item.id)))

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: images[0] || '/guns/pistol.svg',
    images: images,
    ingredients: specsList,
    steps: stepsList,
    is_archived: isArchived,
  }
}

class GunService {
  async getGuns(params = {}, bypassCache = false) {
    const cacheKey = `guns_${JSON.stringify(params)}`
    if (!bypassCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    if (IS_SUPABASE) {
      const queryParts = ['select=*']
      if (params.search) {
        queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
      }
      if (params.category && params.category !== 'All') {
        queryParts.push(`type=eq.${encodeURIComponent(params.category)}`)
      }
      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(`order=${encodeURIComponent(params.sort_by)}.${order}`)
      } else {
        queryParts.push('order=created_at.desc')
      }
      if (params.limit) {
        queryParts.push(`limit=${params.limit}`)
      }
      const queryString = queryParts.join('&')
      const data = await apiClient.get(`/rest/v1/products?${queryString}`)
      const list = Array.isArray(data) ? data.map(normalizeProduct) : []
      const res = {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
      setCache(cacheKey, res)
      return res
    }
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    )
    const res = await apiClient.get('/api/v1/recipes', { params: clean })
    setCache(cacheKey, res)
    return res
  }

  async getGunById(id) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(`/rest/v1/products?id=eq.${id}&select=*`)
      if (Array.isArray(data) && data.length > 0) {
        return { success: true, data: normalizeProduct(data[0]) }
      }
      throw new Error('Hardware item not found.')
    }
    return apiClient.get(`/api/v1/recipes/${id}`)
  }

  async createGun(data) {
    clearCache()
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => `${i.name}: ${i.quantity}`)
        : Array.isArray(data.specs)
        ? data.specs
        : []
      const payload = {
        name: data.name,
        type: data.type || 'Pistol',
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: Array.isArray(data.images) ? data.images[0] : data.image_url,
        images: Array.isArray(data.images) ? data.images : [data.image_url],
      }
      const res = await apiClient.post('/rest/v1/products', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(created) }
    }
    return apiClient.post('/api/v1/recipes', data)
  }

  async updateGun(id, data) {
    clearCache()
    if (IS_SUPABASE) {
      const payload = { updated_at: new Date().toISOString() }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined) payload.price = Number(data.price)
      if (data.description !== undefined) payload.description = data.description
      if (data.images !== undefined) {
        payload.images = data.images
        payload.image_url = data.images[0]
      }
      const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(updated) }
    }
    return apiClient.put(`/api/v1/recipes/${id}`, data)
  }

  // Soft Delete (Archive)
  async softDeleteGun(id) {
    clearCache()
    const current = getSoftDeletedIds()
    if (!current.includes(String(id))) {
      current.push(String(id))
      setSoftDeletedIds(current)
    }
    return { success: true }
  }

  // Restore Soft Delete
  async restoreGun(id) {
    clearCache()
    const current = getSoftDeletedIds().filter((item) => item !== String(id))
    setSoftDeletedIds(current)
    return { success: true }
  }

  // Permanent Delete
  async deleteGunPermanently(id) {
    clearCache()
    this.restoreGun(id)
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/products?id=eq.${id}`)
      return { success: true }
    }
    return apiClient.delete(`/api/v1/recipes/${id}`)
  }
}

export default new GunService()