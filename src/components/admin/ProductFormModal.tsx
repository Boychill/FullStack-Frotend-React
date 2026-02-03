import { useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, initialData }: ProductFormModalProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Extendemos el tipo para permitir strings vacíos en los inputs numéricos mientras se edita
    // También permitimos que price/stock en combinaciones sean strings temporalmente para UX
    const [formData, setFormData] = useState<Omit<Partial<Product>, 'price' | 'stock'> & {
        price: number | string,
        stock: number | string,
        attributes: { name: string, options: string[] }[],
        combinations: (Omit<ProductVariant, 'price' | 'stock'> & { price?: number | string, stock: number | string })[]
    }>({
        name: '',
        price: '',
        category: '' as any,
        description: '',
        stock: '',
        attributes: [],
        images: [],
        combinations: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                price: initialData.price,
                stock: initialData.stock,
                combinations: (initialData.combinations || []).map(c => ({
                    ...c,
                    price: c.price,
                    stock: c.stock
                }))
            } as any);
        } else {
            setFormData({
                name: '',
                price: '',
                category: '' as any,
                description: '',
                stock: '',
                attributes: [],
                images: [],
                combinations: []
            } as any);
        }
    }, [initialData, isOpen]);

    const generateCombinations = useCallback((currentAttributes: { name: string, options: string[] }[]) => {
        const generate = (attrs: typeof currentAttributes, prefix: Record<string, string> = {}): Record<string, string>[] => {
            if (!attrs || attrs.length === 0) return [prefix];
            const [first, ...rest] = attrs;

            // Si una variante no tiene opciones, no podemos generar combinaciones completas aún
            if (first.options.length === 0) return [];

            const results: Record<string, string>[] = [];
            first.options.forEach(opt => {
                const newPrefix = { ...prefix, [first.name]: opt };
                results.push(...generate(rest, newPrefix));
            });
            return results;
        };

        const validAttrs = currentAttributes.filter(a => a.name && a.name.trim() !== '');
        if (validAttrs.length === 0) return [];

        return generate(validAttrs);
    }, []);

    // Efecto para autogenerar combinaciones
    useEffect(() => {
        if (!isOpen) return;

        const combosValues = generateCombinations(formData.attributes || []);

        if (combosValues.length === 0) {
            if (formData.attributes && formData.attributes.length > 0) {
                // Si hay atributos pero no combinaciones válidas (falta completar opciones), limpiamos
                // Solo si ya había combinaciones antes, para no estar limpiando a cada rato
                if (formData.combinations && formData.combinations.length > 0) {
                    setFormData(prev => ({ ...prev, combinations: [] }));
                }
            }
            return;
        }

        setFormData(prev => {
            const newVariants = combosValues.map(c => {
                // Check exact match for values
                const existing = prev.combinations?.find(ex =>
                    Object.entries(c).every(([k, v]) => ex.values[k] === v)
                );
                return {
                    id: existing ? existing.id : crypto.randomUUID(),
                    values: c,
                    stock: existing ? existing.stock : '', // Default to empty string for cleaner input
                    price: existing?.price !== undefined ? existing.price : ((prev.price as any) !== '' ? prev.price : '')
                };
            });

            // Very basic deep compare to avoid loop if nothing changed
            if (prev.combinations?.length === newVariants.length) {
                const isSame = newVariants.every((nv, i) => prev.combinations[i].id === nv.id);
                if (isSame) return prev;
            }

            return { ...prev, combinations: newVariants as any };
        });

    }, [formData.attributes, generateCombinations, isOpen]);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    // Reemplazamos la imagen actual o agregamos a la lista?
                    // Por simplicidad del modelo actual que usa images[0], reemplazamos o ponemos primera.
                    setFormData(prev => ({ ...prev, images: [reader.result as string] }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) newErrors.name = "El nombre es requerido";
        if (!formData.category) newErrors.category = "La categoría es requerida";

        // Convert to numbers for validation
        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (price < 0) newErrors.price = "El precio no puede ser negativo";
        if (stock < 0) newErrors.stock = "El stock no puede ser negativo";

        // Validate Variants if exist
        if (formData.attributes && formData.attributes.length > 0) {
            const hasEmptyOptions = formData.attributes.some(a => a.options.length === 0);
            if (hasEmptyOptions) {
                newErrors.variants = "Todas las variantes deben tener al menos una opción";
            }
            if (!formData.combinations || formData.combinations.length === 0) {
                newErrors.variants = "Debe haber combinaciones generadas";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const finalPrice = formData.price === '' ? 0 : Number(formData.price);
        const finalStock = formData.stock === '' ? 0 : Number(formData.stock);

        // Clean combinations data types
        const cleanCombinations: ProductVariant[] = (formData.combinations || []).map(c => {
            const variantWithPotentialString = c as any;
            return {
                id: c.id,
                values: c.values,
                stock: variantWithPotentialString.stock === '' ? 0 : Number(variantWithPotentialString.stock),
                price: variantWithPotentialString.price === '' || variantWithPotentialString.price === undefined ? finalPrice : Number(variantWithPotentialString.price)
            };
        });

        const productSubmission = {
            id: initialData?.id || crypto.randomUUID(),
            name: formData.name,
            price: finalPrice,
            category: formData.category as 'clothing' | 'technology',
            description: formData.description || '',
            stock: cleanCombinations.length ? cleanCombinations.reduce((acc, c) => acc + c.stock, 0) : finalStock,
            images: formData.images || [],
            attributes: formData.attributes || [],
            rating: initialData?.rating || 0,
            reviews: initialData?.reviews || 0,
            combinations: cleanCombinations
        } as Product;

        try {
            await onSubmit(productSubmission);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar el producto. Verifique los datos.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1" noValidate>
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: '' });
                                    }}
                                    placeholder="Ej: Camiseta Oversize"
                                    required
                                    className={`bg-gray-50 focus:bg-white transition-colors ${errors.name ? 'border-red-500 focus:ring-red-200' : ''}`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, price: val === '' ? '' : Number(val) });
                                            if (errors.price) setErrors({ ...errors, price: '' });
                                        }}
                                        placeholder="0"
                                        className={`bg-gray-50 focus:bg-white transition-colors ${errors.price ? 'border-red-500' : ''}`}
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Base</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, stock: val === '' ? '' : Number(val) });
                                        }}
                                        placeholder="0"
                                        disabled={Boolean(formData.combinations && formData.combinations.length > 0)}
                                        className="bg-gray-50 focus:bg-white transition-colors disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    className={`flex h-10 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 transition-colors ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                                    value={formData.category}
                                    onChange={e => {
                                        setFormData({ ...formData, category: e.target.value as any });
                                        if (errors.category) setErrors({ ...errors, category: '' });
                                    }}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="clothing">Ropa</option>
                                    <option value="technology">Tecnología</option>
                                    <option value="accessories">Accesorios</option>
                                </select>
                                {errors.category && <p className="mt-1 text-xs text-red-500 font-medium">{errors.category}</p>}
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center h-[240px] bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group">
                                {formData.images && formData.images.length > 0 && formData.images[0] ? (
                                    <>
                                        <img
                                            src={formData.images[0]}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-xs font-medium">Cambiar imagen</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-xs">Sube una imagen o pega una URL abajo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="mt-2">
                                <Input
                                    value={formData.images?.[0] || ''}
                                    onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                                    placeholder="O pega una URL https://..."
                                    className="text-xs h-8"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-gray-950 min-h-[80px] p-3 text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalle del producto..."
                        />
                    </div>

                    {/* Variants Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Variantes</label>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    const newAttrs = [...(formData.attributes || []), { name: '', options: [] }];
                                    setFormData({ ...formData, attributes: newAttrs });
                                    setErrors({ ...errors, variants: '' });
                                }}
                            >
                                <Plus size={14} className="mr-1" /> Nueva Variante
                            </Button>
                        </div>

                        {errors.variants && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {errors.variants}
                            </div>
                        )}

                        <div className="space-y-3">
                            {formData.attributes?.map((attr: { name: string; options: string[] }, index: number) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="w-1/3">
                                        <Input
                                            placeholder="Nombre (Ej: Talla)"
                                            value={attr.name}
                                            onChange={e => {
                                                const newAttrs = [...(formData.attributes || [])];
                                                newAttrs[index].name = e.target.value;
                                                setFormData({ ...formData, attributes: newAttrs });
                                            }}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-gray-950">
                                            {attr.options.map((opt, optIdx) => (
                                                <span key={optIdx} className="bg-gray-100 px-2.5 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 animate-in zoom-in-50">
                                                    {opt}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index, optIdx)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                className="outline-none text-sm flex-1 min-w-[120px] bg-transparent placeholder:text-gray-400 py-1"
                                                placeholder="Escribe opción y Enter..."
                                                onKeyDown={(e) => handleKeyDownOption(e, index)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAttrs = formData.attributes?.filter((_, i) => i !== index);
                                            setFormData({ ...formData, attributes: newAttrs });
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Matrix */}
                    {formData.combinations && formData.combinations.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">Inventario por Combinación</h3>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                    {formData.combinations.length} combinaciones generadas
                                </span>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="max-h-[250px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3">Variante</th>
                                                <th className="px-4 py-3 w-32">Precio</th>
                                                <th className="px-4 py-3 w-32">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {formData.combinations.map((combo, idx) => (
                                                <tr key={combo.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {Object.entries(combo.values).map(([k, v]) => (
                                                                <span key={k} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                                                                    {v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-8 text-xs font-mono"
                                                            value={combo.price}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const newCombos = [...(formData.combinations || [])];
                                                                (newCombos[idx] as any).price = val === '' ? '' : Number(val);
                                                                setFormData(prev => ({ ...prev, combinations: newCombos }));
                                                            }}
                                                            placeholder={String(formData.price || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-8 text-xs font-mono"
                                                            value={combo.stock}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const newCombos = [...(formData.combinations || [])];
                                                                (newCombos[idx] as any).stock = val === '' ? '' : Number(val);
                                                                setFormData(prev => ({ ...prev, combinations: newCombos }));
                                                            }}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100 mt-auto">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20">
                            {initialData ? 'Guardar Cambios' : 'Crear Producto'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


