import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/admin/ProtectedRoute';
import StoreLayout from './components/layout/StoreLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const ProductsManagementPage = lazy(() => import('./pages/admin/ProductsManagementPage'));
const OrdersManagementPage = lazy(() => import('./pages/admin/OrdersManagementPage'));
const DeliveriesManagementPage = lazy(() => import('./pages/admin/DeliveriesManagementPage'));

function PageLoader() {
  return <div className="grid min-h-screen place-content-center bg-stone-100"><span className="loading-ring" /></div>;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsManagementPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="deliveries" element={<DeliveriesManagementPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
