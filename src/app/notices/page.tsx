export default function NoticesPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 font-sans pb-28">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-2xl font-extrabold text-blue-600 mb-2">공지·안내</h1>
        <p className="text-gray-500 text-sm">서비스 업데이트 및 새로운 소식을 알려드립니다.</p>
      </div>
      <div className="w-full max-w-2xl bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center mt-4">
        <span className="text-5xl mb-5">🚧</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">페이지 준비 중입니다</h2>
        <p className="text-sm text-gray-500">곧 유용한 공지사항 기능이 업데이트될 예정입니다!<br/>조금만 기다려주세요.</p>
      </div>
    </main>
  );
}
