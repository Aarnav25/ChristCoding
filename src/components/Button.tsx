import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const base = 'rounded-xl px-4 py-2 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
};

export function Button({ className = '', variant = 'primary', ...rest }: Props) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}
