import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
// import Catalog from './pages/Catalog'; 
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ProductDetail from './pages/ProductDetail';
// import Cart from './pages/Cart';
// import Profile from './pages/Profile';
// import Checkout from './pages/Checkout';

// New Pages
import { ShopPage } from './pages/shop/ShopPage';
import { ProductDetailPage } from './pages/shop/ProductDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AccountPage } from './pages/auth/AccountPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';

// Admin
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { OrdersPage } from './pages/admin/OrdersPage';

import ProtectedRoute from './components/routes/ProtectedRoute';
import GuestRoute from './components/routes/GuestRoute';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <CartProvider>
                    <Router>
                        <Routes>
                            {/* Storefront */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="shop" element={<ShopPage />} />
                                <Route path="product/:id" element={<ProductDetailPage />} />

                                {/* Guest Routes (Only for not logged in users) */}
                                <Route element={<GuestRoute />}>
                                    <Route path="auth/login" element={<LoginPage />} />
                                    <Route path="auth/register" element={<RegisterPage />} />
                                </Route>

                                <Route element={<ProtectedRoute />}>
                                    <Route path="auth/account" element={<AccountPage />} />
                                    <Route path="checkout" element={<CheckoutPage />} />
                                </Route>
                            </Route>

                            {/* Admin Layout (Separate) */}
                            <Route element={<ProtectedRoute roles={['admin']} />}>
                                <Route path="admin" element={<AdminLayout />}>
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<DashboardPage />} />
                                    <Route path="products" element={<ProductsPage />} />
                                    <Route path="orders" element={<OrdersPage />} />
                                </Route>
                            </Route>

                            {/* Redirect old paths if needed */}
                            <Route path="catalog" element={<Navigate to="/shop" replace />} />
                            <Route path="login" element={<Navigate to="/auth/login" replace />} />
                            <Route path="register" element={<Navigate to="/auth/register" replace />} />
                        </Routes>
                    </Router>
                </CartProvider>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
