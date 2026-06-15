import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginGate from './pages/LoginGate';
import FirstScreenPage from './pages/FirstScreenPage';
import ManagerDashboard from './pages/ManagerDashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import ChecksPage from './pages/ChecksPage';
import StoreProductsPage from './pages/StoreProductsPage';
import CashierCustomersPage from './pages/CashierCustomersPage';
import CashierChecksPage from './pages/CashierChecksPage';
import ReportsPage from './pages/ReportsPage';
import CashierPOSPage from './pages/CashierPOSPage';
import StatisticsPage from './pages/StatisticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/first-screen" element={<FirstScreenPage />} />
        <Route path="/login" element={<LoginGate />} />
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
              <CashierPOSPage />
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
        <Route path="/manager/store-products" element={<PrivateRoute role="Manager"><StoreProductsPage /></PrivateRoute>} />
        <Route path="/manager/customers" element={<PrivateRoute role="Manager"><CustomersPage /></PrivateRoute>} />
        <Route path="/manager/checks" element={<PrivateRoute role="Manager"><ChecksPage /></PrivateRoute>} />
        <Route path="/manager/reports" element={<PrivateRoute role="Manager"><ReportsPage /></PrivateRoute>} />
        <Route path="/manager/statistics" element={<PrivateRoute role="Manager"><StatisticsPage /></PrivateRoute>} />
        <Route path="/cashier/products" element={<PrivateRoute role="Cashier"><ProductsPage /></PrivateRoute>} />
        <Route path="/cashier/customers" element={<PrivateRoute role="Cashier"><CashierCustomersPage /></PrivateRoute>} />
        <Route path="/cashier/checks" element={<PrivateRoute role="Cashier"><CashierChecksPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/first-screen" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;