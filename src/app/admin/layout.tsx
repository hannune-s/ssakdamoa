"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: '대시보드', path: '/admin', icon: '📊' },
    { name: '서식 관리', path: '/admin/forms', icon: '📄' },
    // { name: '공지사항 관리', path: '/admin/notices', icon: '📢' },
    // { name: '고객센터(1:1)', path: '/admin/inquiries', icon: '🎧' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex-col hidden md:flex border-r border-gray-200">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-blue-600 tracking-tight">싹다모아</span>
            <span className="text-xs font-bold text-gray-400 mt-1">Admin</span>
          </div>
        </header>
        
        <div className="p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
