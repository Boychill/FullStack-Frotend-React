import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProductById } = useProducts();
    const { addToCart } = useCart();

    // Check if ID is defined before using it
    // In real scenario, handle fetch/loading
    const product = id ? getProductById(id) : undefined;

    const [selectedImage, setSelectedImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);

    useEffect(() => {
        if (product && product.attributes) {
            const defaults: Record<string, string> = {};
            product.attributes.forEach(attr => {
                if (attr.options.length > 0) {
                    defaults[attr.name] = attr.options[0];
                }
            });
            setSelectedOptions(defaults);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <Button onClick={() => navigate('/shop')}>Volver al Catálogo</Button>
            </div>
        );
    }

    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    // Hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const handleAddToCart = () => {
        const success = addToCart(product, quantity, selectedOptions);
        if (!success) {
            setNotification({
                show: true,
                message: `Stock máximo disponible: ${product.stock}. Ya tienes unidades en el carro.`,
                type: 'error'
            });
        } else {
            setNotification({
                show: true,
                message: 'Producto agregado al carro correctamente',
                type: 'success'
            });
        }
    };

    // Calculate dynamic price and stock
    const isSelectionComplete = product.attributes?.every((attr: any) => selectedOptions[attr.name]);
    let currentStock = product.stock;
    let displayPrice = product.price;
    let variantFound: any = null;

    if (isSelectionComplete && product.combinations?.length) {
        const match = product.combinations.find((c: any) =>
            Object.entries(c.values).every(([k, v]) => selectedOptions[k] === v)
        );
        if (match) {
            variantFound = match;
            currentStock = match.stock;
            if (match.price) {
                displayPrice = match.price;
            }
        }
    }

    const isOutOfStock = isSelectionComplete && currentStock === 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} className="mr-2" /> Volver
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply p-8"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden ${selectedImage === img ? 'border-gray-900' : 'border-transparent'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="uppercase tracking-wide">{product.category}</Badge>
                            {currentStock > 0 ? (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" /> Stock Disponible
                                </span>
                            ) : (
                                <span className="text-red-600 text-sm font-medium">Agotado</span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
                    </div>

                    <div className="text-3xl font-bold text-gray-900">
                        ${displayPrice.toLocaleString('es-CL')}
                    </div>

                    {/* Variant Selectors */}
                    {/* Dynamic Attributes */}
                    {product.attributes?.map((attr: { name: string; options: string[] }) => (
                        <div key={attr.name}>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">{attr.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {attr.options.map((option: string) => {
                                    // Check if this option should be disabled based on *other* current selections
                                    let isOptionDisabled = false;

                                    if (product.combinations && product.combinations.length > 0) {
                                        // Construct a hypothetical selection where this attribute is set to this option
                                        // We keep other currently selected attributes
                                        const hypotheticSelection = { ...selectedOptions, [attr.name]: option };

                                        // We need to check if this specific option, combined with the OTHER currently selected options,
                                        // results in a valid combination with stock > 0.

                                        // 1. Filter out the current attribute from consideration to see what else is selected
                                        const otherAttributes = product.attributes?.filter(a => a.name !== attr.name) || [];

                                        // 2. Check if all OTHER attributes have a selection. 
                                        // If not all others are selected, we generally allow selecting this one (unless we want to do forward checking, 
                                        // but usually we only block if we have a full "path" to a dead end. 
                                        // However, strictly, we should check if *any* compatible combination exists).
                                        // For now, let's block only if the *resulting* combination (assuming others are selected) is effectively 0 stock.

                                        const areOthersSelected = otherAttributes.every(a => selectedOptions[a.name]);

                                        if (areOthersSelected) {
                                            // Exact match check
                                            const match = product.combinations.find(c =>
                                                Object.entries(hypotheticSelection).every(([k, v]) => c.values[k] === v)
                                            );

                                            // If found and stock is 0, disable.
                                            // If not found (invalid combo), disable.
                                            if (match) {
                                                if (match.stock <= 0) isOptionDisabled = true;
                                            } else {
                                                // Combination does not exist
                                                isOptionDisabled = true;
                                            }
                                        } else {
                                            // Advanced: If I pick "Red", and "Size" is not selected yet.
                                            // Does "Red" have ANY valid combinations with stock > 0?
                                            // If all Red shirts are out of stock (regardless of size), we should disable Red.

                                            const hasAnyStockWithThisOption = product.combinations.some(c =>
                                                c.values[attr.name] === option && c.stock > 0
                                            );

                                            if (!hasAnyStockWithThisOption) {
                                                isOptionDisabled = true;
                                            }
                                        }
                                    }

                                    return (
                                        <button
                                            key={option}
                                            disabled={isOptionDisabled}
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: option }))}
                                            title={isOptionDisabled ? "Sin stock disponible" : ""}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all relative ${selectedOptions[attr.name] === option
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : isOptionDisabled
                                                    ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed decoration-slice'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-900'
                                                }`}
                                        >
                                            {option}
                                            {isOptionDisabled && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-px bg-gray-400 rotate-12"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    < div className="h-px bg-gray-100" />

                    {/* Quantity & Actions */}
                    <div className="space-y-6">
                        {isSelectionComplete && variantFound && (
                            <div className="text-sm font-medium text-gray-500 mb-2">
                                Stock disponible: <span className="text-gray-900">{currentStock}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-xl">
                                <button
                                    className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1 || isOutOfStock}
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-12 text-center font-bold">{isOutOfStock ? 0 : quantity}</span>
                                <button
                                    className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    onClick={() => setQuantity(q => q + 1)}
                                    disabled={quantity >= currentStock || isOutOfStock}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <Button
                                size="lg"
                                className="flex-1 text-lg h-14"
                                onClick={() => {
                                    if (currentStock < quantity) {
                                        alert("No hay suficiente stock para esta variante.");
                                        return;
                                    }
                                    handleAddToCart();
                                }}
                                disabled={!isSelectionComplete || isOutOfStock}
                                variant={isOutOfStock ? "secondary" : "default"}
                            >
                                <ShoppingCart className="mr-2" />
                                {!isSelectionComplete ? 'Selecciona Opciones' : isOutOfStock ? 'Agotado' : 'Agregar al Carro'}
                            </Button>
                        </div>
                    </div>

                    {/* Features / Trust */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <Truck className="text-gray-900 mt-1" />
                            <div>
                                <h4 className="font-bold text-sm">Despacho Rápido</h4>
                                <p className="text-xs text-gray-500 mt-1">Envíos a todo Chile asegurados.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <ShieldCheck className="text-gray-900 mt-1" />
                            <div>
                                <h4 className="font-bold text-sm">Garantía Total</h4>
                                <p className="text-xs text-gray-500 mt-1">3 meses de garantía por fallas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-xl border animate-in slide-in-from-right-5 fade-in duration-300 flex items-center gap-3 max-w-md ${notification.type === 'error'
                        ? 'bg-white border-red-100 text-red-600'
                        : 'bg-gray-900 border-gray-900 text-white'
                    }`}>
                    {notification.type === 'error' ? (
                        <div className="bg-red-100 p-2 rounded-full">
                            <ShieldCheck size={20} className="text-red-600" />
                        </div>
                    ) : (
                        <div className="bg-white/20 p-2 rounded-full">
                            <ShoppingCart size={20} className="text-white" />
                        </div>
                    )}
                    <div>
                        <h4 className={`font-bold text-sm ${notification.type === 'error' ? 'text-red-900' : 'text-white'}`}>
                            {notification.type === 'error' ? 'No se pudo agregar' : '¡Agregado al carro!'}
                        </h4>
                        <p className={`text-xs mt-0.5 ${notification.type === 'error' ? 'text-red-600' : 'text-gray-300'}`}>
                            {notification.message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
