import { createClient } from "@supabase/supabase-js"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "local"
})

const supabase = createClient(
  process.env.PLASMO_PUBLIC_SUPABASE_URL,
  process.env.PLASMO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export default supabase;

// 获取当前登录用户信息
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// 登出
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('登出失败:', error.message);
    throw error;
  }
};

// 发送重置密码邮件
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error('发送重置密码邮件失败:', error.message);
    throw error;
  }
};

// 更新用户密码
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('更新密码失败:', error.message);
    throw error;
  }
};

// 检查重置密码会话
export const checkResetSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};