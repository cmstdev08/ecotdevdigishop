// Supabase Edge Function: admin-actions
// Performs privileged staff operations: role management, user lock/unlock, refunds, inventory additions

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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), { status: 401, headers: corsHeaders })
    }

    // Check staff permissions
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const userRoles = roles?.map((r) => r.role) || []
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN')
    const isAdmin = isSuperAdmin || userRoles.includes('ADMIN')

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: corsHeaders })
    }

    const body = await req.json()
    const { action, payload } = body

    let result: any = {}

    switch (action) {
      case 'SET_USER_ROLE': {
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: 'Only SUPER_ADMIN can modify roles' }), { status: 403, headers: corsHeaders })
        }
        const { targetUserId, newRole } = payload
        await supabase
          .from('user_roles')
          .upsert({ user_id: targetUserId, role: newRole }, { onConflict: 'user_id,role' })
        result = { success: true, message: `Role updated to ${newRole}` }
        break
      }

      case 'TOGGLE_USER_BAN': {
        const { targetUserId, isBanned } = payload
        await supabase
          .from('profiles')
          .update({ is_banned: isBanned })
          .eq('id', targetUserId)
        result = { success: true, isBanned }
        break
      }

      case 'REFUND_ORDER': {
        const { orderId, reason } = payload
        await supabase
          .from('orders')
          .update({ status: 'REFUNDED' })
          .eq('id', orderId)
        await supabase
          .from('payments')
          .update({ status: 'REFUNDED' })
          .eq('order_id', orderId)
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: 'REFUND_ORDER',
          target_type: 'ORDER',
          target_id: orderId,
          metadata: { reason },
        })
        result = { success: true, message: 'Order refunded' }
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
