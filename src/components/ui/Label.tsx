import type { ComponentProps } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Label({ className, ...props }: ComponentProps<"label">) {
    return (
        <label
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                "text-gray-700 dark:text-gray-200",
                className
            )}
            {...props}
        />
    );
}
