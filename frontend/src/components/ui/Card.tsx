import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  hoverable = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-150 ${
        elevated ? "surface-card-elevated" : "surface-card"
      } ${
        hoverable
          ? "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
