import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import client from '../api/client';


interface ProductContextType {
    products: Product[];
    filterByCategory: (category: string) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    updateProductStock: (items: { id: string; quantity: number; variants?: Record<string, string> }[]) => void;
    getProductById: (id: string) => Product | undefined;
    filteredProducts: Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await client.get('/products');
                // Map _id to id if backend sends _id
                const mappedProducts = data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id
                }));
                setProducts(mappedProducts);
                setFilteredProducts(mappedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const saveProducts = (newProducts: Product[]) => {
        // En una app real, aquí haríamos llamadas PUT/POST a la API.
        // Por ahora mantenemos el estado local sincronizado para la UI.
        setProducts(newProducts);
        setFilteredProducts(newProducts);
    };

    const filterByCategory = (category: string) => {
        if (category === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === category));
        }
    };

    const getProductById = (id: string) => {
        return products.find(p => p.id === id);
    };

    const addProduct = (product: Product) => {
        const newProducts = [...products, product];
        saveProducts(newProducts);
    };

    const updateProduct = (updatedProduct: Product) => {
        const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        saveProducts(newProducts);
    };

    const deleteProduct = (id: string) => {
        const newProducts = products.filter(p => p.id !== id);
        saveProducts(newProducts);
    };

    const updateProductStock = (items: { id: string; quantity: number; variants?: Record<string, string> }[]) => {
        const newProducts = products.map(p => {
            const item = items.find(i => i.id === p.id);
            if (item) {
                let updatedProduct = { ...p };

                // If item has variants, try to update specific combination stock
                if (item.variants && p.combinations) {
                    updatedProduct.combinations = p.combinations.map(combo => {
                        const isMatch = Object.entries(combo.values).every(([k, v]) => item.variants?.[k] === v);
                        if (isMatch) {
                            return { ...combo, stock: Math.max(0, combo.stock - item.quantity) };
                        }
                        return combo;
                    });
                }

                // Always update global stock
                updatedProduct.stock = Math.max(0, p.stock - item.quantity);
                return updatedProduct;
            }
            return p;
        });
        saveProducts(newProducts);
    };

    return (
        <ProductContext.Provider value={{
            products,
            filteredProducts,
            filterByCategory,
            getProductById,
            addProduct,
            updateProduct,
            deleteProduct,
            updateProductStock
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
