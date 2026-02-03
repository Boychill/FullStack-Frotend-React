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

    const addProduct = async (product: Product) => {
        try {
            const { data } = await client.post('/products', product);
            const newProduct = { ...data, id: data._id || data.id };
            setProducts([...products, newProduct]);
            setFilteredProducts([...products, newProduct]);
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            const { data } = await client.put(`/products/${updatedProduct.id}`, updatedProduct);
            const newProd = { ...data, id: data._id || data.id };
            const newProducts = products.map(p => p.id === updatedProduct.id ? newProd : p);
            setProducts(newProducts);
            setFilteredProducts(newProducts);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await client.delete(`/products/${id}`);
            const newProducts = products.filter(p => p.id !== id);
            setProducts(newProducts);
            setFilteredProducts(newProducts);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
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
