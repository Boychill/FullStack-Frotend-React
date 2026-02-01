export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'clothing' | 'technology';
    images: string[];
    // Ropa specific
    sizes?: string[];
    colors?: string[];
    material?: string;
    // Tech specific
    specs?: {
        ram?: string;
        storage?: string;
        processor?: string;
        warranty?: string;
    };
    stock: number;
    rating: number;
    reviews: number;
    featured?: boolean;
    attributes?: {
        name: string;
        options: string[];
    }[];
    combinations?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    values: Record<string, string>;
    stock: number;
    price?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'guest' | 'customer' | 'admin';
    addresses: Address[];
}

export interface Address {
    id: string;
    street: string;
    city: string;
    zipCode: string;
    country: string;
}

export interface CartItem extends Product {
    quantity: number;
    variants?: Record<string, string>;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    date: string;
    shippingAddress: Address;
}
