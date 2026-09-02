import React from 'react';

interface Rome1960LogoProps {
  className?: string;
  size?: number | string;
  showShadow?: boolean;
}

export function Rome1960Logo({ className = 'w-16 h-16', size, showShadow = true }: Rome1960LogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${
        showShadow ? 'drop-shadow-lg' : ''
      } ${className}`}
      style={style}
    >
      <img
        src="/assets/logo.svg"
        alt="ROME 1960 CAFE Logo"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
}
