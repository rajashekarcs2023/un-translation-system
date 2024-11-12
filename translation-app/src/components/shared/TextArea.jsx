import React from 'react';

export const TextArea = ({ 
  value, 
  onChange, 
  placeholder,
  className = '',
  isDragging = false,
  ...props 
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`
      w-full h-full p-4 
      border-2 border-dashed 
      ${isDragging ? 'border-[#009EDB]' : 'border-[#e5e7eb]'}
      rounded-md resize-none
      text-base leading-relaxed
      transition-all
      ${isDragging ? 'bg-[#F8FAFC]' : 'bg-white'}
      ${className}
    `}
    {...props}
  />
);
