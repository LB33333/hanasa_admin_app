import {
  Bell,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/salons', label: '살롱', icon: Store },
  { to: '/orders', label: '주문', icon: ShoppingBag },
  { to: '/products', label: '상품', icon: Package },
  { to: '/banners', label: '배너', icon: ImageIcon },
  { to: '/notices', label: '공지', icon: Megaphone },
  { to: '/push', label: '푸시 발송', icon: Bell },
];

export default function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-gray-200 bg-white sm:flex">
        <div className="px-5 py-5">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">hanasa</h1>
          <p className="text-xs text-gray-400">관리자 도구</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut size={17} strokeWidth={2} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 본문 */}
      <div className="sm:pl-56">
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
          <Outlet />
        </main>
      </div>

      {/* 모바일 하단 탭 */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`
            }
          >
            <item.icon size={19} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
