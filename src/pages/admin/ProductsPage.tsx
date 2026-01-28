import { useState } from 'react';

import { useProducts } from '../../context/ProductContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { Product } from '../../types';

export function ProductsPage() {
    const { products, deleteProduct, addProduct, updateProduct } = useProducts();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (product: Product) => {
        if (editingProduct) {
            updateProduct(product);
        } else {
            addProduct(product);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
                    <p className="text-gray-500">Gestiona tu catálogo.</p>
                </div>
                <div className="flex gap-3">

                    <Button onClick={handleCreate}>
                        <Plus size={18} className="mr-2" /> Nuevo Producto
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Buscar producto..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Precio</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize">{product.category}</td>
                                    <td className="px-6 py-4">${product.price.toLocaleString('es-CL')}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                            {product.stock} un.
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingProduct}
            />
        </div>
    );
}

