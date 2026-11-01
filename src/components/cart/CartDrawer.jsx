import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { formatPrice } from '../../utils/helpers'

export default function CartDrawer({ open, onClose, cart }) {
  if (!open) return null

  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = cart

  const handleCheckoutWA = () => {
    if (cartItems.length === 0) return

    // Nomor WA Admin / Pribadi (Dapat disesuaikan)
    const phoneNumber = '6281234567890'
    
    let message = 'Hi aku mau pesan hardware berikut:\n\n'
    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} (${item.type || 'Gun'}) x${item.quantity} - ${formatPrice((Number(item.price) || 0) * item.quantity)}\n`
    })
    message += `\n*Total Pembelian:* ${formatPrice(totalPrice)}\n`
    message += 'Mohon diproses orderan ini, terima kasih!'

    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} stroke="var(--brass)" />
            <h2 className="display">Armory Cart</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} stroke="var(--steel)" />
              <p>Keranjang belanja kamu masih kosong.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <img
                    src={(Array.isArray(item.images) && item.images[0]) || item.image_url || '/guns/pistol.svg'}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-name display">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-qty">
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total:</span>
              <span className="cart-total-val">{formatPrice(totalPrice)}</span>
            </div>
            <button type="button" className="btn btn--primary cart-checkout-btn" onClick={handleCheckoutWA}>
              Checkout via WhatsApp <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}