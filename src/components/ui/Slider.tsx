import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface SliderProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                type="range"
                className={cn(
                    "w-full h-2 rounded-lg appearance-none cursor-pointer accent-gold-500",
                    "bg-gray-300 dark:bg-chumbo-700",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Slider.displayName = "Slider";

export { Slider };
