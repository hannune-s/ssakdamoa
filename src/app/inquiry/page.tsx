export default function InquiryPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans pb-28">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-2">제휴·문의</h1>
        <p className="text-gray-500 text-sm">자영업자 분들의 다양한 의견과 제휴를 기다립니다.</p>
      </div>
      <div className="w-full max-w-2xl bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center mt-4">
        <span className="text-5xl mb-5">🎧</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">고객센터 준비 중입니다</h2>
        <p className="text-sm text-gray-500">더 나은 서비스를 위해 1:1 문의 및 제휴 접수 창구를 준비하고 있습니다.<br/>곧 찾아뵙겠습니다!</p>
      </div>
    </main>
  );
}
