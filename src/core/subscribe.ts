import supabase from "./supabase"


// 获取用户订阅状态
// const getSubscriptionStatus = async () => {
//   const { data, error } = await supabase
//     .from('subscriptions')
//     .select('*')
//     .eq('user_id', currentUser.id)
//     .single()
  
//   if (error && error.code !== 'PGRST116') {
//     console.error(error)
//     return null
//   }
  
//   return data
// }

// 订阅支付记录更新
export const subscribeToPaymentUpdates = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    supabase
      .channel('payments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments' },
        (payload) => {
          // 更新UI显示最新支付
          console.log('New payment:', payload, payload.new);
          
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error('订阅失败:', error);
          reject(error);
        } else if (status === 'SUBSCRIBED') {
          console.log('支付更新订阅成功');
          resolve();
        }
      });
  });
}

// checkout 支付成功后调用