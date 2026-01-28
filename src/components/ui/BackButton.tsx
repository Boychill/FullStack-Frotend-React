import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming cn utility exists, usually does in shadcn-like setups. If not I'll just use string concat.

interface BackButtonProps {
    className?: string;
}

export function BackButton({ className }: BackButtonProps) {
    return (
        <Link
            to="/"
            className={cn(
                "fixed top-8 left-8 z-50",
                "flex items-center justify-center w-12 h-12",
                "bg-white border border-gray-200 rounded-2xl shadow-sm",
                "text-gray-500 transition-all duration-300",
                "hover:scale-110 hover:shadow-md hover:text-primary-600 hover:border-primary-100",
                className
            )}
            title="Volver a la Tienda"
        >
            <ArrowLeft size={24} />
        </Link>
    );
}
