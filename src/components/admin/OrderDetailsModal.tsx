import { X, MapPin, Package, CreditCard, User as UserIcon, CheckCircle, Truck, Clock, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: (orderId: string, newStatus: string) => void;
}

export function OrderDetailsModal({ order, isOpen, onClose, onStatusChange }: OrderDetailsModalProps) {
    const [customer, setCustomer] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        if (order) {
            if (order.customer) {
                setCustomer(order.customer);
            } else if (order.userId === 'admin-1') {
                setCustomer({ name: 'Admin', email: 'admin@admin.com' });
            } else {
                // Fallback for any legacy data
                setCustomer(null);
            }
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const getNextStatus = (current: string) => {
        switch (current) {
            case 'pending': return { label: 'Procesar Pedido', value: 'processing', icon: Clock };
            case 'processing': return { label: 'Marcar Enviado', value: 'shipped', icon: Truck };
            case 'shipped': return { label: 'Marcar Entregado', value: 'delivered', icon: CheckCircle };
            default: return null;
        }
    };

    const nextAction = getNextStatus(order.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h2>
                        <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200/50 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Status Bar & Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Package className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Estado Actual</p>
                                <Badge
                                    variant={
                                        order.status === 'delivered' ? 'success' :
                                            order.status === 'shipped' ? 'secondary' :
                                                order.status === 'cancelled' ? 'destructive' : 'default'
                                    }
                                    className="mt-1 capitalize"
                                >
                                    {order.status}
                                </Badge>
                            </div>
                        </div>

                        {onStatusChange && nextAction && (
                            <Button
                                onClick={() => onStatusChange(order.id, nextAction.value)}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                                <nextAction.icon size={16} className="mr-2" />
                                {nextAction.label}
                                <ArrowRight size={16} className="ml-2 opacity-60" />
                            </Button>
                        )}
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Productos</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x ${item.price.toLocaleString('es-CL')}
                                        </p>
                                        {item.variants && Object.keys(item.variants).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {Object.entries(item.variants).map(([key, value]) => (
                                                    <span key={key} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right font-medium text-gray-900">
                                        ${(item.price * item.quantity).toLocaleString('es-CL')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                        {/* Customer & Shipping Info */}
                        <div className="space-y-6">
                            {(customer || order.userId) && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <UserIcon size={16} /> Cliente
                                    </h3>
                                    <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="font-medium text-gray-900">{customer?.name || 'Usuario desconocido'}</p>
                                        <p className="text-gray-500">{customer?.email || order.userId}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Envío
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="font-medium text-gray-900">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>CP: {order.shippingAddress.zipCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CreditCard size={16} /> Resumen
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${Math.round(order.total / 1.19).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>IVA (19%)</span>
                                    <span>${(order.total - Math.round(order.total / 1.19)).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Envío</span>
                                    <span>Gratis</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total</span>
                                    <span>${order.total.toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
