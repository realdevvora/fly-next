import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'link';
  to?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// made by lovable :3
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  as = 'button',
  to = '',
  fullWidth = false,
  type = 'button', // Add this default
  children,
  className,
  ...props
}) => {
  const baseClasses = "relative inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary button-hover-effect";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-primary/20 bg-transparent text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-primary hover:bg-primary/5"
  };
  
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className || ''}`;
  
  if (as === 'link' && to) {
    return (
      <Link href={to} className={classes}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
