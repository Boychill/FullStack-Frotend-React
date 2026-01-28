import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

export function DashboardPage() {
    const { products } = useProducts();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
    });

    useEffect(() => {
        const storedOrders = localStorage.getItem('orders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];

        const totalSales = orders.reduce((sum: number, order: any) => sum + order.total, 0);

        setStats({
            totalSales,
            totalOrders: orders.length,
            totalProducts: products.length
        });
    }, [products]);

    const cards = [
        { label: 'Ventas Totales', value: `$${stats.totalSales.toLocaleString('es-CL')}`, icon: DollarSign, color: 'bg-green-500' },
        { label: 'Pedidos Totales', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Productos Activos', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
        { label: 'Conversión', value: '2.4%', icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Resumen general de tu tienda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${card.color} text-white shadow-lg shadow-gray-200`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity chart placeholder or list */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Actividad Reciente</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Gráfico de Ventas (Próximamente chartjs/recharts)
                </div>
            </div>
        </div>
    );
}
