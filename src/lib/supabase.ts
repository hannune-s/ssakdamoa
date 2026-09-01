import { createClient } from '@supabase/supabase-js';

// 환경 변수가 없을 경우를 대비한 예외 처리 포함
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Hannune-Dev Supabase 프로젝트와 연결될 클라이언트 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
