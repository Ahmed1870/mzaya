import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Package, Truck, Wallet, TrendingUp, ArrowUpRight, PlusCircle, Globe, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // سحب البيانات من كل التروس المربوطة
  const [products, orders, wallet, profile] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'returned'),
    supabase.from('wallet').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('business_name, username').eq('id', user.id).maybeSingle()
  ])

  const stats = [
    { label: 'إجمالي المنتجات', value: products.count || 0, icon: Package, color: '#D4AF37' },
    { label: 'طلبات المتجر', value: orders.count || 0, icon: ShoppingBag, color: '#2ECC71' },
    { label: 'الرصيد المتاح', value: formatPrice(wallet?.data?.balance || 0), icon: Wallet, color: '#3498DB' },
    { label: 'صافي الأرباح', value: formatPrice(wallet?.data?.total_revenue || 0), icon: TrendingUp, color: '#9B59B6' },
  ]

  const storeUrl = `https://mzaya.shop/store/${profile.data?.username || ''}`

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37', marginBottom: '0.5rem' }}>
            أهلاً بك في {profile.data?.business_name || 'مزايا'} 🚀
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>إليك ملخص أداء إمبراطوريتك اليوم</p>
        </div>
        <Link href="/dashboard/products" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}>
            <PlusCircle size={18} /> إضافة منتج
          </button>
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: `${stat.color}15`, width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p style={{ color: '#444', fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>{stat.label}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ padding: '2rem', background: 'linear-gradient(145deg, #111, #080808)', borderRadius: '2.2rem', border: '1px solid #D4AF3720', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><Globe size={150} color="#D4AF37"/></div>
          
          <h3 style={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Globe size={20} /> رابط متجرك أونلاين
          </h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            انسخ الرابط وشاركه مع عملائك على السوشيال ميديا لاستقبال الطلبات مباشرة في "رادار الطلبات".
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#050505', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #222', color: '#888', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {storeUrl}
            </div>
            <a href={storeUrl} target="_blank" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                معاينة المتجر <ArrowUpRight size={16} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
