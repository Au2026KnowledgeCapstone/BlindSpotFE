import React from "react";

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--bs-bg-raised)",
        ...style,
      }}
      className={`animate-pulse rounded ${className}`}
    />
  );
};
