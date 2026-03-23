import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await supabase.from('commissions').insert({
      merchant_id: body.merchant_id,
      shop_name: body.shop_name,
      order_total: body.order_total,
      commission_amount: body.commission_amount,
      commission_rate: body.commission_rate,
      plan: body.plan,
      customer_name: body.customer_name,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
