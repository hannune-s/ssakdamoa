"use client";
import { useState } from 'react';

// 샘플 데이터 (향후 DB 연동 시 이 부분을 교체하면 됩니다)
const MOCK_DATA = [
  { 
    id: 1, 
    type: 'notice', 
    title: '싹다모아 베타 서비스 오픈 안내', 
    content: '자영업자 분들의 편리한 업무를 위한 싹다모아 서비스가 오픈되었습니다.\n앞으로 많은 이용 부탁드립니다.', 
    date: '2026. 09. 02' 
  },
  { 
    id: 2, 
    type: 'notice', 
    title: '신규 실무 서식 (근로계약서 등) 업데이트', 
    content: '자주 쓰시는 표준 근로계약서와 근태일지 양식이 새롭게 추가되었습니다.\n[실무 서식·양식] 탭에서 바로 다운로드 가능합니다.', 
    date: '2026. 09. 01' 
  },
  { 
    id: 3, 
    type: 'news', 
    title: '여름철 매장 위생 관리 팁 3가지 공유해요', 
    content: '안녕하세요 사장님들!\n최근 날씨가 더워지면서 식자재 관리가 많이 까다로우시죠?\n\n1. 냉장고 온도 수시로 체크 생활화\n2. 도마/칼 교차 오염 주의 및 분리 사용\n3. 마감 후 철저한 수분 건조\n\n기본적인 것들이지만 바쁘면 놓치기 쉬우니 꼭 챙겨보아요. 모두 화이팅합시다!', 
    date: '2026. 08. 28' 
  },
  { 
    id: 4, 
    type: 'news', 
    title: '오늘 배달 주문 받으면서 느낀 점...', 
    content: '고객분들이 리뷰 이벤트 참여를 누르고 요청사항에 안 적어주시는 경우가 꽤 있네요 ㅠㅠ\n이럴 때는 배달앱 메뉴 선택에 필수 옵션으로 [리뷰 참여 여부]를 넣는 게 좋은 것 같습니다.\n\n다들 비슷한 고민 있으시면 참고하세요!', 
    date: '2026. 08. 25' 
  }
];

export default function NoticesPage() {
  const [activeTab, setActiveTab] = useState<'notice' | 'news'>('notice');
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredData = MOCK_DATA.filter(item => item.type === activeTab);

  // 아코디언 열기/닫기 토글 함수
  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
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
        <div className="flex flex-col">
          {filteredData.length > 0 ? (
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
                    <span className="text-[11px] text-gray-400 font-medium">{item.date}</span>
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
            <div className="text-center py-12 text-gray-400 text-sm">
              등록된 게시글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
