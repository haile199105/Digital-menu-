import React from 'react';
import { Sparkles, Flame, Star, Leaf, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  variant?: 'popular' | 'new' | 'special' | 'dietary' | 'unavailable' | 'neutral';
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export function Badge({ variant = 'neutral', children, icon = true, className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-xs';

  const variantStyles = {
    popular: 'bg-amber-500 text-stone-950 font-bold',
    new: 'bg-emerald-600 text-white',
    special: 'bg-stone-900 text-amber-300 border border-amber-500/40',
    dietary: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    unavailable: 'bg-stone-200 text-stone-700 font-medium',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200',
  }[variant];

  const renderIcon = () => {
    if (!icon) return null;
    switch (variant) {
      case 'popular':
        return <Flame className="w-3 h-3 text-stone-950" />;
      case 'new':
        return <Sparkles className="w-3 h-3 text-emerald-200" />;
      case 'special':
        return <Star className="w-3 h-3 text-amber-400 fill-amber-400" />;
      case 'dietary':
        return <Leaf className="w-3 h-3 text-emerald-600" />;
      case 'unavailable':
        return <AlertTriangle className="w-3 h-3 text-stone-500" />;
      default:
        return null;
    }
  };

  return (
    <span className={`${baseClasses} ${variantStyles} ${className}`}>
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
}
