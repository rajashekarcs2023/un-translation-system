import React from 'react';
import { colors } from '../../utils/constants';

export const Button = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all";
  const variants = {
    primary: `bg-[${colors.primary}] text-white hover:opacity-90`,
    secondary: 'bg-[#f3f4f6] border border-[#e5e7eb] hover:bg-[#e5e7eb]'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      {...props}
    >
      {children}
    </button>
  );
};