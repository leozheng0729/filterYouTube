// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.3.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
 
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
 
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// 产品ID对应表格
const productTable = {
  'prod_Tim4FRzSXsjCWD': 'product_filtervideo',
}

// This is needed in order to use the Web Crypto API in Deno.
serve(async (req: { headers: { get: (arg0: string) => any }; text: () => any }) => {
  try {
    // 获取Stripe签名
    const signature = req.headers.get('Stripe-Signature')!

    // 明确使用await获取原始请求体
    const rawBody = await req.text();
    
    // 确保环境变量在异步上下文中读取
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    // 数据处理
    const updateTable = async (tableName: string, props: { payid: any; productid?: any, amount: any; currency: any; status: any; email?: any; name?: any }) => {
      const {
        payid,
        productid,
        amount,
        currency,
        status,
        email,
        name,
      } = props;
	
      try{
        // 是否存在
        let { data: item, error } = await supabase
          .from(tableName)
          .select("*")
          .eq('payment_intent_id', payid)

          if (error && error.code !== 'PGRST116') {
            console.error('select', error)
            return null
          }
      
        if (item && (item.length > 0)) {
          // 更新
          const { data, error } = await supabase
            .from(tableName)
            .update({
              amount: amount,
              currency: currency,
              status: status,
              ...email ? { email: email } : {},
              ...name ? { name: name } : {},
              ...productid ? { product_id: productid } : {},
            })
            .eq('payment_intent_id', payid)
            .select();

            if (error && error.code !== 'PGRST116') {
            console.error('update', error)
            return null
          }
        } else {
          // 插入
          await supabase
          .from(tableName)
          .insert({
            payment_intent_id: payid,
            amount: amount,
            currency: currency,
            status: status,
            ...email ? { email: email } : {},
            ...name ? { name: name } : {},
            ...productid ? { product_id: productid } : {},
          });

          if (error && error.code !== 'PGRST116') {
            console.error('insert', error)
            return null
          }
        }
      }catch(error) {
        console.log('database', error);
      }
    }

    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentDetails = paymentIntent.payment_details;
      const productId = paymentDetails?.order_reference;

      await updateTable(productTable[productId], {
        payid: paymentIntent.id,
        productid: productId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      })
    }
    if (event.type === 'checkout.session.completed') {
      const paymentIntent = event.data.object;
      const email = paymentIntent.customer_details.email;
      const name = paymentIntent.customer_details.name;
      const amountTotal = paymentIntent.amount_total;
      await updateTable('order', {
        payid: paymentIntent.payment_intent,
        amount: amountTotal,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        email: email,
        name: name,
      })
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})