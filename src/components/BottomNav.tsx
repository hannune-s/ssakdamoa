"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // 어드민 페이지에서는 네비게이션 바를 숨김
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const tabs = [
    { name: '홈', path: '/', icon: '🏠' },
    { name: '공지·안내', path: '/notices', icon: '📢' },
    { name: '제휴·문의', path: '/inquiry', icon: '🤝' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-[70px] px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-[22px] mb-0.5">{tab.icon}</span>
              <span className={`text-[11px] font-extrabold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
