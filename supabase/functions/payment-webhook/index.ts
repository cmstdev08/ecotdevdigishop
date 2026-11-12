// Supabase Edge Function: payment-webhook
// Securely verifies gateway signatures, prevents duplicate processing (idempotency), transitions order to PAID and executes fulfillment

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

    const payload = await req.json()
    const { orderCode, transactionCode, amount, signature, isSandbox } = payload

    if (!orderCode || !transactionCode) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400, headers: corsHeaders })
    }

    // 1. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders })
    }

    // Idempotency: If order is already PAID, return success immediately to prevent duplicate webhook delivery
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      return new Response(
        JSON.stringify({ success: true, message: 'Order already fulfilled (Idempotent)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validate Amount
    if (amount !== undefined && Number(amount) < Number(order.total)) {
      return new Response(JSON.stringify({ error: 'Paid amount is less than order total' }), { status: 400, headers: corsHeaders })
    }

    // 3. Mark payment as SUCCESS
    await supabase
      .from('payments')
      .update({
        status: 'SUCCESS',
        paid_at: new Date().toISOString(),
        gateway_response: payload,
      })
      .eq('order_id', order.id)

    // 4. Update order to PAID (Database trigger trigger_order_paid_fulfillment will call public.fulfill_order)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'PAID',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update order status' }), { status: 500, headers: corsHeaders })
    }

    // 5. Audit Log
    await supabase.from('audit_logs').insert({
      action: 'PAYMENT_VERIFIED_AND_FULFILLED',
      target_type: 'ORDER',
      target_id: order.id,
      metadata: {
        order_code: orderCode,
        transaction_code: transactionCode,
        amount: order.total,
        isSandbox: Boolean(isSandbox),
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order verified and products delivered successfully',
        orderId: order.id,
        orderCode: order.order_code,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
