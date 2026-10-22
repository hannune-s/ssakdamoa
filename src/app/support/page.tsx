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

export default function SupportPage() {
  const [mainTab, setMainTab] = useState<'notice' | 'inquiry'>('notice');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  // Inquiry States
  const [formData, setFormData] = useState({ name: '', company: '', phone: '', email: '', message: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setNoticesLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    setErrorMsg('');
    
    const finalMessage = `[1:1 문의]\n${formData.message}`;
    const submitData = { ...formData, message: finalMessage };
    
    try {
      const { error } = await supabase.from('ssakdamoa_inquiries').insert([submitData]);
      if (error) throw error;
      
      setFormData({ name: '', company: '', phone: '', email: '', message: '' });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('전송 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleTabChange = (tab: 'notice' | 'inquiry') => {
    setMainTab(tab);
    setSelectedNotice(null);
    setSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-32 px-4 font-sans">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-start">
        
        {/* 왼쪽 사이드 메뉴 */}
        <aside className="w-full md:w-60 shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h1 className="text-xl font-extrabold text-blue-600 tracking-tight">공지·문의</h1>
              <p className="text-xs text-gray-400 mt-1">싹다모아 소식 및 고객센터</p>
            </div>

            <nav className="flex flex-row md:flex-col gap-2">
              <button
                onClick={() => handleTabChange('notice')}
                className={`flex-1 md:w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all text-left ${
                  mainTab === 'notice'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>📢</span>
                  <span>공지게시판</span>
                </span>
                <span className={`hidden md:inline text-xs ${mainTab === 'notice' ? 'text-blue-100' : 'text-gray-300'}`}>
                  ❯
                </span>
              </button>

              <button
                onClick={() => handleTabChange('inquiry')}
                className={`flex-1 md:w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all text-left ${
                  mainTab === 'inquiry'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>💬</span>
                  <span>1:1 문의</span>
                </span>
                <span className={`hidden md:inline text-xs ${mainTab === 'inquiry' ? 'text-blue-100' : 'text-gray-300'}`}>
                  ❯
                </span>
              </button>
            </nav>
          </div>

          {/* 좌측 하단 안내 카드 (PC 표시) */}
          <div className="hidden md:block bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
            <p className="font-bold text-blue-700 mb-1">💡 안내사항</p>
            필요한 서식 요청이나 서비스 제휴·건의사항은 <b>1:1 문의</b> 메뉴를 통해 남겨주시면 빠르게 확인 후 답변드립니다.
          </div>
        </aside>

        {/* 오른쪽 메인 화면 영역 */}
        <section className="flex-1 w-full min-w-0">
          {/* 1. 공지게시판 화면 */}
          {mainTab === 'notice' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
              {/* 상단 타이틀 헤더 */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800">📢 공지게시판</h2>
                  <p className="text-xs text-gray-500 mt-1">새로운 소식과 유용한 정보를 확인하세요.</p>
                </div>
                {selectedNotice && (
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    ← 목록으로
                  </button>
                )}
              </div>

              {/* 게시글 상세 보기 화면 vs 게시글 목록 화면 */}
              {selectedNotice ? (
                <div className="p-6 md:p-8 min-h-[340px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        selectedNotice.type === 'notice' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'
                      }`}>
                        {selectedNotice.type === 'notice' ? '공지' : '소식'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 pb-5 mb-6 border-b border-gray-100">
                      {selectedNotice.title}
                    </h3>
                    <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[180px]">
                      {selectedNotice.content}
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setSelectedNotice(null)}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                    >
                      목록으로 돌아가기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-3 flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>제목</span>
                  </div>

                  <div className="flex flex-col min-h-[340px] divide-y divide-gray-100">
                    {noticesLoading ? (
                      <div className="flex justify-center items-center h-60 text-gray-400 text-sm">
                        게시글을 불러오는 중입니다...
                      </div>
                    ) : notices.length > 0 ? (
                      notices.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedNotice(item)}
                          className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-blue-50/40 transition-colors gap-3 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              item.type === 'notice' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'
                            }`}>
                              {item.type === 'notice' ? '공지' : '소식'}
                            </span>
                            <h3 className="font-semibold text-[15px] text-gray-800 group-hover:text-blue-600 truncate transition-colors">
                              {item.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-gray-300 group-hover:text-blue-500 text-xs transition-colors">
                              ❯
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col justify-center items-center h-60 text-gray-400 text-sm gap-2">
                        <span className="text-3xl">📭</span>
                        등록된 게시글이 없습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. 1:1 문의 화면 */}
          {mainTab === 'inquiry' && (
            <div className="animate-fade-in-up">
              {submitted ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">접수가 완료되었습니다</h2>
                  <p className="text-gray-500 mb-6 text-sm">
                    보내주신 소중한 문의 내용을 꼼꼼히 확인 후<br/>최대한 빠르게 연락드리겠습니다.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    추가 문의 작성하기
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                  <div className="mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-extrabold text-gray-800">💬 1:1 문의 작성</h2>
                    <p className="text-xs text-gray-500 mt-1">궁금하신 점이나 건의사항을 남겨주시면 빠르게 답변드리겠습니다.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-gray-700">이름 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" required placeholder="예: 홍길동"
                          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-gray-700">연락처 <span className="text-red-500">*</span></label>
                        <input 
                          type="tel" required placeholder="예: 010-1234-5678"
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-700">이메일 (선택)</label>
                      <input 
                        type="email" placeholder="예: ssakda@moa.com"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-700">문의 내용 <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="문의하실 내용이나 건의사항을 자유롭게 작성해주세요."
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={inquiryLoading}
                      className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-sm mt-1 ${
                        inquiryLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {inquiryLoading ? '전송 중...' : '1:1 문의 접수하기'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
