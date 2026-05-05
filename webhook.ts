// supabase/functions/stripe-webhook/index.ts
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.3.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
 
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

// 在代码中打印密钥前缀以调试
const keyPrefix = Deno.env.get('STRIPE_SECRET_KEY')!.substring(0, 7);
console.log(`Using Stripe key starting with: ${keyPrefix}`);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// 产品ID对应表格
const productTable = {
  'prod_Tim4FRzSXsjCWD': 'product_filtervideo',
  'prod_TbnSYMJWfIFs3K': 'product_filtervideo',
}

// 获取Checkout Session的产品ID
async function getProductIdFromCheckoutSession(sessionId) {
  try {
    // 1. 获取 Checkout Session 的详细信息
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'] // 展开line_items以获取产品信息
    });
    
    // 2. 从 line_items 中提取产品信息
    const lineItems = session.line_items.data;
    const products = lineItems.map(item => ({
      productId: item.price.product.id,
      productName: item.price.product.name,
      quantity: item.quantity
    }));

    return products;
  } catch (error) {
    console.error('Error retrieving session:', error);
    throw error;
  }
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
      const orderReference = paymentDetails?.order_reference;
      const products = await getProductIdFromCheckoutSession(orderReference);
      const productId = products[0]['productId'];
      // @ts-ignore
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