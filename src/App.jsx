import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import CreateGunPage from './pages/CreateGunPage.jsx'
import EditGunPage from './pages/EditGunPage.jsx'
import GunDetail from './components/gun/GunDetail.jsx'
import PWABadge from './components/PWABadge.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import CartDrawer from './components/cart/CartDrawer.jsx'
import { useCart } from './hooks/useCart.js'
import gunService from './services/gunService.js'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail' | 'edit-profile'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  
  // Cart state
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  // Auto detect Share Link (?gun=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gunId = params.get('gun')
    if (gunId) {
      gunService.getGunById(gunId).then((res) => {
        if (res.data) {
          setSelectedGun(res.data)
          setMode('detail')
        }
      }).catch(() => {})
    }
  }, [])

  const handleNavigate = (target, payload) => {
    if (target === 'Create') setMode('create')
    else if (target === 'Edit') { setEditingGun(payload); setMode('edit'); }
    else if (target === 'Detail') { setSelectedGun(payload); setMode('detail'); }
    else if (target === 'EditProfile') setMode('edit-profile')
    else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(t) => handleNavigate(t)}
        onNavigateCreate={() => handleNavigate('Create')}
        cartCount={cart.totalItems}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="main">
        {mode === 'create' && (
          <CreateGunPage onBack={() => setMode('list')} onSuccess={() => { setMode('list'); setTab('Catalog'); }} />
        )}

        {mode === 'edit' && (
          <EditGunPage gun={editingGun} gunId={editingGun?.id} onBack={() => setMode('list')} onSuccess={() => { setMode('list'); setTab('Catalog'); }} />
        )}

        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={() => setMode('list')}
            onEdit={(g) => handleNavigate('Edit', g)}
            onAddToCart={cart.addToCart}
          />
        )}

        {mode === 'edit-profile' && (
          <EditProfilePage onBack={() => setMode('list')} onSaveSuccess={() => { setMode('list'); setTab('Profile'); }} />
        )}

        {mode === 'list' && (
          <>
            {tab === 'Catalog' && <Catalog onNavigate={handleNavigate} onAddToCart={cart.addToCart} />}
            {tab === 'Favorites' && <FavoritesPage onSelectGun={(g) => handleNavigate('Detail', g)} onNavigateCatalog={() => setTab('Catalog')} />}
            {tab === 'Profile' && (
              <ProfilePage
                onNavigateEditProfile={() => handleNavigate('EditProfile')}
                onResumeDraft={() => handleNavigate('Create')}
              />
            )}
          </>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
      <PWABadge />
      <Footer />
    </div>
  )
}

export default App