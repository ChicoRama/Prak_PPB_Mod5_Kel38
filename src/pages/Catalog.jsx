import { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen, Archive, Check } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import { matchesSearch, matchesCategory, sortItems, extractCategories } from '../utils/helpers'

const PAGE_SIZE = 6

export default function Catalog({ onNavigate, onAddToCart }) {
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 100 })
  const [useLocal, setUseLocal] = useState(false)
  const [viewArchived, setViewArchived] = useState(false)

  const rawGuns = useMemo(() => {
    if (useLocal || (error && apiGuns.length === 0)) {
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, error, useLocal])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  // Filter Active vs Archived (Soft Deleted)
  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter((g) => {
      const matchSearch = matchesSearch(g, search)
      const matchCat = matchesCategory(g, activeCategory)
      const isArchived = Boolean(g.is_archived)
      return matchSearch && matchCat && (viewArchived ? isArchived : !isArchived)
    })
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder, viewArchived])

  // Pagination calculation
  const totalPages = Math.ceil(filteredGuns.length / PAGE_SIZE) || 1
  const paginatedGuns = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredGuns.slice(start, start + PAGE_SIZE)
  }, [filteredGuns, page])

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory, sortKey, sortOrder, viewArchived])

  // Modal target
  const [selectedGun, setSelectedGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isPermanentDelete, setIsPermanentDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      if (isPermanentDelete) {
        await gunService.deleteGunPermanently(deleteTarget.id)
      } else {
        await gunService.softDeleteGun(deleteTarget.id)
      }
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(err.message || 'Gagal menghapus.')
    } finally {
      setDeleting(false)
    }
  }

  const handleRestore = async (gun) => {
    await gunService.restoreGun(gun.id)
    refetch()
  }

  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => { setSelectedGun(null); setDeleteTarget(g); setIsPermanentDelete(false); }}
        onAddToCart={onAddToCart}
      />
    )
  }

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">A small armory of pistols, rifles, and shotguns.</p>
      </section>

      <section>
        <div className="list-head">
          <div className="view-toggle-tabs">
            <button
              type="button"
              className={`tab-btn ${!viewArchived ? 'tab-btn--active' : ''}`}
              onClick={() => setViewArchived(false)}
            >
              Aktif ({rawGuns.filter(g => !g.is_archived).length})
            </button>
            <button
              type="button"
              className={`tab-btn ${viewArchived ? 'tab-btn--active' : ''}`}
              onClick={() => setViewArchived(true)}
            >
              <Archive size={14} /> Arsip / Soft Deleted ({rawGuns.filter(g => g.is_archived).length})
            </button>
          </div>

          <div className="list-head-right">
            {onNavigate && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onNavigate('Create')}>
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

        {!loading && paginatedGuns.length === 0 && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>{viewArchived ? 'Tidak ada hardware di arsip.' : 'Tidak ada produk yang cocok.'}</p>
          </div>
        )}

        {paginatedGuns.length > 0 && (
          <>
            <ul className="stock">
              {paginatedGuns.map((gun) => (
                <GunCard
                  key={gun.id || gun.name}
                  gun={gun}
                  onSelect={setSelectedGun}
                  onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                  onDelete={(g, isPerm) => { setDeleteTarget(g); setIsPermanentDelete(isPerm); }}
                  onRestore={handleRestore}
                  onAddToCart={onAddToCart}
                />
              ))}
            </ul>

            {/* Paginasi Katalog */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-num-info">Halaman {page} dari {totalPages}</span>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title={isPermanentDelete ? 'Hapus Permanen' : 'Arsipkan Hardware (Soft Delete)'}
        message={
          isPermanentDelete
            ? `Apakah kamu yakin ingin menghapus "${deleteTarget?.name}" secara permanen?`
            : `Pindahkan "${deleteTarget?.name}" ke arsip? Produk ini bisa dipulihkan kembali.`
        }
        confirmLabel={isPermanentDelete ? 'Hapus Permanen' : 'Arsipkan'}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}