import * as React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
        default: "border-transparent bg-gray-900 text-white hover:bg-gray-800",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "text-gray-950",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
    };

    return (
        <div className={cn(baseStyles, variants[variant], className)} {...props} />
    );
}

export { Badge };
