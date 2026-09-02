"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface NoticeItem {
  id: string;
  type: 'notice' | 'news';
  title: string;
  content: string;
  created_at: string;
}

export default function NoticesPage() {
  const [activeTab, setActiveTab] = useState<'notice' | 'news'>('notice');
  const [openId, setOpenId] = useState<string | null>(null);
  
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // DB에서 데이터 불러오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data, error } = await supabase
          .from('ssakdamoa_notices')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setNotices(data);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const filteredData = notices.filter(item => item.type === activeTab);

  // 아코디언 열기/닫기 토글 함수
  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  // 날짜 포맷 (예: 2026. 09. 02)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-28 px-4 font-sans">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-2">공지·안내</h1>
        <p className="text-gray-500 text-sm">서비스 업데이트 및 유용한 소식을 전해드립니다.</p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => { setActiveTab('notice'); setOpenId(null); }}
            className={`flex-1 py-4 font-bold text-[15px] transition-colors relative ${activeTab === 'notice' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            공지사항
            {activeTab === 'notice' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('news'); setOpenId(null); }}
            className={`flex-1 py-4 font-bold text-[15px] transition-colors relative ${activeTab === 'news' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            소식
            {activeTab === 'news' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400 text-sm">
              게시글을 불러오는 중입니다...
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                <button 
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className={`font-semibold text-[15px] leading-tight ${openId === item.id ? 'text-blue-600' : 'text-gray-800'}`}>
                      {item.title}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{formatDate(item.created_at)}</span>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform duration-300 ${openId === item.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {/* Content Area (펼쳐지는 부분) */}
                {openId === item.id && (
                  <div className="px-5 py-6 bg-gray-50/80 text-gray-600 text-sm leading-relaxed border-t border-gray-100 whitespace-pre-wrap">
                    {item.content}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-400 text-sm">
              아직 등록된 게시글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
