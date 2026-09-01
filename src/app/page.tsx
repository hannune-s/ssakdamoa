import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-3 tracking-tight">싹다모아</h1>
        <p className="text-gray-600 text-lg">전국 자영업자 필수 링크 & 서식 종합 유틸리티 허브</p>
      </div>

      {/* Main Content Area: Responsive Grid 
          모바일(기본): 1열 (링크트리 형태) 
          PC(md 이상): 2열 넓은 배치 
      */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Payment & Local Currency */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            💳 페이 가맹 & 지역화폐
          </h2>
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            제로페이 가맹 신청 
            <span className="text-blue-300 group-hover:text-blue-600 transition-colors">→</span>
          </button>
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            온누리상품권 안내 
            <span className="text-blue-300 group-hover:text-blue-600 transition-colors">→</span>
          </button>
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            인천이음 신청 
            <span className="text-blue-300 group-hover:text-blue-600 transition-colors">→</span>
          </button>
        </div>

        {/* Section 2: Administrative Forms */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📄 필수 행정 서식
          </h2>
          <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            보건증(건강진단결과서) 
            <span className="text-green-300 group-hover:text-green-600 transition-colors">↓</span>
          </button>
          <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            축산물 이력제 양식 
            <span className="text-green-300 group-hover:text-green-600 transition-colors">↓</span>
          </button>
          <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-4 px-6 rounded-xl font-semibold transition-colors text-left flex justify-between items-center group">
            영업신고증 서식 
            <span className="text-green-300 group-hover:text-green-600 transition-colors">↓</span>
          </button>
        </div>

      </div>

      {/* Cross Promotion Banner */}
      <div className="w-full max-w-3xl mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg text-center transform hover:scale-[1.02] transition-transform cursor-pointer">
        <h3 className="text-xl font-extrabold mb-3">사장님을 위한 맞춤형 세무/재고 관리! 🚀</h3>
        <p className="text-indigo-100 mb-6">복잡한 매장 관리, '한고세쏙' 하나로 간편하게 해결하세요.</p>
        <button className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition-colors shadow-md">
          한고세쏙 앱 알아보기
        </button>
      </div>
    </main>
  );
}
