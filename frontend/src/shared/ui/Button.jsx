import React from 'react';
import { clsx } from 'clsx';

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none';
  
  const variantStyles = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const styles = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    widthStyles,
    disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5',
    className
  );
  
  return (
    <button 
      className={styles} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export default Button; 