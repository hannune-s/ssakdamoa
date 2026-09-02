"use server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

export async function fetchAdminAnalytics(pin: string) {
  if (pin !== '1234') {
    return { error: 'Unauthorized' };
  }

  if (!supabaseServiceKey) {
    return { 
      error: 'MissingKey', 
      message: '서버 비밀키(SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다. Vercel 환경변수 및 .env.local에 추가해주세요.' 
    };
  }

  // 서버 환경에서 RLS를 우회하는 관리자(Service Role) 클라이언트 생성
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  kstNow.setUTCHours(0, 0, 0, 0);
  const startOfTodayIso = kstNow.toISOString();

  const { count: totalCount } = await supabaseAdmin
    .from('ssakdamoa_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('visited_at', startOfTodayIso);

  const { count: instaCount } = await supabaseAdmin
    .from('ssakdamoa_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('visited_at', startOfTodayIso)
    .eq('is_instagram', true);

  const { data } = await supabaseAdmin
    .from('ssakdamoa_analytics')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(10);

  return {
    totalCount: totalCount || 0,
    instaCount: instaCount || 0,
    recentVisits: data || []
  };
}
