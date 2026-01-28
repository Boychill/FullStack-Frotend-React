import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { Button } from './Button';
import { Badge } from './Badge';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const { addToCart } = useCart();

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-gray-50 relative">
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm px-3 py-1">Agotado</Badge>
                    </div>
                )}
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Quick Actions overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Button
                        size="sm"
                        className="rounded-full shadow-lg"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onAddToCart) {
                                onAddToCart(product);
                            } else {
                                addToCart(product, 1);
                            }
                        }}
                        disabled={product.stock === 0}
                    >
                        <ShoppingCart size={16} className="mr-2" />
                        Agregar
                    </Button>
                    <Link to={`/product/${product.id}`}>
                        <Button size="sm" variant="secondary" className="rounded-full shadow-lg">
                            <Eye size={16} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                        {product.category}
                    </Badge>
                    <span className="font-bold text-lg">${product.price.toLocaleString('es-CL')}</span>
                </div>

                <Link to={`/product/${product.id}`} className="block group-hover:text-primary-600 transition-colors">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                </Link>

                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">
                    {product.description}
                </p>
            </div>
        </div>
    );
}
