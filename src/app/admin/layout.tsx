"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 페이지 이동 시 모바일 메뉴 자동으로 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: '대시보드', path: '/admin', icon: '📊' },
    { name: '서식 관리', path: '/admin/forms', icon: '📄' },
    { name: '공지사항 관리', path: '/admin/notices', icon: '📢' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      {/* Desktop Sidebar (PC에서는 항상 보임) */}
      <aside className="w-64 bg-white shadow-sm flex-col hidden md:flex border-r border-gray-200 z-10 shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight">싹다모아</span>
          <span className="text-sm font-bold text-gray-400 mt-1">Admin</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          © 2026 싹다모아
        </div>
      </aside>

      {/* Mobile Overlay (배경 어둡게) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Drawer Sidebar (모바일 슬라이드 메뉴) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-blue-600 tracking-tight">싹다모아</span>
            <span className="text-xs font-bold text-gray-400 mt-1">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            ✕
          </button>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {/* Mobile Header (햄버거 버튼 포함) */}
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-gray-500 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-extrabold text-blue-600 tracking-tight">싹다모아</span>
            <span className="text-[10px] font-bold text-gray-400 mt-1">Admin</span>
          </div>
        </header>
        
        {/* 본문 영역 (모바일 여백 최적화) */}
        <div className="p-4 sm:p-6 md:p-10 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
