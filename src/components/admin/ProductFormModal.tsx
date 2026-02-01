import { useState, useEffect, useCallback } from 'react';
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
    // Extendemos el tipo para permitir strings vacíos en los inputs numéricos mientras se edita
    const [formData, setFormData] = useState<Partial<Product> & { price: number | string, stock: number | string, attributes: { name: string, options: string[] }[] }>({
        name: '',
        price: '',
        category: '' as any,
        description: '',
        stock: '',
        attributes: [],
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1598&ixlib=rb-4.0.3']
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                price: initialData.price,
                stock: initialData.stock
            });
        } else {
            setFormData({
                name: '',
                price: '',
                category: '' as any,
                description: '',
                stock: '',
                attributes: [],
                images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1598&ixlib=rb-4.0.3']
            });
        }
    }, [initialData, isOpen]);

    // Función para generar combinaciones (Memoizada para poder usarla en useEffect sin loops infinitos si se gestiona bien)
    // En este caso, la definimos dentro o fuera. Al ser dependiente del estado actual para preservar stocks, mejor dentro.
    const generateCombinations = useCallback((currentAttributes: { name: string, options: string[] }[]) => {
        // Lógica de generación
        const generate = (attrs: typeof currentAttributes, prefix: Record<string, string> = {}): Record<string, string>[] => {
            if (!attrs || attrs.length === 0) return [prefix];
            const [first, ...rest] = attrs;
            const results: Record<string, string>[] = [];

            // Si un atributo no tiene opciones, ignoramos o paramos?
            // Mejor paramos esa rama si no hay opciones para combinar
            if (first.options.length === 0) return []; // Retornar vacío si faltan opciones en un nivel intermedio obligaría a llenar todo
            // Alternativa: Si no hay opciones, tratarlo como si no existiera este atributo para la comb? No, eso rompe la consistencia.
            // Asumimos que para generar, todos los atributos definidos deben tener al menos 1 opción.

            first.options.forEach(opt => {
                const newPrefix = { ...prefix, [first.name]: opt };
                results.push(...generate(rest, newPrefix));
            });
            return results;
        };

        // Solo generar si hay atributos y todos tienen al menos una opción y un nombre
        const validAttrs = currentAttributes.filter(a => a.name && a.options.length > 0);
        if (validAttrs.length === 0) return [];

        const combos = generate(validAttrs);
        return combos;
    }, []);

    // Efecto para autogenerar combinaciones cuando cambian los atributos
    useEffect(() => {
        if (!isOpen) return;

        // Debounce simple o chequeo directo?
        // Dado que ahora usamos Tags, el cambio es discreto (al añadir/quitar tag), no al tipear letra por letra.
        // Así que podemos ejecutar directamente.

        const combosValues = generateCombinations(formData.attributes || []);

        if (combosValues.length === 0) {
            // Si no hay combinaciones válidas (ej. borró todas las opciones), limpiamos las combinaciones
            // PERO, solo si tenemos atributos definidos que quedaron vacíos. 
            // Si no hay atributos en absoluto, no tocamos nada (limpieza global).
            if (formData.attributes && formData.attributes.length > 0) {
                setFormData(prev => ({ ...prev, combinations: [] }));
            }
            return;
        }

        setFormData(prev => {
            // Preservar stock y precio existente
            const newVariants: ProductVariant[] = combosValues.map(c => {
                const existing = prev.combinations?.find(ex =>
                    Object.entries(c).every(([k, v]) => ex.values[k] === v)
                );
                return {
                    id: existing ? existing.id : crypto.randomUUID(), // Mantener ID si existe o generar uno nuevo
                    values: c,
                    stock: existing ? existing.stock : 0,
                    price: existing?.price !== undefined ? existing.price : (Number(prev.price) || 0)
                };
            });

            // Evitar actualización si no hay cambios reales para prevenir loops (aunque React maneja esto bien si la ref es nueva pero contenido igual?)
            // Comparación profunda es costosa. Confiemos en que Tags events son "lentos" (usuario hace click).

            // Un pequeño check: si la longitud y los IDs son iguales, asumimos que no cambió nada estructural
            // Pero si el usuario cambia el nombre de una opción "S" a "Small", se regenerará todo y perderá el stock de "S"?
            // Sí, porque "Small" es un valor nuevo. Es el comportamiento esperado.

            return { ...prev, combinations: newVariants };
        });

    }, [formData.attributes, generateCombinations, isOpen]); // formData.price no está aquí para evitar regenerar al cambiar precio base, solo atributos.

    const handleKeyDownOption = (e: React.KeyboardEvent<HTMLInputElement>, attrIndex: number) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val) {
                const newAttrs = [...(formData.attributes || [])];
                if (!newAttrs[attrIndex].options.includes(val)) {
                    newAttrs[attrIndex].options.push(val);
                    setFormData({ ...formData, attributes: newAttrs });
                }
                e.currentTarget.value = '';
            }
        }
    };

    const removeOption = (attrIndex: number, optIndex: number) => {
        const newAttrs = [...(formData.attributes || [])];
        newAttrs[attrIndex].options.splice(optIndex, 1);
        setFormData({ ...formData, attributes: newAttrs });
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validación básica
        if (!formData.name || !formData.category) {
            alert("Nombre y Categoría son requeridos");
            return;
        }

        // Validar precio y stock base
        const finalPrice = formData.price === '' ? 0 : Number(formData.price);
        const finalStock = formData.stock === '' ? 0 : Number(formData.stock);

        if (finalPrice < 0 || finalStock < 0) {
            alert("El precio y el stock no pueden ser negativos");
            return;
        }

        // Validar combinaciones
        if (formData.attributes && formData.attributes.length > 0) {
            if (!formData.combinations || formData.combinations.length === 0) {
                // Esto podría pasar si hay atributos pero sin opciones
                alert("Tienes variantes configuradas pero no se han generado combinaciones válidas. Asegúrate de agregar opciones a todas las variantes.");
                return;
            }
        }

        const productSubmission = {
            id: initialData?.id || crypto.randomUUID(),
            name: formData.name,
            price: finalPrice,
            category: formData.category as 'clothing' | 'technology',
            description: formData.description || '',
            stock: formData.combinations?.length ? formData.combinations.reduce((acc, c) => acc + c.stock, 0) : finalStock, // El stock total es la suma de variantes si existen
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (CLP)</label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.price}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, price: val === '' ? '' : Number(val) });
                                }}
                                placeholder="9990"
                                required={false} // Permitir vacío visualmente, se valida al submit
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Base</label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.stock}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, stock: val === '' ? '' : Number(val) });
                                }}
                                placeholder="10"
                                disabled={Boolean(formData.combinations && formData.combinations.length > 0)} // Deshabilitar si hay variantes
                                title={Boolean(formData.combinations && formData.combinations.length > 0) ? "El stock se calcula por la suma de variantes" : ""}
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
                                <div key={index} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center gap-2">
                                        <Input
                                            placeholder="Nombre (Ej: Talla, Color)"
                                            value={attr.name}
                                            onChange={e => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[index].name = e.target.value;
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                            className="h-8 text-sm font-medium w-1/2 border-dashed focus:border-solid bg-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newAttrs = formData.attributes?.filter((_, i) => i !== index);
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Tag Input Area */}
                                    <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg min-h-[42px]">
                                        {attr.options.map((opt, optIdx) => (
                                            <span key={optIdx} className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 animate-in zoom-in-50">
                                                {opt}
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index, optIdx)}
                                                    className="hover:text-red-500 cursor-pointer"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            className="outline-none text-sm flex-1 min-w-[100px] bg-transparent placeholder:text-gray-400"
                                            placeholder="Escribe y presiona Enter..."
                                            onKeyDown={(e) => handleKeyDownOption(e, index)}
                                        />
                                    </div>
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
                    {formData.combinations && formData.combinations.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">Inventario por Variante</label>
                                <Badge variant="secondary" className="text-xs">
                                    Autogenerado
                                </Badge>
                            </div>

                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden max-h-[200px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2">Variante</th>
                                            <th className="px-2 py-2 w-24">Precio</th>
                                            <th className="px-2 py-2 w-24">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {formData.combinations.map((combo, idx) => (
                                            <tr key={combo.id || idx}>
                                                <td className="px-4 py-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(combo.values).map(([k, v]) => (
                                                            <span key={k} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-600">
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        className="h-7 bg-white text-xs px-2"
                                                        value={combo.price === undefined ? (Number(formData.price) || 0) : combo.price}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            const newCombos = [...(formData.combinations || [])];
                                                            newCombos[idx].price = val;
                                                            setFormData(prev => ({ ...prev, combinations: newCombos }));
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        className="h-7 bg-white text-xs px-2"
                                                        value={combo.stock}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
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

// Helper badge component simple local
function Badge({ variant, className, children }: any) {
    const bg = variant === 'secondary' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100';
    return <span className={`px-2 py-0.5 rounded-full border ${bg} ${className}`}>{children}</span>;
}
