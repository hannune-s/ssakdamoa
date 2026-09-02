"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface VisitorStat {
  id: string;
  visited_at: string;
  referrer: string;
  is_instagram: boolean;
  path: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<VisitorStat[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [instagramCount, setInstagramCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // 한국 시간 기준 오늘 자정 구하기
      const now = new Date();
      const kstOffset = 9 * 60 * 60 * 1000; // UTC+9
      const kstNow = new Date(now.getTime() + kstOffset);
      kstNow.setUTCHours(0, 0, 0, 0); // KST 자정
      const startOfTodayIso = new Date(kstNow.getTime() - kstOffset).toISOString();

      // 1. 오늘 총 방문자 수 카운팅
      const { count: totalCount, error: totalError } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', startOfTodayIso);

      if (totalError) throw totalError;

      // 2. 오늘 인스타그램 유입 수 카운팅
      const { count: instaCount, error: instaError } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', startOfTodayIso)
        .eq('is_instagram', true);

      if (instaError) throw instaError;

      // 3. 최근 접속 기록 딱 10건만 가져오기
      const { data, error: listError } = await supabase
        .from('analytics')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(10);

      if (listError) throw listError;

      setTodayTotal(totalCount || 0);
      setInstagramCount(instaCount || 0);
      if (data) setStats(data);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">방문자 접속 통계</h1>
      <p className="text-gray-500 mb-8">싹다모아 플랫폼의 통합 관리자 시스템입니다.</p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 오늘 총 방문자 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 flex flex-col justify-center">
          <h3 className="text-gray-500 font-semibold mb-2">오늘 총 방문자</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-blue-600">{loading ? '-' : todayTotal}</span>
            <span className="text-gray-500">명</span>
          </div>
        </div>

        {/* 인스타그램 유입 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-pink-500 flex flex-col justify-center">
          <h3 className="text-gray-500 font-semibold mb-2">인스타그램 유입 (오늘)</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-pink-600">{loading ? '-' : instagramCount}</span>
            <span className="text-gray-500">명</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            비중: {todayTotal > 0 ? Math.round((instagramCount / todayTotal) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* 최근 접속 기록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold">최근 접속 기록 (최근 10건)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-3 font-semibold">접속 시간</th>
                <th className="px-6 py-3 font-semibold">유입 경로 (Referrer)</th>
                <th className="px-6 py-3 font-semibold">인스타그램 여부</th>
                <th className="px-6 py-3 font-semibold">접속 페이지</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">데이터를 불러오는 중입니다...</td>
                </tr>
              ) : stats.slice(0, 10).map((stat) => (
                <tr key={stat.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(stat.visited_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs text-gray-600">
                    {stat.referrer || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {stat.is_instagram ? (
                      <span className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">인스타</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">일반</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{stat.path}</td>
                </tr>
              ))}
              {!loading && stats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">접속 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
