'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, AlertTriangle, Package, Box, ExternalLink, Search } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const deleteProduct = async (id: string) => {
    const result = await Swal.fire({
      title: 'حذف المنتج؟',
      text: "سيتم حذف المنتج وجميع بياناته من المخزن نهائياً",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#111',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      background: '#111',
      color: '#fff'
    })

    if (result.isConfirmed) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        Swal.fire({ icon: 'success', title: 'تم الحذف', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' })
        load()
      }
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box size={28} /> المخزن الرقمي
          </h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>إدارة مخزونك وتسعير منتجاتك (تحت الرقابة الذكية)</p>
        </div>
        <Link href="/dashboard/products/new" style={{ background: '#D4AF37', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> منتج جديد
        </Link>
      </header>

      {/* Search & Filter */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
        <input style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.9rem 2.8rem 0.9rem 1rem', borderRadius: '15px', color: '#fff' }} 
          placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1/-1', background: '#111', borderRadius: '2rem', border: '1px dashed #222' }}>
            <Package size={50} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: '#444' }}>لا يوجد منتجات حالياً</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#050505', border: '1px solid #222', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={24} color="#222" />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{p.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#444', margin: '4px 0' }}>{p.category || 'بدون تصنيف'}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#D4AF37', fontWeight: 900 }}>{formatPrice(p.price)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#e74c3c' }}>تكلفة: {formatPrice(p.cost || 0)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: (p.stock || 0) < 5 ? '#e74c3c' : '#2ecc71' }}>
                    <Box size={14} /> {p.stock || 0} في المخزن
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: p.is_active ? '#2ecc7120' : '#4442', color: p.is_active ? '#2ecc71' : '#444' }}>
                    {p.is_active ? 'نشط' : 'مسودة'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/dashboard/products/${p.id}/edit`} style={{ color: '#D4AF37', background: '#D4AF3715', padding: '8px', borderRadius: '10px' }}><Pencil size={16} /></Link>
                  <button onClick={() => deleteProduct(p.id)} style={{ color: '#e74c3c', background: '#e74c3c15', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
