import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Package, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import client from '../../api/client';

export function AccountPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                console.log("No user found in context, skipping fetch");
                return;
            }
            console.log("Fetching orders for user:", user.id);
            try {
                // client baseURL already includes /api, so we just append /orders/myorders
                const { data } = await client.get('/orders/myorders');
                console.log("API Response (MyOrders):", data);

                // Adapt API response to UI model if needed
                const adaptedOrders = data.map((o: any) => ({
                    id: o._id,
                    date: o.createdAt,
                    total: o.totalPrice,
                    status: o.status || 'pending', // Default to pending if unknown
                    items: o.orderItems.map((i: any) => ({
                        id: i.product || i._id, // fallback
                        name: i.name,
                        price: i.price,
                        quantity: i.qty,
                        image: i.image,
                        variants: i.variants
                    })),
                    userId: o.user
                }));
                console.log("Adapted Orders:", adaptedOrders);
                setOrders(adaptedOrders);
            } catch (error: any) {
                console.error("Error fetching orders:", error);
                if (error.response) {
                    console.error("Server Error Data:", error.response.data);
                    console.error("Server Status:", error.response.status);
                    alert(`Error cargando pedidos: Status ${error.response.status}`);
                }
            }
        };

        fetchOrders();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Cuenta</h1>
                        <p className="text-gray-500">Bienvenido de nuevo, {user.name}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                        <LogOut size={16} className="mr-2" /> Cerrar Sesión
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Perfil Personal</h3>
                                    <p className="text-xs text-gray-500">Información básica</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Nombre</p>
                                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 group">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Email</p>
                                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{user.email}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Rol</p>
                                    <Badge variant="secondary" className="uppercase text-xs tracking-wider">{user.role}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <Package className="text-gray-400" size={24} />
                                Historial de Pedidos
                            </h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                            </span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes pedidos aún</h3>
                                <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra algo especial.</p>
                                <Button onClick={() => navigate('/shop')} className="animate-pulse">
                                    Explorar Productos
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white p-0 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
                                    >
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="hidden sm:flex w-12 h-12 bg-gray-50 rounded-lg items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-500 text-sm">{new Date(order.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span>{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="font-bold text-gray-900">${order.total.toLocaleString('es-CL')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-50">
                                                <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'} className="capitalize">
                                                    {order.status}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="group-hover:translate-x-1 transition-transform"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    Ver Detalle <ChevronRight size={14} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}
