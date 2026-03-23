// types/index.ts
export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  cost: number | null
  stock_quantity: number
  image_url: string | null
  category: string | null
  is_active: boolean
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  customer_name: string
  customer_phone: string | null
  customer_address: string | null
  total_amount: number
  shipping_cost: number
  status: 'pending' | 'paid' | 'cancelled'
  notes: string | null
  created_at: string
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Profile {
  id: string
  full_name: string | null
  shop_name: string | null
  phone: string | null
  plan: 'free' | 'pro' | 'business'
  created_at: string
}
