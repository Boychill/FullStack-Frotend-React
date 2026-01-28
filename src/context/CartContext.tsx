import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number, options?: Record<string, string>) => boolean;
    removeFromCart: (productId: string, options?: { size?: string; color?: string }) => void;
    updateQuantity: (productId: string, delta: number, options?: Record<string, string>) => void;
    clearCart: () => void;
    total: number;
    subtotal: number;
    shippingCost: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity: number, options?: Record<string, string>): boolean => {
        const existingItem = cart.find(item => {
            if (item.id !== product.id) return false;
            // Compare variants
            const itemVariants = item.variants || {};
            const newVariants = options || {};

            // Check keys length
            const itemKeys = Object.keys(itemVariants);
            const newKeys = Object.keys(newVariants);
            if (itemKeys.length !== newKeys.length) return false;

            // Check every key
            return newKeys.every(key => itemVariants[key] === newVariants[key]);
        });

        const currentQty = existingItem ? existingItem.quantity : 0;

        let maxStock = product.stock;

        if (product.combinations && product.combinations.length > 0) {
            maxStock = 0;

            if (options) {
                const variant = product.combinations.find(c =>
                    Object.entries(c.values).every(([k, v]) => options[k] === v)
                );

                if (variant) {
                    maxStock = variant.stock;
                }
            }
        }

        if (currentQty + quantity > maxStock) {
            return false;
        }

        setCart(prev => {
            const existingItemIndex = prev.findIndex(item => {
                if (item.id !== product.id) return false;
                const itemVariants = item.variants || {};
                const newVariants = options || {};
                const itemKeys = Object.keys(itemVariants);
                const newKeys = Object.keys(newVariants);
                if (itemKeys.length !== newKeys.length) return false;
                return newKeys.every(key => itemVariants[key] === newVariants[key]);
            });

            if (existingItemIndex > -1) {
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            }

            return [...prev, {
                ...product,
                quantity,
                variants: options
            }];
        });

        return true;
    };

    const removeFromCart = (productId: string, options?: Record<string, string>) => {
        setCart(prev => prev.filter(item => {
            if (item.id !== productId) return true;
            // If it is the product, check if variants match. If they match, remove (return false).
            const itemVariants = item.variants || {};
            const targetVariants = options || {};
            const keys = Object.keys(targetVariants);

            // If we are removing specific options
            if (keys.length > 0) {
                const match = keys.every(key => itemVariants[key] === targetVariants[key]);
                return !match;
            }
            // If options is empty/undefined, remove all instances of product? or logic is flawed?
            // Usually remove is called on a specific item in the cart list, so we might want to just filter by index or exact match.
            // But let's keep the logic consistent: remove matching variant.
            return true;
        }));
    };

    const updateQuantity = (productId: string, delta: number, options?: Record<string, string>) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id !== productId) return item;

                // Check variants
                const itemVariants = item.variants || {};
                const targetVariants = options || {};
                const itemKeys = Object.keys(itemVariants);
                const targetKeys = Object.keys(targetVariants);

                if (itemKeys.length !== targetKeys.length) return item;
                const match = itemKeys.every(key => itemVariants[key] === targetVariants[key]);

                if (!match) return item;

                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return null;

                // Check Stock for increment
                if (delta > 0) {
                    let maxStock = item.stock;
                    if (item.combinations) {
                        const variant = item.combinations.find(c =>
                            Object.entries(c.values).every(([k, v]) => itemVariants[k] === v)
                        );
                        if (variant) maxStock = variant.stock;
                    }
                    if (newQuantity > maxStock) return item;
                }

                return { ...item, quantity: newQuantity };
            }).filter((item): item is CartItem => item !== null);
        });
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const FREE_SHIPPING_THRESHOLD = 50000;
    const FLAT_SHIPPING_RATE = 3500;

    // Shipping logic: free if subtotal > threshold, else flat rate. If cart empty, 0.
    const shippingCost = cart.length === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE);

    const total = subtotal + shippingCost;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, subtotal, shippingCost, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
