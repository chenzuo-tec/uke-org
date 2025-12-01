import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white border-2 border-transparent",
    secondary: "bg-amber-300 hover:bg-amber-400 text-orange-900 border-2 border-transparent",
    outline: "bg-transparent border-2 border-orange-500 text-orange-600 hover:bg-orange-50",
    danger: "bg-red-400 hover:bg-red-500 text-white border-2 border-transparent"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};