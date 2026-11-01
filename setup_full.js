const fs = require('fs');
const path = require('path');

// 1. Buat semua struktur folder
const directories = [
  'public/guns',
  'src/config',
  'src/hooks',
  'src/services',
  'src/pages',
  'src/components/common',
  'src/components/gun',
  'src/components/modals',
  'src/utils',
  'src/data'
];

directories.forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

// 2. Konten lengkap seluruh file (termasuk index.html, main.jsx, & package.json)
const files = {
  'package.json': `{
  "name": "pwa2-prakppb",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "lucide-react": "^0.395.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1",
    "vite-plugin-pwa": "^0.20.0"
  }
}`,

  'index.html': `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bore & Barrel - PWA</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bore & Barrel',
        short_name: 'Bore&Barrel',
        description: 'Tactical Hardware Catalog PWA',
        theme_color: '#160e08',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})`,

  '.env': `VITE_API_BASE_URL=https://sxunubxupdxyupnebuid.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TXg9-r3ZVI8YZMzE90nwsQ_PU9GAmzg`,

  'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

  'src/config/api.js': `import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
const IS_SUPABASE =
  BASE_URL.includes('supabase.co') || Boolean(SUPABASE_KEY)

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (IS_SUPABASE && SUPABASE_KEY) {
      config.headers['apikey'] = SUPABASE_KEY
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = \`Bearer \${SUPABASE_KEY}\`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred'
    let status = null
    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.message ||
        error.response.data?.msg ||
        error.response.data?.error ||
        error.response.data?.error_description ||
        \`Server error (\${status})\`
    } else if (error.request) {
      message =
        'Unable to reach the server. Check your connection and try again.'
    } else {
      message = error.message || message
    }
    return Promise.reject({
      message,
      status,
      code: error.response?.data?.code,
      raw: error.response?.data,
    })
  },
)

export { apiClient, BASE_URL, SUPABASE_KEY, IS_SUPABASE }`,

  'src/data/guns.js': `const GUNS_LOCAL = [
  {
    id: 'local-1',
    name: 'Glock 19 Gen 5',
    type: 'Pistol',
    caliber: '9mm',
    price: 549,
    description: 'Compact striker-fired sidearm featuring marksman barrel and dual recoil spring assembly.',
    image_url: '/guns/pistol.svg',
    ingredients: [
      { name: 'Receiver', quantity: 'Polymer' },
      { name: 'Barrel Length', quantity: '4.02 inches' },
      { name: 'Capacity', quantity: '15+1 rounds' }
    ],
    steps: [
      'Perform safety check and verify chamber is clear.',
      'Field strip frame and slide assembly for maintenance.'
    ]
  },
  {
    id: 'local-2',
    name: 'Colt M4A1 Carbine',
    type: 'Rifle',
    caliber: '5.56mm NATO',
    price: 1299,
    description: 'Select-fire tactical rifle engineered with direct impingement operating system.',
    image_url: '/guns/rifle.svg',
    ingredients: [
      { name: 'Receiver', quantity: '7075-T6 Aluminum' },
      { name: 'Barrel Length', quantity: '14.5 inches' },
      { name: 'Capacity', quantity: '30 rounds' }
    ],
    steps: [
      'Ensure safety selector is in safe position.',
      'Disassemble upper and lower receiver pins.'
    ]
  },
  {
    id: 'local-3',
    name: 'Remington 870 Tactical',
    type: 'Shotgun',
    caliber: '12 Gauge',
    price: 489,
    description: 'Pump-action smoothbore shotgun with solid steel receiver.',
    image_url: '/guns/shotgun.svg',
    ingredients: [
      { name: 'Receiver', quantity: 'Milled Steel' },
      { name: 'Barrel Length', quantity: '18.5 inches' },
      { name: 'Chamber', quantity: '3 inch Magnum' }
    ],
    steps: [
      'Depress action bar lock and open bolt fully.',
      'Inspect tubular magazine tube.'
    ]
  }
]

export default GUNS_LOCAL`,

  'src/hooks/useGuns.js': `import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'

export function useGuns(params = {}) {
  const [guns, setGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchGuns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getGuns(params)
      if (response.success) {
        setGuns(response.data || [])
        setPagination(response.pagination || null)
      } else {
        setError(response.message || 'Failed to fetch products.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching products.')
      setGuns([])
    } finally {
      setLoading(false)
    }
  }, [paramKey])

  useEffect(() => {
    fetchGuns()
  }, [fetchGuns])

  return { guns, loading, error, pagination, refetch: fetchGuns }
}

export function useGunById(id) {
  const [gun, setGun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGun = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getGunById(id)
      if (response.success) {
        setGun(response.data)
      } else {
        setError(response.message || 'Product not found.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details.')
      setGun(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGun()
  }, [fetchGun])

  return { gun, loading, error, refetch: fetchGun }
}`,

  'src/hooks/useReviews.js': `import { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'

export function useReviews(gunId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!gunId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await reviewService.getReviews(gunId)
      if (response.success) {
        setReviews(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch reviews.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reviews.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [gunId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (gunId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const response = await reviewService.createReview(gunId, reviewData)
      if (response.success) {
        setSuccess(true)
        return response.data
      } else {
        setError(response.message || 'Failed to submit review.')
        return null
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting review.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}`,

  'src/hooks/useFavorites.js': `import { useState, useEffect, useCallback } from 'react'
import favoriteService from '../services/favoriteService'
import { getUserIdentifier } from '../services/userService'

const LOCAL_KEY = 'bore_barrel_favorites'

const readLocalFavs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeLocalFavs = (ids) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
  } catch {}
}

export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLocal, setIsLocal] = useState(false)
  const userIdentifier = getUserIdentifier()

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await favoriteService.getFavorites(userIdentifier)
      if (response.success) {
        setFavorites(response.data || [])
        setIsLocal(false)
      } else {
        throw new Error(response.message)
      }
    } catch {
      setFavorites(readLocalFavs())
      setIsLocal(true)
    } finally {
      setLoading(false)
    }
  }, [userIdentifier])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return { favorites, loading, error, isLocal, refetch: fetchFavorites }
}

export function useToggleFavorite() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const userIdentifier = getUserIdentifier()

  const toggleFavorite = async (gunId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await favoriteService.toggleFavorite({
        recipe_id: gunId,
        user_identifier: userIdentifier,
      })
      if (response.success) {
        return response.data
      }
      throw new Error(response.message)
    } catch {
      const current = readLocalFavs()
      const idx = current.findIndex((id) => String(id) === String(gunId))
      let isFavorited
      if (idx === -1) {
        current.push(gunId)
        isFavorited = true
      } else {
        current.splice(idx, 1)
        isFavorited = false
      }
      writeLocalFavs(current)
      return { is_favorited: isFavorited }
    } finally {
      setLoading(false)
    }
  }

  return { toggleFavorite, loading, error }
}

export function useIsFavorited(gunId) {
  const { favorites, loading: fetchLoading, refetch } = useFavorites()
  const { toggleFavorite: toggle, loading: toggleLoading } = useToggleFavorite()

  const isFavorited = favorites.some((fav) => {
    const favId = typeof fav === 'object' && fav !== null ? (fav.id ?? fav.product_id ?? fav.recipe_id) : fav
    return String(favId) === String(gunId)
  })

  const toggleFavorite = async () => {
    const result = await toggle(gunId)
    if (result) await refetch()
    return result
  }

  return {
    isFavorited,
    loading: fetchLoading || toggleLoading,
    toggleFavorite,
  }
}

export { getUserIdentifier }`,

  'src/services/favoriteService.js': `import { apiClient, IS_SUPABASE } from '../config/api'
import { normalizeProduct } from './gunService'

class FavoriteService {
  async getFavorites(userIdentifier) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        \`/rest/v1/favorites?user_id=eq.\${userIdentifier}&select=product_id,created_at,products(*)\`,
      )
      const list = Array.isArray(data)
        ? data.map((fav) => {
            const prod = fav.products ? normalizeProduct(fav.products) : null
            return {
              ...(prod || {}),
              id: fav.product_id,
              recipe_id: fav.product_id,
              product_id: fav.product_id,
              created_at: fav.created_at,
            }
          })
        : []
      return { success: true, data: list }
    }
    return apiClient.get('/api/v1/favorites', {
      params: { user_identifier: userIdentifier },
    })
  }

  async toggleFavorite(data) {
    if (IS_SUPABASE) {
      const targetId = Number(data.recipe_id || data.gun_id)
      const userId = data.user_identifier
      const existing = await apiClient.get(
        \`/rest/v1/favorites?product_id=eq.\${targetId}&user_id=eq.\${userId}&select=*\`,
      )
      if (Array.isArray(existing) && existing.length > 0) {
        await apiClient.delete(
          \`/rest/v1/favorites?product_id=eq.\${targetId}&user_id=eq.\${userId}\`,
        )
        return { success: true, data: { is_favorited: false } }
      } else {
        await apiClient.post(
          '/rest/v1/favorites',
          { product_id: targetId, user_id: userId },
          { headers: { Prefer: 'return=minimal' } },
        )
        return { success: true, data: { is_favorited: true } }
      }
    }
    return apiClient.post('/api/v1/favorites/toggle', data)
  }
}

export default new FavoriteService()`,

  'src/services/gunService.js': `import { apiClient, IS_SUPABASE } from '../config/api'

export const normalizeProduct = (item) => {
  if (!item) return null
  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: \`spec-\${idx}\`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return {
          id: \`spec-\${idx}\`,
          name: 'Specification',
          quantity: s.trim(),
        }
      }
      return s
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }
  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : ['Verify firearm is completely unloaded and point in safe direction.', 'Inspect receiver and mechanism for maintenance.']

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: item.image_url || item.image || '/guns/pistol.svg',
    image: item.image_url || item.image || '/guns/pistol.svg',
    ingredients: specsList,
    steps: stepsList,
  }
}

class GunService {
  async getGuns(params = {}) {
    if (IS_SUPABASE) {
      const queryParts = ['select=*']
      if (params.search) {
        queryParts.push(\`name=ilike.*\${encodeURIComponent(params.search)}*\`)
      }
      if (params.category && params.category !== 'All') {
        queryParts.push(\`type=eq.\${encodeURIComponent(params.category)}\`)
      }
      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(\`order=\${encodeURIComponent(params.sort_by)}.\${order}\`)
      } else {
        queryParts.push('order=created_at.desc')
      }
      if (params.limit) {
        queryParts.push(\`limit=\${params.limit}\`)
      }
      const queryString = queryParts.join('&')
      const data = await apiClient.get(\`/rest/v1/products?\${queryString}\`)
      const list = Array.isArray(data) ? data.map(normalizeProduct) : []
      return {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
    }
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    )
    return apiClient.get('/api/v1/recipes', { params: clean })
  }

  async getGunById(id) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(\`/rest/v1/products?id=eq.\${id}&select=*\`)
      if (Array.isArray(data) && data.length > 0) {
        return { success: true, data: normalizeProduct(data[0]) }
      }
      throw new Error('Hardware item not found.')
    }
    return apiClient.get(\`/api/v1/recipes/\${id}\`)
  }

  async createGun(data) {
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => \`\${i.name}: \${i.quantity}\`)
        : Array.isArray(data.specs)
        ? data.specs
        : []
      const payload = {
        name: data.name,
        type: data.type || (data.category === 'minuman' ? 'Rifle' : 'Pistol'),
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? data.cook_time ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: data.image_url || null,
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
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => \`\${i.name}: \${i.quantity}\`)
        : Array.isArray(data.specs)
        ? data.specs
        : undefined
      const payload = {
        updated_at: new Date().toISOString(),
      }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined || data.cook_time !== undefined) {
        payload.price = Number(data.price ?? data.cook_time ?? 0)
      }
      if (data.description !== undefined) payload.description = data.description
      if (specsArray !== undefined) payload.specs = specsArray
      if (data.image_url !== undefined) payload.image_url = data.image_url
      const res = await apiClient.patch(\`/rest/v1/products?id=eq.\${id}\`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(updated) }
    }
    return apiClient.put(\`/api/v1/recipes/\${id}\`, data)
  }

  async patchGun(id, data) {
    if (IS_SUPABASE) {
      return this.updateGun(id, data)
    }
    return apiClient.patch(\`/api/v1/recipes/\${id}\`, data)
  }

  async deleteGun(id) {
    if (IS_SUPABASE) {
      await apiClient.delete(\`/rest/v1/products?id=eq.\${id}\`)
      return { success: true }
    }
    return apiClient.delete(\`/api/v1/recipes/\${id}\`)
  }
}

export default new GunService()`,

  'src/services/reviewService.js': `import { apiClient, IS_SUPABASE } from '../config/api'

class ReviewService {
  async getReviews(gunId) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        \`/rest/v1/reviews?product_id=eq.\${gunId}&select=*&order=created_at.desc\`,
      )
      const list = Array.isArray(data)
        ? data.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_identifier: r.user_id ? \`Operator \${String(r.user_id).substring(0, 8)}\` : 'Anonymous',
            rating: r.rating,
            comment: r.comment || '',
            created_at: r.created_at,
          }))
        : []
      return { success: true, data: list }
    }
    return apiClient.get(\`/api/v1/recipes/\${gunId}/reviews\`)
  }

  async createReview(gunId, reviewData) {
    if (IS_SUPABASE) {
      const payload = {
        product_id: Number(gunId),
        user_id: reviewData.user_id || reviewData.user_identifier,
        rating: Number(reviewData.rating),
        comment: reviewData.comment || '',
      }
      const res = await apiClient.post('/rest/v1/reviews', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: created }
    }
    return apiClient.post(\`/api/v1/recipes/\${gunId}/reviews\`, reviewData)
  }

  async updateReview(reviewId, reviewData) {
    if (IS_SUPABASE) {
      const res = await apiClient.patch(
        \`/rest/v1/reviews?id=eq.\${reviewId}\`,
        {
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
        },
        { headers: { Prefer: 'return=representation' } },
      )
      return { success: true, data: Array.isArray(res) ? res[0] : res }
    }
    return apiClient.put(\`/api/v1/reviews/\${reviewId}\`, reviewData)
  }

  async deleteReview(reviewId) {
    if (IS_SUPABASE) {
      await apiClient.delete(\`/rest/v1/reviews?id=eq.\${reviewId}\`)
      return { success: true }
    }
    return apiClient.delete(\`/api/v1/reviews/\${reviewId}\`)
  }
}

export default new ReviewService()`,

  'src/services/uploadService.js': `import axios from 'axios'
import { BASE_URL, SUPABASE_KEY, IS_SUPABASE } from '../config/api'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

class UploadService {
  async uploadImage(file) {
    if (!file) throw new Error('No file provided.')
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Allowed formats: .jpg, .jpeg, .png, .webp')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('File size exceeds the 5 MB limit.')
    }
    if (IS_SUPABASE) {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = \`gun_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}.\${ext}\`
      const bucketName = 'guns'
      try {
        const uploadUrl = \`\${BASE_URL}/storage/v1/object/\${bucketName}/\${fileName}\`
        await axios.post(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
            apikey: SUPABASE_KEY,
            Authorization: \`Bearer \${SUPABASE_KEY}\`,
          },
          timeout: 30000,
        })
        const publicUrl = \`\${BASE_URL}/storage/v1/object/public/\${bucketName}/\${fileName}\`
        return {
          success: true,
          data: { url: publicUrl, filename: fileName },
        }
      } catch (err) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        return {
          success: true,
          data: { url: dataUrl, filename: file.name },
        }
      }
    }
    const formData = new FormData()
    formData.append('image', file)
    const response = await axios.post(\`\${BASE_URL}/api/v1/upload\`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
    return response.data
  }
}

export default new UploadService()`,

  'src/services/userService.js': `const USER_IDENTIFIER_KEY = 'bore_barrel_user_id'
const USER_PROFILE_KEY = 'bore_barrel_user_profile'

const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getUserIdentifier = () => {
  try {
    let userId = localStorage.getItem(USER_IDENTIFIER_KEY)
    if (!userId || !isValidUUID(userId)) {
      userId = generateUUID()
      localStorage.setItem(USER_IDENTIFIER_KEY, userId)
    }
    return userId
  } catch {
    return generateUUID()
  }
}

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    username: 'Shooter',
    avatar: null,
    bio: '',
    userId: getUserIdentifier(),
  }
}

export const saveUserProfile = (profile) => {
  try {
    const data = {
      ...profile,
      userId: getUserIdentifier(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data))
    return { success: true, data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const updateUsername = (username) => {
  const profile = getUserProfile()
  profile.username = username.trim() || 'Shooter'
  return saveUserProfile(profile)
}

export const updateBio = (bio) => {
  const profile = getUserProfile()
  profile.bio = bio.trim()
  return saveUserProfile(profile)
}

export const updateAvatar = (avatarBase64) => {
  const profile = getUserProfile()
  profile.avatar = avatarBase64
  return saveUserProfile(profile)
}

export const resetUserIdentifier = () => {
  try {
    localStorage.removeItem(USER_IDENTIFIER_KEY)
    localStorage.removeItem(USER_PROFILE_KEY)
    return getUserIdentifier()
  } catch {
    return \`anon_\${Date.now()}\`
  }
}

export default {
  getUserIdentifier,
  getUserProfile,
  saveUserProfile,
  updateUsername,
  updateBio,
  updateAvatar,
  resetUserIdentifier,
}`,

  'src/utils/draftStorage.js': `const PREFIX = 'gun_draft_'
const TS_SUFFIX = '_ts'

export const saveDraft = (draftData, draftId = 'create') => {
  try {
    const key = \`\${PREFIX}\${draftId}\`
    const ts = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify({ ...draftData, savedAt: ts }))
    localStorage.setItem(\`\${key}\${TS_SUFFIX}\`, ts)
    return true
  } catch {
    return false
  }
}

export const loadDraft = (draftId = 'create') => {
  try {
    const raw = localStorage.getItem(\`\${PREFIX}\${draftId}\`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const deleteDraft = (draftId = 'create') => {
  try {
    const key = \`\${PREFIX}\${draftId}\`
    localStorage.removeItem(key)
    localStorage.removeItem(\`\${key}\${TS_SUFFIX}\`)
    return true
  } catch {
    return false
  }
}

export const hasDraft = (draftId = 'create') => {
  try {
    return localStorage.getItem(\`\${PREFIX}\${draftId}\`) !== null
  } catch {
    return false
  }
}

export const getDraftTimestamp = (draftId = 'create') => {
  try {
    return localStorage.getItem(\`\${PREFIX}\${draftId}\${TS_SUFFIX}\`)
  } catch {
    return null
  }
}

export const formatDraftTime = (timestamp) => {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return \`\${mins} min ago\`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return \`\${hrs} hr ago\`
  const days = Math.floor(hrs / 24)
  if (days < 7) return \`\${days} day\${days > 1 ? 's' : ''} ago\`
  return new Date(timestamp).toLocaleDateString()
}

export const getAllDraftIds = () => {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && !k.endsWith(TS_SUFFIX))
      .map((k) => k.slice(PREFIX.length))
  } catch {
    return []
  }
}

export const clearAllDrafts = () => {
  getAllDraftIds().forEach(deleteDraft)
}`,

  'src/utils/helpers.js': `export const formatPrice = (price) => {
  const num = Number(price)
  if (Number.isNaN(num)) return '$0'
  return \`$\${num.toLocaleString()}\`
}

export const matchesSearch = (item, query) => {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    (item.name || '').toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q)
  )
}

export const matchesCategory = (item, category) => {
  if (!category || category === 'All') return true
  return (
    (item.type || '').toLowerCase() === category.toLowerCase() ||
    (item.category || '').toLowerCase() === category.toLowerCase()
  )
}

export const sortItems = (items, key = 'name', order = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    if (key === 'price') return (Number(a.price) || 0) - (Number(b.price) || 0)
    return String(a[key] || '').localeCompare(String(b[key] || ''))
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str || ''
  return str.slice(0, max).trimEnd() + '…'
}

export const extractCategories = (items) => {
  const set = new Set()
  items.forEach((i) => {
    const cat = i.type || i.category
    if (cat) set.add(cat)
  })
  return ['All', ...Array.from(set).sort()]
}

export const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}`,

  'src/pages/About.jsx': `function About() {
  return (
    <div className="page">
      <h1 className="display">A one-room armory.</h1>
      <p className="lede">
        Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
        from the bench — no markup theatre, no filler.
      </p>
    </div>
  )
}
export default About`,

  'src/pages/Contact.jsx': `function Contact() {
  return (
    <div className="page">
      <h1 className="display">Come by the shop.</h1>
      <p className="lede">
        123 Range Road. Open Tuesday to Saturday, 10 to 6. Call (555) 010-0100.
      </p>
    </div>
  )
}
export default Contact`,

  'src/components/Footer.jsx': `function Footer() {
  return (
    <footer className="footer">
      <p>Bore &amp; Barrel, 123 Range Road</p>
    </footer>
  )
}
export default Footer`,

  'src/components/GunCard.jsx': `export { default } from './gun/GunCard'`,

  'src/components/Header.jsx': `import { Plus } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasBadge: true },
  { id: 'Profile', label: 'Profile' },
  { id: 'About', label: 'About' },
  { id: 'Contact', label: 'Contact' },
]

function Header({ tab, onTab, onNavigateCreate }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  return (
    <header className="header">
      <div className="header-brand-wrap" onClick={() => onTab('Catalog')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.hasBadge && favCount > 0 && (
              <span className="nav-badge">{favCount}</span>
            )}
          </button>
        ))}
      </nav>
      {onNavigateCreate && (
        <button
          type="button"
          className="btn btn--primary btn--sm header-cta"
          onClick={onNavigateCreate}
          title="Register new hardware"
        >
          <Plus size={15} /> Add Hardware
        </button>
      )}
    </header>
  )
}
export default Header`,

  'src/components/PWABadge.jsx': `import { useState, useEffect } from 'react'
import { Download, WifiOff, X } from 'lucide-react'

export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  if (dismissed) return null

  if (isOffline) {
    return (
      <aside className="pwa-badge pwa-badge--offline" role="status" aria-live="polite">
        <WifiOff size={16} />
        <span>Working offline. Cached hardware data is available.</span>
      </aside>
    )
  }

  if (installPrompt && !installed) {
    return (
      <aside className="pwa-badge" role="region" aria-label="Install App">
        <div className="pwa-badge-content">
          <Download size={16} stroke="var(--brass)" />
          <span>Install <strong>Bore &amp; Barrel</strong> for offline access.</span>
        </div>
        <div className="pwa-badge-actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleInstallClick}
          >
            Install App
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </aside>
    )
  }

  return null
}`,

  'src/components/common/AdvancedFilter.jsx': `import { Search, SlidersHorizontal } from 'lucide-react'

export default function AdvancedFilter({
  search,
  onSearch,
  categories,
  activeCategory,
  onCategory,
  sortKey,
  sortOrder,
  onSort,
}) {
  return (
    <div className="adv-filter">
      <div className="adv-filter__search">
        <Search size={16} className="adv-filter__icon" />
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="adv-filter__input"
          aria-label="Search products"
        />
      </div>
      <div className="adv-filter__pills">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={\`pill\${activeCategory === cat ? ' pill--active' : ''}\`}
            onClick={() => onCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="adv-filter__sort">
        <SlidersHorizontal size={14} />
        <select
          value={\`\${sortKey}_\${sortOrder}\`}
          onChange={(e) => {
            const [key, order] = e.target.value.split('_')
            onSort({ key, order })
          }}
          aria-label="Sort products"
          className="adv-filter__select"
        >
          <option value="name_asc">Name A → Z</option>
          <option value="name_desc">Name Z → A</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
        </select>
      </div>
    </div>
  )
}`,

  'src/components/common/FavoriteButton.jsx': `import { Heart } from 'lucide-react'
import { useIsFavorited } from '../../hooks/useFavorites'

export default function FavoriteButton({ gunId, onToggle }) {
  const { isFavorited, loading, toggleFavorite } = useIsFavorited(gunId)
  const handleClick = async (e) => {
    e.stopPropagation()
    const result = await toggleFavorite()
    if (result && onToggle) onToggle(result)
  }
  return (
    <button
      type="button"
      className={\`fav-btn\${isFavorited ? ' fav-btn--active' : ''}\`}
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={18}
        fill={isFavorited ? 'var(--brass)' : 'none'}
        stroke={isFavorited ? 'var(--brass)' : 'var(--steel)'}
      />
    </button>
  )
}`,

  'src/components/common/SplashScreen.css': `.splash-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 42%, #160e08 0%, #08090b 43%, #030406 78%);
  isolation: isolate;
  z-index: 99999;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
  cursor: pointer;
  user-select: none;
}
.splash-overlay--fading {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.splash-mark {
  position: absolute;
  left: 50%;
  top: 29%;
  width: min(90vw, 58vh, 650px);
  aspect-ratio: 1;
  object-fit: contain;
  transform: translate(-50%, 0) translateX(-100vw) scale(0.94);
  opacity: 0;
  animation: splash-rush 2s cubic-bezier(0.15, 0.8, 0.18, 1) 0.05s forwards,
             splash-glow 1.5s ease-out 2.55s forwards;
  pointer-events: none;
}
.splash-trail {
  position: absolute;
  left: -50%;
  top: 49%;
  width: 58vw;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ff6500, #ffb329, transparent);
  filter: blur(4px);
  opacity: 0;
  animation: splash-trail 1.5s ease-out 0.1s forwards;
  pointer-events: none;
}
.splash-flash {
  position: absolute;
  inset: 0;
  background: #fff0c4;
  opacity: 0;
  pointer-events: none;
  animation: splash-flash 0.23s ease-out 2.45s;
}
.splash-cracks {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  animation: splash-crack 0.65s ease-out 2.48s forwards;
  filter: drop-shadow(0 0 2px rgba(230, 240, 255, 0.28));
}
.splash-cracks path {
  fill: none;
  stroke: #cbd7e3;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.82;
}
.splash-overlay.hit {
  animation: splash-shake 0.35s linear;
}
.splash-brand {
  position: absolute;
  top: 81%;
  left: 0;
  width: 100%;
  text-align: center;
  opacity: 0;
  transform: translateY(12px);
  animation: splash-brandIn 0.9s ease-out 3.8s forwards;
  color: #f6f3ec;
  pointer-events: none;
}
.splash-brand-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 5.4vw, 43px);
  letter-spacing: 0.035em;
  font-weight: 700;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
}
.splash-brand-sub {
  margin-top: 12px;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: #ff8a28;
  font-weight: 600;
  text-transform: uppercase;
}
.splash-brand::after {
  content: '';
  display: block;
  width: 76px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff7b12, transparent);
  margin: 16px auto 0;
}
.splash-skip-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(18, 14, 11, 0.65);
  border: 1px solid rgba(255, 138, 40, 0.35);
  border-radius: 9999px;
  color: #f6f3ec;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  animation: splash-skipIn 0.6s ease-out 1.5s forwards;
  transition: all 0.2s ease;
}
.splash-skip-btn:hover {
  background: rgba(255, 117, 0, 0.2);
  border-color: #ff8a28;
  color: #ffffff;
  transform: translateY(-1px);
}
.splash-hint {
  position: absolute;
  bottom: 28px;
  left: 24px;
  font-size: 11px;
  color: rgba(246, 243, 236, 0.35);
  letter-spacing: 0.05em;
  opacity: 0;
  animation: splash-skipIn 0.6s ease-out 2.5s forwards;
  pointer-events: none;
}
@keyframes splash-rush {
  0% { opacity: 0; left: -20%; transform: translate(-50%, 0) scale(0.94); }
  58% { opacity: 1; left: 53%; transform: translate(-50%, 0) scale(1.025); }
  78% { left: 49%; transform: translate(-50%, 0) scale(0.99); }
  100% { opacity: 1; left: 50%; transform: translate(-50%, 0) scale(1); }
}
@keyframes splash-trail {
  0% { opacity: 0; left: -35%; }
  22% { opacity: 0.95; }
  100% { opacity: 0; left: 48%; }
}
@keyframes splash-flash {
  0% { opacity: 0; }
  25% { opacity: 0.75; }
  100% { opacity: 0; }
}
@keyframes splash-crack {
  0% { opacity: 0; transform: scale(0.98); }
  45% { opacity: 0.9; }
  100% { opacity: 0.82; transform: scale(1); }
}
@keyframes splash-shake {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-5px, 2px); }
  45% { transform: translate(4px, -2px); }
  70% { transform: translate(-2px, 1px); }
}
@keyframes splash-glow {
  0% { filter: drop-shadow(0 0 0 rgba(255, 117, 0, 0)); }
  45% { filter: drop-shadow(0 0 24px rgba(255, 117, 0, 0.5)); }
  100% { filter: drop-shadow(0 0 10px rgba(255, 117, 0, 0.2)); }
}
@keyframes splash-brandIn { to { opacity: 1; transform: translateY(0); } }
@keyframes splash-skipIn { to { opacity: 1; } }`,

  'src/components/common/SplashScreen.jsx': `import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import './SplashScreen.css'

export default function SplashScreen({ onFinish, duration = 5400 }) {
  const [isHit, setIsHit] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const dismissedRef = useRef(false)

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setIsFading(true)
    setTimeout(() => {
      if (onFinish) onFinish()
    }, 600)
  }, [onFinish])

  const handleHit = (e) => {
    if (e.target.closest('.splash-skip-btn')) return
    setIsHit(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsHit(true)
      })
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [duration, handleDismiss])

  return (
    <main
      className={\`splash-overlay \${isHit ? 'hit' : ''} \${isFading ? 'splash-overlay--fading' : ''}\`}
      id="splash"
      onClick={handleHit}
      role="dialog"
      aria-modal="true"
      aria-label="Bore & Barrel Intro"
    >
      <div className="splash-trail" aria-hidden="true" />
      <div className="splash-flash" aria-hidden="true" />
      <img
        className="splash-mark"
        src="/logo.png"
        alt="Bore & Barrel Gunshop Asli Ngawi Logo"
      />
      <svg
        className="splash-cracks"
        viewBox="0 0 720 1280"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g transform="translate(525 500)">
          <path d="M0 0 28 -24 61 -31 84 -58 120 -72 158 -91 196 -128 230 -145 M61 -31 74 5 108 26 125 58 M120 -72 134 -42 166 -23 184 14 M0 0 -34 -22 -72 -27 -95 -52 -128 -61 -159 -92 M-72 -27 -69 7 -92 31 -105 63 M-128 -61 -148 -40 -176 -38 -204 -17 M0 0 14 38 10 75 35 103 42 137 M14 38 48 49 71 76 96 88 M0 0 -31 27 -55 60 -83 81 -105 119 M-55 60 -40 91 -49 119 M0 0 40 13 68 8 96 29 129 32 M40 13 44 -18 66 -39 M0 0 7 -45 -2 -76 13 -108 5 -139 M7 -45 33 -64 53 -91" />
        </g>
      </svg>
      <section className="splash-brand">
        <div className="splash-brand-name">Bore &amp; Barrel</div>
        <div className="splash-brand-sub">GUNSHOP ASLI NGAWI</div>
      </section>
      <button
        type="button"
        className="splash-skip-btn"
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
        aria-label="Skip splash screen"
      >
        <span>Enter Armory</span>
        <ArrowRight size={14} />
      </button>
      <span className="splash-hint">Tap anywhere to recoil</span>
    </main>
  )
}`,

  'src/components/gun/GunCard.jsx': `import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'

export default function GunCard({ gun, onSelect, onEdit, onDelete }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={\`View \${gun.name}\`}
      >
        <img
          className="card-img"
          src={imgSrc}
          alt={gun.name}
          width="240"
          height="180"
          loading="lazy"
        />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? \` · \${caliber}\` : ''}
        </span>
        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}
        <span className="price">{formatPrice(price)}</span>
      </button>
      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />
        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            aria-label={\`Edit \${gun.name}\`}
            title="Edit"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(gun) }}
            aria-label={\`Delete \${gun.name}\`}
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </li>
  )
}`,

  'src/components/gun/GunDetail.jsx': `import { useState } from 'react'
import { ArrowLeft, Star, Send, Loader } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'

export default function GunDetail({ gun, onBack, onEdit, onDelete }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }
    const result = await createReview(gun.id, {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim(),
    })
    if (result) {
      setReviewSuccess('Review submitted!')
      setComment('')
      setRating(5)
      refetchReviews()
    } else {
      setReviewError('Could not submit review. Server unavailable.')
    }
  }

  return (
    <div className="detail">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>
      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? \` · \${caliber}\` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>
          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}
          <div className="detail-actions">
            <FavoriteButton gunId={gun.id || gun.name} />
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}
      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>
                {step.instruction || step}
              </li>
            ))}
          </ol>
        </section>
      )}
      <section className="detail-section">
        <h2>Reviews</h2>
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>
          <textarea
            className="review-input"
            rows="3"
            placeholder="Write a short review…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !gun.id}
          >
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>
          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
        </form>
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => (
              <li key={rev.id} className="review-item">
                <div className="review-head">
                  <span className="review-user">{rev.user_identifier || 'Anonymous'}</span>
                  <span className="review-stars-display">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'var(--brass)' : 'none'}
                        stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                      />
                    ))}
                  </span>
                </div>
                {rev.comment && <p className="review-comment">{rev.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet.</p>
        )}
      </section>
    </div>
  )
}`,

  'src/components/modals/ConfirmModal.jsx': `import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  open,
  isOpen,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  const isVisible = open ?? isOpen ?? false
  const handleCancel = onCancel || onClose
  const actualConfirmText = confirmLabel || confirmText || 'Confirm'
  const actualCancelText = cancelLabel || cancelText || 'Cancel'

  if (!isVisible) return null

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div
        className="modal-box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">
          <AlertTriangle size={28} stroke={danger ? '#c0392b' : 'var(--brass)'} />
        </div>
        <h3 id="confirm-title" className="modal-title display">
          {title}
        </h3>
        <p id="confirm-msg" className="modal-msg">
          {message}
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn modal-btn--cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {actualCancelText}
          </button>
          <button
            type="button"
            className={\`modal-btn \${danger ? 'modal-btn--danger' : 'modal-btn--confirm'}\`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : actualConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}`,

  'src/pages/Catalog.jsx': `import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

export default function Catalog({ onNavigate }) {
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 50 })
  const [useLocal, setUseLocal] = useState(false)

  const rawGuns = useMemo(() => {
    if (useLocal || (error && apiGuns.length === 0)) {
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || \`local-\${i}\` }))
    }
    return apiGuns
  }, [apiGuns, error, useLocal])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])

  const [selectedGun, setSelectedGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await gunService.deleteGun(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => { setSelectedGun(null); setDeleteTarget(g) }}
      />
    )
  }

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed
          with its type, caliber, and price — nothing else.
        </p>
      </section>
      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">
              {filteredGuns.length} piece{filteredGuns.length !== 1 ? 's' : ''}
            </span>
            {onNavigate && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>
        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />
        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}
        {!loading && error && !useLocal && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <div className="state-box__actions">
              <button type="button" className="btn btn--outline" onClick={refetch}>
                <RefreshCw size={16} /> Retry
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setUseLocal(true)}
              >
                View Local Catalog
              </button>
            </div>
          </div>
        )}
        {!loading && filteredGuns.length === 0 && !error && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}
        {filteredGuns.length > 0 && (
          <ul className="stock">
            {filteredGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={setSelectedGun}
                onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onDelete={setDeleteTarget}
              />
            ))}
          </ul>
        )}
        {useLocal && (
          <p className="local-notice">
            Showing local catalog (server unavailable).{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setUseLocal(false); refetch() }}
            >
              Retry server
            </button>
          </p>
        )}
      </section>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={\`Are you sure you want to delete "\${deleteTarget?.name}"? This action cannot be undone.\`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
      />
      {deleteError && (
        <div className="toast toast--error">{deleteError}</div>
      )}
    </>
  )
}`,

  'src/pages/CreateGunPage.jsx': `import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import gunService from '../services/gunService'
import uploadService from '../services/uploadService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

export default function CreateGunPage({ onBack, onSuccess }) {
  const [currentStep, setCurrentStep] = useState('upload')
  const [formData, setFormData] = useState({
    name: '',
    type: 'Pistol',
    caliber: '9mm',
    category: 'makanan',
    difficulty: 'mudah',
    price: 599,
    description: '',
    servings: 1,
    is_featured: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [specs, setSpecs] = useState([
    { name: 'Frame', quantity: 'Polymer' },
    { name: 'Action', quantity: 'Striker-Fired' },
    { name: 'Capacity', quantity: '17 rounds' },
  ])
  const [steps, setSteps] = useState([
    'Verify firearm is completely unloaded and point in safe direction.',
    'Disassemble slide assembly from receiver frame for routine maintenance.',
  ])
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showDraftModal, setShowDraftModal] = useState(() => hasDraft('create'))
  const [draftTimestamp, setDraftTimestamp] = useState(() => getDraftTimestamp('create'))

  const handleSaveDraft = useCallback((notify = true) => {
    const draftData = { formData, specs, steps, uploadedImageUrl }
    const saved = saveDraft(draftData, 'create')
    if (saved) {
      const ts = getDraftTimestamp('create')
      setDraftTimestamp(ts)
      if (notify) {
        setSuccessMsg(\`Draft saved (\${formatDraftTime(ts)})\`)
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    }
  }, [formData, specs, steps, uploadedImageUrl])

  useEffect(() => {
    if (currentStep !== 'form') return
    const interval = setInterval(() => handleSaveDraft(false), 30000)
    return () => clearInterval(interval)
  }, [handleSaveDraft, currentStep])

  const handleLoadDraft = () => {
    const draft = loadDraft('create')
    if (draft) {
      if (draft.formData) setFormData(draft.formData)
      if (draft.specs) setSpecs(draft.specs)
      if (draft.steps) setSteps(draft.steps)
      if (draft.uploadedImageUrl) {
        setUploadedImageUrl(draft.uploadedImageUrl)
        setImagePreview(draft.uploadedImageUrl)
        setCurrentStep('form')
      }
      setShowDraftModal(false)
      setSuccessMsg('Draft successfully loaded.')
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft('create')
    setShowDraftModal(false)
    setDraftTimestamp(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.')
      return
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Allowed formats: .jpg, .jpeg, .png, .webp')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSelectPreset = (url) => {
    setImageFile(null)
    setImagePreview(url)
    setUploadedImageUrl(url)
    setCurrentStep('form')
    setError('')
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      if (uploadedImageUrl) {
        setCurrentStep('form')
        return
      }
      setError('Please select an image file first.')
      return
    }
    try {
      setUploading(true)
      setError('')
      const result = await uploadService.uploadImage(imageFile)
      if (result.success && result.data?.url) {
        setUploadedImageUrl(result.data.url)
        setCurrentStep('form')
      } else {
        throw new Error(result.message || 'Image upload failed.')
      }
    } catch (err) {
      setUploadedImageUrl(imagePreview || '/guns/pistol.svg')
      setCurrentStep('form')
    } finally {
      setUploading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSpecChange = (index, field, value) => {
    setSpecs((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addSpec = () => setSpecs((prev) => [...prev, { name: '', quantity: '' }])
  const removeSpec = (index) => {
    if (specs.length <= 1) return
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStepChange = (index, value) => {
    setSteps((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const addStep = () => setSteps((prev) => [...prev, ''])
  const removeStep = (index) => {
    if (steps.length <= 1) return
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError('Product name must be at least 3 characters.')
      return
    }
    const cleanSpecs = specs
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        quantity: s.quantity.trim() || 'Standard',
      }))
    if (cleanSpecs.length === 0) {
      setError('Please provide at least one specification.')
      return
    }
    const cleanSteps = steps.filter((s) => s.trim()).map((s) => s.trim())
    if (cleanSteps.length === 0) {
      setError('Please provide at least one maintenance step.')
      return
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category || 'makanan',
      description: formData.description.trim() || \`\${formData.type} caliber \${formData.caliber}.\`,
      image_url: uploadedImageUrl || '/guns/pistol.svg',
      prep_time: 15,
      cook_time: Number(formData.price) || 500,
      servings: Number(formData.servings) || 1,
      difficulty: formData.difficulty || 'mudah',
      is_featured: Boolean(formData.is_featured),
      ingredients: cleanSpecs,
      steps: cleanSteps,
    }

    try {
      setCreating(true)
      const response = await gunService.createGun(payload)
      if (response.success || response.data) {
        deleteDraft('create')
        if (onSuccess) onSuccess(response.data)
        else if (onBack) onBack()
      } else {
        throw new Error(response.message || 'Failed to create product.')
      }
    } catch (err) {
      setError(err.message || 'Error occurred while saving product.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Catalog
        </button>
        <div className="form-head-actions">
          {currentStep === 'form' && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => handleSaveDraft(true)}
            >
              <Save size={14} /> Save Draft
            </button>
          )}
        </div>
      </div>
      <div className="form-title-group">
        <h1 className="display">Register New Hardware</h1>
        <p className="lede">
          Add a firearm or accessory to the catalog. Data will be synchronized.
        </p>
      </div>
      {error && <div className="toast toast--error"><AlertCircle size={18} /> {error}</div>}
      {successMsg && <div className="toast toast--success"><CheckCircle size={18} /> {successMsg}</div>}
      
      <div className="form-steps-nav">
        <div className={\`step-badge \${currentStep === 'upload' ? 'step-badge--active' : 'step-badge--done'}\`}>
          1. Imagery
        </div>
        <div className="step-badge-connector" />
        <div className={\`step-badge \${currentStep === 'form' ? 'step-badge--active' : ''}\`}>
          2. Specifications &amp; Details
        </div>
      </div>

      {currentStep === 'upload' && (
        <div className="card-box">
          <h2 className="card-box-title">Weapon Imagery</h2>
          {!imagePreview ? (
            <div className="upload-dropzone">
              <input
                id="gun-image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden-file-input"
              />
              <label htmlFor="gun-image-input" className="upload-label">
                <Upload size={36} className="upload-icon" />
                <span className="upload-main-text">Click to choose an image file</span>
              </label>
              <div className="preset-selector">
                <span className="preset-title">Or use a stock preset:</span>
                <div className="preset-pills">
                  <button type="button" className="pill" onClick={() => handleSelectPreset('/guns/pistol.svg')}>Pistol</button>
                  <button type="button" className="pill" onClick={() => handleSelectPreset('/guns/rifle.svg')}>Rifle</button>
                  <button type="button" className="pill" onClick={() => handleSelectPreset('/guns/shotgun.svg')}>Shotgun</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-container">
              <div className="preview-image-wrap">
                <img src={imagePreview} alt="Preview" className="preview-img" />
                <button type="button" className="preview-remove-btn" onClick={() => { setImageFile(null); setImagePreview(null); setUploadedImageUrl(''); }}>
                  <X size={18} />
                </button>
              </div>
              <div className="preview-actions">
                <button type="button" className="btn btn--primary" onClick={handleUploadImage} disabled={uploading}>
                  {uploading ? <><Loader size={18} className="spin" /> Uploading…</> : <><Upload size={18} /> Confirm Imagery</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 'form' && (
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Model Designation *</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleFormChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="type" className="form-label">Category *</label>
              <select id="type" name="type" value={formData.type} onChange={(e) => { handleFormChange(e); setFormData(p => ({ ...p, category: e.target.value === 'Pistol' ? 'makanan' : 'minuman' })) }} className="form-select">
                <option value="Pistol">Pistol</option>
                <option value="Rifle">Rifle</option>
                <option value="Shotgun">Shotgun</option>
              </select>
            </div>
          </div>
          <div className="form-grid form-grid--3">
            <div className="form-group">
              <label htmlFor="caliber" className="form-label">Caliber *</label>
              <input id="caliber" type="text" name="caliber" value={formData.caliber} onChange={handleFormChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="price" className="form-label">Price (USD) *</label>
              <input id="price" type="number" name="price" value={formData.price} onChange={handleFormChange} className="form-input" required />
            </div>
          </div>
          <div className="form-actions-bar">
            <button type="button" className="btn btn--outline" onClick={onBack} disabled={creating}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={creating}>
              {creating ? <><Loader size={18} className="spin" /> Registering…</> : 'Commit to Armory'}
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        open={showDraftModal}
        title="Resume Draft?"
        message="An unfinished draft was found. Resume editing?"
        confirmLabel="Load Draft"
        cancelLabel="Discard"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  )
}`,

  'src/pages/EditGunPage.jsx': `import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X, Plus, Loader, Save, CheckCircle, AlertCircle } from 'lucide-react'
import gunService from '../services/gunService'

export default function EditGunPage({ gun, gunId, onBack, onSuccess }) {
  const targetId = gunId || gun?.id
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: 'Pistol',
    caliber: '9mm',
    price: 599,
    description: '',
  })

  useEffect(() => {
    const fetchGun = async () => {
      try {
        setLoading(true)
        let data = gun
        if (!data && targetId) {
          const res = await gunService.getGunById(targetId)
          if (res.success && res.data) data = res.data
        }
        if (data) {
          setFormData({
            name: data.name || '',
            type: data.type || 'Pistol',
            caliber: data.caliber || '9mm',
            price: data.price ?? 599,
            description: data.description || '',
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load details.')
      } finally {
        setLoading(false)
      }
    }
    fetchGun()
  }, [targetId, gun])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const res = await gunService.updateGun(targetId, formData)
      if (res.success || res.data) {
        if (onSuccess) onSuccess(res.data)
        else if (onBack) onBack()
      }
    } catch (err) {
      setError(err.message || 'Update failed.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="state-box"><Loader size={28} className="spin" /><p>Loading…</p></div>

  return (
    <div className="form-page">
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}><ArrowLeft size={18} /> Back</button>
      </div>
      <h1 className="display">Edit Hardware</h1>
      {error && <div className="toast toast--error"><AlertCircle size={18} /> {error}</div>}
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label className="form-label">Model Designation</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Price</label>
          <input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} className="form-input" required />
        </div>
        <div className="form-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={updating}>Save Changes</button>
        </div>
      </form>
    </div>
  )
}`,

  'src/pages/FavoritesPage.jsx': `import { useMemo } from 'react'
import { Heart, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'

export default function FavoritesPage({ onSelectGun, onNavigateCatalog }) {
  const { favorites, loading: favLoading, error: favError, refetch } = useFavorites()
  const { guns: apiGuns } = useGuns({ limit: 100 })

  const allKnownGuns = useMemo(() => {
    const map = new Map()
    GUNS_LOCAL.forEach((g, idx) => {
      const id = g.id || \`local-\${idx}\`
      map.set(id, { ...g, id })
    })
    apiGuns.forEach((g) => {
      if (g.id !== undefined && g.id !== null) map.set(g.id, g)
    })
    return map
  }, [apiGuns])

  const favoriteItems = useMemo(() => {
    const resolved = []
    favorites.forEach((fav) => {
      const id = typeof fav === 'object' ? (fav.id || fav.recipe_id || fav.product_id) : fav
      const match = allKnownGuns.get(id) || allKnownGuns.get(Number(id))
      if (match) resolved.push(match)
    })
    return resolved
  }, [favorites, allKnownGuns])

  return (
    <div className="fav-page">
      <section className="masthead">
        <h1 className="display">Saved Shortlist</h1>
      </section>
      {favoriteItems.length === 0 ? (
        <div className="state-box">
          <Heart size={36} />
          <h3>No hardware favorited yet</h3>
          {onNavigateCatalog && (
            <button type="button" className="btn btn--primary" onClick={onNavigateCatalog}>
              Browse Catalog <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        <ul className="stock">
          {favoriteItems.map((gun) => (
            <GunCard key={gun.id} gun={gun} onSelect={onSelectGun} />
          ))}
        </ul>
      )}
    </div>
  )
}`,

  'src/pages/ProfilePage.jsx': `import { useState } from 'react'
import { Shield, Copy, Check, Save, Heart, FileText, Camera, Play } from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'

export default function ProfilePage({ onReplaySplash }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [copied, setCopied] = useState(false)
  const { favorites } = useFavorites()

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="profile-page">
      <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Operator credentials and settings.</p>
        </div>
        {onReplaySplash && (
          <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash}>
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>
      <div className="profile-card">
        <h2>{username}</h2>
        <div className="profile-id-row">
          <span className="mono-badge">{profile.userId}</span>
          <button type="button" className="icon-btn" onClick={handleCopyId}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}`,

  'src/App.jsx': `import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreateGunPage from './pages/CreateGunPage.jsx'
import EditGunPage from './pages/EditGunPage.jsx'
import GunDetail from './components/gun/GunDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import gunService from './services/gunService.js'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list')
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
    } else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
      />
      <main className="main">
        {mode === 'create' && (
          <CreateGunPage
            onBack={handleBackToList}
            onSuccess={() => { handleBackToList(); setTab('Catalog') }}
          />
        )}
        {mode === 'edit' && (
          <EditGunPage
            gun={editingGun}
            gunId={editingGun?.id}
            onBack={handleBackToList}
            onSuccess={() => { handleBackToList(); setTab('Catalog') }}
          />
        )}
        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={handleBackToList}
            onEdit={(g) => handleNavigate('Edit', g)}
            onDelete={(g) => setDeleteTarget(g)}
          />
        )}
        {mode === 'list' && (
          <>
            {tab === 'Catalog' && <Catalog onNavigate={handleNavigate} />}
            {tab === 'Favorites' && (
              <FavoritesPage
                onSelectGun={(g) => handleNavigate('Detail', g)}
                onNavigateCatalog={() => setTab('Catalog')}
              />
            )}
            {tab === 'Profile' && (
              <ProfilePage onReplaySplash={() => setShowSplash(true)} />
            )}
            {tab === 'About' && <About />}
            {tab === 'Contact' && <Contact />}
          </>
        )}
      </main>
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Record"
        message={\`Are you sure you want to delete "\${deleteTarget?.name}"?\`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await gunService.deleteGun(deleteTarget.id)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to delete record.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
      <PWABadge />
      <Footer />
    </div>
  )
}

export default App`,

  'src/App.css': `
.display { font-family: system-ui, sans-serif; }
.shell { min-height: 100vh; display: flex; flex-direction: column; background: #0e0d0c; color: #f6f3ec; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #161412; border-bottom: 1px solid #2a2622; position: sticky; top: 0; z-index: 20; }
.header-logo-badge img { width: 28px; height: 28px; }
.brand { font-size: 1.2rem; font-weight: 700; color: #ff8a28; }
.nav { display: flex; gap: 16px; }
.nav-link { background: none; border: none; color: #a0988e; font: inherit; cursor: pointer; padding: 6px 8px; }
.nav-link.active { color: #ff8a28; font-weight: 600; border-bottom: 2px solid #ff8a28; }
.main { width: 100%; max-width: 900px; margin: 0 auto; padding: 24px; flex: 1; }
.btn { padding: 8px 16px; border-radius: 4px; border: none; font: inherit; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.btn--primary { background: #ff8a28; color: #0e0d0c; }
.btn--outline { background: transparent; border: 1px solid #4a423a; color: #f6f3ec; }
.btn--danger { background: #c0392b; color: #fff; }
.stock { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.card { background: #181614; border: 1px solid #2a2622; border-radius: 6px; padding: 12px; position: relative; }
.card-img { width: 100%; height: 140px; object-fit: contain; }
.price { color: #ff8a28; font-weight: bold; }
.footer { padding: 16px; text-align: center; border-top: 1px solid #2a2622; font-size: 0.85rem; color: #8a8278; }
.state-box { padding: 40px; text-align: center; color: #a0988e; }
.toast { padding: 10px 16px; border-radius: 4px; margin-bottom: 16px; }
.toast--error { background: #3d1414; color: #ff7272; }
.toast--success { background: #143d22; color: #72ff9b; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`
};

// 3. Tulis semua file
Object.entries(files).forEach(([filepath, content]) => {
  fs.writeFileSync(path.join(__dirname, filepath), content.trim(), 'utf8');
  console.log(`[Created] ${filepath}`);
});

// 4. Generate Icon SVG dasar
const icons = {
  'public/guns/pistol.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#ff8a28" stroke-width="2"><path d="M10 20h30l4 8h10v8h-6l-4 16h-8l3-16H10v-16z"/></svg>`,
  'public/guns/rifle.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#ff8a28" stroke-width="2"><path d="M4 24h40l8 4h8v4h-6l-2 8h-6l2-8H4v-8z"/></svg>`,
  'public/guns/shotgun.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#ff8a28" stroke-width="2"><path d="M6 22h44l4 6h6v4h-8l-2 10h-6l2-10H6v-10z"/></svg>`,
  'public/icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="240" fill="#160e08" stroke="#ff8a28" stroke-width="16"/><path d="M160 220h160l24 40h40v40h-24l-16 80h-40l12-80H160v-80z" fill="#ff8a28"/></svg>`
};

Object.entries(icons).forEach(([filepath, svgContent]) => {
  fs.writeFileSync(path.join(__dirname, filepath), svgContent, 'utf8');
});

// Dummy PNGs agar build Vite tidak error saat mencari gambar
const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
['public/icon-192.png', 'public/icon-512.png', 'public/logo.png'].forEach((pngPath) => {
  fs.writeFileSync(path.join(__dirname, pngPath), Buffer.from(dummyPngBase64, 'base64'));
});

console.log('\n✅ Seluruh file fondasi & komponen Modul 5 siap 100%!');