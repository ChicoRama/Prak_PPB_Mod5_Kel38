import { useState, useEffect } from 'react'

const CART_KEY = 'bore_barrel_cart'

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
    } catch (err) {
      console.error('Failed to save cart:', err)
    }
  }, [cartItems])

  const addToCart = (gun, quantity = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => String(item.id) === String(gun.id))
      if (existingIdx > -1) {
        const updated = [...prev]
        updated[existingIdx].quantity += quantity
        return updated
      }
      return [...prev, { ...gun, quantity }]
    })
  }

  const removeFromCart = (gunId) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(gunId)))
  }

  const updateQuantity = (gunId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(gunId)) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)

  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }
}