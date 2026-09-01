"use client";

import { useState } from 'react';

const CATEGORIES = ['전체', '페이·가맹', '필수행정서식', '지원금·세무'];

const LINKS = [
  { id: 1, title: '제로페이 가맹 신청', category: '페이·가맹', keywords: ['제로페이', '페이', '가맹'], url: '#' },
  { id: 2, title: '온누리상품권 안내', category: '페이·가맹', keywords: ['온누리', '상품권', '온누리상품권'], url: '#' },
  { id: 3, title: '인천이음 신청', category: '페이·가맹', keywords: ['인천이음', '지역화폐', '이음'], url: '#' },
  { id: 4, title: '보건증(건강진단결과서) 발급 안내', category: '필수행정서식', keywords: ['보건증', '건강진단', '건강진단결과서'], url: '#' },
  { id: 5, title: '축산물 이력제 양식 다운로드', category: '필수행정서식', keywords: ['축산물', '이력제', '양식'], url: '#' },
  { id: 6, title: '영업신고증 서식', category: '필수행정서식', keywords: ['영업신고증', '신고', '서식'], url: '#' },
  { id: 7, title: '소상공인 정책자금 (대출 지원)', category: '지원금·세무', keywords: ['지원금', '정책자금', '소상공인', '대출'], url: '#' },
  { id: 8, title: '종합소득세 / 부가세 신고 가이드', category: '지원금·세무', keywords: ['세무', '세금', '종소세', '종합소득세', '부가세'], url: '#' },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 검색어 및 카테고리 필터링 로직
  const filteredLinks = LINKS.filter(link => {
    const matchCategory = selectedCategory === '전체' || link.category === selectedCategory;
    
    // 검색어가 없으면 통과, 있으면 제목이나 키워드에 포함되어야 함
    if (!searchTerm.trim()) return matchCategory;
    
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = link.title.toLowerCase().includes(term) || link.keywords.some(kw => kw.includes(term));
    
    return matchCategory && matchSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">싹다모아</h1>
        <p className="text-gray-500 text-sm">자영업자 필수 링크 & 서식 종합 허브</p>
      </div>

      {/* Search & Filter Area */}
      <div className="w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="'보건증', '제로페이' 등 키워드 검색" 
            className="w-full bg-gray-100 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Links List */}
      <div className="w-full max-w-2xl flex flex-col gap-2.5">
        {filteredLinks.length > 0 ? (
          filteredLinks.map(link => (
            <button 
              key={link.id} 
              className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3.5 px-5 rounded-xl border border-gray-200 font-medium transition-all text-left flex justify-between items-center group shadow-sm hover:shadow"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px]">{link.title}</span>
                <span className="text-xs text-blue-500 font-semibold">{link.category}</span>
              </div>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-xl">→</span>
            </button>
          ))
        ) : (
          <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-200">
            검색 결과가 없습니다. 다른 키워드를 입력해보세요!
          </div>
        )}
      </div>

      {/* Cross Promotion Banner */}
      <div className="w-full max-w-2xl mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg text-center transform hover:scale-[1.02] transition-transform cursor-pointer">
        <h3 className="text-lg font-extrabold mb-1.5">사장님을 위한 맞춤형 세무/재고 관리! 🚀</h3>
        <p className="text-indigo-100 text-sm mb-4">복잡한 매장 관리, '한고세쏙' 하나로 간편하게 해결하세요.</p>
        <button className="bg-white text-indigo-700 font-bold py-2.5 px-6 rounded-full hover:bg-indigo-50 transition-colors shadow-sm text-sm">
          한고세쏙 앱 알아보기
        </button>
      </div>
    </main>
  );
}
