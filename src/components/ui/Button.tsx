import * as React from "react";
import { cn } from "../../lib/utils";

// Removed unused imports and complex variants for now as we don't have the deps installed
// import { Slot } from "@radix-ui/react-slot";
// import { cva, type VariantProps } from "class-variance-authority";

// const buttonVariants = cva(...) // Removed unused variable

// I need cva (class-variance-authority). It is NOT in package.json.
// I must manual implement variants logic or stick to simple Props without cva.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            default: "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-95",
            destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
            outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
            link: "text-blue-600 underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-lg px-3",
            lg: "h-12 rounded-xl px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
