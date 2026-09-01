"use client";

import { useState } from 'react';

const CATEGORIES = ['전체', '페이·가맹', '필수 실무 링크', '필수행정서식', '지원금·세무'];

const LINKS = [
  // 전국 단위
  { id: 1, title: '제로페이 가맹 신청', category: '페이·가맹', keywords: ['제로페이', '페이', '가맹'], url: 'https://www.zeropay.or.kr/UI_HP_001.act' },
  { id: 2, title: '온누리 가맹 신청', category: '페이·가맹', keywords: ['온누리', '가맹', '신청', '온누리상품권'], url: 'https://frc.sbiz.or.kr/afms/afm/SMMDL0001M01/page.do' },
  { id: 14, title: '농할상품권 가맹 신청', category: '페이·가맹', keywords: ['농할상품권', '농할', '가맹', '신청'], url: 'https://app.catchsecu.com/projects/2816edfa3b5d25f/form' },
  
  // 핵심 인구 밀집 지역화폐
  { id: 10, title: '서울페이+ 가맹 신청', category: '페이·가맹', keywords: ['서울페이', '서울페이플러스', '서울', '지역화폐'], url: 'https://seoulpay.shinhancard.com/' },
  { id: 11, title: '경기지역화폐 가맹 신청', category: '페이·가맹', keywords: ['경기지역화폐', '경기', '경기도', '지역화폐'], url: 'https://www.gmoney.or.kr/' },
  { id: 3, title: '인천이음카드 가맹 신청', category: '페이·가맹', keywords: ['인천이음', '지역화폐', '이음', '인천이음카드', '인천'], url: 'https://with.konacard.co.kr/8-1' },
  { id: 12, title: '부산 동백전 가맹 신청', category: '페이·가맹', keywords: ['동백전', '부산', '지역화폐'], url: 'https://busandong100.kr/' },
  { id: 13, title: '대구로페이 가맹 신청', category: '페이·가맹', keywords: ['대구로페이', '대구', '대구행복페이', '지역화폐'], url: 'https://minwon.daegu.go.kr/cvpl/AUTN-009/info' },
  { id: 9, title: '김포페이 가맹 신청', category: '페이·가맹', keywords: ['김포페이', '지역화폐', '김포'], url: 'https://gppay.merchant-portal.co.kr/bridge/' },
  
  // 필수 실무 링크 (안내/접수용 사이트 연결)
  { id: 4, title: '보건증(건강진단결과서) 발급 안내', category: '필수 실무 링크', keywords: ['보건증', '건강진단', '건강진단결과서'], url: 'https://www.gov.kr/portal/service/serviceInfo/135200000129' },
  { id: 16, title: '4대보험통합징수포털', category: '필수 실무 링크', keywords: ['4대보험', '사대보험', '통합징수포털', '국민건강보험'], url: 'https://si4n.nhis.or.kr/jpza/JpZaa00101.do' },
  
  // 필수행정서식 (실제 양식/파일 다운로드용)
  { id: 5, title: '축산물 이력제 양식 다운로드', category: '필수행정서식', keywords: ['축산물', '이력제', '양식', '서식'], url: '#' },
  { id: 6, title: '영업신고증 위임장 등 서식 다운로드', category: '필수행정서식', keywords: ['영업신고증', '신고', '서식', '위임장'], url: '#' },
  { id: 15, title: '표준근로계약서 양식 다운로드 (알바/직원)', category: '필수행정서식', keywords: ['근로계약서', '알바', '직원', '계약서', '서식'], url: '#' },
  
  // 지원금 / 세무
  { id: 7, title: '소상공인 정책자금 (대출 지원)', category: '지원금·세무', keywords: ['지원금', '정책자금', '소상공인', '대출'], url: '#' },
  { id: 8, title: '종합소득세 / 부가세 신고 가이드', category: '지원금·세무', keywords: ['세무', '세금', '종소세', '종합소득세', '부가세'], url: '#' },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 향상된 검색 및 필터링 로직
  const filteredLinks = LINKS.filter(link => {
    // 검색어에서 공백 제거 (예: '제로 페이' -> '제로페이'도 검색되도록)
    const term = searchTerm.trim().toLowerCase().replace(/\s+/g, '');
    
    // 1. 검색어가 있을 때는 현재 카테고리 탭을 무시하고 "전체"에서 실시간으로 찾아줍니다.
    if (term) {
      const title = link.title.toLowerCase().replace(/\s+/g, '');
      const matchSearch = title.includes(term) || link.keywords.some(kw => kw.toLowerCase().replace(/\s+/g, '').includes(term));
      return matchSearch;
    }
    
    // 2. 검색어가 없을 때는 선택된 카테고리 탭에 맞는 것만 보여줍니다.
    return selectedCategory === '전체' || link.category === selectedCategory;
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
            placeholder="'보건증', '제로페이', '계약서' 등 키워드 검색" 
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
              onClick={() => {
                setSelectedCategory(category);
                setSearchTerm(''); // 탭 이동 시 검색어 초기화
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === category && !searchTerm
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
            <a 
              key={link.id} 
              href={link.url}
              target={link.url === '#' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3.5 px-5 rounded-xl border border-gray-200 font-medium transition-all text-left flex justify-between items-center group shadow-sm hover:shadow"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px]">{link.title}</span>
                <span className="text-xs text-blue-500 font-semibold">{link.category}</span>
              </div>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-xl">
                {link.category === '필수행정서식' ? '↓' : '→'}
              </span>
            </a>
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
