import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/60 ${className}`}
      {...props}
    />
  );
};
