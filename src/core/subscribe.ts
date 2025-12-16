import supabase from "./supabase"

// 产品ID
const PLASMO_PRODUCT_PRICE_ID = "prod_TbnSYMJWfIFs3K";


// 获取用户订阅状态
export const getSubscriptionStatus = async (email: string) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('order')
    .select('*')
    .eq('email', email)

  if (error && error.code !== 'PGRST116') {
    console.error(error)
    return null
  }

  const { payment_intent_id: paymentIntentId } = data?.[0] || {}

  const { data: item, error: err } = await supabase
    .from('product')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .eq('product_id', PLASMO_PRODUCT_PRICE_ID)

  if (err && err.code !== 'PGRST116') {
    console.error(err)
    return null
  }
  return item
}

