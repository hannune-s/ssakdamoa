"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function InquiryPage() {
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('ssakdamoa_inquiries').insert([formData]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      alert('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans pb-28">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">접수가 완료되었습니다</h2>
          <p className="text-gray-500 mb-6 text-sm">보내주신 소중한 문의/제휴 내용을 꼼꼼히 확인 후<br/>최대한 빠르게 연락드리겠습니다.</p>
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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans pb-28">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">제휴 및 문의</h1>
        <p className="text-gray-500 text-sm">서비스 제휴나 앱 제작 및 기타 궁금하신 사항을 남겨주세요.</p>
      </div>

      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">이름 / 상호명 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="예: 홍길동 / 싹다식당"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">연락받으실 곳 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="예: 010-1234-5678 또는 이메일 주소"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">문의 내용 <span className="text-red-500">*</span></label>
            <textarea 
              required
              rows={6}
              placeholder="제휴 제안, 궁금하신 점, 건의사항 등을 자유롭게 적어주세요."
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            {loading ? '전송 중...' : '문의하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
