import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';


export function AdminLayout() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/auth/login');
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) return null;

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Productos', icon: Package },
        { path: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex relative">

            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Store className="text-primary-400" /> Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
                    >
                        <Home size={20} />
                        <span className="font-medium">Volver a la Tienda</span>
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">Administrador</p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => { logout(); navigate('/'); }}
                    >
                        <LogOut size={16} className="mr-2" /> Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-h-screen p-8">
                <Outlet />
            </main>
        </div>
    );
}
