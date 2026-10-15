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
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(null);
  
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

  const toggleAccordion = (id: string) => {
    setOpenNoticeId(openNoticeId === id ? null : id);
  };

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

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans pb-28">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">접수가 완료되었습니다</h2>
          <p className="text-gray-500 mb-6 text-sm">보내주신 소중한 문의 내용을 꼼꼼히 확인 후<br/>최대한 빠르게 연락드리겠습니다.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-32 px-4 font-sans">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-2">공지·문의</h1>
        <p className="text-gray-500 text-sm">
          {mainTab === 'notice' ? '새로운 소식과 유용한 정보를 확인하세요.' : '궁금하신 점이나 건의사항을 남겨주시면 빠르게 답변드리겠습니다.'}
        </p>
      </div>

      {/* Main Tabs */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-1 mb-6 flex">
        <button
          onClick={() => setMainTab('notice')}
          className={`flex-1 py-3 text-[15px] font-bold rounded-xl transition-colors ${
            mainTab === 'notice' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          공지게시판
        </button>
        <button
          onClick={() => setMainTab('inquiry')}
          className={`flex-1 py-3 text-[15px] font-bold rounded-xl transition-colors ${
            mainTab === 'inquiry' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          1:1 문의
        </button>
      </div>

      {mainTab === 'notice' && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
          {/* 게시판 헤더 */}
          <div className="bg-gray-50/80 border-b border-gray-200 px-5 py-3 flex justify-between items-center text-xs font-bold text-gray-500">
            <span>제목</span>
            <span>작성일</span>
          </div>

          <div className="flex flex-col min-h-[300px] divide-y divide-gray-100">
            {noticesLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-400 text-sm">
                게시글을 불러오는 중입니다...
              </div>
            ) : notices.length > 0 ? (
              notices.map((item) => (
                <div key={item.id}>
                  <button 
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        item.type === 'notice' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'
                      }`}>
                        {item.type === 'notice' ? '공지' : '소식'}
                      </span>
                      <h3 className={`font-semibold text-[15px] truncate ${openNoticeId === item.id ? 'text-blue-600' : 'text-gray-800'}`}>
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                      <span className="text-gray-300 text-xs">
                        {openNoticeId === item.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  {openNoticeId === item.id && (
                    <div className="p-5 bg-gray-50 text-sm text-gray-700 leading-relaxed border-t border-gray-100 whitespace-pre-wrap">
                      {item.content}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col justify-center items-center h-48 text-gray-400 text-sm gap-2">
                <span className="text-3xl">📭</span>
                등록된 게시글이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'inquiry' && (
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">💬 1:1 문의 작성</h2>
              <p className="text-xs text-gray-500 mt-1">궁금하신 점이나 건의사항을 편하게 남겨주세요.</p>
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
        </div>
      )}
    </main>
  );
}
