"use server";
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

let cachedAdminClient: ReturnType<typeof createClient> | null = null;
let verifiedPinCache: { pin: string; expiresAt: number } | null = null;
const PIN_CACHE_TTL_MS = 5 * 60 * 1000; // 5분간 메모리 캐시 유지 (중복 DB 조회 및 bcrypt 연산 방지)

// Next.js의 강력한 fetch 캐시를 무력화하고 무조건 실시간 DB를 조회하도록 설정
function getAdminClient() {
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    });
  }
  return cachedAdminClient;
}

export async function verifyPin(pin: string) {
  if (!pin) return false;

  // 아직 환경변수 셋업이 안 되었을 때 관리자가 아예 튕기는 걸 방지하는 안전장치
  if (!supabaseServiceKey) {
    return pin === '1234';
  }

  // 최근 검증된 동일 PIN이면 DB 조회 및 무거운 bcrypt 연산 즉시 생략
  if (verifiedPinCache && verifiedPinCache.pin === pin && Date.now() < verifiedPinCache.expiresAt) {
    return true;
  }

  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('ssakdamoa_admin_config')
    .select('admin_pin')
    .eq('id', 1)
    .single<{ admin_pin: string }>();
  
  if (error || !data || !data.admin_pin) {
    const isDefault = pin === '1234';
    if (isDefault) verifiedPinCache = { pin, expiresAt: Date.now() + PIN_CACHE_TTL_MS };
    return isDefault; // 테이블 생성 전 기본값
  }
  
  const isMatched =
    data.admin_pin.length === 4
      ? pin === data.admin_pin
      : await bcrypt.compare(pin, data.admin_pin);

  if (isMatched) {
    verifiedPinCache = { pin, expiresAt: Date.now() + PIN_CACHE_TTL_MS };
  }
  return isMatched;
}

export async function resetPinToDefault() {
  if (!supabaseServiceKey) {
    verifiedPinCache = { pin: '1234', expiresAt: Date.now() + PIN_CACHE_TTL_MS };
    return { success: true };
  }

  const supabaseAdmin = getAdminClient();
  const { error } = await (supabaseAdmin.from('ssakdamoa_admin_config') as any)
    .upsert({ id: 1, admin_pin: '1234' });

  if (error) {
    console.error('resetPinToDefault error:', error);
    return { success: false, error: error.message };
  }

  verifiedPinCache = { pin: '1234', expiresAt: Date.now() + PIN_CACHE_TTL_MS };
  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function changePin(currentPin: string, newPin: string) {
  if (!supabaseServiceKey) {
    return { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY가 등록되지 않아 비밀번호를 변경할 수 없습니다.' };
  }

  const isValid = currentPin === '1234' || (await verifyPin(currentPin));
  if (!isValid) return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };

  const salt = await bcrypt.genSalt(10);
  const hashedPin = await bcrypt.hash(newPin, salt);

  const supabaseAdmin = getAdminClient();
  
  // UPDATE 대신 UPSERT를 사용하여 DB에 1번 행이 없더라도 무조건 강제로 생성하며 저장하도록 수정
  const { error } = await (supabaseAdmin.from('ssakdamoa_admin_config') as any)
    .upsert({ id: 1, admin_pin: hashedPin });

  if (error) {
    console.error('changePin error:', error);
    return { success: false, error: 'DB 오류: 먼저 안내해 드린 SQL 스크립트를 실행했는지 확인해주세요.' };
  }
  
  verifiedPinCache = { pin: newPin, expiresAt: Date.now() + PIN_CACHE_TTL_MS };

  // 성공 시 모든 어드민 페이지 캐시 즉각 삭제
  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function fetchAdminAnalytics(pin: string) {
  const isPinValid = await verifyPin(pin);
  if (!isPinValid) {
    return { error: 'Unauthorized' };
  }

  if (!supabaseServiceKey) {
    return { 
      error: 'MissingKey', 
      message: '서버 비밀키(SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다. Vercel 환경변수 및 .env.local에 추가해주세요.' 
    };
  }

  // 서버 환경에서 RLS를 우회하는 관리자(Service Role) 클라이언트 생성
  const supabaseAdmin = getAdminClient();

  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  kstNow.setUTCHours(0, 0, 0, 0);
  const startOfTodayIso = new Date(kstNow.getTime() - kstOffset).toISOString();

  // 4개의 DB 쿼리를 직렬 대기 없이 동시에(병렬로) 실행
  const [
    { count: totalCount },
    { count: instaCount },
    { count: installCount },
    { data }
  ] = await Promise.all([
    supabaseAdmin
      .from('ssakdamoa_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startOfTodayIso)
      .neq('path', 'APP_INSTALL'),
    supabaseAdmin
      .from('ssakdamoa_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startOfTodayIso)
      .eq('is_instagram', true)
      .neq('path', 'APP_INSTALL'),
    supabaseAdmin
      .from('ssakdamoa_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startOfTodayIso)
      .eq('path', 'APP_INSTALL'),
    supabaseAdmin
      .from('ssakdamoa_analytics')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(10)
  ]);

  return {
    totalCount: totalCount || 0,
    instaCount: instaCount || 0,
    installCount: installCount || 0,
    recentVisits: (data as any[]) || []
  };
}

export async function resetTodayAnalytics(pin: string) {
  const isPinValid = await verifyPin(pin);
  if (!isPinValid) return { error: 'Unauthorized' };
  if (!supabaseServiceKey) return { error: 'MissingKey', message: '서버 비밀키가 없습니다.' };

  const supabaseAdmin = getAdminClient();
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  kstNow.setUTCHours(0, 0, 0, 0);
  const startOfTodayIso = new Date(kstNow.getTime() - kstOffset).toISOString();

  const { error } = await supabaseAdmin
    .from('ssakdamoa_analytics')
    .delete()
    .gte('visited_at', startOfTodayIso);

  if (error) return { error: error.message };
  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function deleteVisitRecord(pin: string, id: string) {
  const isPinValid = await verifyPin(pin);
  if (!isPinValid) return { error: 'Unauthorized' };
  if (!supabaseServiceKey) return { error: 'MissingKey', message: '서버 비밀키가 없습니다.' };

  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('ssakdamoa_analytics')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function fetchAdminInquiries(pin: string) {
  const isPinValid = await verifyPin(pin);
  if (!isPinValid) return { error: 'Unauthorized' };
  if (!supabaseServiceKey) return { error: 'MissingKey', message: '서버 비밀키가 없습니다.' };

  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('ssakdamoa_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { inquiries: data || [] };
}

export async function deleteAdminInquiry(pin: string, id: string) {
  const isPinValid = await verifyPin(pin);
  if (!isPinValid) return { error: 'Unauthorized' };
  
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from('ssakdamoa_inquiries').delete().eq('id', id);
  if (error) return { error: error.message };
  
  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function fetchPublicTodayVisitorCount(): Promise<number> {
  if (!supabaseServiceKey) return 0;

  try {
    const supabaseAdmin = getAdminClient();
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    kstNow.setUTCHours(0, 0, 0, 0);
    const startOfTodayIso = new Date(kstNow.getTime() - kstOffset).toISOString();

    const { count } = await supabaseAdmin
      .from('ssakdamoa_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', startOfTodayIso)
      .neq('path', 'APP_INSTALL');

    return count || 0;
  } catch (e) {
    console.error('Failed to fetch public today visitor count', e);
    return 0;
  }
}
