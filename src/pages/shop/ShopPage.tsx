import { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../../components/ui/ProductCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function ShopPage() {
    const { products } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Derive categories from products
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return Array.from(cats);
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? product.category === selectedCategory : true;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters - Desktop */}
                <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Categorías</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                Todas
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex justify-between items-center mb-4">
                    <Button variant="outline" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                        <SlidersHorizontal size={18} className="mr-2" /> Filtros
                    </Button>
                    <span className="text-sm text-gray-500">{filteredProducts.length} productos</span>
                </div>

                {/* Mobile Filter Menu (Overlay) */}
                {showMobileFilters && (
                    <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Filtros</h3>
                            <button onClick={() => setShowMobileFilters(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Categorías</h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={!selectedCategory ? "default" : "outline"}
                                    onClick={() => { setSelectedCategory(null); setShowMobileFilters(false); }}
                                >
                                    Todas
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        size="sm"
                                        variant={selectedCategory === cat ? "default" : "outline"}
                                        className="capitalize"
                                        onClick={() => { setSelectedCategory(cat); setShowMobileFilters(false); }}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
                            <p className="text-gray-500 mt-1">Explora nuestra colección premium</p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Input
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 text-lg">No se encontraron productos.</p>
                            <Button
                                variant="link"
                                onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
