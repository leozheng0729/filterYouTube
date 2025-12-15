import supabase from "./supabase"


// 获取用户订阅状态
export const getSubscriptionStatus = async (email: string) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('subfiltervideo')
    .select('*')
    .eq('email', email)
  if (error && error.code !== 'PGRST116') {
    console.error(error)
    return null
  }
  
  return data
}

