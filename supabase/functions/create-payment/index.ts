// Supabase Edge Function: create-payment
// Validates prices on the server, verifies coupons, creates pending order & transaction record

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { items, couponCode, customerName, customerEmail, customerPhone, paymentMethod } = body

    if (!items || !items.length) {
      return new Response(JSON.stringify({ error: 'No items in order' }), { status: 400, headers: corsHeaders })
    }

    // 1. Fetch products from database to calculate server-authoritative prices (anti-tamper)
    const productIds = items.map((i: any) => i.productId)
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, sale_price, product_type, status')
      .in('id', productIds)

    if (prodError || !dbProducts) {
      return new Response(JSON.stringify({ error: 'Failed to verify products' }), { status: 400, headers: corsHeaders })
    }

    let subtotal = 0
    const verifiedOrderItems: any[] = []

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId)
      if (!dbProd || dbProd.status !== 'PUBLISHED') {
        return new Response(JSON.stringify({ error: `Product not available: ${item.productId}` }), { status: 400, headers: corsHeaders })
      }
      const unitPrice = dbProd.sale_price ? Number(dbProd.sale_price) : Number(dbProd.price)
      const qty = Math.max(1, Number(item.quantity) || 1)
      const itemSubtotal = unitPrice * qty
      subtotal += itemSubtotal

      verifiedOrderItems.push({
        product_id: dbProd.id,
        product_name: dbProd.name,
        product_type: dbProd.product_type,
        unit_price: unitPrice,
        quantity: qty,
        subtotal: itemSubtotal,
      })
    }

    // 2. Validate Coupon
    let discount = 0
    let appliedCouponId: string | null = null

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (coupon) {
        const now = new Date()
        const starts = new Date(coupon.starts_at)
        const expires = new Date(coupon.expires_at)

        if (now >= starts && now <= expires && subtotal >= Number(coupon.min_order_value)) {
          if (coupon.discount_type === 'PERCENTAGE') {
            discount = (subtotal * Number(coupon.discount_value)) / 100
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, Number(coupon.max_discount_amount))
            }
          } else {
            discount = Number(coupon.discount_value)
          }
          appliedCouponId = coupon.id
        }
      }
    }

    const total = Math.max(0, subtotal - discount)
    const orderCode = `ECOT-${Math.floor(100000 + Math.random() * 900000)}`

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_code: orderCode,
        customer_name: customerName || user.email?.split('@')[0],
        customer_email: customerEmail || user.email,
        customer_phone: customerPhone,
        subtotal,
        discount,
        total,
        coupon_id: appliedCouponId,
        payment_method: paymentMethod || 'BANK_TRANSFER',
        status: 'PENDING',
      })
      .select()
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: orderError?.message || 'Could not create order' }), { status: 500, headers: corsHeaders })
    }

    // 4. Create Order Items
    const itemsToInsert = verifiedOrderItems.map((oi) => ({
      ...oi,
      order_id: order.id,
    }))
    await supabase.from('order_items').insert(itemsToInsert)

    // 5. Create Payment record
    const transactionCode = `TXN-${orderCode}-${Date.now()}`
    await supabase.from('payments').insert({
      order_id: order.id,
      payment_method: paymentMethod || 'BANK_TRANSFER',
      transaction_code: transactionCode,
      amount: total,
      status: 'PENDING',
    })

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          orderCode: order.order_code,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          status: order.status,
          transactionCode,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
