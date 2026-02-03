import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle, CreditCard, MapPin, Truck } from 'lucide-react';
import client from '../../api/client';

export function CheckoutPage() {
    const { cart, total, subtotal, shippingCost, clearCart, updateQuantity, removeFromCart } = useCart();
    // const { updateProductStock } = useProducts(); // Frontend stock update removed in favor of backend
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [address, setAddress] = useState({
        street: '',
        city: '',
        zip: '',
        country: 'Chile'
    });

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!address.street.trim()) newErrors.street = "La dirección es requerida";
        if (!address.city.trim()) newErrors.city = "La ciudad es requerida";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Redirect if empty cart (unless placing order)
    if (cart.length === 0 && step !== 4) { // Step 4 could be success state inside component or separate page
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Tu carro está vacío</h2>
                <Button onClick={() => navigate('/shop')}>Ir a comprar</Button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/auth/login?redirect=/checkout');
            return;
        }

        try {
            const orderData = {
                orderItems: cart.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    image: item.images[0],
                    price: item.price,
                    product: item.id,
                    variants: item.variants
                })),
                shippingAddress: address,
                paymentMethod: 'WebPay',
                itemsPrice: subtotal,
                shippingPrice: shippingCost,
                taxPrice: 0, // Implement tax if needed
                totalPrice: total,
            };

            await client.post('/orders', orderData);

            // Success
            clearCart();
            // Store order ID if needed to show receipt?
            setStep(4);

            // Optional: We could refresh products from backend here to sync stock
            // updateProductStock(...) // This is local, better to just let next fetch handle it or refetch

            // Clear local storage orders logic (deprecated)
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
        }
    };

    const renderStep1_Address = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin /> Dirección de Envío
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Calle y Número <span className="text-red-500">*</span></label>
                    <Input
                        value={address.street}
                        onChange={e => {
                            setAddress({ ...address, street: e.target.value });
                            if (errors.street) setErrors({ ...errors, street: '' });
                        }}
                        placeholder="Av. Providencia 1234, Depto 501"
                        className={errors.street ? "border-red-500 ring-red-100 focus-visible:ring-red-200" : ""}
                    />
                    {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Comuna / Ciudad <span className="text-red-500">*</span></label>
                    <Input
                        value={address.city}
                        onChange={e => {
                            setAddress({ ...address, city: e.target.value });
                            if (errors.city) setErrors({ ...errors, city: '' });
                        }}
                        placeholder="Providencia"
                        className={errors.city ? "border-red-500 ring-red-100 focus-visible:ring-red-200" : ""}
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Código Postal (Opcional)</label>
                    <Input
                        value={address.zip}
                        onChange={e => setAddress({ ...address, zip: e.target.value })}
                        placeholder="7500000"
                    />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button
                    onClick={() => {
                        if (validateStep1()) setStep(2);
                    }}
                >
                    Continuar a Pago
                </Button>
            </div>
        </div>
    );

    const renderStep2_Payment = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard /> Método de Pago
            </h2>

            <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 bg-gray-50 border-gray-900 ring-1 ring-gray-900 transition-all">
                    <div className="w-5 h-5 rounded-full border border-gray-900 bg-gray-900 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="font-medium">Tarjeta de Crédito / Débito (WebPay)</span>
                </div>
                <div className="border rounded-xl p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
                    <div className="w-5 h-5 rounded-full border border-gray-300" />
                    <span className="font-medium">Transferencia Bancaria (Deshabilitado)</span>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl text-blue-700 text-sm">
                <p>Estás en un ambiente de demostración. No se realizará ningún cargo real.</p>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                <Button onClick={() => setStep(3)}>Revisar Pedido</Button>
            </div>
        </div>
    );

    const renderStep3_Review = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle /> Resumen Final
            </h2>

            <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-sm">
                <div>
                    <span className="font-bold block mb-1">Envío a:</span>
                    <p>{address.street}, {address.city}</p>
                    <p>{address.country}</p>
                </div>
                <div>
                    <span className="font-bold block mb-1">Método de Pago:</span>
                    <p>Tarjeta de Crédito (Simulado)</p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                <Button size="lg" onClick={handlePlaceOrder} className="bg-green-600 hover:bg-green-700">
                    Confirmar Compra
                </Button>
            </div>
        </div>
    );

    const renderStep4_Success = () => (
        <div className="text-center py-12 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Exitoso!</h2>
            <p className="text-gray-500 mb-8">Gracias por tu compra. Puedes ver el estado en tu cuenta.</p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/auth/account')}>Ir a mis pedidos</Button>
                <Button variant="outline" onClick={() => navigate('/shop')}>Seguir comprando</Button>
            </div>
        </div>
    );

    if (step === 4) {
        return <div className="container mx-auto px-4 py-8 max-w-2xl">{renderStep4_Success()}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Finalizar Compra</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {/* Steps Form */}
                <div className="lg:col-span-2">
                    {/* Progress Indicator */}
                    <div className="flex justify-between mb-8 px-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors ${step >= s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {s}
                                </div>
                                <span className="text-xs font-medium text-gray-500">
                                    {s === 1 ? 'Dirección' : s === 2 ? 'Pago' : 'Revisión'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        {step === 1 && renderStep1_Address()}
                        {step === 2 && renderStep2_Payment()}
                        {step === 3 && renderStep3_Review()}
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1 h-fit bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-4">
                    <h3 className="font-bold text-lg mb-4">Resumen de Compra</h3>
                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map((item) => (
                            <div key={`${item.id}-${Object.values(item.variants || {}).join('-')}`} className="flex gap-3 items-start group">
                                <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-white flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {Object.entries(item.variants || {}).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                    </p>

                                    {/* Interactive Quantity */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-gray-200 rounded-md bg-white">
                                            <button
                                                className="px-2 py-0.5 hover:bg-gray-50 text-gray-600"
                                                onClick={() => updateQuantity(item.id, -1, item.variants)}
                                            >
                                                -
                                            </button>
                                            <span className="text-xs px-1 font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                            <button
                                                className="px-2 py-0.5 hover:bg-gray-50 text-gray-600"
                                                onClick={() => updateQuantity(item.id, 1, item.variants)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="text-gray-400 hover:text-red-500 p-1"
                                            onClick={() => removeFromCart(item.id, item.variants)}
                                            title="Eliminar"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-sm">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${subtotal.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Envío</span>
                            {shippingCost === 0 ? (
                                <span className="text-green-600 font-medium">Gratis</span>
                            ) : (
                                <span>${shippingCost.toLocaleString('es-CL')}</span>
                            )}
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                            <span>Total</span>
                            <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                    </div>

                    {shippingCost > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                            <Truck size={14} />
                            <span>Agrega más productos para envío gratis</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
