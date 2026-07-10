import supabase from "./supabase"

export interface GetSubscriptionStatusOptions {
  /** Logged-in user email. */
  email: string
  /** Stripe / payment product price id, e.g. "prod_xxx". */
  productPriceId: string
  /**
   * Per-extension product table name in supabase, e.g. "product_filtervideo",
   * "product_filterpdf". Each extension owns its own product table.
   */
  productTable: string
}

export const getSubscriptionStatus = async ({
  email,
  productPriceId,
  productTable
}: GetSubscriptionStatusOptions) => {
  if (!email) return null

  const { data: orders, error: orderError } = await supabase
    .from("order")
    .select("*")
    .eq("email", email)

  if (orderError && orderError.code !== "PGRST116") {
    console.error(orderError)
    return null
  }

  for (const order of orders ?? []) {
    const { payment_intent_id: paymentIntentId } = order
    if (!paymentIntentId) continue

    const { data: items, error: productError } = await supabase
      .from(productTable)
      .select("*")
      .eq("payment_intent_id", paymentIntentId)
      .eq("product_id", productPriceId)

    if (productError && productError.code !== "PGRST116") {
      console.error(productError)
      return null
    }

    if (items && items.length > 0) return items
  }

  return null
}

