import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, RefreshCw } from 'lucide-react';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, initialData }: ProductFormModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        price: 0,
        category: '' as any, // Allow string during input
        description: '',
        stock: 0,
        attributes: [],
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1598&ixlib=rb-4.0.3']
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                price: 0,
                category: '' as any,
                description: '',
                stock: 0,
                attributes: [],
                // Default placeholder image
                images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1598&ixlib=rb-4.0.3']
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.price || !formData.category) return;

        // Ensure combinations are generated if attributes exist
        if (formData.attributes && formData.attributes.length > 0) {
            if (!formData.combinations || formData.combinations.length === 0) {
                alert("Debes generar las combinaciones de stock antes de guardar.");
                return;
            }
        }

        if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
            alert("El precio y el stock no pueden ser negativos");
            return;
        }

        const productSubmission = {
            id: initialData?.id || crypto.randomUUID(),
            name: formData.name,
            price: Number(formData.price),
            category: formData.category as 'clothing' | 'technology',
            description: formData.description || '',
            stock: Number(formData.stock),
            images: formData.images || [],
            attributes: formData.attributes || [],
            rating: initialData?.rating || 0,
            reviews: initialData?.reviews || 0,
            combinations: formData.combinations || []
        } as Product;

        onSubmit(productSubmission);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Camiseta Oversize"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP)</label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.price}
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val >= 0) setFormData({ ...formData, price: val });
                                }}
                                placeholder="9990"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.stock}
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val >= 0) setFormData({ ...formData, stock: val });
                                }}
                                placeholder="10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (slug)</label>
                        <Input
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                            placeholder="tecnologia, ropa, accesorios..."
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Variantes y Opciones</label>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    const newAttrs = [...(formData.attributes || []), { name: '', options: [] }];
                                    setFormData({ ...formData, attributes: newAttrs });
                                }}
                            >
                                <Plus size={14} className="mr-1" /> Agregar Variante
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.attributes?.map((attr: { name: string; options: string[] }, index: number) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="Nombre (Ej: Talla)"
                                            value={attr.name}
                                            onChange={e => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[index].name = e.target.value;
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                            className="h-8 text-sm"
                                        />
                                        <Input
                                            placeholder="Opciones (Ej: S, M, L)"
                                            value={attr.options.join(', ')}
                                            onChange={e => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[index].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAttrs = formData.attributes?.filter((_, i) => i !== index);
                                            setFormData({ ...formData, attributes: newAttrs });
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {(!formData.attributes || formData.attributes.length === 0) && (
                                <p className="text-sm text-gray-400 italic text-center py-2 border border-dashed rounded-lg">
                                    No hay variantes configuradas.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stock Matrix Management */}
                    {formData.attributes && formData.attributes.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">Gestión de Stock por Variantes</label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        // Generate combinations
                                        const generate = (attrs: typeof formData.attributes, prefix: Record<string, string> = {}): Record<string, string>[] => {
                                            if (!attrs || attrs.length === 0) return [prefix];
                                            const [first, ...rest] = attrs;
                                            const results: Record<string, string>[] = [];
                                            if (first.options.length === 0) return generate(rest, prefix);

                                            first.options.forEach(opt => {
                                                const newPrefix = { ...prefix, [first.name]: opt };
                                                results.push(...generate(rest, newPrefix));
                                            });
                                            return results;
                                        };

                                        const combos = generate(formData.attributes || []);
                                        const newVariants: ProductVariant[] = combos.map(c => {
                                            // Try to preserve existing stock if ID matches (roughly) or by values
                                            const id = Object.values(c).join('-');
                                            const existing = formData.combinations?.find(ex =>
                                                Object.entries(c).every(([k, v]) => ex.values[k] === v)
                                            );
                                            return {
                                                id: id,
                                                values: c,
                                                stock: existing ? existing.stock : 0
                                            };
                                        });

                                        setFormData(prev => ({
                                            ...prev,
                                            combinations: newVariants,
                                            stock: newVariants.reduce((sum, v) => sum + v.stock, 0) // Update total stock
                                        }));
                                    }}
                                >
                                    <RefreshCw size={14} className="mr-2" /> Generar Combinaciones
                                </Button>
                            </div>

                            {formData.combinations && formData.combinations.length > 0 && (
                                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">Variante</th>
                                                <th className="px-4 py-3 w-32">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {formData.combinations.map((combo, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(combo.values).map(([k, v]) => (
                                                                <span key={k} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                                                                    {k}: {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            className="h-8 bg-white"
                                                            value={combo.stock}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                const newCombos = [...(formData.combinations || [])];
                                                                newCombos[idx].stock = val;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    combinations: newCombos,
                                                                    stock: newCombos.reduce((sum, v) => sum + v.stock, 0)
                                                                }));
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-primary-100 focus:border-primary-400 min-h-[100px] p-3 text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalle del producto..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
                        <Input
                            value={formData.images?.[0] || ''}
                            onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{initialData ? 'Guardar Cambios' : 'Crear Producto'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
