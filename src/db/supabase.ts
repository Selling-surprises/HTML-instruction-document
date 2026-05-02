import { createClient } from "@supabase/supabase-js";

// 获取环境变量，如果未设置则使用占位值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// 检查是否使用了占位值
const isPlaceholder = supabaseUrl === 'https://placeholder.supabase.co';

if (isPlaceholder && typeof window !== 'undefined') {
  console.warn('⚠️ Supabase 环境变量未配置，使用占位值。部分功能可能无法正常工作。');
  console.warn('请在环境变量中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);