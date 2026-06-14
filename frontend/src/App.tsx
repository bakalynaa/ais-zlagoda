import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierDashboard from './pages/CashierDashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import PlaceholderPage from './pages/PlaceholderPage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import StoreProductsPage from './pages/StoreProductsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/manager"
          element={
            <PrivateRoute role="Manager">
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <PrivateRoute role="Cashier">
              <CashierDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="/manager/employees" element={<PrivateRoute role="Manager"><EmployeesPage /></PrivateRoute>} />
        <Route path="/manager/categories" element={<PrivateRoute role="Manager"><CategoriesPage /></PrivateRoute>} />
        <Route path="/manager/products" element={<PrivateRoute role="Manager"><ProductsPage /></PrivateRoute>} />
        <Route path="/manager/customers" element={<PrivateRoute role="Manager"><CustomersPage /></PrivateRoute>} />
        <Route path="/manager/checks" element={<PrivateRoute role="Manager"><PlaceholderPage title="Чеки" /></PrivateRoute>} />
        <Route path="/manager/reports" element={<PrivateRoute role="Manager"><PlaceholderPage title="Звіти" /></PrivateRoute>} />
        <Route path="/manager/store-products" element={<PrivateRoute role="Manager"><StoreProductsPage /></PrivateRoute>} />
        <Route path="/cashier/customers" element={<PrivateRoute role="Cashier"><PlaceholderPage title="Клієнти" /></PrivateRoute>} />
        <Route path="/cashier/checks" element={<PrivateRoute role="Cashier"><PlaceholderPage title="Мої чеки" /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;