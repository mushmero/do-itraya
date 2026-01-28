import React from "react";
import clsx from "clsx";

const SkeletonCard = ({
  className = "",
  height = "h-32",
  rounded = "rounded-3xl",
  variant = "default",
}) => {
  return (
    <div
      className={clsx(
        "skeleton relative overflow-hidden",
        "bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50",
        "border border-white/5",
        height,
        rounded,
        className,
      )}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s linear infinite",
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
};

export default SkeletonCard;
