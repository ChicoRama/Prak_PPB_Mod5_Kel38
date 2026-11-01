import { apiClient, IS_SUPABASE } from '../config/api'

const LOCAL_VOTES_KEY = 'bore_barrel_review_votes'

const getLocalVotes = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY)) || {}
  } catch {
    return {}
  }
}

class ReviewService {
  async getReviews(gunId) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        `/rest/v1/reviews?product_id=eq.${gunId}&select=*&order=created_at.desc`
      )
      const votes = getLocalVotes()
      const list = Array.isArray(data)
        ? data.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_identifier: r.user_id ? `Operator ${String(r.user_id).substring(0, 8)}` : 'Anonymous',
            user_id: r.user_id,
            rating: r.rating,
            comment: r.comment || '',
            created_at: r.created_at,
            upvotes: (r.upvotes || 0) + (votes[r.id]?.up || 0),
            downvotes: (r.downvotes || 0) + (votes[r.id]?.down || 0),
            userVote: votes[r.id]?.myVote || null,
          }))
        : []
      return { success: true, data: list }
    }
    return apiClient.get(`/api/v1/recipes/${gunId}/reviews`)
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
    return apiClient.post(`/api/v1/recipes/${gunId}/reviews`, reviewData)
  }

  async updateReview(reviewId, reviewData) {
    if (IS_SUPABASE) {
      const res = await apiClient.patch(
        `/rest/v1/reviews?id=eq.${reviewId}`,
        {
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
        },
        { headers: { Prefer: 'return=representation' } }
      )
      return { success: true, data: Array.isArray(res) ? res[0] : res }
    }
    return apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData)
  }

  async deleteReview(reviewId) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/reviews?id=eq.${reviewId}`)
      return { success: true }
    }
    return apiClient.delete(`/api/v1/reviews/${reviewId}`)
  }

  async voteReview(reviewId, type) {
    const votes = getLocalVotes()
    const current = votes[reviewId] || { up: 0, down: 0, myVote: null }

    if (current.myVote === type) {
      // Toggle off
      if (type === 'up') current.up = Math.max(0, current.up - 1)
      if (type === 'down') current.down = Math.max(0, current.down - 1)
      current.myVote = null
    } else {
      if (current.myVote === 'up') current.up = Math.max(0, current.up - 1)
      if (current.myVote === 'down') current.down = Math.max(0, current.down - 1)

      if (type === 'up') current.up += 1
      if (type === 'down') current.down += 1
      current.myVote = type
    }

    votes[reviewId] = current
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes))
    return { success: true, data: current }
  }
}

export default new ReviewService()