import supabase from './supabase';

// 调用函数
export const invokeCleverTask = async () => {
  const { data, error } = await supabase.functions.invoke('clever-task', {
    body: { name: 'Functions' },
  })
  if (error) {
    console.error('获取书籍列表失败:', error.message);
    throw error;
  }

  return data;
}
