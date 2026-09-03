"use client";
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type InquiryType = 'none' | 'general' | 'app';

export default function InquiryPage() {
  const [inquiryType, setInquiryType] = useState<InquiryType>('none');
  const [formData, setFormData] = useState({ name: '', company: '', phone: '', email: '', message: '' });
  const [appData, setAppData] = useState({ type: '', industry: '', budget: '', schedule: '' });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);

  // 유형 선택 시 부드럽게 스크롤
  useEffect(() => {
    if (inquiryType !== 'none' && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [inquiryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const finalMessage = inquiryType === 'app'
      ? `[앱 제작 문의]\n- 희망 앱 형태: ${appData.type || '미입력'}\n- 매장 업종: ${appData.industry || '미입력'}\n- 예상 예산: ${appData.budget || '미입력'}\n- 희망 일정: ${appData.schedule || '미입력'}\n\n[상세 내용]\n${formData.message}`
      : `[기타 문의]\n${formData.message}`;

    const submitData = { ...formData, message: finalMessage };
    
    try {
      const { error } = await supabase.from('ssakdamoa_inquiries').insert([submitData]);
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      setFormData({ name: '', company: '', phone: '', email: '', message: '' });
      setAppData({ type: '', industry: '', budget: '', schedule: '' });
      setInquiryType('none');
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('전송 중 오류가 발생했습니다. 관리자에게 DB 설정을 확인해달라고 요청해주세요.');
    } finally {
      setLoading(false);
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
            새로운 문의 작성하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans pb-32">
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">문의하기</h1>
        <p className="text-gray-500 text-sm">어떤 도움이 필요하신가요? 목적에 맞는 항목을 선택해주세요.</p>
      </div>

      {/* 선택 버튼 영역 */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setInquiryType('general')}
          className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left ${
            inquiryType === 'general' 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-3">💬</div>
          <h3 className={`text-lg font-bold mb-1 ${inquiryType === 'general' ? 'text-blue-700' : 'text-gray-800'}`}>
            기타 문의
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            기타 서비스 이용 관련 궁금하신 점이나 건의사항을 남겨주세요.
          </p>
        </button>

        <button
          onClick={() => setInquiryType('app')}
          className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left ${
            inquiryType === 'app' 
              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
          }`}
        >
          <div className="text-2xl mb-3">📱</div>
          <h3 className={`text-lg font-bold mb-1 ${inquiryType === 'app' ? 'text-indigo-700' : 'text-gray-800'}`}>
            앱 제작 문의
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            우리 매장 전용 앱 개발, 예약/주문 프로그램 구축 상담을 도와드립니다.
          </p>
        </button>
      </div>

      {/* 폼 영역 (선택 시 부드럽게 나타남) */}
      <div 
        ref={formRef}
        className={`w-full max-w-2xl transition-all duration-500 ease-in-out origin-top ${
          inquiryType !== 'none' ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden'
        }`}
      >
        <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-sm border ${inquiryType === 'app' ? 'border-indigo-100' : 'border-blue-100'}`}>
          
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              {inquiryType === 'app' ? '📱 앱 제작 상세 문의' : '💬 기타 문의'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {inquiryType === 'app' ? '자세히 적어주실수록 더 정확하고 빠른 상담이 가능합니다.' : '빠른 시일 내에 담당자가 확인 후 연락드리겠습니다.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 공통 입력란: 이름 & 상호명 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-800">이름 <span className="text-red-500">*</span></label>
                <input 
                  type="text" required placeholder="예: 홍길동"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-800">상호명 <span className="text-red-500">*</span></label>
                <input 
                  type="text" required placeholder="예: 싹다식당"
                  value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* 공통 입력란: 연락처 & 이메일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-800">연락처 <span className="text-red-500">*</span></label>
                <input 
                  type="tel" required placeholder="예: 010-1234-5678"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-800">이메일 <span className="text-red-500">*</span></label>
                <input 
                  type="email" required placeholder="예: ssakda@moa.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* 앱 제작 문의용 추가 필드 */}
            {inquiryType === 'app' && (
              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col gap-5 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-indigo-900">매장 업종</label>
                    <input 
                      type="text" placeholder="예: 카페, 식당, 미용실 등"
                      value={appData.industry} onChange={e => setAppData({...appData, industry: e.target.value})}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-indigo-900">원하시는 앱 형태</label>
                    <input 
                      type="text" placeholder="예: 배달앱, 예약앱, 포인트 적립앱"
                      value={appData.type} onChange={e => setAppData({...appData, type: e.target.value})}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-indigo-900">예산 (선택)</label>
                    <input 
                      type="text" placeholder="예: 300만원 이하, 미정"
                      value={appData.budget} onChange={e => setAppData({...appData, budget: e.target.value})}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-indigo-900">희망 일정 (선택)</label>
                    <input 
                      type="text" placeholder="예: 1개월 이내, 최대한 빨리"
                      value={appData.schedule} onChange={e => setAppData({...appData, schedule: e.target.value})}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-bold text-gray-800">문의 내용 <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={5}
                placeholder={inquiryType === 'app' ? "추가로 원하시는 기능이나 참고할 만한 앱(벤치마킹)이 있다면 적어주세요." : "자세한 문의 사항이나 건의 내용을 남겨주세요."}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-md mt-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : (inquiryType === 'app' ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg')
              }`}
            >
              {loading ? '전송 중...' : (inquiryType === 'app' ? '앱 제작 문의 접수하기' : '문의 접수하기')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
