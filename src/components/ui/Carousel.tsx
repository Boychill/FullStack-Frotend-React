import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const Carousel = () => {
    const { products } = useProducts();
    const { addToCart } = useCart();
    // Filter by featured or fallback to first 5
    const featuredProducts = products.filter(p => p.featured).slice(0, 5);
    const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5);

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [displayProducts.length]);

    if (displayProducts.length === 0) return null;

    const currentProduct = displayProducts[currentIndex];

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Productos Destacados</h2>

            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="flex h-[400px] md:h-[500px]">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2 relative bg-gray-50 flex items-center justify-center p-8">
                        <img
                            src={currentProduct.images[0]}
                            alt={currentProduct.name}
                            className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 transform hover:scale-105"
                        />
                    </div>

                    {/* Content Side */}
                    <div className="hidden md:flex flex-col justify-center p-12 w-1/2 bg-white relative">
                        <div className="animate-fade-in space-y-6">
                            <span className="text-primary-600 font-semibold tracking-wide uppercase text-sm">
                                {currentProduct.category}
                            </span>
                            <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                                {currentProduct.name}
                            </h3>
                            <p className="text-gray-500 text-lg line-clamp-3">
                                {currentProduct.description}
                            </p>
                            <div className="flex items-center space-x-6 pt-4">
                                <span className="text-3xl font-bold text-primary-600">
                                    ${currentProduct.price.toLocaleString('es-CL')}
                                </span>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => addToCart(currentProduct, 1)}
                                        className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg flex items-center space-x-2"
                                    >
                                        <ShoppingCart size={20} />
                                        <span>Añadir</span>
                                    </button>
                                    <Link
                                        to={`/product/${currentProduct.id}`}
                                        className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Ver Detalles
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Slide indicators */}
                        <div className="absolute bottom-8 left-12 flex space-x-2">
                            {displayProducts.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile Content Overlay */}
                    <div className="md:hidden absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{currentProduct.name}</h3>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-bold">${currentProduct.price.toLocaleString('es-CL')}</span>
                            <Link
                                to={`/product/${currentProduct.id}`}
                                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold"
                            >
                                Ver
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur text-gray-800 transition-all hover:scale-110 z-10"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur text-gray-800 transition-all hover:scale-110 z-10"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default Carousel;
