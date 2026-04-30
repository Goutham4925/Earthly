import React from 'react';

type BadgeVariant = 'active' | 'pending' | 'outofstock' | 'category' | 'verified' | 'info' | 'warning' | 'danger';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  outofstock: 'bg-red-100 text-red-700 border-red-200',
  category: 'bg-secondary text-primary border-primary/20',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}