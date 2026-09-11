import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white shadow-xs hover:shadow transition-shadow",
      secondary:
        "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs hover:border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
      outline:
        "border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-xs px-3.5 py-2 gap-2",
      lg: "text-sm px-4.5 py-2.5 gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
