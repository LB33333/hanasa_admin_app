import { Route, Routes } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/AuthContext';
import LoginGate from '@/pages/LoginGate';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SalonsPage from '@/pages/salons/SalonsPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import ProductCreatePage from '@/pages/products/ProductCreatePage';
import ProductEditPage from '@/pages/products/ProductEditPage';
import BannersPage from '@/pages/banners/BannersPage';
import CouponsPage from '@/pages/coupons/CouponsPage';
import NoticesPage from '@/pages/notices/NoticesPage';
import PushComposerPage from '@/pages/push/PushComposerPage';

export default function App() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthed') {
    return <LoginGate />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="salons" element={<SalonsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="push" element={<PushComposerPage />} />
      </Route>
    </Routes>
  );
}
